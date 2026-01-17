import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DesignSystemPage } from './design-system.page';
import { ProjectService } from '../../../../shared/services/project.service';
import { Project } from '../../../../models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * Testes baseados na História de Usuário US06 - Design System
 * - Configurar cores
 * - Configurar tipografia
 * - Definir componentes
 * - Configurar animações
 */
describe('DesignSystemPage', () => {
  let component: DesignSystemPage;
  let fixture: ComponentFixture<DesignSystemPage>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;

  const mockProject: Project = {
    id: 1, name: 'Test', description: '', databaseType: 'mysql',
    databaseCharset: 'utf8mb4', databaseCollation: 'utf8mb4_unicode_ci',
    isFavorite: false, progressPercentage: 50, createdAt: new Date(), updatedAt: new Date(),
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProject', 'updateDesignData']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward'], { router$: new BehaviorSubject(null) });

    projectServiceSpy.getProject.and.returnValue(Promise.resolve(mockProject));
    projectServiceSpy.updateDesignData.and.returnValue(Promise.resolve(mockProject));

    await TestBed.configureTestingModule({
      declarations: [DesignSystemPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: ActivatedRoute, useValue: { parent: { parent: { snapshot: { params: { id: '1' } } } } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DesignSystemPage);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Section navigation', () => {
    it('should have colors as default section', () => {
      expect(component.activeSection).toBe('colors');
    });

    it('should have 6 sections', () => {
      expect(component.sections.length).toBe(6);
    });
  });

  describe('Colors configuration', () => {
    it('should have default colors', () => {
      expect(component.colors).toBeDefined();
      expect(component.colors.primary).toBeDefined();
    });

    it('should have dark mode config', () => {
      expect(component.darkMode).toBeDefined();
    });
  });

  describe('Typography configuration', () => {
    it('should have font options', () => {
      expect(component.fontOptions.length).toBeGreaterThan(0);
    });

    it('should have monospace font options', () => {
      expect(component.monoFontOptions.length).toBeGreaterThan(0);
    });

    it('should have default typography', () => {
      expect(component.typography).toBeDefined();
    });
  });

  describe('Components configuration', () => {
    it('should have button style options', () => {
      expect(component.buttonStyles).toContain('filled');
      expect(component.buttonStyles).toContain('outlined');
    });

    it('should have input style options', () => {
      expect(component.inputStyles).toContain('filled');
      expect(component.inputStyles).toContain('outlined');
    });

    it('should have default components config', () => {
      expect(component.components).toBeDefined();
    });
  });

  describe('Icons configuration', () => {
    it('should have icon library options', () => {
      expect(component.iconLibraries).toContain('Ionicons');
    });

    it('should have icon style options', () => {
      expect(component.iconStyles).toContain('outline');
      expect(component.iconStyles).toContain('filled');
    });
  });

  describe('Animations configuration', () => {
    it('should have animation level options', () => {
      expect(component.animationLevels).toContain('minimal');
      expect(component.animationLevels).toContain('normal');
    });

    it('should have easing options', () => {
      expect(component.easingOptions).toContain('ease-in-out');
    });

    it('should have loading style options', () => {
      expect(component.loadingStyles).toContain('spinner');
      expect(component.loadingStyles).toContain('skeleton');
    });
  });
});
