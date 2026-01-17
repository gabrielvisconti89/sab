import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { of, BehaviorSubject, Subject } from 'rxjs';
import { ProjectPage } from './project.page';
import { ProjectService } from '../../shared/services/project.service';
import { TableService } from '../../shared/services/table.service';
import { ToastService } from '../../shared/services/toast.service';
import { Project, Table } from '../../models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * Testes baseados na História de Usuário US01 - Gerenciamento de Projetos
 * - Carregar dados do projeto
 * - Exibir nome e descrição do projeto
 * - Navegar entre tabs
 * - Abrir modal de exportação
 * - Abrir modal de configurações
 * - Salvar alterações do projeto
 * - Excluir projeto
 */
describe('ProjectPage', () => {
  let component: ProjectPage;
  let fixture: ComponentFixture<ProjectPage>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let tableServiceSpy: jasmine.SpyObj<TableService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let actionSheetControllerSpy: jasmine.SpyObj<ActionSheetController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'A test project for unit testing',
    databaseType: 'mysql',
    databaseCharset: 'utf8mb4',
    databaseCollation: 'utf8mb4_unicode_ci',
    tablePrefix: 'tst_',
    isFavorite: false,
    progressPercentage: 50,
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
    columns: [],
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', [
      'getProject',
      'updateProject',
      'deleteProject',
    ]);
    tableServiceSpy = jasmine.createSpyObj('TableService', ['getTablesByProject']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'presentSuccess',
      'presentError',
    ]);
    actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/project/1/ux-research',
      events: of(),
    });

    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateBack', 'navigateRoot'], {
      router$: new BehaviorSubject(null),
    });

    projectServiceSpy.getProject.and.returnValue(Promise.resolve(mockProject));
    tableServiceSpy.getTablesByProject.and.returnValue(Promise.resolve([mockTable]));
    toastServiceSpy.presentSuccess.and.returnValue(Promise.resolve());
    toastServiceSpy.presentError.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      declarations: [ProjectPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: TableService, useValue: tableServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ActionSheetController, useValue: actionSheetControllerSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavController, useValue: navControllerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectPage);
    component = fixture.componentInstance;
  });

  // US01: Teste básico de criação
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // US01: Carregar dados do projeto no init
  describe('Project loading', () => {
    it('should load project data on init', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(projectServiceSpy.getProject).toHaveBeenCalledWith(1);
      expect(component.project).toEqual(mockProject);
    });

    it('should load project tables on init', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(tableServiceSpy.getTablesByProject).toHaveBeenCalledWith(1);
      expect(component.projectTables).toEqual([mockTable]);
    });

    it('should redirect to home if project not found', async () => {
      projectServiceSpy.getProject.and.returnValue(Promise.resolve(null));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should redirect to home on load error', async () => {
      projectServiceSpy.getProject.and.returnValue(Promise.reject('error'));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  // US01: Exibir nome e descrição do projeto
  describe('Project display', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have project name accessible', () => {
      expect(component.project?.name).toBe('Test Project');
    });

    it('should have project description accessible', () => {
      expect(component.project?.description).toBe('A test project for unit testing');
    });

    it('should calculate overall progress', () => {
      expect(component.getOverallProgress()).toBe(50);
    });

    it('should return 0 progress if no project', () => {
      component.project = null;
      expect(component.getOverallProgress()).toBe(0);
    });
  });

  // US01: Navegar entre tabs
  describe('Tab navigation', () => {
    it('should have ux-research as default active tab (first tab)', () => {
      expect(component.activeTab).toBe('ux-research');
    });

    it('should have all 9 tabs defined', () => {
      expect(component.tabs.length).toBe(9);
    });

    it('should contain all expected tabs', () => {
      const tabIds = component.tabs.map(t => t.id);
      expect(tabIds).toContain('ux-research');
      expect(tabIds).toContain('requirements');
      expect(tabIds).toContain('design-system');
      expect(tabIds).toContain('data-architecture');
      expect(tabIds).toContain('frontend-stack');
      expect(tabIds).toContain('backend-stack');
      expect(tabIds).toContain('integrations');
      expect(tabIds).toContain('environments');
      expect(tabIds).toContain('glossary');
    });

    it('should select tab and update activeTab', () => {
      const uxTab = component.tabs.find(t => t.id === 'ux-research')!;

      component.selectTab(uxTab);

      expect(component.activeTab).toBe('ux-research');
    });

    it('should navigate to tab route on selection', () => {
      const designTab = component.tabs.find(t => t.id === 'design-system')!;

      component.selectTab(designTab);

      expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should return true for active tab', () => {
      component.activeTab = 'ux-research';
      expect(component.isTabActive('ux-research')).toBeTrue();
    });

    it('should return false for inactive tab', () => {
      component.activeTab = 'ux-research';
      expect(component.isTabActive('data-architecture')).toBeFalse();
    });

    it('should navigate to correct route when selectTab is called', () => {
      const designTab = component.tabs.find(t => t.id === 'design-system')!;
      component.selectTab(designTab);

      expect(component.activeTab).toBe('design-system');
      expect(routerSpy.navigate).toHaveBeenCalledWith(
        ['design-system'],
        jasmine.objectContaining({ relativeTo: jasmine.anything() })
      );
    });

    it('should update activeTab when navigating through all tabs', () => {
      component.tabs.forEach(tab => {
        component.selectTab(tab);
        expect(component.activeTab).toBe(tab.id);
      });
    });
  });

  // US01: Abrir modal de exportacao
  describe('Export modal', () => {
    it('should have showExportModal as false by default', () => {
      expect(component.showExportModal).toBeFalse();
    });

    it('should open export modal', () => {
      component.exportProject();
      expect(component.showExportModal).toBeTrue();
    });

    it('should close export modal', () => {
      component.showExportModal = true;
      component.closeExportModal();
      expect(component.showExportModal).toBeFalse();
    });
  });

  // US01: Abrir modal de configuracoes
  describe('Settings modal', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have showSettingsModal as false by default', () => {
      expect(component.showSettingsModal).toBeFalse();
    });

    it('should open settings modal and populate form', () => {
      component.openSettings();

      expect(component.showSettingsModal).toBeTrue();
      expect(component.settingsForm.name).toBe('Test Project');
      expect(component.settingsForm.description).toBe('A test project for unit testing');
      expect(component.settingsForm.databaseType).toBe('mysql');
      expect(component.settingsForm.tablePrefix).toBe('tst_');
    });

    it('should not open settings if no project', () => {
      component.project = null;
      component.openSettings();
      expect(component.showSettingsModal).toBeFalse();
    });

    it('should close settings modal', () => {
      component.showSettingsModal = true;
      component.closeSettingsModal();
      expect(component.showSettingsModal).toBeFalse();
    });

    it('should have all database types available', () => {
      expect(component.databaseTypes.length).toBe(4);
      const values = component.databaseTypes.map(d => d.value);
      expect(values).toContain('mysql');
      expect(values).toContain('postgresql');
      expect(values).toContain('sqlite');
      expect(values).toContain('mariadb');
    });
  });

  // US01: Salvar alterações do projeto
  describe('Save settings', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      projectServiceSpy.updateProject.and.returnValue(Promise.resolve(mockProject));
    });

    it('should save settings and reload project', async () => {
      component.settingsForm = {
        name: 'Updated Project',
        description: 'Updated description',
        databaseType: 'postgresql',
        tablePrefix: 'upd_',
      };

      await component.saveSettings();

      expect(projectServiceSpy.updateProject).toHaveBeenCalledWith(1, {
        name: 'Updated Project',
        description: 'Updated description',
        databaseType: 'postgresql',
        tablePrefix: 'upd_',
      });
    });

    it('should show success toast after saving', async () => {
      component.settingsForm.name = 'Test';

      await component.saveSettings();

      expect(toastServiceSpy.presentSuccess).toHaveBeenCalled();
    });

    it('should close settings modal after saving', async () => {
      component.showSettingsModal = true;
      component.settingsForm.name = 'Test';

      await component.saveSettings();

      expect(component.showSettingsModal).toBeFalse();
    });

    it('should not save if name is empty', async () => {
      component.settingsForm.name = '   ';

      await component.saveSettings();

      expect(projectServiceSpy.updateProject).not.toHaveBeenCalled();
    });

    it('should show error toast on save failure', async () => {
      projectServiceSpy.updateProject.and.returnValue(Promise.reject('error'));
      component.settingsForm.name = 'Test';

      await component.saveSettings();

      expect(toastServiceSpy.presentError).toHaveBeenCalled();
    });
  });

  // US01: Excluir projeto
  describe('Delete project', () => {
    let alertPresent: jasmine.Spy;
    let alertButtons: any[];

    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      alertPresent = jasmine.createSpy('present');
      alertControllerSpy.create.and.returnValue(Promise.resolve({
        present: alertPresent,
        onDidDismiss: () => Promise.resolve({ role: 'cancel' }),
      } as any));
    });

    it('should show confirmation alert before deleting', async () => {
      await component.confirmDelete();

      expect(alertControllerSpy.create).toHaveBeenCalled();
      expect(alertPresent).toHaveBeenCalled();
    });

    it('should include project name in delete confirmation', async () => {
      await component.confirmDelete();

      const createCall = alertControllerSpy.create.calls.mostRecent();
      const config = createCall.args[0]!;

      expect(config.message).toContain('Test Project');
    });

    it('should have cancel and delete buttons', async () => {
      await component.confirmDelete();

      const createCall = alertControllerSpy.create.calls.mostRecent();
      const config = createCall.args[0]!;
      const buttons = config.buttons as Array<{ text: string; role?: string }>;

      expect(buttons.length).toBe(2);
      expect(buttons[0].role).toBe('cancel');
      expect(buttons[1].role).toBe('destructive');
    });
  });

  // US01: Menu do projeto
  describe('Project menu', () => {
    let actionSheetPresent: jasmine.Spy;

    beforeEach(() => {
      actionSheetPresent = jasmine.createSpy('present');
      actionSheetControllerSpy.create.and.returnValue(Promise.resolve({
        present: actionSheetPresent,
      } as any));
    });

    it('should open project menu action sheet', async () => {
      await component.openProjectMenu();

      expect(actionSheetControllerSpy.create).toHaveBeenCalled();
      expect(actionSheetPresent).toHaveBeenCalled();
    });

    it('should have export, settings, delete and cancel options', async () => {
      await component.openProjectMenu();

      const createCall = actionSheetControllerSpy.create.calls.mostRecent();
      const config = createCall.args[0]!;
      const buttons = config.buttons as Array<{ text: string; icon?: string; role?: string }>;

      expect(buttons.length).toBe(4);
      expect(buttons[0].text).toBe('Exportar');
      expect(buttons[1].text).toBe('Configurações');
      expect(buttons[2].text).toBe('Excluir Projeto');
      expect(buttons[3].text).toBe('Cancelar');
    });
  });

  // US01: Navegação de volta
  describe('Back navigation', () => {
    it('should navigate to home on goBack', () => {
      component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });
  });
});
