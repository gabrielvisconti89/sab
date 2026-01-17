export type RelationshipType = '1:1' | '1:N' | 'N:N';
export type ReferentialAction = 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';

export interface Relationship {
  id: number;
  projectId: number;
  sourceTableId: number;
  targetTableId: number;
  sourceColumnId: number;
  targetColumnId: number;
  type: RelationshipType;
  onDelete: ReferentialAction;
  onUpdate: ReferentialAction;
  pivotTableName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelationshipDisplay extends Relationship {
  sourceTableName?: string;
  targetTableName?: string;
  sourceColumnName?: string;
  targetColumnName?: string;
}
