import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Subscription, filter } from 'rxjs';
import { Project, Table, DatabaseType } from '../../models';
import { ProjectService } from '../../shared/services/project.service';
import { TableService } from '../../shared/services/table.service';
import { ToastService } from '../../shared/services/toast.service';

interface Tab {
  id: string;
  label: string;
  icon: string;
  route: string;
  progress: number;
}

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
  standalone: false,
})
export class ProjectPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tabContainer') tabContainer?: ElementRef<HTMLDivElement>;

  project: Project | null = null;
  projectId: number = 0;
  activeTab = 'ux-research';
  private routerSubscription?: Subscription;

  // Export modal
  showExportModal = false;
  projectTables: Table[] = [];

  // Settings modal
  showSettingsModal = false;
  settingsForm = {
    name: '',
    description: '',
    databaseType: 'mysql' as DatabaseType,
    tablePrefix: '',
  };

  databaseTypes: { value: DatabaseType; label: string }[] = [
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'mariadb', label: 'MariaDB' },
  ];

  tabs: Tab[] = [
    { id: 'ux-research', label: 'UX', icon: 'people-outline', route: 'ux-research', progress: 0 },
    { id: 'requirements', label: 'Requisitos', icon: 'list-outline', route: 'requirements', progress: 0 },
    { id: 'design-system', label: 'Design', icon: 'color-palette-outline', route: 'design-system', progress: 0 },
    { id: 'data-architecture', label: 'Dados', icon: 'server-outline', route: 'data-architecture', progress: 0 },
    { id: 'frontend-stack', label: 'Frontend', icon: 'phone-portrait-outline', route: 'frontend-stack', progress: 0 },
    { id: 'backend-stack', label: 'Backend', icon: 'code-slash-outline', route: 'backend-stack', progress: 0 },
    { id: 'integrations', label: 'APIs', icon: 'git-network-outline', route: 'integrations', progress: 0 },
    { id: 'environments', label: 'Ambientes', icon: 'globe-outline', route: 'environments', progress: 0 },
    { id: 'glossary', label: 'Glossário', icon: 'book-outline', route: 'glossary', progress: 0 },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private projectService: ProjectService,
    private tableService: TableService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.projectId = +params['id'];
      this.loadProject();
    });

    // Sync activeTab with current route
    this.syncActiveTabFromUrl();
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.syncActiveTabFromUrl());
  }

  ngAfterViewInit() {
    // Scroll to active tab after view is initialized
    setTimeout(() => this.scrollToActiveTab(), 100);
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  private syncActiveTabFromUrl() {
    const url = this.router.url || '';
    if (!url) return;

    const matchingTab = this.tabs.find((tab) => url.includes(`/${tab.route}`));
    if (matchingTab) {
      this.activeTab = matchingTab.id;
      this.scrollToActiveTab();
    }
  }

  private scrollToActiveTab() {
    const tabElement = document.getElementById(`tab-${this.activeTab}`);
    if (tabElement) {
      tabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  async loadProject() {
    try {
      this.project = await this.projectService.getProject(this.projectId);

      if (!this.project) {
        // Project not found, redirect to home
        this.router.navigate(['/home']);
        return;
      }

      // Load tables for export
      this.projectTables = await this.tableService.getTablesByProject(this.projectId);
    } catch (error) {
      console.error('Failed to load project:', error);
      this.router.navigate(['/home']);
    }
  }

  selectTab(tab: Tab) {
    this.activeTab = tab.id;
    this.scrollToActiveTab();
    this.router.navigate([tab.route], { relativeTo: this.route });
  }

  isTabActive(tabId: string): boolean {
    return this.activeTab === tabId;
  }

  async openProjectMenu() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opções do Projeto',
      buttons: [
        {
          text: 'Exportar',
          icon: 'download-outline',
          handler: () => this.exportProject(),
        },
        {
          text: 'Configurações',
          icon: 'settings-outline',
          handler: () => this.openSettings(),
        },
        {
          text: 'Excluir Projeto',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.confirmDelete(),
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

  async exportProject() {
    // Reload tables before opening export modal
    this.projectTables = await this.tableService.getTablesByProject(this.projectId);
    this.showExportModal = true;
  }

  closeExportModal() {
    this.showExportModal = false;
  }

  openSettings() {
    if (this.project) {
      this.settingsForm = {
        name: this.project.name,
        description: this.project.description || '',
        databaseType: this.project.databaseType,
        tablePrefix: this.project.tablePrefix || '',
      };
      this.showSettingsModal = true;
    }
  }

  closeSettingsModal() {
    this.showSettingsModal = false;
  }

  async saveSettings() {
    if (!this.settingsForm.name.trim()) return;

    try {
      await this.projectService.updateProject(this.projectId, {
        name: this.settingsForm.name.trim(),
        description: this.settingsForm.description.trim() || undefined,
        databaseType: this.settingsForm.databaseType,
        tablePrefix: this.settingsForm.tablePrefix.trim() || undefined,
      });

      await this.loadProject();
      this.closeSettingsModal();
      await this.toastService.presentSuccess('Configurações salvas');
    } catch (error) {
      console.error('Failed to save settings:', error);
      await this.toastService.presentError('Falha ao salvar configurações');
    }
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Excluir projeto',
      message: `Tem certeza que deseja excluir "${this.project?.name}"? Esta ação não pode ser desfeita.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            await this.projectService.deleteProject(this.projectId);
            this.router.navigate(['/home']);
          },
        },
      ],
    });

    await alert.present();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  getOverallProgress(): number {
    if (!this.project) return 0;
    return this.project.progressPercentage;
  }
}
