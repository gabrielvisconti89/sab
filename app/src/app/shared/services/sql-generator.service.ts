import { Injectable } from '@angular/core';
import { Project, Table, Column, DatabaseType } from '../../models';
import { DATA_TYPE_CATEGORIES } from '../../models/table.model';

@Injectable({
  providedIn: 'root',
})
export class SqlGeneratorService {
  generateCreateTable(table: Table, dbType: DatabaseType = 'mysql'): string {
    const columns = table.columns || [];
    const columnDefs: string[] = [];
    const indexes: string[] = [];
    const primaryKeys: string[] = [];
    const foreignKeys: string[] = [];

    columns.forEach((col) => {
      columnDefs.push(this.generateColumnDefinition(col, dbType));

      if (col.isPrimaryKey) {
        primaryKeys.push(this.quote(col.name, dbType));
      }

      if (col.isUnique) {
        indexes.push(this.generateUniqueIndex(table.name, col.name, dbType));
      } else if (col.isIndexed && !col.isForeignKey) {
        indexes.push(this.generateIndex(table.name, col.name, dbType));
      }

      // Generate foreign key constraint
      if (col.isForeignKey && col.foreignKey) {
        foreignKeys.push(this.generateForeignKeyConstraint(table.name, col, dbType));
      }
    });

    // Add timestamps
    if (table.hasTimestamps) {
      columnDefs.push(this.generateTimestampColumn('created_at', dbType));
      columnDefs.push(this.generateTimestampColumn('updated_at', dbType));
    }

    // Add soft delete
    if (table.hasSoftDelete) {
      columnDefs.push(this.generateTimestampColumn('deleted_at', dbType));
    }

    // Add primary key constraint
    if (primaryKeys.length > 0) {
      columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
    }

    // Build SQL
    let sql = `CREATE TABLE ${this.quote(table.name, dbType)} (\n`;
    sql += columnDefs.join(',\n');

    if (indexes.length > 0) {
      sql += ',\n' + indexes.join(',\n');
    }

    if (foreignKeys.length > 0) {
      sql += ',\n' + foreignKeys.join(',\n');
    }

    sql += '\n)';
    sql += this.getTableOptions(dbType);
    sql += ';\n';

    return sql;
  }

  generateForeignKeyConstraint(tableName: string, col: Column, dbType: DatabaseType): string {
    if (!col.foreignKey) return '';

    const fk = col.foreignKey;
    const constraintName = `${tableName}_${col.name}_foreign`;

    let constraint = `  CONSTRAINT ${this.quote(constraintName, dbType)} `;
    constraint += `FOREIGN KEY (${this.quote(col.name, dbType)}) `;
    constraint += `REFERENCES ${this.quote(fk.referenceTable, dbType)}(${this.quote(fk.referenceColumn, dbType)})`;

    if (fk.onDelete) {
      constraint += ` ON DELETE ${fk.onDelete}`;
    }
    if (fk.onUpdate) {
      constraint += ` ON UPDATE ${fk.onUpdate}`;
    }

    return constraint;
  }

  generateColumnDefinition(col: Column, dbType: DatabaseType): string {
    let def = `  ${this.quote(col.name, dbType)} ${this.getColumnType(col, dbType)}`;

    if (col.isUnsigned && this.isNumericType(col.dataType) && dbType !== 'postgresql') {
      def += ' UNSIGNED';
    }

    if (!col.isNullable) {
      def += ' NOT NULL';
    }

    if (col.isAutoIncrement) {
      def += this.getAutoIncrementSyntax(dbType);
    }

    if (col.defaultValue !== undefined && col.defaultValue !== '') {
      def += ` DEFAULT ${this.formatDefaultValue(col, dbType)}`;
    }

    return def;
  }

  getColumnType(col: Column, dbType: DatabaseType): string {
    let type: string = col.dataType;

    // PostgreSQL specific mappings
    if (dbType === 'postgresql') {
      type = this.mapToPostgresType(col);
    }

    // SQLite specific mappings
    if (dbType === 'sqlite') {
      type = this.mapToSqliteType(col);
    }

    // Add length/precision
    if (col.dataLength && !['postgresql', 'sqlite'].includes(dbType)) {
      type += `(${col.dataLength})`;
    } else if (col.dataLength && dbType === 'postgresql' && ['VARCHAR', 'CHAR'].includes(col.dataType)) {
      type += `(${col.dataLength})`;
    } else if (col.dataPrecision !== undefined && col.dataScale !== undefined) {
      type += `(${col.dataPrecision}, ${col.dataScale})`;
    } else if (col.enumValues && col.enumValues.length > 0 && dbType !== 'postgresql') {
      type += `('${col.enumValues.join("', '")}')`;
    }

    return type;
  }

