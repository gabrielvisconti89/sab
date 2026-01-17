import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import {
  RequirementsData,
  FunctionalRequirements,
  NonFunctionalRequirements,
  MoscowPrioritization,
  CrudEntity,
  Project,
} from '../../../../models';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.page.html',
  styleUrls: ['./requirements.page.scss'],
  standalone: false,
})
export class RequirementsPage implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  isLoading = true;

  // Active section
  activeSection: 'functional' | 'non-functional' | 'moscow' = 'functional';

  // Accordion state
  expandedCategories: Record<string, boolean> = {
    authentication: true,
    userManagement: false,
    crud: false,
    notifications: false,
    searchFilters: false,
    reports: false,
    other: false,
  };

  // Functional requirements
  authRequirements: Record<string, { label: string; value: boolean }> = {};
  userManagementRequirements: Record<string, { label: string; value: boolean }> = {};
  notificationRequirements: Record<string, { label: string; value: boolean }> = {};
  searchFilterRequirements: Record<string, { label: string; value: boolean }> = {};
  reportRequirements: Record<string, { label: string; value: boolean }> = {};
  otherRequirements: Record<string, { label: string; value: boolean }> = {};
  crudEntities: CrudEntity[] = [];

  // Non-functional requirements
  performanceReqs: Record<string, { label: string; value: string | number; unit?: string }> = {};
  scalabilityReqs: Record<string, { label: string; value: string | number; unit?: string }> = {};
  availabilityReqs: Record<string, { label: string; value: string | number; unit?: string }> = {};
  securityReqs: Record<string, { label: string; value: boolean }> = {};
  backupReqs: Record<string, { label: string; value: string }> = {};

  // MoSCoW
  moscow: MoscowPrioritization = {
    mustHave: [],
    shouldHave: [],
    couldHave: [],
    wontHave: [],
  };

  // Modal states
  showCrudModal = false;
  showMoscowModal = false;

  // Form data
  crudForm: CrudEntity = this.getEmptyCrudForm();
  moscowForm = { text: '', category: 'mustHave' as keyof MoscowPrioritization };

  sections = [
    { id: 'functional', label: 'Funcionais', icon: 'checkmark-circle-outline' },
    { id: 'non-functional', label: 'Não-Funcionais', icon: 'speedometer-outline' },
    { id: 'moscow', label: 'MoSCoW', icon: 'grid-outline' },
  ];

  moscowCategories: Array<{ key: keyof MoscowPrioritization; label: string; color: string }> = [
    { key: 'mustHave', label: 'Must Have', color: 'danger' },
    { key: 'shouldHave', label: 'Should Have', color: 'warning' },
    { key: 'couldHave', label: 'Could Have', color: 'success' },
    { key: 'wontHave', label: 'Won\'t Have', color: 'medium' },
  ];

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
      if (this.project?.requirementsData) {
        const data = this.project.requirementsData;
        // Load functional requirements
        if (data.functional) {
          this.authRequirements = data.functional.authentication ?? this.authRequirements;
          this.userManagementRequirements = data.functional.userManagement ?? this.userManagementRequirements;
          this.notificationRequirements = data.functional.notifications ?? this.notificationRequirements;
          this.searchFilterRequirements = data.functional.searchFilters ?? this.searchFilterRequirements;
          this.reportRequirements = data.functional.reports ?? this.reportRequirements;
          this.otherRequirements = data.functional.other ?? this.otherRequirements;
          this.crudEntities = data.functional.crudEntities ?? this.crudEntities;
        }
        // Load non-functional requirements
        if (data.nonFunctional) {
          this.performanceReqs = data.nonFunctional.performance ?? this.performanceReqs;
          this.scalabilityReqs = data.nonFunctional.scalability ?? this.scalabilityReqs;
          this.availabilityReqs = data.nonFunctional.availability ?? this.availabilityReqs;
          this.securityReqs = data.nonFunctional.security ?? this.securityReqs;
          this.backupReqs = data.nonFunctional.backup ?? this.backupReqs;
        }
        // Load MoSCoW
        if (data.moscow) {
          this.moscow = data.moscow;
        }
      } else {
        this.loadDefaultData();
      }
    } catch (error) {
      console.error('Failed to load requirements data:', error);
      this.loadDefaultData();
    } finally {
      this.isLoading = false;
    }
  }

  private async saveData() {
    const requirementsData: RequirementsData = {
      functional: {
        authentication: this.authRequirements,
        userManagement: this.userManagementRequirements,
        notifications: this.notificationRequirements,
        searchFilters: this.searchFilterRequirements,
        reports: this.reportRequirements,
        other: this.otherRequirements,
        crudEntities: this.crudEntities,
      },
      nonFunctional: {
        performance: this.performanceReqs,
        scalability: this.scalabilityReqs,
        availability: this.availabilityReqs,
        security: this.securityReqs,
        backup: this.backupReqs,
      },
      moscow: this.moscow,
    };

    try {
      await this.projectService.updateRequirementsData(this.projectId, requirementsData);
    } catch (error) {
      console.error('Failed to save requirements data:', error);
    }
  }

  loadDefaultData() {
    // Authentication requirements
    this.authRequirements = {
      emailPassword: { label: 'Login com Email/Senha', value: true },
      oauth: { label: 'Login com Google/Apple', value: true },
      magicLink: { label: 'Magic Link', value: false },
      twoFactor: { label: 'Autenticação 2FA', value: true },
      passwordRecovery: { label: 'Recuperação de Senha', value: true },
      sessionManagement: { label: 'Gerenciamento de Sessões', value: true },
      rememberMe: { label: 'Lembrar Dispositivo', value: true },
    };

    // User management
    this.userManagementRequirements = {
      registration: { label: 'Registro de Usuários', value: true },
      profileEdit: { label: 'Edição de Perfil', value: true },
      avatar: { label: 'Upload de Avatar', value: true },
      roles: { label: 'Sistema de Roles', value: true },
      permissions: { label: 'Permissões Granulares', value: false },
      accountDeactivation: { label: 'Desativação de Conta', value: true },
    };

    // Notifications
    this.notificationRequirements = {
      push: { label: 'Notificações Push', value: true },
      email: { label: 'Notificações por Email', value: true },
      inApp: { label: 'Notificações In-App', value: true },
      preferences: { label: 'Preferências de Notificação', value: true },
    };

    // Search and filters
    this.searchFilterRequirements = {
      globalSearch: { label: 'Busca Global', value: true },
      advancedFilters: { label: 'Filtros Avançados', value: true },
      savedFilters: { label: 'Filtros Salvos', value: false },
      recentSearches: { label: 'Buscas Recentes', value: true },
    };

    // Reports
    this.reportRequirements = {
      pdfExport: { label: 'Exportação PDF', value: true },
      csvExport: { label: 'Exportação CSV', value: true },
      charts: { label: 'Gráficos/Dashboards', value: false },
      scheduled: { label: 'Relatórios Agendados', value: false },
    };

    // Other
    this.otherRequirements = {
      darkMode: { label: 'Modo Escuro', value: true },
      offlineMode: { label: 'Modo Offline', value: true },
      i18n: { label: 'Internacionalização', value: false },
      accessibility: { label: 'Acessibilidade WCAG', value: true },
    };

    // CRUD Entities
    this.crudEntities = [
      { name: 'Projetos', create: true, list: true, view: true, edit: true, delete: true, export: true, import: false },
      { name: 'Tabelas', create: true, list: true, view: true, edit: true, delete: true, export: true, import: true },
      { name: 'Colunas', create: true, list: true, view: true, edit: true, delete: true, export: false, import: false },
    ];

    // Non-functional: Performance
    this.performanceReqs = {
      pageLoad: { label: 'Tempo de Carregamento', value: 2, unit: 's' },
      apiResponse: { label: 'Resposta da API', value: 200, unit: 'ms' },
      bundleSize: { label: 'Tamanho do Bundle', value: 2, unit: 'MB' },
    };

    // Non-functional: Scalability
    this.scalabilityReqs = {
      concurrentUsers: { label: 'Usuários Concorrentes', value: 1000, unit: '' },
      dataVolume: { label: 'Volume de Dados', value: 100, unit: 'GB' },
      requestsPerSecond: { label: 'Requisições/segundo', value: 100, unit: 'req/s' },
    };

    // Non-functional: Availability
    this.availabilityReqs = {
      uptime: { label: 'Uptime Garantido', value: 99.9, unit: '%' },
      rto: { label: 'RTO (Recovery Time)', value: 4, unit: 'h' },
      rpo: { label: 'RPO (Recovery Point)', value: 1, unit: 'h' },
    };

    // Non-functional: Security
    this.securityReqs = {
      https: { label: 'HTTPS Obrigatório', value: true },
      dataEncryption: { label: 'Criptografia de Dados', value: true },
      auditLog: { label: 'Log de Auditoria', value: true },
      rateLimiting: { label: 'Rate Limiting', value: true },
      inputValidation: { label: 'Validação de Input', value: true },
      csrf: { label: 'Proteção CSRF', value: true },
      xss: { label: 'Proteção XSS', value: true },
    };

    // Non-functional: Backup
    this.backupReqs = {
      frequency: { label: 'Frequência', value: 'Diário' },
      retention: { label: 'Retenção', value: '30 dias' },
      location: { label: 'Localização', value: 'Cloud (S3)' },
    };

    // MoSCoW
    this.moscow = {
      mustHave: [
        'CRUD de Projetos',
        'CRUD de Tabelas',
        'Geração de SQL',
        'Geração de Migrations',
        'Exportação de Arquivos',
      ],
      shouldHave: [
        'Diagrama ER Visual',
        'Modo Offline',
        'Sincronização Cloud',
        'Compartilhamento de Projetos',
      ],
      couldHave: [
        'Templates de Projetos',
        'Integração com Git',
        'Colaboração em Tempo Real',
        'Histórico de Versões',
      ],
      wontHave: [
        'Execução de SQL',
        'Conexão Direta com DB',
        'Deploy Automático',
      ],
    };
  }

  selectSection(section: any) {
    this.activeSection = section.id;
  }

  toggleCategory(category: string) {
    this.expandedCategories[category] = !this.expandedCategories[category];
  }

  getEmptyCrudForm(): CrudEntity {
    return {
      name: '',
      create: true,
      list: true,
      view: true,
      edit: true,
      delete: true,
      export: false,
      import: false,
    };
  }

  // CRUD Entity methods
  openCreateCrud() {
    this.crudForm = this.getEmptyCrudForm();
    this.showCrudModal = true;
  }

  openEditCrud(entity: CrudEntity) {
    this.crudForm = { ...entity };
    this.showCrudModal = true;
  }

  async saveCrud() {
    if (!this.crudForm.name.trim()) return;

    const existingIndex = this.crudEntities.findIndex(e => e.name === this.crudForm.name);
    if (existingIndex === -1) {
      this.crudEntities.push({ ...this.crudForm });
    } else {
      this.crudEntities[existingIndex] = { ...this.crudForm };
    }
    this.showCrudModal = false;
    await this.saveData();
  }

  async deleteCrud(entity: CrudEntity) {
    const alert = await this.alertController.create({
      header: 'Excluir Entidade',
      message: `Remover "${entity.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            this.crudEntities = this.crudEntities.filter(e => e.name !== entity.name);
            await this.saveData();
          },
        },
      ],
    });
    await alert.present();
  }

  getCrudOperations(entity: CrudEntity): string[] {
    const ops: string[] = [];
    if (entity.create) ops.push('C');
    if (entity.list || entity.view) ops.push('R');
    if (entity.edit) ops.push('U');
    if (entity.delete) ops.push('D');
    return ops;
  }

  // MoSCoW methods
  openAddMoscow(category: keyof MoscowPrioritization) {
    this.moscowForm = { text: '', category };
    this.showMoscowModal = true;
  }

  async saveMoscow() {
    if (!this.moscowForm.text.trim()) return;
    this.moscow[this.moscowForm.category].push(this.moscowForm.text.trim());
    this.showMoscowModal = false;
    await this.saveData();
  }

  async removeMoscowItem(category: keyof MoscowPrioritization, index: number) {
    this.moscow[category].splice(index, 1);
    await this.saveData();
  }

  async moveMoscowItem(category: keyof MoscowPrioritization, index: number, direction: 'up' | 'down') {
    const categories = this.moscowCategories.map(c => c.key);
    const currentIndex = categories.indexOf(category);
    const targetCategory = direction === 'up' ? categories[currentIndex - 1] : categories[currentIndex + 1];

    if (targetCategory) {
      const item = this.moscow[category].splice(index, 1)[0];
      this.moscow[targetCategory].push(item);
      await this.saveData();
    }
  }

  async onRequirementChange() {
    await this.saveData();
  }

  getMoscowCategoryLabel(category: keyof MoscowPrioritization): string {
    return this.moscowCategories.find(c => c.key === category)?.label || category;
  }

  getMoscowCategoryColor(category: keyof MoscowPrioritization): string {
    return this.moscowCategories.find(c => c.key === category)?.color || 'medium';
  }
}
