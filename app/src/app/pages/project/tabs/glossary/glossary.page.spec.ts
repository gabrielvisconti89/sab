import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { GlossaryPage } from './glossary.page';
import { ProjectService } from '../../../../shared/services/project.service';
import { Project, GlossaryTerm } from '../../../../models';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/**
 * Testes baseados na História de Usuário US08 - Glossário
 * - Adicionar termos
 * - Buscar termos
 * - Filtrar alfabeticamente
 */
describe('GlossaryPage', () => {
  let component: GlossaryPage;
  let fixture: ComponentFixture<GlossaryPage>;
  let projectServiceSpy: jasmine.SpyObj<ProjectService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  const mockTerm: GlossaryTerm = {
    id: 1,
    term: 'API',
    definition: 'Application Programming Interface',
    synonyms: ['Interface'],
    relatedEntity: 'integrations',
    usageExample: 'REST API',
  };

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
    glossaryData: { terms: [mockTerm] },
  };

  beforeEach(async () => {
    projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProject', 'updateGlossaryData']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);

    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateBack'], {
      router$: new BehaviorSubject(null),
    });

    // Deep clone to avoid test pollution
    projectServiceSpy.getProject.and.callFake(() => Promise.resolve(JSON.parse(JSON.stringify(mockProject))));
    projectServiceSpy.updateGlossaryData.and.callFake((id, data) => Promise.resolve({ ...mockProject, glossaryData: data }));

    await TestBed.configureTestingModule({
      declarations: [GlossaryPage],
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

    fixture = TestBed.createComponent(GlossaryPage);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // US08: Carregar lista de termos
  describe('Term loading', () => {
    it('should load terms on init', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      expect(projectServiceSpy.getProject).toHaveBeenCalledWith(1);
      expect(component.terms.length).toBe(1);
    });

    it('should set isLoading to false after loading', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.isLoading).toBeFalse();
    });
  });

  // US08: Adicionar novo termo
  describe('Add term', () => {
    it('should open create term modal', () => {
      component.openCreateTerm();
      expect(component.showTermModal).toBeTrue();
      expect(component.termForm.id).toBe(0);
    });

    it('should save new term', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      component.projectId = 1;
      component.termForm = { id: 0, term: 'Database', definition: 'Storage system', synonyms: [], relatedEntity: '', usageExample: '' };
      await component.saveTerm();
      expect(component.terms.length).toBe(2);
      expect(projectServiceSpy.updateGlossaryData).toHaveBeenCalled();
    });

    it('should not save term with empty name', async () => {
      component.termForm = { id: 0, term: '   ', definition: 'Test' };
      await component.saveTerm();
      expect(projectServiceSpy.updateGlossaryData).not.toHaveBeenCalled();
    });

    it('should not save term with empty definition', async () => {
      component.termForm = { id: 0, term: 'Test', definition: '   ' };
      await component.saveTerm();
      expect(projectServiceSpy.updateGlossaryData).not.toHaveBeenCalled();
    });
  });

  // US08: Editar termo
  describe('Edit term', () => {
    it('should open edit term modal', () => {
      component.openEditTerm(mockTerm);
      expect(component.showTermModal).toBeTrue();
      expect(component.termForm.term).toBe('API');
    });

    it('should update existing term', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      component.projectId = 1;
      component.termForm = { ...mockTerm, definition: 'Updated definition' };
      await component.saveTerm();
      expect(component.terms[0].definition).toBe('Updated definition');
    });
  });

  // US08: Excluir termo
  describe('Delete term', () => {
    let alertPresent: jasmine.Spy;

    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      alertPresent = jasmine.createSpy('present');
      alertControllerSpy.create.and.returnValue(Promise.resolve({ present: alertPresent } as any));
    });

    it('should show confirmation before deleting', async () => {
      await component.deleteTerm(mockTerm);
      expect(alertControllerSpy.create).toHaveBeenCalled();
      expect(alertPresent).toHaveBeenCalled();
    });
  });

  // US08: Buscar termos
  describe('Search terms', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should filter by search query', () => {
      component.searchQuery = 'API';
      component.onSearchChange();
      expect(component.filteredTerms.length).toBe(1);
    });

    it('should filter by search in definition', () => {
      component.searchQuery = 'Interface';
      component.onSearchChange();
      expect(component.filteredTerms.length).toBe(1);
    });

    it('should show no results for non-matching query', () => {
      component.searchQuery = 'nonexistent';
      component.onSearchChange();
      expect(component.filteredTerms.length).toBe(0);
    });

    it('should clear filter when search is empty', () => {
      component.searchQuery = '';
      component.onSearchChange();
      expect(component.filteredTerms.length).toBe(1);
    });
  });

  // US08: Filtrar alfabeticamente
  describe('Alphabetical filter', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have alphabet array', () => {
      expect(component.alphabet.length).toBe(26);
      expect(component.alphabet[0]).toBe('A');
    });

    it('should filter by selected letter', () => {
      component.selectLetter('A');
      expect(component.selectedLetter).toBe('A');
      expect(component.filteredTerms.length).toBe(1);
    });

    it('should toggle letter selection', () => {
      component.selectLetter('A');
      expect(component.selectedLetter).toBe('A');
      component.selectLetter('A');
      expect(component.selectedLetter).toBe('');
    });

    it('should show no results for letter with no terms', () => {
      component.selectLetter('Z');
      expect(component.filteredTerms.length).toBe(0);
    });
  });

  // US08: Processar sinonimos
  describe('Synonyms processing', () => {
    it('should parse comma-separated synonyms', () => {
      const event = { target: { value: 'Interface, Service, Endpoint' } };
      component.onSynonymsChange(event);
      expect(component.termForm.synonyms).toEqual(['Interface', 'Service', 'Endpoint']);
    });

    it('should filter empty synonyms', () => {
      const event = { target: { value: 'Interface, , Endpoint, ' } };
      component.onSynonymsChange(event);
      expect(component.termForm.synonyms).toEqual(['Interface', 'Endpoint']);
    });
  });

  // US08: Estado vazio
  describe('Empty state', () => {
    it('should handle project with no glossary data', async () => {
      projectServiceSpy.getProject.and.returnValue(Promise.resolve({ ...mockProject, glossaryData: undefined }));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.terms).toEqual([]);
    });
  });
});