  mapToPostgresType(col: Column): string {
    const mapping: Record<string, string> = {
      'TINYINT': 'SMALLINT',
      'MEDIUMINT': 'INTEGER',
      'INT': 'INTEGER',
      'BIGINT': 'BIGINT',
      'DOUBLE': 'DOUBLE PRECISION',
      'FLOAT': 'REAL',
      'DATETIME': 'TIMESTAMP',
      'TINYTEXT': 'TEXT',
      'MEDIUMTEXT': 'TEXT',
      'LONGTEXT': 'TEXT',
      'TINYBLOB': 'BYTEA',
      'BLOB': 'BYTEA',
      'MEDIUMBLOB': 'BYTEA',
      'LONGBLOB': 'BYTEA',
      'ENUM': 'VARCHAR(255)',
      'SET': 'VARCHAR(255)',
    };
    return mapping[col.dataType] || col.dataType;
  }

  mapToSqliteType(col: Column): string {
    const mapping: Record<string, string> = {
      'TINYINT': 'INTEGER',
      'SMALLINT': 'INTEGER',
      'MEDIUMINT': 'INTEGER',
      'INT': 'INTEGER',
      'BIGINT': 'INTEGER',
      'DECIMAL': 'REAL',
      'FLOAT': 'REAL',
      'DOUBLE': 'REAL',
      'VARCHAR': 'TEXT',
      'CHAR': 'TEXT',
      'TINYTEXT': 'TEXT',
      'MEDIUMTEXT': 'TEXT',
      'LONGTEXT': 'TEXT',
      'DATETIME': 'TEXT',
      'TIMESTAMP': 'TEXT',
      'DATE': 'TEXT',
      'TIME': 'TEXT',
      'ENUM': 'TEXT',
      'SET': 'TEXT',
      'JSON': 'TEXT',
      'TINYBLOB': 'BLOB',
      'MEDIUMBLOB': 'BLOB',
      'LONGBLOB': 'BLOB',
    };
    return mapping[col.dataType] || col.dataType;
  }

  getAutoIncrementSyntax(dbType: DatabaseType): string {
    switch (dbType) {
      case 'postgresql':
        return ''; // PostgreSQL uses SERIAL type
      case 'sqlite':
        return ''; // SQLite uses INTEGER PRIMARY KEY for auto-increment
      default:
        return ' AUTO_INCREMENT';
    }
  }

  getTableOptions(dbType: DatabaseType): string {
    switch (dbType) {
      case 'mysql':
      case 'mariadb':
        return ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
      default:
        return '';
    }
  }

  generateTimestampColumn(name: string, dbType: DatabaseType): string {
    switch (dbType) {
      case 'postgresql':
        return `  ${this.quote(name, dbType)} TIMESTAMP NULL DEFAULT NULL`;
      case 'sqlite':
        return `  ${this.quote(name, dbType)} TEXT NULL DEFAULT NULL`;
      default:
        return `  ${this.quote(name, dbType)} TIMESTAMP NULL DEFAULT NULL`;
    }
  }

  generateUniqueIndex(tableName: string, columnName: string, dbType: DatabaseType): string {
    const indexName = `${tableName}_${columnName}_unique`;
    return `  UNIQUE KEY ${this.quote(indexName, dbType)} (${this.quote(columnName, dbType)})`;
  }

  generateIndex(tableName: string, columnName: string, dbType: DatabaseType): string {
    const indexName = `${tableName}_${columnName}_index`;
    if (dbType === 'postgresql') {
      return `  -- CREATE INDEX ${indexName} ON ${tableName}(${columnName})`;
    }
    return `  KEY ${this.quote(indexName, dbType)} (${this.quote(columnName, dbType)})`;
  }

  formatDefaultValue(col: Column, dbType: DatabaseType): string {
    if (col.defaultValue === 'NULL') return 'NULL';
    if (col.defaultValue === 'CURRENT_TIMESTAMP') return 'CURRENT_TIMESTAMP';

    const textTypes = ['VARCHAR', 'CHAR', 'TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT', 'ENUM', 'SET'];
    if (textTypes.includes(col.dataType)) {
      return `'${col.defaultValue}'`;
    }

    return col.defaultValue!;
  }

  quote(identifier: string, dbType: DatabaseType): string {
    switch (dbType) {
      case 'postgresql':
        return `"${identifier}"`;
      case 'sqlite':
        return `"${identifier}"`;
      default:
        return `\`${identifier}\``;
    }
  }

  isNumericType(type: string): boolean {
    return DATA_TYPE_CATEGORIES.numeric.includes(type as any);
  }

  generateFullSchema(tables: Table[], dbType: DatabaseType = 'mysql'): string {
    const header = this.generateHeader(dbType);
    const tablesSql = tables.map((t) => this.generateCreateTable(t, dbType)).join('\n');
    return header + tablesSql;
  }

  generateHeader(dbType: DatabaseType): string {
    const now = new Date().toISOString();
    let header = `-- =============================================\n`;
    header += `-- Database Schema\n`;
    header += `-- Generated by Software Architecture Builder\n`;
    header += `-- Date: ${now}\n`;
    header += `-- Database: ${dbType.toUpperCase()}\n`;
    header += `-- =============================================\n\n`;

    if (dbType === 'mysql' || dbType === 'mariadb') {
      header += `SET FOREIGN_KEY_CHECKS=0;\n`;
      header += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
      header += `SET time_zone = "+00:00";\n\n`;
    }

    return header;
  }
}
