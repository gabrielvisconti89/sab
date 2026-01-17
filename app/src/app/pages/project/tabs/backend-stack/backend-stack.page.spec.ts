import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { BackendStackPage } from './backend-stack.page';
import { ProjectService } from '../../../../shared/services/project.service';
import { Project } from '../../../../models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * Testes baseados na História de Usuário US07 - Configuração de Stacks
 * - Configurar PHP version
 * - Configurar Laravel settings
 * - Adicionar packages
 * - Configurar database settings
 * - Configurar services
 */
describe('BackendStackPage', () => {
  let component: BackendStackPage;
  let fixture: ComponentFixture<BackendStackPage>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;

  const mockProject: Project = {
    id: 1, name: 'Test', description: '', databaseType: 'mysql',
    databaseCharset: 'utf8mb4', databaseCollation: 'utf8mb4_unicode_ci',
    isFavorite: false, progressPercentage: 50, createdAt: new Date(), updatedAt: new Date(),
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProject', 'updateBackendStackData']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward'], { router$: new BehaviorSubject(null) });

    projectServiceSpy.getProject.and.returnValue(Promise.resolve(mockProject));
    projectServiceSpy.updateBackendStackData.and.returnValue(Promise.resolve(mockProject));

    await TestBed.configureTestingModule({
      declarations: [BackendStackPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: ActivatedRoute, useValue: { parent: { parent: { snapshot: { params: { id: '1' } } } } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BackendStackPage);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('PHP configuration', () => {
    it('should have default PHP version', () => {
      expect(component.php.version).toBeDefined();
    });

    it('should have default extensions', () => {
      expect(component.php.extensions.length).toBeGreaterThan(0);
    });

    it('should have extension options', () => {
      expect(component.extensionOptions).toContain('mbstring');
      expect(component.extensionOptions).toContain('pdo');
    });
  });

  describe('Laravel configuration', () => {
    it('should have default Laravel version', () => {
      expect(component.laravel.version).toBeDefined();
    });

    it('should have starter kit options', () => {
      expect(component.starterKitOptions).toContain('None');
      expect(component.starterKitOptions).toContain('Breeze');
    });

    it('should have API auth options', () => {
      expect(component.apiAuthOptions).toContain('Sanctum');
      expect(component.apiAuthOptions).toContain('Passport');
    });
  });

  describe('Database configuration', () => {
    it('should have default database driver', () => {
      expect(component.database.driver).toBeDefined();
    });

    it('should have database driver options', () => {
      expect(component.databaseDrivers).toContain('mysql');
      expect(component.databaseDrivers).toContain('postgresql');
    });

    it('should have redis setting', () => {
      expect(component.database.redis).toBeDefined();
    });
  });

  describe('Packages', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have default packages', () => {
      expect(component.packages).toBeDefined();
    });
  });

  describe('Services', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have services config', () => {
      expect(component.services).toBeDefined();
    });
  });
});
