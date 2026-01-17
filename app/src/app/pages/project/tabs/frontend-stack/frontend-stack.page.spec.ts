import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { FrontendStackPage } from './frontend-stack.page';
import { ProjectService } from '../../../../shared/services/project.service';
import { Project } from '../../../../models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * Testes baseados na História de Usuário US07 - Configuração de Stacks
 * - Configurar Ionic settings
 * - Configurar Angular settings
 * - Configurar Capacitor settings
 * - Adicionar dependencies
 */
describe('FrontendStackPage', () => {
  let component: FrontendStackPage;
  let fixture: ComponentFixture<FrontendStackPage>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;

  const mockProject: Project = {
    id: 1, name: 'Test', description: '', databaseType: 'mysql',
    databaseCharset: 'utf8mb4', databaseCollation: 'utf8mb4_unicode_ci',
    isFavorite: false, progressPercentage: 50, createdAt: new Date(), updatedAt: new Date(),
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProject', 'updateFrontendStackData']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward'], { router$: new BehaviorSubject(null) });

    projectServiceSpy.getProject.and.returnValue(Promise.resolve(mockProject));
    projectServiceSpy.updateFrontendStackData.and.returnValue(Promise.resolve(mockProject));

    await TestBed.configureTestingModule({
      declarations: [FrontendStackPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: ActivatedRoute, useValue: { parent: { parent: { snapshot: { params: { id: '1' } } } } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FrontendStackPage);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Ionic configuration', () => {
    it('should have default Ionic version', () => {
      expect(component.ionic.version).toBeDefined();
    });
  });

  describe('Angular configuration', () => {
    it('should have default Angular version', () => {
      expect(component.angular.version).toBeDefined();
    });

    it('should have strictMode setting', () => {
      expect(component.angular.strictMode).toBeDefined();
    });

    it('should have standaloneComponents setting', () => {
      expect(component.angular.standaloneComponents).toBeDefined();
    });

    it('should have ssr setting', () => {
      expect(component.angular.ssr).toBeDefined();
    });
  });

  describe('Capacitor configuration', () => {
    it('should have default Capacitor version', () => {
      expect(component.capacitor.version).toBeDefined();
    });

    it('should have platform options', () => {
      expect(component.platformOptions).toContain('iOS');
      expect(component.platformOptions).toContain('Android');
    });

    it('should have default platforms', () => {
      expect(component.capacitor.platforms.length).toBeGreaterThan(0);
    });
  });

  describe('Dependencies', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have default dependencies', () => {
      expect(component.dependencies).toBeDefined();
    });
  });

  describe('Build configuration', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have build config', () => {
      expect(component.buildConfig).toBeDefined();
    });
  });
});
