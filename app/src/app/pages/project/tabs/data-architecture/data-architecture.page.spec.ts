import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DataArchitecturePage } from './data-architecture.page';
import { SqlGeneratorService } from '../../../../shared/services/sql-generator.service';
import { TableService } from '../../../../shared/services/table.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Table, Column, DATA_TYPE_CATEGORIES } from '../../../../models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * Testes baseados na História de Usuário US02 - Modelagem de Banco de Dados
 * - Criar tabelas
 * - Adicionar colunas com tipos de dados
 * - Configurar relacionamentos/foreign keys
 * - Visualizar preview SQL
 * - Reordenar colunas via drag & drop
 */
describe('DataArchitecturePage', () => {
  let component: DataArchitecturePage;
  let fixture: ComponentFixture<DataArchitecturePage>;
  let sqlGeneratorSpy: jasmine.SpyObj<SqlGeneratorService>;
  let tableServiceSpy: jasmine.SpyObj<TableService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

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

  beforeEach(async () => {
    sqlGeneratorSpy = jasmine.createSpyObj('SqlGeneratorService', ['generateCreateTable']);
    tableServiceSpy = jasmine.createSpyObj('TableService', [
      'getTablesByProject',
      'getTable',
      'createTable',
      'updateTable',
      'deleteTable',
      'addColumn',
      'updateColumn',
      'deleteColumn',
    ]);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['presentSuccess', 'presentError']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);

    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateBack'], {
      router$: new BehaviorSubject(null),
    });

    tableServiceSpy.getTablesByProject.and.returnValue(Promise.resolve([mockTable]));
    tableServiceSpy.getTable.and.returnValue(Promise.resolve(mockTable));
    tableServiceSpy.createTable.and.returnValue(Promise.resolve(mockTable));
    tableServiceSpy.updateTable.and.returnValue(Promise.resolve(mockTable));
    tableServiceSpy.deleteTable.and.returnValue(Promise.resolve(true));
    tableServiceSpy.addColumn.and.returnValue(Promise.resolve(mockColumn));
    tableServiceSpy.updateColumn.and.returnValue(Promise.resolve(mockColumn));
    tableServiceSpy.deleteColumn.and.returnValue(Promise.resolve(true));
    sqlGeneratorSpy.generateCreateTable.and.returnValue('CREATE TABLE users...');
    toastServiceSpy.presentSuccess.and.returnValue(Promise.resolve());
    toastServiceSpy.presentError.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      declarations: [DataArchitecturePage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: SqlGeneratorService, useValue: sqlGeneratorSpy },
        { provide: TableService, useValue: tableServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: NavController, useValue: navControllerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              parent: {
                snapshot: { params: { id: '1' } },
              },
            },
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DataArchitecturePage);
    component = fixture.componentInstance;
  });

  // US02: Teste básico de criação
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // US02: Carregar lista de tabelas
  describe('Table loading', () => {
    it('should load tables on init', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(tableServiceSpy.getTablesByProject).toHaveBeenCalledWith(1);
      expect(component.tables).toEqual([mockTable]);
    });

    it('should set isLoading to false after loading', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isLoading).toBeFalse();
    });

    it('should handle load error gracefully', async () => {
      tableServiceSpy.getTablesByProject.and.returnValue(Promise.reject('error'));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tables).toEqual([]);
      expect(component.isLoading).toBeFalse();
    });
  });

  // US02: Criar nova tabela
  describe('Create table', () => {
    it('should open create table modal', () => {
      component.openCreateTable();

      expect(component.showTableModal).toBeTrue();
      expect(component.tableForm.id).toBe(0);
      expect(component.tableForm.name).toBe('');
    });

    it('should have timestamps enabled by default for new table', () => {
      component.openCreateTable();
      expect(component.tableForm.hasTimestamps).toBeTrue();
    });

    it('should have soft delete disabled by default for new table', () => {
      component.openCreateTable();
      expect(component.tableForm.hasSoftDelete).toBeFalse();
    });

    it('should save new table', async () => {
      component.projectId = 1;
      component.tableForm = {
        id: 0,
        name: 'products',
        description: 'Products table',
        hasTimestamps: true,
        hasSoftDelete: false,
      };

      await component.saveTable();

      expect(tableServiceSpy.createTable).toHaveBeenCalled();
    });

    it('should not save table with empty name', async () => {
      component.tableForm = {
        id: 0,
        name: '   ',
        description: '',
        hasTimestamps: true,
        hasSoftDelete: false,
      };

      await component.saveTable();

      expect(tableServiceSpy.createTable).not.toHaveBeenCalled();
    });

    it('should close modal after saving', async () => {
      component.projectId = 1;
      component.showTableModal = true;
      component.tableForm = {
        id: 0,
        name: 'products',
        description: '',
        hasTimestamps: true,
        hasSoftDelete: false,
      };

      await component.saveTable();

      expect(component.showTableModal).toBeFalse();
    });
  });

  // US02: Editar tabela existente
  describe('Edit table', () => {
    it('should populate form when editing table', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.openEditTable(mockTable, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.tableForm.id).toBe(1);
      expect(component.tableForm.name).toBe('users');
      expect(component.showTableModal).toBeTrue();
    });

    it('should update existing table', async () => {
      component.projectId = 1;
      component.tableForm = {
        id: 1,
        name: 'users_updated',
        description: 'Updated description',
        hasTimestamps: true,
        hasSoftDelete: true,
      };

      await component.saveTable();

      expect(tableServiceSpy.updateTable).toHaveBeenCalled();
    });
  });

  // US02: Excluir tabela com confirmacao
  describe('Delete table', () => {
    let alertPresent: jasmine.Spy;

    beforeEach(() => {
      alertPresent = jasmine.createSpy('present');
      alertControllerSpy.create.and.returnValue(
        Promise.resolve({
          present: alertPresent,
        } as any)
      );
    });

    it('should show confirmation dialog before deleting', async () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      await component.confirmDeleteTable(mockTable, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(alertControllerSpy.create).toHaveBeenCalled();
      expect(alertPresent).toHaveBeenCalled();
    });

    it('should include table name in confirmation message', async () => {
      const event = new Event('click');
      await component.confirmDeleteTable(mockTable, event);

      const createCall = alertControllerSpy.create.calls.mostRecent();
      const config = createCall.args[0]!;

      expect(config.message).toContain('users');
    });
  });

  // US02: Selecionar tabela
  describe('Select table', () => {
    beforeEach(() => {
      component.projectId = 1;
    });

    it('should select table and load details', async () => {
      await component.selectTable(mockTable);

      expect(tableServiceSpy.getTable).toHaveBeenCalledWith(1, 1);
      expect(component.selectedTable).toEqual(mockTable);
    });

    it('should go back to tables list', () => {
      component.selectedTable = mockTable;
      component.backToTables();
      expect(component.selectedTable).toBeNull();
    });
  });

  // US02: Adicionar coluna a tabela
  describe('Add column', () => {
    beforeEach(() => {
      component.selectedTable = mockTable;
    });

    it('should open create column modal', () => {
      component.openCreateColumn();

      expect(component.showColumnModal).toBeTrue();
      expect(component.columnForm.id).toBe(0);
      expect(component.columnForm.name).toBe('');
    });

    it('should have VARCHAR as default data type', () => {
      component.openCreateColumn();
      expect(component.columnForm.dataType).toBe('VARCHAR');
    });

    it('should have 255 as default length', () => {
      component.openCreateColumn();
      expect(component.columnForm.dataLength).toBe(255);
    });

    it('should save new column', async () => {
      component.projectId = 1;
      component.columnForm = {
        id: 0,
        name: 'email',
        dataType: 'VARCHAR',
        dataLength: 255,
        isNullable: false,
        isPrimaryKey: false,
        isAutoIncrement: false,
        isUnique: true,
        isIndexed: false,
        isUnsigned: false,
        isForeignKey: false,
      };

      await component.saveColumn();

      expect(tableServiceSpy.addColumn).toHaveBeenCalled();
    });

    it('should not save column with empty name', async () => {
      component.columnForm = {
        id: 0,
        name: '   ',
        dataType: 'VARCHAR',
      };

      await component.saveColumn();

      expect(tableServiceSpy.addColumn).not.toHaveBeenCalled();
    });
  });

  // US02: Editar propriedades de coluna
  describe('Edit column', () => {
    beforeEach(() => {
      component.selectedTable = mockTable;
    });

    it('should populate form when editing column', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.openEditColumn(mockColumn, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.columnForm.id).toBe(1);
      expect(component.columnForm.name).toBe('id');
      expect(component.showColumnModal).toBeTrue();
    });

    it('should update existing column', async () => {
      component.projectId = 1;
      component.columnForm = {
        id: 1,
        name: 'user_id',
        dataType: 'BIGINT',
        isNullable: false,
        isPrimaryKey: true,
        isAutoIncrement: true,
        isUnique: false,
        isIndexed: false,
        isUnsigned: true,
        isForeignKey: false,
      };

      await component.saveColumn();

      expect(tableServiceSpy.updateColumn).toHaveBeenCalled();
    });
  });

  // US02: Excluir coluna
  describe('Delete column', () => {
    let alertPresent: jasmine.Spy;

    beforeEach(() => {
      component.selectedTable = mockTable;
      alertPresent = jasmine.createSpy('present');
      alertControllerSpy.create.and.returnValue(
        Promise.resolve({
          present: alertPresent,
        } as any)
      );
    });

    it('should show confirmation dialog before deleting column', async () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      await component.confirmDeleteColumn(mockColumn, event);

      expect(alertControllerSpy.create).toHaveBeenCalled();
      expect(alertPresent).toHaveBeenCalled();
    });
  });

  // US02: Configurar tipos de dados
  describe('Data types configuration', () => {
    it('should have all data type categories', () => {
      expect(component.dataTypeCategories).toEqual(DATA_TYPE_CATEGORIES);
    });

    it('should identify numeric types', () => {
      expect(component.isNumericType('INT')).toBeTrue();
      expect(component.isNumericType('BIGINT')).toBeTrue();
      expect(component.isNumericType('VARCHAR')).toBeFalse();
    });

    it('should identify types that need length', () => {
      expect(component.needsLength('VARCHAR')).toBeTrue();
      expect(component.needsLength('CHAR')).toBeTrue();
      expect(component.needsLength('INT')).toBeFalse();
    });

    it('should identify types that need precision', () => {
      expect(component.needsPrecision('DECIMAL')).toBeTrue();
      expect(component.needsPrecision('FLOAT')).toBeTrue();
      expect(component.needsPrecision('VARCHAR')).toBeFalse();
    });

    it('should identify types that need enum values', () => {
      expect(component.needsEnumValues('ENUM')).toBeTrue();
      expect(component.needsEnumValues('SET')).toBeTrue();
      expect(component.needsEnumValues('VARCHAR')).toBeFalse();
    });

    it('should change data type on category change', () => {
      component.selectedCategory = 'numeric';
      component.onCategoryChange();
      expect(DATA_TYPE_CATEGORIES.numeric).toContain(component.columnForm.dataType!);
    });
  });

  // US02: Configurar foreign key
  describe('Foreign key configuration', () => {
    beforeEach(() => {
      component.tables = [mockTable];
    });

    it('should set foreign key on toggle', () => {
      component.columnForm.isForeignKey = true;
      component.onForeignKeyToggle();

      expect(component.columnForm.foreignKey).toBeDefined();
      expect(component.columnForm.isIndexed).toBeTrue();
    });

    it('should clear foreign key when disabled', () => {
      component.columnForm.isForeignKey = false;
      component.columnForm.foreignKey = {
        referenceTable: 'users',
        referenceColumn: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      };

      component.onForeignKeyToggle();

      expect(component.columnForm.foreignKey).toBeUndefined();
    });

    it('should return available tables for FK reference', () => {
      component.selectedTable = mockTable;
      const table2: Table = { ...mockTable, id: 2, name: 'orders' };
      component.tables = [mockTable, table2];

      const available = component.getAvailableTables();

      expect(available.length).toBe(1);
      expect(available[0].name).toBe('orders');
    });

    it('should have referential actions available', () => {
      expect(component.referentialActions).toContain('CASCADE');
      expect(component.referentialActions).toContain('SET NULL');
      expect(component.referentialActions).toContain('RESTRICT');
      expect(component.referentialActions).toContain('NO ACTION');
    });
  });

  // US02: Preview SQL
  describe('SQL preview', () => {
    beforeEach(() => {
      component.selectedTable = mockTable;
    });

    it('should open SQL preview modal', () => {
      component.openSqlPreview();

      expect(component.showSqlPreview).toBeTrue();
      expect(sqlGeneratorSpy.generateCreateTable).toHaveBeenCalled();
    });

    it('should generate SQL content', () => {
      component.openSqlPreview();
      expect(component.sqlPreviewContent).toBe('CREATE TABLE users...');
    });

    it('should close SQL preview modal', () => {
      component.showSqlPreview = true;
      component.closeSqlPreview();
      expect(component.showSqlPreview).toBeFalse();
    });

    it('should return empty string if no table selected', () => {
      component.selectedTable = null;
      const sql = component.generateSql();
      expect(sql).toBe('');
    });
  });

  // US02: Copiar SQL para clipboard
  describe('Copy to clipboard', () => {
    beforeEach(() => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    });

    it('should copy SQL to clipboard', async () => {
      await component.copyToClipboard('CREATE TABLE...');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('CREATE TABLE...');
      expect(toastServiceSpy.presentSuccess).toHaveBeenCalled();
    });

    it('should show error on copy failure', async () => {
      (navigator.clipboard.writeText as jasmine.Spy).and.returnValue(Promise.reject('error'));

      await component.copyToClipboard('CREATE TABLE...');

      expect(toastServiceSpy.presentError).toHaveBeenCalled();
    });
  });

  // US02: Exibir badges de coluna
  describe('Column badges', () => {
    it('should show PK badge for primary key', () => {
      const col: Column = { ...mockColumn, isPrimaryKey: true };
      const badges = component.getColumnBadges(col);
      expect(badges).toContain('PK');
    });

    it('should show FK badge for foreign key', () => {
      const col: Column = { ...mockColumn, isForeignKey: true };
      const badges = component.getColumnBadges(col);
      expect(badges).toContain('FK');
    });

    it('should show UQ badge for unique', () => {
      const col: Column = { ...mockColumn, isUnique: true };
      const badges = component.getColumnBadges(col);
      expect(badges).toContain('UQ');
    });

    it('should show IDX badge for indexed non-FK', () => {
      const col: Column = { ...mockColumn, isIndexed: true, isForeignKey: false };
      const badges = component.getColumnBadges(col);
      expect(badges).toContain('IDX');
    });

    it('should show AI badge for auto increment', () => {
      const col: Column = { ...mockColumn, isAutoIncrement: true };
      const badges = component.getColumnBadges(col);
      expect(badges).toContain('AI');
    });
  });

  // US02: Exibir tipo de coluna formatado
  describe('Column type display', () => {
    it('should display type with length', () => {
      const col: Column = { ...mockColumn, dataType: 'VARCHAR', dataLength: 255 };
      const display = component.getColumnTypeDisplay(col);
      expect(display).toBe('VARCHAR(255)');
    });

    it('should display type with precision and scale', () => {
      const col: Column = {
        ...mockColumn,
        dataType: 'DECIMAL',
        dataLength: undefined,
        dataPrecision: 10,
        dataScale: 2,
        isUnsigned: false,
      };
      const display = component.getColumnTypeDisplay(col);
      expect(display).toBe('DECIMAL(10,2)');
    });

    it('should display UNSIGNED for numeric types', () => {
      const col: Column = { ...mockColumn, dataType: 'INT', isUnsigned: true };
      const display = component.getColumnTypeDisplay(col);
      expect(display).toContain('UNSIGNED');
    });
  });

  // US02: Processar valores de ENUM
  describe('Enum values processing', () => {
    it('should parse comma-separated enum values', () => {
      const event = { target: { value: 'active, inactive, pending' } };
      component.onEnumValuesChange(event);

      expect(component.columnForm.enumValues).toEqual(['active', 'inactive', 'pending']);
    });

    it('should filter empty values', () => {
      const event = { target: { value: 'active, , pending, ' } };
      component.onEnumValuesChange(event);

      expect(component.columnForm.enumValues).toEqual(['active', 'pending']);
    });
  });

  // US02: Colunas default
  describe('Default columns', () => {
    it('should create id column by default', () => {
      const columns = component.getDefaultColumns(true, false);

      expect(columns.length).toBe(1);
      expect(columns[0].name).toBe('id');
      expect(columns[0].isPrimaryKey).toBeTrue();
      expect(columns[0].isAutoIncrement).toBeTrue();
    });
  });

  // US02: Modal states
  describe('Modal management', () => {
    it('should close table modal', () => {
      component.showTableModal = true;
      component.closeTableModal();
      expect(component.showTableModal).toBeFalse();
    });

    it('should close column modal', () => {
      component.showColumnModal = true;
      component.closeColumnModal();
      expect(component.showColumnModal).toBeFalse();
    });
  });
});
