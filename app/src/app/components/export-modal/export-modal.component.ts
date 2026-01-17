import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Project, Table, DatabaseType } from '../../models';
import { SqlGeneratorService } from '../../shared/services/sql-generator.service';
import { MigrationGeneratorService, MigrationFile } from '../../shared/services/migration-generator.service';
import { DocumentationGeneratorService } from '../../shared/services/documentation-generator.service';
import { ToastService } from '../../shared/services/toast.service';
import * as JSZip from 'jszip';

export interface ExportOptions {
  sql: boolean;
  migrations: boolean;
  claudeMd: boolean;
  readme: boolean;
  targetDatabase: DatabaseType;
}

export interface SchemaValidationError {
  type: 'error' | 'warning';
  message: string;
  table?: string;
  column?: string;
}

export interface ExportFile {
  name: string;
  content: string;
  type: 'sql' | 'php' | 'md';
}

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.scss'],
  standalone: false,
})
export class ExportModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() project: Project | null = null;
  @Input() tables: Table[] = [];
  @Output() close = new EventEmitter<void>();

  options: ExportOptions = {
    sql: true,
    migrations: true,
    claudeMd: true,
    readme: true,
    targetDatabase: 'mysql',
  };

  validationErrors: SchemaValidationError[] = [];

  databaseTypes: { value: DatabaseType; label: string }[] = [
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'mariadb', label: 'MariaDB' },
  ];

  // Preview state
  showPreview = false;
  previewFile: ExportFile | null = null;
  generatedFiles: ExportFile[] = [];

  // Export state
  isExporting = false;
  exportProgress = 0;
  exportComplete = false;

  constructor(
    private actionSheetController: ActionSheetController,
    private sqlGenerator: SqlGeneratorService,
    private migrationGenerator: MigrationGeneratorService,
    private documentationGenerator: DocumentationGeneratorService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (this.project?.databaseType) {
      this.options.targetDatabase = this.project.databaseType;
    }
  }

  onClose() {
    this.showPreview = false;
    this.previewFile = null;
    this.exportComplete = false;
    this.validationErrors = [];
    this.close.emit();
  }

  async generateExport() {
    this.isExporting = true;
    this.exportProgress = 0;
    this.generatedFiles = [];
    this.validationErrors = [];

    try {
      // Validate schema first
      this.exportProgress = 10;
      this.validateSchema();

      // If there are blocking errors, stop
      const hasErrors = this.validationErrors.some((e) => e.type === 'error');
      if (hasErrors) {
        this.isExporting = false;
        await this.toastService.presentError('Corrija os erros antes de exportar');
        return;
      }

      // Generate SQL
      if (this.options.sql) {
        this.exportProgress = 25;
        const sqlContent = this.sqlGenerator.generateFullSchema(
          this.tables,
          this.options.targetDatabase
        );
        this.generatedFiles.push({
          name: 'schema.sql',
          content: sqlContent,
          type: 'sql',
        });
      }

      // Generate Migrations
      if (this.options.migrations) {
        this.exportProgress = 50;
        const migrations = this.migrationGenerator.generateAllMigrations(this.tables);
        migrations.forEach((migration) => {
          this.generatedFiles.push({
            name: migration.filename,
            content: migration.content,
            type: 'php',
          });
        });
      }

      // Generate claude.md
      if (this.options.claudeMd && this.project) {
        this.exportProgress = 70;
        const claudeMd = this.documentationGenerator.generateClaudeMd(this.project, this.tables);
        this.generatedFiles.push({
          name: 'claude.md',
          content: claudeMd,
          type: 'md',
        });
      }

      // Generate README.md
      if (this.options.readme && this.project) {
        this.exportProgress = 85;
        const readme = this.documentationGenerator.generateReadme(this.project, this.tables);
        this.generatedFiles.push({
          name: 'README.md',
          content: readme,
          type: 'md',
        });
      }

      this.exportProgress = 100;
      this.exportComplete = true;

      if (this.validationErrors.length > 0) {
        await this.toastService.presentInfo(
          `Exportado com ${this.validationErrors.length} aviso(s)`
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      await this.toastService.presentError('Erro ao gerar exportação');
    } finally {
      this.isExporting = false;
    }
  }

  validateSchema(): void {
    this.validationErrors = [];

    if (this.tables.length === 0) {
      this.validationErrors.push({
        type: 'warning',
        message: 'Nenhuma tabela definida no projeto',
      });
      return;
    }

    const tableNames = new Set<string>();

    this.tables.forEach((table) => {
      // Check for duplicate table names
      if (tableNames.has(table.name.toLowerCase())) {
        this.validationErrors.push({
          type: 'error',
          message: `Nome de tabela duplicado: ${table.name}`,
          table: table.name,
        });
      }
      tableNames.add(table.name.toLowerCase());

      // Check for tables without columns
      if (!table.columns || table.columns.length === 0) {
        this.validationErrors.push({
          type: 'warning',
          message: `Tabela sem colunas: ${table.name}`,
          table: table.name,
        });
      }

      // Check for primary key
      const hasPK = table.columns?.some((c) => c.isPrimaryKey);
      if (!hasPK) {
        this.validationErrors.push({
          type: 'warning',
          message: `Tabela sem chave primária: ${table.name}`,
          table: table.name,
        });
      }

      // Check for foreign key references
      table.columns?.forEach((col) => {
        if (col.isForeignKey && col.foreignKey) {
          const refTable = this.tables.find(
            (t) => t.name.toLowerCase() === col.foreignKey!.referenceTable.toLowerCase()
          );
          if (!refTable) {
            this.validationErrors.push({
              type: 'error',
              message: `FK referencia tabela inexistente: ${col.foreignKey.referenceTable}`,
              table: table.name,
              column: col.name,
            });
          } else {
            const refColumn = refTable.columns?.find(
              (c) => c.name.toLowerCase() === col.foreignKey!.referenceColumn.toLowerCase()
            );
            if (!refColumn) {
              this.validationErrors.push({
                type: 'error',
                message: `FK referencia coluna inexistente: ${col.foreignKey.referenceTable}.${col.foreignKey.referenceColumn}`,
                table: table.name,
                column: col.name,
              });
            }
          }
        }
      });

      // Check column names within table
      const columnNames = new Set<string>();
      table.columns?.forEach((col) => {
        if (columnNames.has(col.name.toLowerCase())) {
          this.validationErrors.push({
            type: 'error',
            message: `Nome de coluna duplicado: ${col.name}`,
            table: table.name,
            column: col.name,
          });
        }
        columnNames.add(col.name.toLowerCase());
      });
    });
  }

  openPreview(file: ExportFile) {
    this.previewFile = file;
    this.showPreview = true;
  }

  closePreview() {
    this.showPreview = false;
    this.previewFile = null;
  }

  async copyToClipboard(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      await this.toastService.presentSuccess('Copiado para a área de transferência');
    } catch (error) {
      console.error('Failed to copy:', error);
      await this.toastService.presentError('Falha ao copiar');
    }
  }

  async downloadFile(file: ExportFile) {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  }

  async downloadAll() {
    const zip = new JSZip();
    const migrationsFolder = zip.folder('migrations');

    for (const file of this.generatedFiles) {
      if (file.type === 'php') {
        migrationsFolder?.file(file.name, file.content);
      } else {
        zip.file(file.name, file.content);
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const projectName = this.project?.name?.toLowerCase().replace(/\s+/g, '-') || 'export';
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}-export.zip`;
    link.click();
    URL.revokeObjectURL(url);
  }

  getFileIcon(type: string): string {
    switch (type) {
      case 'sql':
        return 'server-outline';
      case 'php':
        return 'code-slash-outline';
      case 'md':
        return 'document-text-outline';
      default:
        return 'document-outline';
    }
  }

  getFileColor(type: string): string {
    switch (type) {
      case 'sql':
        return 'primary';
      case 'php':
        return 'tertiary';
      case 'md':
        return 'secondary';
      default:
        return 'medium';
    }
  }

  get canExport(): boolean {
    const hasOutput = this.options.sql || this.options.migrations || this.options.claudeMd || this.options.readme;
    return this.tables.length > 0 && hasOutput;
  }

  get hasValidationErrors(): boolean {
    return this.validationErrors.some((e) => e.type === 'error');
  }

  get hasValidationWarnings(): boolean {
    return this.validationErrors.some((e) => e.type === 'warning');
  }

  getDatabaseLabel(value: DatabaseType): string {
    const db = this.databaseTypes.find(d => d.value === value);
    return db?.label || value;
  }

  async openDatabaseSelector() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Banco de Dados',
      buttons: [
        ...this.databaseTypes.map(db => ({
          text: db.label,
          handler: () => {
            this.options.targetDatabase = db.value;
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }
}
