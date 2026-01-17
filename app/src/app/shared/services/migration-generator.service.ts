import { Injectable } from '@angular/core';
import { Table, Column, DataType } from '../../models';
import { DATA_TYPE_CATEGORIES } from '../../models/table.model';

export interface MigrationFile {
  filename: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class MigrationGeneratorService {
  generateMigration(table: Table, index: number = 0): MigrationFile {
    const timestamp = this.generateTimestamp(index);
    const className = this.toClassName(table.name);
    const filename = `${timestamp}_create_${table.name}_table.php`;

    const content = this.generateMigrationContent(table, className);

    return { filename, content };
  }

  generateMigrationContent(table: Table, className: string): string {
    const columns = table.columns || [];

    let upMethod = `        Schema::create('${table.name}', function (Blueprint $table) {\n`;

    // Generate column definitions
    columns.forEach((col) => {
      upMethod += this.generateColumnMethod(col);
    });

    // Add timestamps
    if (table.hasTimestamps) {
      upMethod += `            $table->timestamps();\n`;
    }

    // Add soft delete
    if (table.hasSoftDelete) {
      upMethod += `            $table->softDeletes();\n`;
    }

    upMethod += `        });`;

    return `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
${upMethod}
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('${table.name}');
    }
};
`;
  }

  generateColumnMethod(col: Column): string {
    let method = '            $table->';

    // Use foreignId for foreign key columns (Laravel convention)
    if (col.isForeignKey && col.foreignKey && col.dataType === 'BIGINT' && col.isUnsigned) {
      method += `foreignId('${col.name}')`;

      if (col.isNullable) {
        method += '->nullable()';
      }

      // Add constrained() with reference
      method += `->constrained('${col.foreignKey.referenceTable}', '${col.foreignKey.referenceColumn}')`;

      // Add onDelete and onUpdate
      if (col.foreignKey.onDelete && col.foreignKey.onDelete !== 'RESTRICT') {
        method += `->onDelete('${col.foreignKey.onDelete.toLowerCase().replace(' ', '')}')`;
      }
      if (col.foreignKey.onUpdate && col.foreignKey.onUpdate !== 'RESTRICT') {
        method += `->onUpdate('${col.foreignKey.onUpdate.toLowerCase().replace(' ', '')}')`;
      }

      if (col.description) {
        method += `->comment('${col.description.replace(/'/g, "\\'")}')`;
      }

      method += ';\n';
      return method;
    }

    // Handle special cases first
    if (col.isPrimaryKey && col.isAutoIncrement && col.dataType === 'BIGINT') {
      method += col.isUnsigned ? 'id' : 'bigIncrements';
      method += `('${col.name}')`;
    } else if (col.isPrimaryKey && col.isAutoIncrement && col.dataType === 'INT') {
      method += `increments('${col.name}')`;
    } else {
      method += this.getColumnMethodName(col);
      method += `('${col.name}'`;

      // Add parameters based on type
      if (this.needsLength(col.dataType) && col.dataLength) {
        method += `, ${col.dataLength}`;
      } else if (this.needsPrecision(col.dataType) && col.dataPrecision !== undefined) {
        method += `, ${col.dataPrecision}`;
        if (col.dataScale !== undefined) {
          method += `, ${col.dataScale}`;
        }
      } else if (this.needsEnumValues(col.dataType) && col.enumValues?.length) {
        method += `, ['${col.enumValues.join("', '")}']`;
      }

      method += ')';
    }

    // Add modifiers
    if (col.isUnsigned && this.isNumericType(col.dataType) && !col.isPrimaryKey) {
      method += '->unsigned()';
    }

    if (col.isNullable) {
      method += '->nullable()';
    }

    if (col.defaultValue !== undefined && col.defaultValue !== '') {
      if (col.defaultValue === 'NULL') {
        method += '->default(null)';
      } else if (col.defaultValue === 'CURRENT_TIMESTAMP') {
        method += '->useCurrent()';
      } else if (this.isNumericType(col.dataType)) {
        method += `->default(${col.defaultValue})`;
      } else {
        method += `->default('${col.defaultValue}')`;
      }
    }

    if (col.isUnique && !col.isPrimaryKey) {
      method += '->unique()';
    }

    if (col.isIndexed && !col.isPrimaryKey && !col.isUnique && !col.isForeignKey) {
      method += '->index()';
    }

    if (col.description) {
      method += `->comment('${col.description.replace(/'/g, "\\'")}')`;
    }

    method += ';\n';
    return method;
  }

  getColumnMethodName(col: Column): string {
    const mapping: Record<DataType, string> = {
      // Numeric
      'TINYINT': 'tinyInteger',
      'SMALLINT': 'smallInteger',
      'MEDIUMINT': 'mediumInteger',
      'INT': 'integer',
      'BIGINT': 'bigInteger',
      'DECIMAL': 'decimal',
      'FLOAT': 'float',
      'DOUBLE': 'double',
      // Text
      'CHAR': 'char',
      'VARCHAR': 'string',
      'TINYTEXT': 'tinyText',
      'TEXT': 'text',
      'MEDIUMTEXT': 'mediumText',
      'LONGTEXT': 'longText',
      // Date/Time
      'DATE': 'date',
      'TIME': 'time',
      'DATETIME': 'dateTime',
      'TIMESTAMP': 'timestamp',
      'YEAR': 'year',
      // Binary
      'BINARY': 'binary',
      'VARBINARY': 'binary',
      'TINYBLOB': 'binary',
      'BLOB': 'binary',
      'MEDIUMBLOB': 'binary',
      'LONGBLOB': 'binary',
      // JSON
      'JSON': 'json',
      // Special
      'BOOLEAN': 'boolean',
      'ENUM': 'enum',
      'SET': 'set',
      'UUID': 'uuid',
    };

    return mapping[col.dataType] || 'string';
  }

  needsLength(type: DataType): boolean {
    return ['VARCHAR', 'CHAR'].includes(type);
  }

  needsPrecision(type: DataType): boolean {
    return ['DECIMAL', 'FLOAT', 'DOUBLE'].includes(type);
  }

  needsEnumValues(type: DataType): boolean {
    return ['ENUM', 'SET'].includes(type);
  }

  isNumericType(type: DataType): boolean {
    return DATA_TYPE_CATEGORIES.numeric.includes(type);
  }

  toClassName(tableName: string): string {
    return tableName
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  generateTimestamp(index: number): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds() + index).padStart(2, '0');

    return `${year}_${month}_${day}_${hour}${minute}${second}`;
  }

  generateAllMigrations(tables: Table[]): MigrationFile[] {
    return tables.map((table, index) => this.generateMigration(table, index));
  }
}
