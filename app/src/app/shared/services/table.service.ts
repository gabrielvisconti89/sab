import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import { Table, Column } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  constructor(private storageService: StorageService) {}

  // === Table CRUD ===

  async getTablesByProject(projectId: number): Promise<Table[]> {
    const tables = await this.storageService.get<Table[]>(STORAGE_KEYS.tables(projectId)) ?? [];
    return tables.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getTable(projectId: number, tableId: number): Promise<Table | null> {
    const tables = await this.getTablesByProject(projectId);
    return tables.find(t => t.id === tableId) ?? null;
  }

  async createTable(projectId: number, data: Omit<Table, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'orderIndex'>): Promise<Table> {
    const tables = await this.getTablesByProject(projectId);
    const now = new Date();
    const id = this.generateId();

    const table: Table = {
      ...data,
      id,
      projectId,
      orderIndex: tables.length,
      columns: [],
      createdAt: now,
      updatedAt: now,
    };

    tables.push(table);
    await this.storageService.set(STORAGE_KEYS.tables(projectId), tables);

    return table;
  }

  async updateTable(projectId: number, tableId: number, updates: Partial<Table>): Promise<Table | null> {
    const tables = await this.getTablesByProject(projectId);
    const index = tables.findIndex(t => t.id === tableId);

    if (index === -1) return null;

    const updated: Table = {
      ...tables[index],
      ...updates,
      id: tableId,
      projectId,
      updatedAt: new Date(),
    };

    tables[index] = updated;
    await this.storageService.set(STORAGE_KEYS.tables(projectId), tables);

    return updated;
  }

  async deleteTable(projectId: number, tableId: number): Promise<boolean> {
    const tables = await this.getTablesByProject(projectId);
    const filtered = tables.filter(t => t.id !== tableId);

    if (filtered.length === tables.length) return false;

    // Reindex remaining tables
    filtered.forEach((t, i) => t.orderIndex = i);

    await this.storageService.set(STORAGE_KEYS.tables(projectId), filtered);
    return true;
  }

  async reorderTables(projectId: number, tableIds: number[]): Promise<void> {
    const tables = await this.getTablesByProject(projectId);

    tableIds.forEach((id, index) => {
      const table = tables.find(t => t.id === id);
      if (table) table.orderIndex = index;
    });

    tables.sort((a, b) => a.orderIndex - b.orderIndex);
    await this.storageService.set(STORAGE_KEYS.tables(projectId), tables);
  }

  async duplicateTable(projectId: number, tableId: number, newName: string): Promise<Table | null> {
    const original = await this.getTable(projectId, tableId);
    if (!original) return null;

    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, orderIndex: _orderIndex, ...rest } = original;

    const duplicatedColumns = (original.columns ?? []).map(col => ({
      ...col,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return this.createTable(projectId, {
      ...rest,
      name: newName,
      columns: duplicatedColumns,
    });
  }

  // === Column CRUD ===

  async getColumns(projectId: number, tableId: number): Promise<Column[]> {
    const table = await this.getTable(projectId, tableId);
    return (table?.columns ?? []).sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async addColumn(projectId: number, tableId: number, data: Omit<Column, 'id' | 'tableId' | 'createdAt' | 'updatedAt' | 'orderIndex'>): Promise<Column | null> {
    const tables = await this.getTablesByProject(projectId);
    const tableIndex = tables.findIndex(t => t.id === tableId);

    if (tableIndex === -1) return null;

    const table = tables[tableIndex];
    const columns = table.columns ?? [];
    const now = new Date();
    const id = this.generateId();

    const column: Column = {
      ...data,
      id,
      tableId,
      orderIndex: columns.length,
      createdAt: now,
      updatedAt: now,
    };

    table.columns = [...columns, column];
    table.updatedAt = now;
    tables[tableIndex] = table;

    await this.storageService.set(STORAGE_KEYS.tables(projectId), tables);
    return column;
  }

  async updateColumn(projectId: number, tableId: number, columnId: number, updates: Partial<Column>): Promise<Column | null> {
    const tables = await this.getTablesByProject(projectId);
    const tableIndex = tables.findIndex(t => t.id === tableId);

    if (tableIndex === -1) return null;

    const table = tables[tableIndex];
    const columns = table.columns ?? [];
    const columnIndex = columns.findIndex(c => c.id === columnId);

    if (columnIndex === -1) return null;

    const now = new Date();
    const updated: Column = {
      ...columns[columnIndex],
      ...updates,
      id: columnId,
      tableId,
      updatedAt: now,
    };

    columns[columnIndex] = updated;
    table.columns = columns;
    table.updatedAt = now;
    tables[tableIndex] = table;

    await this.storageService.set(STORAGE_KEYS.tables(projectId), tables);
    return updated;
  }

  async deleteColumn(projectId: number, tableId: number, columnId: number): Promise<boolean> {
    const tables = await this.getTablesByProject(projectId);
    const tableIndex = tables.findIndex(t => t.id === tableId);

    if (tableIndex === -1) return false;

    const table = tables[tableIndex];
    const columns = table.columns ?? [];
    const filtered = columns.filter(c => c.id !== columnId);

    if (filtered.length === columns.length) return false;

    // Reindex remaining columns
    filtered.forEach((c, i) => c.orderIndex = i);

    table.columns = filtered;
    table.updatedAt = new Date();
    tables[tableIndex] = table;

    await this.storageService.set(STORAGE_KEYS.tables(projectId), tables);
    return true;
  }

  async reorderColumns(projectId: number, tableId: number, columnIds: number[]): Promise<void> {
    const tables = await this.getTablesByProject(projectId);
    const tableIndex = tables.findIndex(t => t.id === tableId);

    if (tableIndex === -1) return;

    const table = tables[tableIndex];
    const columns = table.columns ?? [];

    columnIds.forEach((id, index) => {
      const column = columns.find(c => c.id === id);
      if (column) column.orderIndex = index;
    });

    columns.sort((a, b) => a.orderIndex - b.orderIndex);
    table.columns = columns;
    table.updatedAt = new Date();
    tables[tableIndex] = table;

    await this.storageService.set(STORAGE_KEYS.tables(projectId), tables);
  }

  // === Bulk Operations ===

  async seedMockTables(projectId: number, tables: Omit<Table, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'orderIndex'>[]): Promise<void> {
    const now = new Date();
    const tablesWithIds: Table[] = tables.map((t, index) => ({
      ...t,
      id: this.generateId() + index,
      projectId,
      orderIndex: index,
      createdAt: now,
      updatedAt: now,
      columns: (t.columns ?? []).map((col, colIndex) => ({
        ...col,
        id: this.generateId() + colIndex,
        createdAt: now,
        updatedAt: now,
      })),
    }));

    await this.storageService.set(STORAGE_KEYS.tables(projectId), tablesWithIds);
  }

  // === Utility ===

  async getTableNames(projectId: number): Promise<{ id: number; name: string }[]> {
    const tables = await this.getTablesByProject(projectId);
    return tables.map(t => ({ id: t.id, name: t.name }));
  }

  private generateId(): number {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
  }
}
