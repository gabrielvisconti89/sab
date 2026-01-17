import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ActionSheetController } from '@ionic/angular';
import { Project, DatabaseType, Table } from '../models';
import { ProjectService } from '../shared/services/project.service';
import { TableService } from '../shared/services/table.service';

interface DatabaseTypeOption {
  value: DatabaseType;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  searchQuery = '';
  isLoading = true;
  showCreateModal = false;

  newProject = {
    name: '',
    description: '',
    databaseType: 'mysql' as DatabaseType,
  };

  databaseTypes: DatabaseTypeOption[] = [
    { value: 'mysql', label: 'MySQL', icon: 'server-outline', description: 'Popular, otimo para web e apps' },
    { value: 'postgresql', label: 'PostgreSQL', icon: 'server-outline', description: 'Robusto, ideal para dados complexos' },
    { value: 'sqlite', label: 'SQLite', icon: 'document-outline', description: 'Leve, perfeito para apps mobile' },
    { value: 'mariadb', label: 'MariaDB', icon: 'server-outline', description: 'Fork do MySQL, alta performance' },
  ];

  // Export modal state
  showExportModal = false;
  exportProject_: Project | null = null;
  exportTables: Table[] = [];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private projectService: ProjectService,
    private tableService: TableService
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  async loadProjects() {
    this.isLoading = true;
    try {
      this.projects = await this.projectService.getAllProjects();
      this.filteredProjects = this.sortProjects([...this.projects]);
    } catch (error) {
      console.error('Failed to load projects:', error);
      this.projects = [];
      this.filteredProjects = [];
    } finally {
      this.isLoading = false;
    }
  }

  sortProjects(projects: Project[]): Project[] {
    return projects.sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      // Then by updated date
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  filterProjects(event: any) {
    const query = event.detail.value?.toLowerCase() || '';
    this.searchQuery = query;

    if (!query) {
      this.filteredProjects = this.sortProjects([...this.projects]);
      return;
    }

    this.filteredProjects = this.sortProjects(
      this.projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      )
    );
  }

  openCreateModal() {
    this.newProject = {
      name: '',
      description: '',
      databaseType: 'mysql',
    };
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  async createProject() {
    if (!this.newProject.name.trim()) {
      return;
    }

    try {
      await this.projectService.createProject({
        name: this.newProject.name.trim(),
        description: this.newProject.description.trim() || undefined,
        databaseType: this.newProject.databaseType,
        databaseCharset: 'utf8mb4',
        databaseCollation: 'utf8mb4_unicode_ci',
        isFavorite: false,
        progressPercentage: 0,
      });

      await this.loadProjects();
      this.closeCreateModal();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  }

  async openProjectActions(project: Project, event: Event) {
    event.stopPropagation();

    const actionSheet = await this.actionSheetController.create({
      header: project.name,
      buttons: [
        {
          text: project.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos',
          icon: project.isFavorite ? 'star' : 'star-outline',
          handler: () => this.toggleFavorite(project),
        },
        {
          text: 'Duplicar projeto',
          icon: 'copy-outline',
          handler: () => this.duplicateProject(project),
        },
        {
          text: 'Exportar',
          icon: 'download-outline',
          handler: () => this.exportProject(project),
        },
        {
          text: 'Excluir',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.confirmDelete(project),
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  async toggleFavorite(project: Project) {
    try {
      await this.projectService.toggleFavorite(project.id);
      await this.loadProjects();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }

  async duplicateProject(project: Project) {
    try {
      await this.projectService.duplicateProject(project.id, `${project.name} (copia)`);
      await this.loadProjects();
    } catch (error) {
      console.error('Failed to duplicate project:', error);
    }
  }

  async exportProject(project: Project) {
    this.exportProject_ = project;
    this.exportTables = await this.tableService.getTablesByProject(project.id);
    this.showExportModal = true;
  }

  closeExportModal() {
    this.showExportModal = false;
    this.exportProject_ = null;
    this.exportTables = [];
  }

  async confirmDelete(project: Project) {
    const alert = await this.alertController.create({
      header: 'Excluir projeto',
      message: `Tem certeza que deseja excluir "${project.name}"? Esta ação não pode ser desfeita.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.deleteProject(project),
        },
      ],
    });

    await alert.present();
  }

  async deleteProject(project: Project) {
    try {
      await this.projectService.deleteProject(project.id);
      await this.loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  openProject(project: Project) {
    // Libera o foco antes de navegar para evitar aria-hidden warning
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.router.navigate(['/project', project.id]);
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'success';
    if (progress >= 50) return 'warning';
    if (progress >= 25) return 'tertiary';
    return 'medium';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  }

  getDatabaseIcon(type: string): string {
    const db = this.databaseTypes.find((d) => d.value === type);
    return db?.icon || 'server-outline';
  }

  getDatabaseLabel(type: string): string {
    const db = this.databaseTypes.find((d) => d.value === type);
    return db?.label || type;
  }

  async openDatabaseSelector() {
    const buttons = this.databaseTypes.map((db) => ({
      text: db.label,
      cssClass: this.newProject.databaseType === db.value ? 'action-sheet-selected' : '',
      handler: () => {
        this.newProject.databaseType = db.value;
      },
    }));

    buttons.push({
      text: 'Cancelar',
      cssClass: 'action-sheet-cancel',
      handler: () => {},
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Banco de dados',
      subHeader: 'Escolha o tipo de banco de dados do projeto',
      cssClass: 'dark-action-sheet database-selector',
      buttons,
    });

    await actionSheet.present();
  }
}
