import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { IntegrationsPage } from './integrations.page';
import { ProjectService } from '../../../../shared/services/project.service';
import { Project, ExternalApi, Webhook } from '../../../../models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * Testes baseados na História de Usuário US07 - Integrações
 * - Adicionar external API
 * - Editar API configuration
 * - Excluir API
 * - Adicionar incoming webhook
 * - Adicionar outgoing webhook
 */
describe('IntegrationsPage', () => {
  let component: IntegrationsPage;
  let fixture: ComponentFixture<IntegrationsPage>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  const mockProject: Project = {
    id: 1, name: 'Test', description: '', databaseType: 'mysql',
    databaseCharset: 'utf8mb4', databaseCollation: 'utf8mb4_unicode_ci',
    isFavorite: false, progressPercentage: 50, createdAt: new Date(), updatedAt: new Date(),
    integrationsData: { externalApis: [], webhooksReceived: [], webhooksSent: [] },
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProject', 'updateIntegrationsData']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward'], { router$: new BehaviorSubject(null) });

    projectServiceSpy.getProject.and.returnValue(Promise.resolve(mockProject));
    projectServiceSpy.updateIntegrationsData.and.returnValue(Promise.resolve(mockProject));

    await TestBed.configureTestingModule({
      declarations: [IntegrationsPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: ActivatedRoute, useValue: { parent: { parent: { snapshot: { params: { id: '1' } } } } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(IntegrationsPage);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Section navigation', () => {
    it('should have apis as default section', () => {
      expect(component.activeSection).toBe('apis');
    });

    it('should have 3 sections', () => {
      expect(component.sections.length).toBe(3);
    });

    it('should change active section', () => {
      component.selectSection({ id: 'webhooks-in' });
      expect(component.activeSection).toBe('webhooks-in');
    });
  });

  describe('External APIs', () => {
    it('should open create API modal', () => {
      component.openCreateApi();
      expect(component.showApiModal).toBeTrue();
    });

    it('should have category options', () => {
      expect(component.categoryOptions).toContain('Pagamento');
      expect(component.categoryOptions).toContain('Email');
    });

    it('should have auth type options', () => {
      expect(component.authTypeOptions).toContain('API Key');
      expect(component.authTypeOptions).toContain('Bearer Token');
    });

    it('should have empty API form', () => {
      const form = component.getEmptyApiForm();
      expect(form.id).toBe(0);
      expect(form.name).toBe('');
    });
  });

  describe('Webhooks', () => {
    it('should have empty webhook form', () => {
      const form = component.getEmptyWebhookForm();
      expect(form.id).toBe(0);
      expect(form.event).toBe('');
    });
  });

  describe('Data loading', () => {
    it('should load integrations data on init', async () => {
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
});
