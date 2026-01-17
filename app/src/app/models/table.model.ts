export interface Table {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  hasTimestamps: boolean;
  hasSoftDelete: boolean;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  columns?: Column[];
}

export interface ForeignKey {
  referenceTable: string;
  referenceColumn: string;
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface Column {
  id: number;
  tableId: number;
  name: string;
  description?: string;
  dataType: DataType;
  dataLength?: number;
  dataPrecision?: number;
  dataScale?: number;
  isNullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  isUnique: boolean;
  isIndexed: boolean;
  isUnsigned: boolean;
  isForeignKey: boolean;
  foreignKey?: ForeignKey;
  enumValues?: string[];
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export type DataType =
  // Numeric
  | 'TINYINT'
  | 'SMALLINT'
  | 'MEDIUMINT'
  | 'INT'
  | 'BIGINT'
  | 'DECIMAL'
  | 'FLOAT'
  | 'DOUBLE'
  // Text
  | 'CHAR'
  | 'VARCHAR'
  | 'TINYTEXT'
  | 'TEXT'
  | 'MEDIUMTEXT'
  | 'LONGTEXT'
  // Date/Time
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'TIMESTAMP'
  | 'YEAR'
  // Binary
  | 'BINARY'
  | 'VARBINARY'
  | 'TINYBLOB'
  | 'BLOB'
  | 'MEDIUMBLOB'
  | 'LONGBLOB'
  // JSON
  | 'JSON'
  // Special
  | 'BOOLEAN'
  | 'ENUM'
  | 'SET'
  | 'UUID';

export type DataTypeCategory = 'numeric' | 'text' | 'datetime' | 'binary' | 'json' | 'special';

export const DATA_TYPE_CATEGORIES: Record<DataTypeCategory, DataType[]> = {
  numeric: ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE'],
  text: ['CHAR', 'VARCHAR', 'TINYTEXT', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT'],
  datetime: ['DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR'],
  binary: ['BINARY', 'VARBINARY', 'TINYBLOB', 'BLOB', 'MEDIUMBLOB', 'LONGBLOB'],
  json: ['JSON'],
  special: ['BOOLEAN', 'ENUM', 'SET', 'UUID'],
};

export const DATA_TYPES_WITH_LENGTH: DataType[] = ['CHAR', 'VARCHAR', 'BINARY', 'VARBINARY'];
export const DATA_TYPES_WITH_PRECISION: DataType[] = ['DECIMAL', 'FLOAT', 'DOUBLE'];
export const DATA_TYPES_WITH_ENUM: DataType[] = ['ENUM', 'SET'];
export const DATA_TYPES_NUMERIC: DataType[] = ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE'];
