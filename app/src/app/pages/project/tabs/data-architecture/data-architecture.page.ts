import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Table, Column, DataType, DATA_TYPE_CATEGORIES, DataTypeCategory, ForeignKey } from '../../../../models';
import { SqlGeneratorService } from '../../../../shared/services/sql-generator.service';
import { TableService } from '../../../../shared/services/table.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-data-architecture',
  templateUrl: './data-architecture.page.html',
  styleUrls: ['./data-architecture.page.scss'],
  standalone: false,
})
export class DataArchitecturePage implements OnInit {
  projectId: number = 0;
  tables: Table[] = [];
  selectedTable: Table | null = null;
  isLoading = true;

  // Modal states
  showTableModal = false;
  showColumnModal = false;
  showSqlPreview = false;

  // Form data
  tableForm = {
    id: 0,
    name: '',
    description: '',
    hasTimestamps: true,
    hasSoftDelete: false,
  };

  columnForm: Partial<Column> = this.getEmptyColumnForm();

  // Data type options
  dataTypeCategories = DATA_TYPE_CATEGORIES;
  selectedCategory: DataTypeCategory = 'text';

  // SQL Preview
  sqlPreviewContent = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private sqlGenerator: SqlGeneratorService,
    private tableService: TableService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.extractProjectId();
  }

  private extractProjectId() {
    // Primeiro, tentar obter da URL diretamente
    const urlParts = this.router.url.split('/');
    const projectIndex = urlParts.indexOf('project');
    if (projectIndex !== -1 && urlParts[projectIndex + 1]) {
      const idFromUrl = parseInt(urlParts[projectIndex + 1], 10);
      if (!isNaN(idFromUrl)) {
        this.projectId = idFromUrl;
        this.loadTables();
        return;
      }
    }

    // Fallback: percorrer a arvore de rotas
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const id = currentRoute.snapshot.params['id'];
      if (id) {
        this.projectId = +id;
        this.loadTables();
        return;
      }
      currentRoute = currentRoute.parent;
    }

    console.error('Project ID not found in route');
    this.isLoading = false;
  }

  async loadTables() {
    this.isLoading = true;
    try {
      this.tables = await this.tableService.getTablesByProject(this.projectId);
    } catch (error) {
      console.error('Failed to load tables:', error);
      this.tables = [];
    } finally {
      this.isLoading = false;
    }
  }

  // Table CRUD
  openCreateTable() {
    this.tableForm = {
      id: 0,
      name: '',
      description: '',
      hasTimestamps: true,
      hasSoftDelete: false,
    };
    this.showTableModal = true;
  }

  openEditTable(table: Table, event: Event) {
    event.stopPropagation();
    this.tableForm = {
      id: table.id,
      name: table.name,
      description: table.description || '',
      hasTimestamps: table.hasTimestamps,
      hasSoftDelete: table.hasSoftDelete,
    };
    this.showTableModal = true;
  }

  async saveTable() {
    if (!this.tableForm.name.trim()) return;

    try {
      const tableName = this.tableForm.name.trim().toLowerCase().replace(/\s+/g, '_');

      if (this.tableForm.id === 0) {
        // Create new table
        const newTable = await this.tableService.createTable(this.projectId, {
          name: tableName,
          description: this.tableForm.description.trim() || undefined,
          hasTimestamps: this.tableForm.hasTimestamps,
          hasSoftDelete: this.tableForm.hasSoftDelete,
          columns: this.getDefaultColumns(this.tableForm.hasTimestamps, this.tableForm.hasSoftDelete),
        });

        if (newTable) {
          await this.loadTables();
        }
      } else {
        // Update existing table
        await this.tableService.updateTable(this.projectId, this.tableForm.id, {
          name: tableName,
          description: this.tableForm.description.trim() || undefined,
          hasTimestamps: this.tableForm.hasTimestamps,
          hasSoftDelete: this.tableForm.hasSoftDelete,
        });

        await this.loadTables();

        // Refresh selected table if it was the one edited
        if (this.selectedTable?.id === this.tableForm.id) {
          this.selectedTable = await this.tableService.getTable(this.projectId, this.tableForm.id);
        }
      }
    } catch (error) {
      console.error('Failed to save table:', error);
    }

    this.closeTableModal();
  }

  closeTableModal() {
    this.showTableModal = false;
  }

  async confirmDeleteTable(table: Table, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Excluir tabela',
      message: `Tem certeza que deseja excluir a tabela "${table.name}"? Todas as colunas serão removidas.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            try {
              await this.tableService.deleteTable(this.projectId, table.id);
              await this.loadTables();

              if (this.selectedTable?.id === table.id) {
                this.selectedTable = null;
              }
            } catch (error) {
              console.error('Failed to delete table:', error);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async selectTable(table: Table) {
    this.selectedTable = await this.tableService.getTable(this.projectId, table.id);
  }

  backToTables() {
    this.selectedTable = null;
  }

  // Foreign Key options
  referentialActions: Array<'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'> = [
    'CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION'
  ];

  // Column CRUD
  getEmptyColumnForm(): Partial<Column> {
    return {
      id: 0,
      name: '',
      description: '',
      dataType: 'VARCHAR',
      dataLength: 255,
      isNullable: false,
      defaultValue: '',
      isPrimaryKey: false,
      isAutoIncrement: false,
      isUnique: false,
      isIndexed: false,
      isUnsigned: false,
      isForeignKey: false,
      foreignKey: undefined,
      enumValues: [],
    };
  }

  getEmptyForeignKey(): ForeignKey {
    return {
      referenceTable: '',
      referenceColumn: '',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    };
  }

  onForeignKeyToggle() {
    if (this.columnForm.isForeignKey) {
      this.columnForm.foreignKey = this.getEmptyForeignKey();
      // Auto-set indexed for FK columns
      this.columnForm.isIndexed = true;
    } else {
      this.columnForm.foreignKey = undefined;
    }
  }

  getAvailableTables(): Table[] {
    // Return all tables except the current one (to avoid self-reference)
    return this.tables.filter(t => t.id !== this.selectedTable?.id);
  }

  getColumnsForTable(tableName: string): Column[] {
    const table = this.tables.find(t => t.name === tableName);
    return table?.columns || [];
  }

  openCreateColumn() {
    this.columnForm = this.getEmptyColumnForm();
    this.selectedCategory = 'text';
    this.showColumnModal = true;
  }

  openEditColumn(column: Column, event: Event) {
    event.stopPropagation();
    this.columnForm = { ...column };
    this.selectedCategory = this.getCategoryForType(column.dataType);
    this.showColumnModal = true;
  }

  getCategoryForType(type: DataType): DataTypeCategory {
    for (const [category, types] of Object.entries(DATA_TYPE_CATEGORIES)) {
      if (types.includes(type)) {
        return category as DataTypeCategory;
      }
    }
    return 'text';
  }

  onCategoryChange() {
    const types = this.dataTypeCategories[this.selectedCategory];
    if (types && types.length > 0) {
      this.columnForm.dataType = types[0];
    }
  }

  async saveColumn() {
    if (!this.columnForm.name?.trim() || !this.selectedTable) return;

    try {
      const columnName = this.columnForm.name.trim().toLowerCase().replace(/\s+/g, '_');

      const columnData = {
        name: columnName,
        description: this.columnForm.description?.trim() || undefined,
        dataType: this.columnForm.dataType!,
        dataLength: this.columnForm.dataLength,
        dataPrecision: this.columnForm.dataPrecision,
        dataScale: this.columnForm.dataScale,
        isNullable: this.columnForm.isNullable || false,
        defaultValue: this.columnForm.defaultValue?.trim() || undefined,
        isPrimaryKey: this.columnForm.isPrimaryKey || false,
        isAutoIncrement: this.columnForm.isAutoIncrement || false,
        isUnique: this.columnForm.isUnique || false,
        isIndexed: this.columnForm.isIndexed || false,
        isUnsigned: this.columnForm.isUnsigned || false,
        isForeignKey: this.columnForm.isForeignKey || false,
        foreignKey: this.columnForm.isForeignKey ? this.columnForm.foreignKey : undefined,
        enumValues: this.columnForm.enumValues,
      };

      if (this.columnForm.id === 0) {
        // Create new column
        await this.tableService.addColumn(this.projectId, this.selectedTable.id, columnData);
      } else {
        // Update existing column
        await this.tableService.updateColumn(
          this.projectId,
          this.selectedTable.id,
          this.columnForm.id!,
          columnData
        );
      }

      // Refresh the selected table to get updated columns
      this.selectedTable = await this.tableService.getTable(this.projectId, this.selectedTable.id);
      await this.loadTables();
    } catch (error) {
      console.error('Failed to save column:', error);
    }

    this.closeColumnModal();
  }

  closeColumnModal() {
    this.showColumnModal = false;
  }

  onEnumValuesChange(event: any) {
    const value = event.target?.value || '';
    this.columnForm.enumValues = value
      .split(',')
      .map((v: string) => v.trim())
      .filter((v: string) => v);
  }

  async confirmDeleteColumn(column: Column, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Excluir coluna',
      message: `Tem certeza que deseja excluir a coluna "${column.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            try {
              if (this.selectedTable) {
                await this.tableService.deleteColumn(this.projectId, this.selectedTable.id, column.id);
                this.selectedTable = await this.tableService.getTable(this.projectId, this.selectedTable.id);
                await this.loadTables();
              }
            } catch (error) {
              console.error('Failed to delete column:', error);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  // SQL Preview
  openSqlPreview() {
    this.sqlPreviewContent = this.generateSql();
    this.showSqlPreview = true;
  }

  closeSqlPreview() {
    this.showSqlPreview = false;
  }

  generateSql(): string {
    if (!this.selectedTable) return '';
    return this.sqlGenerator.generateCreateTable(this.selectedTable, 'mysql');
  }

  isNumericType(type: DataType): boolean {
    return DATA_TYPE_CATEGORIES.numeric.includes(type);
  }

  needsLength(type: DataType): boolean {
    return ['VARCHAR', 'CHAR', 'BINARY', 'VARBINARY'].includes(type);
  }

  needsPrecision(type: DataType): boolean {
    return ['DECIMAL', 'FLOAT', 'DOUBLE'].includes(type);
  }

  needsEnumValues(type: DataType): boolean {
    return ['ENUM', 'SET'].includes(type);
  }

  // Helper methods
  getDefaultColumns(hasTimestamps: boolean, hasSoftDelete: boolean): Column[] {
    const columns: Column[] = [
      {
        id: Date.now(),
        tableId: 0,
        name: 'id',
        dataType: 'BIGINT',
        isNullable: false,
        isPrimaryKey: true,
        isAutoIncrement: true,
        isUnique: false,
        isIndexed: false,
        isUnsigned: true,
        isForeignKey: false,
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    return columns;
  }

  getColumnBadges(column: Column): string[] {
    const badges: string[] = [];
    if (column.isPrimaryKey) badges.push('PK');
    if (column.isForeignKey) badges.push('FK');
    if (column.isUnique) badges.push('UQ');
    if (column.isIndexed && !column.isForeignKey) badges.push('IDX');
    if (column.isAutoIncrement) badges.push('AI');
    return badges;
  }

  getColumnTypeDisplay(column: Column): string {
    let display = column.dataType;
    if (column.dataLength) {
      display += `(${column.dataLength})`;
    } else if (column.dataPrecision && column.dataScale !== undefined) {
      display += `(${column.dataPrecision},${column.dataScale})`;
    }
    if (column.isUnsigned && this.isNumericType(column.dataType)) {
      display += ' UNSIGNED';
    }
    return display;
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      await this.toastService.presentSuccess('SQL copiado para a area de transferencia');
    } catch (error) {
      await this.toastService.presentError('Falha ao copiar');
    }
  }

  // Category labels
  categoryLabels: Record<DataTypeCategory, string> = {
    numeric: 'Numerico',
    text: 'Texto',
    datetime: 'Data/Hora',
    binary: 'Binario',
    json: 'JSON',
    special: 'Especial',
  };

  getCategoryLabel(category: DataTypeCategory): string {
    return this.categoryLabels[category] || category;
  }

  // Action Sheet Selectors
  async openCategorySelector() {
    const categories: DataTypeCategory[] = ['numeric', 'text', 'datetime', 'binary', 'json', 'special'];
    const actionSheet = await this.actionSheetController.create({
      header: 'Categoria',
      buttons: [
        ...categories.map(cat => ({
          text: this.getCategoryLabel(cat),
          handler: () => {
            this.selectedCategory = cat;
            this.onCategoryChange();
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async openDataTypeSelector() {
    const types = this.dataTypeCategories[this.selectedCategory] || [];
    const actionSheet = await this.actionSheetController.create({
      header: 'Tipo de Dado',
      buttons: [
        ...types.map(type => ({
          text: type,
          handler: () => {
            this.columnForm.dataType = type;
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async openReferenceTableSelector() {
    const tables = this.getAvailableTables();
    const actionSheet = await this.actionSheetController.create({
      header: 'Tabela Referenciada',
      buttons: [
        ...tables.map(table => ({
          text: table.name,
          handler: () => {
            if (this.columnForm.foreignKey) {
              this.columnForm.foreignKey.referenceTable = table.name;
              this.columnForm.foreignKey.referenceColumn = '';
            }
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async openReferenceColumnSelector() {
    if (!this.columnForm.foreignKey?.referenceTable) return;
    const columns = this.getColumnsForTable(this.columnForm.foreignKey.referenceTable);
    const actionSheet = await this.actionSheetController.create({
      header: 'Coluna Referenciada',
      buttons: [
        ...columns.map(col => ({
          text: `${col.name} (${col.dataType})`,
          handler: () => {
            if (this.columnForm.foreignKey) {
              this.columnForm.foreignKey.referenceColumn = col.name;
            }
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async openOnDeleteSelector() {
    const actionSheet = await this.actionSheetController.create({
      header: 'ON DELETE',
      buttons: [
        ...this.referentialActions.map(action => ({
          text: action,
          handler: () => {
            if (this.columnForm.foreignKey) {
              this.columnForm.foreignKey.onDelete = action;
            }
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async openOnUpdateSelector() {
    const actionSheet = await this.actionSheetController.create({
      header: 'ON UPDATE',
      buttons: [
        ...this.referentialActions.map(action => ({
          text: action,
          handler: () => {
            if (this.columnForm.foreignKey) {
              this.columnForm.foreignKey.onUpdate = action;
            }
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }
}
