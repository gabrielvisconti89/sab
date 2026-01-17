import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ExportModalComponent, ExportFile } from './export-modal.component';
import { SqlGeneratorService } from '../../shared/services/sql-generator.service';
import { MigrationGeneratorService, MigrationFile } from '../../shared/services/migration-generator.service';
import { ToastService } from '../../shared/services/toast.service';
import { Project, Table, Column } from '../../models';

/**
 * Testes baseados na História de Usuário US03 - Exportação
 * - Exportar SQL (MySQL, PostgreSQL, SQLite, MariaDB)
 * - Exportar Laravel Migrations
 * - Exportar claude.md
 * - Download individual e ZIP
 * - Preview de arquivos gerados
 */
describe('ExportModalComponent', () => {
  let component: ExportModalComponent;
  let fixture: ComponentFixture<ExportModalComponent>;
  let sqlGeneratorSpy: jasmine.SpyObj<SqlGeneratorService>;
  let migrationGeneratorSpy: jasmine.SpyObj<MigrationGeneratorService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'A test project for unit testing',
    databaseType: 'mysql',
    databaseCharset: 'utf8mb4',
    databaseCollation: 'utf8mb4_unicode_ci',
    tablePrefix: '',
    isFavorite: false,
    progressPercentage: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockColumn: Column = {
    id: 1,
    tableId: 1,
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
  };

  const mockTable: Table = {
    id: 1,
    projectId: 1,
    name: 'users',
    description: 'Users table',
    hasTimestamps: true,
    hasSoftDelete: false,
    orderIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    columns: [mockColumn],
  };

  const mockMigration: MigrationFile = {
    filename: '2024_01_01_000000_create_users_table.php',
    content: '<?php // migration content',
  };

  beforeEach(async () => {
    sqlGeneratorSpy = jasmine.createSpyObj('SqlGeneratorService', ['generateFullSchema']);
    migrationGeneratorSpy = jasmine.createSpyObj('MigrationGeneratorService', ['generateAllMigrations']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['presentSuccess', 'presentError']);

    sqlGeneratorSpy.generateFullSchema.and.returnValue('CREATE TABLE users...');
    migrationGeneratorSpy.generateAllMigrations.and.returnValue([mockMigration]);
    toastServiceSpy.presentSuccess.and.returnValue(Promise.resolve());
    toastServiceSpy.presentError.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      declarations: [ExportModalComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: SqlGeneratorService, useValue: sqlGeneratorSpy },
        { provide: MigrationGeneratorService, useValue: migrationGeneratorSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportModalComponent);
    component = fixture.componentInstance;
  });

  // US03: Teste básico de criação
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // US03: Modal deve abrir quando isOpen for true
  describe('Modal visibility', () => {
    it('should have isOpen as false by default', () => {
      expect(component.isOpen).toBeFalse();
    });

    it('should reflect isOpen input', () => {
      component.isOpen = true;
      expect(component.isOpen).toBeTrue();
    });
  });

  // US03: Exibir opções de formato de exportação
  describe('Export format options', () => {
    it('should have SQL export option enabled by default', () => {
      expect(component.options.sql).toBeTrue();
    });

    it('should have Migrations export option enabled by default', () => {
      expect(component.options.migrations).toBeTrue();
    });

    it('should have Claude.md export option enabled by default', () => {
      expect(component.options.claudeMd).toBeTrue();
    });

    it('should have docs export option disabled by default', () => {
      expect(component.options.docs).toBeFalse();
    });
  });

  // US03: Exibir seletor de tipo de banco de dados
  describe('Database type selector', () => {
    it('should have MySQL as default database type', () => {
      expect(component.options.targetDatabase).toBe('mysql');
    });

    it('should have all database types available', () => {
      const types = component.databaseTypes.map(t => t.value);
      expect(types).toContain('mysql');
      expect(types).toContain('postgresql');
      expect(types).toContain('sqlite');
      expect(types).toContain('mariadb');
    });

    it('should use project database type on init if available', () => {
      component.project = { ...mockProject, databaseType: 'postgresql' };
      component.ngOnInit();
      expect(component.options.targetDatabase).toBe('postgresql');
    });
  });

  // US03: Gerar arquivos SQL quando formato SQL selecionado
  describe('SQL file generation', () => {
    beforeEach(() => {
      component.project = mockProject;
      component.tables = [mockTable];
    });

    it('should generate SQL file when sql option is enabled', async () => {
      component.options.sql = true;
      component.options.migrations = false;
      component.options.claudeMd = false;

      await component.generateExport();

      expect(sqlGeneratorSpy.generateFullSchema).toHaveBeenCalledWith(
        [mockTable],
        'mysql'
      );
      expect(component.generatedFiles.some(f => f.name === 'schema.sql')).toBeTrue();
    });

    it('should not generate SQL file when sql option is disabled', async () => {
      component.options.sql = false;
      component.options.migrations = false;
      component.options.claudeMd = true;

      await component.generateExport();

      expect(sqlGeneratorSpy.generateFullSchema).not.toHaveBeenCalled();
    });

    it('should generate SQL for PostgreSQL when selected', async () => {
      component.options.targetDatabase = 'postgresql';
      component.options.sql = true;
      component.options.migrations = false;
      component.options.claudeMd = false;

      await component.generateExport();

      expect(sqlGeneratorSpy.generateFullSchema).toHaveBeenCalledWith(
        [mockTable],
        'postgresql'
      );
    });
  });

  // US03: Gerar migrations quando formato Migrations selecionado
  describe('Migration file generation', () => {
    beforeEach(() => {
      component.project = mockProject;
      component.tables = [mockTable];
    });

    it('should generate migration files when migrations option is enabled', async () => {
      component.options.sql = false;
      component.options.migrations = true;
      component.options.claudeMd = false;

      await component.generateExport();

      expect(migrationGeneratorSpy.generateAllMigrations).toHaveBeenCalledWith([mockTable]);
      expect(component.generatedFiles.some(f => f.type === 'php')).toBeTrue();
    });

    it('should not generate migrations when migrations option is disabled', async () => {
      component.options.sql = false;
      component.options.migrations = false;
      component.options.claudeMd = true;

      await component.generateExport();

      expect(migrationGeneratorSpy.generateAllMigrations).not.toHaveBeenCalled();
    });
  });

  // US03: Gerar claude.md quando formato documentação selecionado
  describe('Claude.md generation', () => {
    beforeEach(() => {
      component.project = mockProject;
      component.tables = [mockTable];
    });

    it('should generate claude.md when claudeMd option is enabled', async () => {
      component.options.sql = false;
      component.options.migrations = false;
      component.options.claudeMd = true;

      await component.generateExport();

      expect(component.generatedFiles.some(f => f.name === 'claude.md')).toBeTrue();
    });

    it('should include project name in claude.md', () => {
      const content = component.generateClaudeMd();
      expect(content).toContain('# Test Project');
    });

    it('should include project description in claude.md', () => {
      const content = component.generateClaudeMd();
      expect(content).toContain('A test project for unit testing');
    });

    it('should include database configuration in claude.md', () => {
      const content = component.generateClaudeMd();
      expect(content).toContain('MYSQL');
      expect(content).toContain('utf8mb4');
    });

    it('should include table structure in claude.md', () => {
      const content = component.generateClaudeMd();
      expect(content).toContain('### users');
    });

    it('should return empty string if no project', () => {
      component.project = null;
      const content = component.generateClaudeMd();
      expect(content).toBe('');
    });
  });

  // US03: Preview de arquivos gerados
  describe('File preview', () => {
    const mockFile: ExportFile = {
      name: 'schema.sql',
      content: 'CREATE TABLE test...',
      type: 'sql',
    };

    it('should open preview for a file', () => {
      component.openPreview(mockFile);

      expect(component.showPreview).toBeTrue();
      expect(component.previewFile).toBe(mockFile);
    });

    it('should close preview', () => {
      component.showPreview = true;
      component.previewFile = mockFile;

      component.closePreview();

      expect(component.showPreview).toBeFalse();
      expect(component.previewFile).toBeNull();
    });
  });

  // US03: Copiar conteúdo para clipboard
  describe('Copy to clipboard', () => {
    beforeEach(() => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    });

    it('should copy content to clipboard and show success toast', async () => {
      await component.copyToClipboard('test content');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test content');
      expect(toastServiceSpy.presentSuccess).toHaveBeenCalled();
    });

    it('should show error toast when copy fails', async () => {
      (navigator.clipboard.writeText as jasmine.Spy).and.returnValue(Promise.reject('error'));

      await component.copyToClipboard('test content');

      expect(toastServiceSpy.presentError).toHaveBeenCalled();
    });
  });

  // US03: Download individual de arquivo
  describe('Individual file download', () => {
    it('should create download link for file', async () => {
      const mockFile: ExportFile = {
        name: 'schema.sql',
        content: 'CREATE TABLE test...',
        type: 'sql',
      };

      const createElementSpy = spyOn(document, 'createElement').and.callThrough();
      spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(URL, 'revokeObjectURL');

      await component.downloadFile(mockFile);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    });
  });

  // US03: Download ZIP de todos os arquivos
  describe('Download all as ZIP', () => {
    beforeEach(() => {
      component.project = mockProject;
      component.generatedFiles = [
        { name: 'schema.sql', content: 'SQL content', type: 'sql' },
        { name: 'migration.php', content: 'PHP content', type: 'php' },
        { name: 'claude.md', content: 'MD content', type: 'md' },
      ];
    });

    it('should create ZIP with all generated files', async () => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(URL, 'revokeObjectURL');

      await component.downloadAll();

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    });
  });

  // US03: Progresso durante geracao
  describe('Export progress', () => {
    beforeEach(() => {
      component.project = mockProject;
      component.tables = [mockTable];
    });

    it('should start with isExporting false', () => {
      expect(component.isExporting).toBeFalse();
    });

    it('should set isExporting to false after export completes', async () => {
      component.options.sql = true;

      await component.generateExport();

      expect(component.isExporting).toBeFalse();
    });

    it('should update progress during export', async () => {
      component.options.sql = true;
      component.options.migrations = true;
      component.options.claudeMd = true;

      await component.generateExport();

      expect(component.exportProgress).toBe(100);
    });

    it('should set exportComplete to true after export', async () => {
      await component.generateExport();

      expect(component.exportComplete).toBeTrue();
    });
  });

  // US03: Fechar modal
  describe('Modal close', () => {
    it('should emit close event on onClose', () => {
      spyOn(component.close, 'emit');

      component.onClose();

      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should reset preview state on close', () => {
      component.showPreview = true;
      component.previewFile = { name: 'test', content: 'test', type: 'sql' };
      component.exportComplete = true;

      component.onClose();

      expect(component.showPreview).toBeFalse();
      expect(component.previewFile).toBeNull();
      expect(component.exportComplete).toBeFalse();
    });
  });

  // US03: Validação de exportação
  describe('Export validation', () => {
    it('should not allow export when no tables', () => {
      component.tables = [];
      expect(component.canExport).toBeFalse();
    });

    it('should not allow export when no options selected', () => {
      component.tables = [mockTable];
      component.options.sql = false;
      component.options.migrations = false;
      component.options.claudeMd = false;

      expect(component.canExport).toBeFalse();
    });

    it('should allow export when tables exist and at least one option selected', () => {
      component.tables = [mockTable];
      component.options.sql = true;

      expect(component.canExport).toBeTrue();
    });
  });

  // US03: Ícones e cores de arquivos
  describe('File icons and colors', () => {
    it('should return correct icon for SQL files', () => {
      expect(component.getFileIcon('sql')).toBe('server-outline');
    });

    it('should return correct icon for PHP files', () => {
      expect(component.getFileIcon('php')).toBe('code-slash-outline');
    });

    it('should return correct icon for MD files', () => {
      expect(component.getFileIcon('md')).toBe('document-text-outline');
    });

    it('should return default icon for unknown types', () => {
      expect(component.getFileIcon('unknown')).toBe('document-outline');
    });

    it('should return correct color for SQL files', () => {
      expect(component.getFileColor('sql')).toBe('primary');
    });

    it('should return correct color for PHP files', () => {
      expect(component.getFileColor('php')).toBe('tertiary');
    });

    it('should return correct color for MD files', () => {
      expect(component.getFileColor('md')).toBe('secondary');
    });

    it('should return default color for unknown types', () => {
      expect(component.getFileColor('unknown')).toBe('medium');
    });
  });
});
