import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UxResearchPage } from './ux-research.page';
import { ProjectService } from '../../../../shared/services/project.service';
import { Project, Persona, JourneyStep, Screen, CriticalAction } from '../../../../models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * Testes baseados na História de Usuário US04 - UX Research
 * - Definir personas
 * - Documentar problemas
 * - Mapear jornadas de usuário
 * - Listar ações críticas
 * - Configurar onboarding
 */
describe('UxResearchPage', () => {
  let component: UxResearchPage;
  let fixture: ComponentFixture<UxResearchPage>;
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
    uxData: {
      personas: [],
      problemCentral: { problemStatement: '', detailedDescription: '', proposedSolution: '', differential: '' },
      journey: [],
      screens: [],
      criticalActions: [],
      usageContext: { frequency: '', priorityDevice: '', targetPlatforms: [], offlineRequired: false, accessibilityRequirements: [] },
      onboarding: { needsTutorial: false, skipAllowed: true },
    },
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProject', 'updateUxData']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);

    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateBack'], {
      router$: new BehaviorSubject(null),
    });

    projectServiceSpy.getProject.and.returnValue(Promise.resolve(mockProject));
    projectServiceSpy.updateUxData.and.returnValue(Promise.resolve(mockProject));

    await TestBed.configureTestingModule({
      declarations: [UxResearchPage],
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

    fixture = TestBed.createComponent(UxResearchPage);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // US04: Carregar dados
  describe('Data loading', () => {
    it('should load project data on init', async () => {
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

  // US04: Navegação entre seções
  describe('Section navigation', () => {
    it('should have personas as default section', () => {
      expect(component.activeSection).toBe('personas');
    });

    it('should have 7 sections', () => {
      expect(component.sections.length).toBe(7);
    });

    it('should change active section', () => {
      component.selectSection({ id: 'journey' });
      expect(component.activeSection).toBe('journey');
    });
  });

  // US04: Adicionar persona
  describe('Persona management', () => {
    it('should open create persona modal', () => {
      component.openCreatePersona();
      expect(component.showPersonaModal).toBeTrue();
      expect(component.personaForm.id).toBe(0);
    });

    it('should open edit persona modal', () => {
      const persona: Persona = {
        id: 1, name: 'Test', ageRange: '25-35', technicalProfile: 'Dev',
        profession: 'Engineer', usageContext: '', frustrations: '', objectives: '', isPrimary: true
      };
      component.openEditPersona(persona);
      expect(component.showPersonaModal).toBeTrue();
      expect(component.personaForm.name).toBe('Test');
    });

    it('should save new persona', async () => {
      component.projectId = 1;
      component.personaForm = { id: 0, name: 'New Persona', ageRange: '20-30', technicalProfile: '', profession: '', usageContext: '', frustrations: '', objectives: '', isPrimary: false };
      await component.savePersona();
      expect(component.personas.length).toBe(1);
      expect(projectServiceSpy.updateUxData).toHaveBeenCalled();
    });

    it('should not save persona with empty name', async () => {
      component.personaForm = { id: 0, name: '   ' };
      await component.savePersona();
      expect(projectServiceSpy.updateUxData).not.toHaveBeenCalled();
    });
  });

  // US04: Adicionar jornada
  describe('Journey management', () => {
    it('should open create journey modal', () => {
      component.openCreateJourney();
      expect(component.showJourneyModal).toBeTrue();
    });

    it('should save new journey step', async () => {
      component.projectId = 1;
      component.journeyForm = { id: 0, order: 1, title: 'Step 1', description: 'First step', emotion: 'happy' };
      await component.saveJourney();
      expect(component.journeySteps.length).toBe(1);
    });
  });

  // US04: Adicionar tela
  describe('Screen management', () => {
    it('should open create screen modal', () => {
      component.openCreateScreen();
      expect(component.showScreenModal).toBeTrue();
    });

    it('should have screen type options', () => {
      expect(component.screenTypes).toContain('list');
      expect(component.screenTypes).toContain('form');
      expect(component.screenTypes).toContain('dashboard');
    });

    it('should have priority options', () => {
      expect(component.priorityOptions).toContain('essential');
      expect(component.priorityOptions).toContain('important');
      expect(component.priorityOptions).toContain('desirable');
    });
  });

  // US04: Adicionar ação crítica
  describe('Critical action management', () => {
    it('should open create action modal', () => {
      component.openCreateAction();
      expect(component.showActionModal).toBeTrue();
    });

    it('should have criticality options', () => {
      expect(component.criticalityOptions).toContain('blocking');
      expect(component.criticalityOptions).toContain('high');
      expect(component.criticalityOptions).toContain('medium');
      expect(component.criticalityOptions).toContain('low');
    });

    it('should return correct criticality color', () => {
      expect(component.getCriticalityColor('blocking')).toBe('danger');
      expect(component.getCriticalityColor('high')).toBe('warning');
      expect(component.getCriticalityColor('medium')).toBe('primary');
      expect(component.getCriticalityColor('low')).toBe('medium');
    });
  });

  // US04: Contexto de uso
  describe('Usage context', () => {
    it('should have platform options', () => {
      expect(component.platformOptions).toContain('iOS');
      expect(component.platformOptions).toContain('Android');
      expect(component.platformOptions).toContain('Web');
    });

    it('should toggle platform selection', async () => {
      component.projectId = 1;
      await component.togglePlatform('iOS');
      expect(component.usageContext.targetPlatforms).toContain('iOS');
      await component.togglePlatform('iOS');
      expect(component.usageContext.targetPlatforms).not.toContain('iOS');
    });
  });

  // US04: Configuração de onboarding
  describe('Onboarding config', () => {
    it('should have empty onboarding config by default', () => {
      const config = component.getEmptyOnboardingConfig();
      expect(config.needsTutorial).toBeFalse();
      expect(config.skipAllowed).toBeTrue();
    });

    it('should save onboarding changes', async () => {
      component.projectId = 1;
      component.onboardingConfig.needsTutorial = true;
      await component.saveOnboarding();
      expect(projectServiceSpy.updateUxData).toHaveBeenCalled();
    });
  });

  // US04: Helpers
  describe('Helper methods', () => {
    it('should return correct priority color', () => {
      expect(component.getPriorityColor('essential')).toBe('danger');
      expect(component.getPriorityColor('important')).toBe('warning');
      expect(component.getPriorityColor('desirable')).toBe('success');
    });

    it('should return correct screen type icon', () => {
      expect(component.getScreenTypeIcon('list')).toBe('list-outline');
      expect(component.getScreenTypeIcon('form')).toBe('create-outline');
      expect(component.getScreenTypeIcon('dashboard')).toBe('grid-outline');
    });
  });
});
