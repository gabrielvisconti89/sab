import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { GlossaryTerm, GlossaryData, Project } from '../../../../models';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-glossary',
  templateUrl: './glossary.page.html',
  styleUrls: ['./glossary.page.scss'],
  standalone: false,
})
export class GlossaryPage implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  isLoading = true;

  terms: GlossaryTerm[] = [];
  filteredTerms: GlossaryTerm[] = [];
  searchQuery = '';
  selectedLetter = '';
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  showTermModal = false;
  termForm: Partial<GlossaryTerm> = this.getEmptyTermForm();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.extractProjectId();
  }

  private extractProjectId() {
    const urlParts = this.router.url.split('/');
    const projectIndex = urlParts.indexOf('project');
    if (projectIndex !== -1 && urlParts[projectIndex + 1]) {
      const idFromUrl = parseInt(urlParts[projectIndex + 1], 10);
      if (!isNaN(idFromUrl)) {
        this.projectId = idFromUrl;
        this.loadData();
        return;
      }
    }
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const id = currentRoute.snapshot.params['id'];
      if (id) {
        this.projectId = +id;
        this.loadData();
        return;
      }
      currentRoute = currentRoute.parent;
    }
    console.error('Project ID not found in route');
    this.isLoading = false;
  }

  async loadData() {
    this.isLoading = true;
    try {
      this.project = await this.projectService.getProject(this.projectId);
      this.terms = this.project?.glossaryData?.terms ?? [];
      this.filterTerms();
    } catch (error) {
      console.error('Failed to load glossary data:', error);
      this.terms = [];
    } finally {
      this.isLoading = false;
    }
  }

  private async saveData() {
    const glossaryData: GlossaryData = {
      terms: this.terms,
    };

    try {
      await this.projectService.updateGlossaryData(this.projectId, glossaryData);
    } catch (error) {
      console.error('Failed to save glossary data:', error);
    }
  }

  getEmptyTermForm(): Partial<GlossaryTerm> {
    return { id: 0, term: '', definition: '', synonyms: [], relatedEntity: '', usageExample: '' };
  }

  filterTerms() {
    let result = [...this.terms];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        t.term.toLowerCase().includes(query) ||
        t.definition.toLowerCase().includes(query) ||
        t.synonyms.some(s => s.toLowerCase().includes(query))
      );
    }

    if (this.selectedLetter) {
      result = result.filter(t => t.term.toUpperCase().startsWith(this.selectedLetter));
    }

    result.sort((a, b) => a.term.localeCompare(b.term));
    this.filteredTerms = result;
  }

  selectLetter(letter: string) {
    this.selectedLetter = this.selectedLetter === letter ? '' : letter;
    this.filterTerms();
  }

  onSearchChange() {
    this.filterTerms();
  }

  openCreateTerm() {
    this.termForm = this.getEmptyTermForm();
    this.showTermModal = true;
  }

  openEditTerm(term: GlossaryTerm) {
    this.termForm = { ...term, synonyms: [...term.synonyms] };
    this.showTermModal = true;
  }

  async saveTerm() {
    if (!this.termForm.term?.trim() || !this.termForm.definition?.trim()) return;

    if (this.termForm.id === 0) {
      this.terms.push({ ...this.termForm, id: Date.now() } as GlossaryTerm);
    } else {
      const index = this.terms.findIndex(t => t.id === this.termForm.id);
      if (index !== -1) this.terms[index] = { ...this.termForm } as GlossaryTerm;
    }
    this.showTermModal = false;
    this.filterTerms();
    await this.saveData();
  }

  async deleteTerm(term: GlossaryTerm) {
    const alert = await this.alertController.create({
      header: 'Excluir Termo',
      message: `Remover "${term.term}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir', role: 'destructive', handler: async () => {
          this.terms = this.terms.filter(t => t.id !== term.id);
          this.filterTerms();
          await this.saveData();
        }},
      ],
    });
    await alert.present();
  }

  onSynonymsChange(event: any) {
    const value = event.target?.value || '';
    this.termForm.synonyms = value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }
}
