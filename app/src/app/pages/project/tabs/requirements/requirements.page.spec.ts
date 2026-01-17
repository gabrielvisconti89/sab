import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RequirementsPage } from './requirements.page';
import { ProjectService } from '../../../../shared/services/project.service';
import { Project, CrudEntity } from '../../../../models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * Testes baseados na História de Usuário US05 - Requisitos
 * - Adicionar requisitos funcionais
 * - Adicionar requisitos não-funcionais
 * - Priorização MoSCoW
 */
describe('RequirementsPage', () => {
  let component: RequirementsPage;
  let fixture: ComponentFixture<RequirementsPage>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  const mockProject: Project = {
    id: 1,
    name: 'Test Project',
    description: 'Test description',
    databaseType: 'mysql',
    databaseCharset: 'utf8mb4',
    databaseCollation: 'utf8mb4_unicode_ci',
    isFavorite: false,
    progressPercentage: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProject', 'updateRequirementsData']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);

    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateBack'], {
      router$: new BehaviorSubject(null),
    });

    projectServiceSpy.getProject.and.returnValue(Promise.resolve(mockProject));
    projectServiceSpy.updateRequirementsData.and.returnValue(Promise.resolve(mockProject));

    await TestBed.configureTestingModule({
      declarations: [RequirementsPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: NavController, useValue: navControllerSpy },
        {
          provide: ActivatedRoute,
          useValue: { parent: { parent: { snapshot: { params: { id: '1' } } } } },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RequirementsPage);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // US05: Navegação entre seções
  describe('Section navigation', () => {
    it('should have functional as default section', () => {
      expect(component.activeSection).toBe('functional');
    });

    it('should have 3 sections', () => {
      expect(component.sections.length).toBe(3);
    });

    it('should change active section', () => {
      component.selectSection({ id: 'moscow' });
      expect(component.activeSection).toBe('moscow');
    });
  });

  // US05: Requisitos funcionais
  describe('Functional requirements', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have authentication requirements', () => {
      expect(component.authRequirements).toBeDefined();
    });

    it('should have user management requirements', () => {
      expect(component.userManagementRequirements).toBeDefined();
    });

    it('should toggle category expansion', () => {
      expect(component.expandedCategories['authentication']).toBeTrue();
      component.toggleCategory('authentication');
      expect(component.expandedCategories['authentication']).toBeFalse();
    });
  });

  // US05: CRUD Entities
  describe('CRUD entities', () => {
    it('should open create CRUD modal', () => {
      component.openCreateCrud();
      expect(component.showCrudModal).toBeTrue();
      expect(component.crudForm.name).toBe('');
    });

    it('should open edit CRUD modal', () => {
      const entity: CrudEntity = { name: 'Users', create: true, list: true, view: true, edit: true, delete: true, export: false, import: false };
      component.openEditCrud(entity);
      expect(component.showCrudModal).toBeTrue();
      expect(component.crudForm.name).toBe('Users');
    });

    it('should save new CRUD entity', async () => {
      component.projectId = 1;
      component.crudForm = { name: 'Products', create: true, list: true, view: true, edit: true, delete: true, export: false, import: false };
      await component.saveCrud();
      expect(component.crudEntities.length).toBeGreaterThan(0);
    });

    it('should get CRUD operations', () => {
      const entity: CrudEntity = { name: 'Test', create: true, list: true, view: false, edit: true, delete: true, export: false, import: false };
      const ops = component.getCrudOperations(entity);
      expect(ops).toContain('C');
      expect(ops).toContain('R');
      expect(ops).toContain('U');
      expect(ops).toContain('D');
    });
  });

  // US05: Requisitos não-funcionais
  describe('Non-functional requirements', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have performance requirements', () => {
      expect(component.performanceReqs).toBeDefined();
    });

    it('should have security requirements', () => {
      expect(component.securityReqs).toBeDefined();
    });

    it('should have scalability requirements', () => {
      expect(component.scalabilityReqs).toBeDefined();
    });
  });

  // US05: MoSCoW prioritization
  describe('MoSCoW prioritization', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have 4 MoSCoW categories', () => {
      expect(component.moscowCategories.length).toBe(4);
    });

    it('should have mustHave category', () => {
      expect(component.moscow.mustHave).toBeDefined();
    });

    it('should have shouldHave category', () => {
      expect(component.moscow.shouldHave).toBeDefined();
    });

    it('should open add MoSCoW modal', () => {
      component.openAddMoscow('mustHave');
      expect(component.showMoscowModal).toBeTrue();
      expect(component.moscowForm.category).toBe('mustHave');
    });

    it('should save MoSCoW item', async () => {
      component.projectId = 1;
      component.moscowForm = { text: 'New feature', category: 'mustHave' };
      await component.saveMoscow();
      expect(component.moscow.mustHave).toContain('New feature');
    });

    it('should remove MoSCoW item', async () => {
      component.projectId = 1;
      component.moscow.mustHave = ['Feature 1', 'Feature 2'];
      await component.removeMoscowItem('mustHave', 0);
      expect(component.moscow.mustHave.length).toBe(1);
    });

    it('should get category label', () => {
      expect(component.getMoscowCategoryLabel('mustHave')).toBe('Must Have');
    });

    it('should get category color', () => {
      expect(component.getMoscowCategoryColor('mustHave')).toBe('danger');
      expect(component.getMoscowCategoryColor('shouldHave')).toBe('warning');
      expect(component.getMoscowCategoryColor('couldHave')).toBe('success');
      expect(component.getMoscowCategoryColor('wontHave')).toBe('medium');
    });
  });

  // US05: Salvar alteracoes
  describe('Save changes', () => {
    it('should save on requirement change', async () => {
      component.projectId = 1;
      await component.onRequirementChange();
      expect(projectServiceSpy.updateRequirementsData).toHaveBeenCalled();
    });
  });
});
