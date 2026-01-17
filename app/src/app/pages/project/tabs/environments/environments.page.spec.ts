import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { EnvironmentsPage } from './environments.page';
import { ProjectService } from '../../../../shared/services/project.service';
import { Project } from '../../../../models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * Testes baseados na História de Usuário US07 - Ambientes
 * - Configurar local environment
 * - Configurar development environment
 * - Configurar staging environment
 * - Configurar production environment
 * - Adicionar environment variables
 */
describe('EnvironmentsPage', () => {
  let component: EnvironmentsPage;
  let fixture: ComponentFixture<EnvironmentsPage>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;

  const mockProject: Project = {
    id: 1, name: 'Test', description: '', databaseType: 'mysql',
    databaseCharset: 'utf8mb4', databaseCollation: 'utf8mb4_unicode_ci',
    isFavorite: false, progressPercentage: 50, createdAt: new Date(), updatedAt: new Date(),
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProject', 'updateEnvironmentsData']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward'], { router$: new BehaviorSubject(null) });

    projectServiceSpy.getProject.and.returnValue(Promise.resolve(mockProject));
    projectServiceSpy.updateEnvironmentsData.and.returnValue(Promise.resolve(mockProject));

    await TestBed.configureTestingModule({
      declarations: [EnvironmentsPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: ActivatedRoute, useValue: { parent: { parent: { snapshot: { params: { id: '1' } } } } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvironmentsPage);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Environment tabs', () => {
    it('should have local as default environment', () => {
      expect(component.activeEnv).toBe('local');
    });

    it('should have 4 environment tabs', () => {
      expect(component.envTabs.length).toBe(4);
    });

    it('should contain all environments', () => {
      const envIds = component.envTabs.map(e => e.id);
      expect(envIds).toContain('local');
      expect(envIds).toContain('development');
      expect(envIds).toContain('staging');
      expect(envIds).toContain('production');
    });

    it('should change active environment', () => {
      component.selectEnv({ id: 'production' });
      expect(component.activeEnv).toBe('production');
    });
  });

  describe('Environment configuration', () => {
    it('should have empty environment by default', () => {
      const env = component.getEmptyEnv();
      expect(env.frontendUrl).toBe('');
      expect(env.apiUrl).toBe('');
    });

    it('should get current environment', () => {
      component.activeEnv = 'local';
      const current = component.currentEnv;
      expect(current).toBeDefined();
    });

    it('should have all 4 environments configured', () => {
      expect(component.environments.local).toBeDefined();
      expect(component.environments.development).toBeDefined();
      expect(component.environments.staging).toBeDefined();
      expect(component.environments.production).toBeDefined();
    });
  });

  describe('Environment variables', () => {
    it('should have envVariables object', () => {
      expect(component.currentEnv.envVariables).toBeDefined();
    });

    it('should remove environment variable', async () => {
      component.projectId = 1;
      component.currentEnv.envVariables['TEST_VAR'] = 'value';
      await component.removeEnvVar('TEST_VAR');
      expect(component.currentEnv.envVariables['TEST_VAR']).toBeUndefined();
    });
  });

  describe('Data loading', () => {
    it('should load environments data on init', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      expect(projectServiceSpy.getProject).toHaveBeenCalledWith(1);
    });

    it('should set isLoading to false after loading', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Save changes', () => {
    it('should save on field change', async () => {
      component.projectId = 1;
      await component.onFieldChange();
      expect(projectServiceSpy.updateEnvironmentsData).toHaveBeenCalled();
    });
  });
});
