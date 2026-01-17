import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, ViewWillEnter } from '@ionic/angular';
import {
  UxData,
  Persona,
  ProblemCentral,
  JourneyStep,
  Screen,
  CriticalAction,
  UsageContext,
  OnboardingConfig,
  Project,
} from '../../../../models';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-ux-research',
  templateUrl: './ux-research.page.html',
  styleUrls: ['./ux-research.page.scss'],
  standalone: false,
})
export class UxResearchPage implements OnInit, ViewWillEnter {
  projectId: number = 0;
  project: Project | null = null;
  isLoading = true;

  // Active section
  activeSection: 'personas' | 'problem' | 'journey' | 'screens' | 'actions' | 'context' | 'onboarding' = 'personas';

  // Data
  personas: Persona[] = [];
  problemCentral: ProblemCentral = this.getEmptyProblemCentral();
  journeySteps: JourneyStep[] = [];
  screens: Screen[] = [];
  criticalActions: CriticalAction[] = [];
  usageContext: UsageContext = this.getEmptyUsageContext();
  onboardingConfig: OnboardingConfig = this.getEmptyOnboardingConfig();

  // Modal states
  showPersonaModal = false;
  showJourneyModal = false;
  showScreenModal = false;
  showActionModal = false;

  // Form data
  personaForm: Partial<Persona> = this.getEmptyPersonaForm();
  journeyForm: Partial<JourneyStep> = this.getEmptyJourneyForm();
  screenForm: Partial<Screen> = this.getEmptyScreenForm();
  actionForm: Partial<CriticalAction> = this.getEmptyActionForm();

  // Options
  screenTypes: Screen['type'][] = ['list', 'detail', 'form', 'dashboard', 'modal', 'settings'];
  priorityOptions: Screen['priority'][] = ['essential', 'important', 'desirable'];
  criticalityOptions: CriticalAction['criticality'][] = ['blocking', 'high', 'medium', 'low'];
  platformOptions = ['iOS', 'Android', 'Web', 'PWA', 'Desktop'];
  accessibilityOptions = ['VoiceOver', 'Alto Contraste', 'Tamanho de Fonte', 'Redução de Movimento'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.extractProjectId();

    // Read section from query params (when returning from add-persona)
    this.route.queryParams.subscribe((params) => {
      if (params['section']) {
        this.activeSection = params['section'];
      }
    });
  }

  ionViewWillEnter() {
    if (this.projectId) {
      this.loadData();
    }
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
      if (this.project?.uxData) {
        this.personas = this.project.uxData.personas ?? [];
        this.problemCentral = this.project.uxData.problemCentral ?? this.getEmptyProblemCentral();
        this.journeySteps = this.project.uxData.journey ?? [];
        this.screens = this.project.uxData.screens ?? [];
        this.criticalActions = this.project.uxData.criticalActions ?? [];
        this.usageContext = this.project.uxData.usageContext ?? this.getEmptyUsageContext();
        this.onboardingConfig = this.project.uxData.onboarding ?? this.getEmptyOnboardingConfig();
      }
    } catch (error) {
      console.error('Failed to load UX data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async saveData() {
    const uxData: UxData = {
      personas: this.personas,
      problemCentral: this.problemCentral,
      journey: this.journeySteps,
      screens: this.screens,
      criticalActions: this.criticalActions,
      usageContext: this.usageContext,
      onboarding: this.onboardingConfig,
    };

    try {
      await this.projectService.updateUxData(this.projectId, uxData);
    } catch (error) {
      console.error('Failed to save UX data:', error);
    }
  }

  // Section navigation
  sections = [
    { id: 'personas', label: 'Personas', icon: 'people-outline' },
    { id: 'problem', label: 'Problema', icon: 'alert-circle-outline' },
    { id: 'journey', label: 'Jornada', icon: 'map-outline' },
    { id: 'screens', label: 'Telas', icon: 'phone-portrait-outline' },
    { id: 'actions', label: 'Ações', icon: 'flash-outline' },
    { id: 'context', label: 'Contexto', icon: 'globe-outline' },
    { id: 'onboarding', label: 'Onboarding', icon: 'school-outline' },
  ];

  selectSection(section: any) {
    this.activeSection = section.id;
  }

  // Empty form getters
  getEmptyPersonaForm(): Partial<Persona> {
    return {
      id: 0,
      name: '',
      ageRange: '',
      technicalProfile: '',
      profession: '',
      usageContext: '',
      frustrations: '',
      objectives: '',
      isPrimary: false,
    };
  }

  getEmptyJourneyForm(): Partial<JourneyStep> {
    return {
      id: 0,
      order: 0,
      title: '',
      description: '',
      emotion: '',
    };
  }

  getEmptyScreenForm(): Partial<Screen> {
    return {
      id: 0,
      name: '',
      type: 'list',
      description: '',
      mainComponents: [],
      priority: 'important',
    };
  }

  getEmptyActionForm(): Partial<CriticalAction> {
    return {
      id: 0,
      action: '',
      description: '',
      criticality: 'medium',
    };
  }

  getEmptyProblemCentral(): ProblemCentral {
    return {
      problemStatement: '',
      detailedDescription: '',
      proposedSolution: '',
      differential: '',
    };
  }

  getEmptyUsageContext(): UsageContext {
    return {
      frequency: '',
      priorityDevice: '',
      targetPlatforms: [],
      offlineRequired: false,
      accessibilityRequirements: [],
    };
  }

  getEmptyOnboardingConfig(): OnboardingConfig {
    return {
      needsTutorial: false,
      type: '',
      stepsCount: 0,
      skipAllowed: true,
    };
  }

  // Persona CRUD
  openCreatePersona() {
    this.router.navigate(['persona', 'new'], { relativeTo: this.route });
  }

  openEditPersona(persona: Persona) {
    this.router.navigate(['persona', persona.id], { relativeTo: this.route });
  }

  async savePersona() {
    if (!this.personaForm.name?.trim()) return;

    if (this.personaForm.id === 0) {
      const newPersona: Persona = {
        ...this.personaForm as Persona,
        id: Date.now(),
      };
      this.personas.push(newPersona);
    } else {
      const index = this.personas.findIndex(p => p.id === this.personaForm.id);
      if (index !== -1) {
        this.personas[index] = { ...this.personaForm as Persona };
      }
    }
    this.showPersonaModal = false;
    await this.saveData();
  }

  async deletePersona(persona: Persona) {
    const alert = await this.alertController.create({
      header: 'Excluir Persona',
      message: `Remover "${persona.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            this.personas = this.personas.filter(p => p.id !== persona.id);
            await this.saveData();
          },
        },
      ],
    });
    await alert.present();
  }

  // Journey CRUD
  openCreateJourney() {
    this.journeyForm = this.getEmptyJourneyForm();
    this.journeyForm.order = this.journeySteps.length + 1;
    this.showJourneyModal = true;
  }

  openEditJourney(step: JourneyStep) {
    this.journeyForm = { ...step };
    this.showJourneyModal = true;
  }

  async saveJourney() {
    if (!this.journeyForm.title?.trim()) return;

    if (this.journeyForm.id === 0) {
      const newStep: JourneyStep = {
        ...this.journeyForm as JourneyStep,
        id: Date.now(),
      };
      this.journeySteps.push(newStep);
    } else {
      const index = this.journeySteps.findIndex(s => s.id === this.journeyForm.id);
      if (index !== -1) {
        this.journeySteps[index] = { ...this.journeyForm as JourneyStep };
      }
    }
    this.showJourneyModal = false;
    await this.saveData();
  }

  async deleteJourney(step: JourneyStep) {
    const alert = await this.alertController.create({
      header: 'Excluir Etapa',
      message: `Remover "${step.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            this.journeySteps = this.journeySteps.filter(s => s.id !== step.id);
            await this.saveData();
          },
        },
      ],
    });
    await alert.present();
  }

  // Screen CRUD
  openCreateScreen() {
    this.screenForm = this.getEmptyScreenForm();
    this.showScreenModal = true;
  }

  openEditScreen(screen: Screen) {
    this.screenForm = { ...screen, mainComponents: [...screen.mainComponents] };
    this.showScreenModal = true;
  }

  async saveScreen() {
    if (!this.screenForm.name?.trim()) return;

    if (this.screenForm.id === 0) {
      const newScreen: Screen = {
        ...this.screenForm as Screen,
        id: Date.now(),
      };
      this.screens.push(newScreen);
    } else {
      const index = this.screens.findIndex(s => s.id === this.screenForm.id);
      if (index !== -1) {
        this.screens[index] = { ...this.screenForm as Screen };
      }
    }
    this.showScreenModal = false;
    await this.saveData();
  }

  async deleteScreen(screen: Screen) {
    const alert = await this.alertController.create({
      header: 'Excluir Tela',
      message: `Remover "${screen.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            this.screens = this.screens.filter(s => s.id !== screen.id);
            await this.saveData();
          },
        },
      ],
    });
    await alert.present();
  }

  onComponentsChange(event: any) {
    const value = event.target?.value || '';
    this.screenForm.mainComponents = value.split(',').map((c: string) => c.trim()).filter((c: string) => c);
  }

  // Action CRUD
  openCreateAction() {
    this.actionForm = this.getEmptyActionForm();
    this.showActionModal = true;
  }

  openEditAction(action: CriticalAction) {
    this.actionForm = { ...action };
    this.showActionModal = true;
  }

  async saveAction() {
    if (!this.actionForm.action?.trim()) return;

    if (this.actionForm.id === 0) {
      const newAction: CriticalAction = {
        ...this.actionForm as CriticalAction,
        id: Date.now(),
      };
      this.criticalActions.push(newAction);
    } else {
      const index = this.criticalActions.findIndex(a => a.id === this.actionForm.id);
      if (index !== -1) {
        this.criticalActions[index] = { ...this.actionForm as CriticalAction };
      }
    }
    this.showActionModal = false;
    await this.saveData();
  }

  async deleteAction(action: CriticalAction) {
    const alert = await this.alertController.create({
      header: 'Excluir Ação',
      message: `Remover "${action.action}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            this.criticalActions = this.criticalActions.filter(a => a.id !== action.id);
            await this.saveData();
          },
        },
      ],
    });
    await alert.present();
  }

  // Problem Central auto-save
  async saveProblemCentral() {
    await this.saveData();
  }

  // Usage Context auto-save
  async saveUsageContext() {
    await this.saveData();
  }

  // Onboarding auto-save
  async saveOnboarding() {
    await this.saveData();
  }

  // Helpers
  getCriticalityColor(criticality: string): string {
    switch (criticality) {
      case 'blocking': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'medium';
      default: return 'medium';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'essential': return 'danger';
      case 'important': return 'warning';
      case 'desirable': return 'success';
      default: return 'medium';
    }
  }

  getScreenTypeIcon(type: string): string {
    switch (type) {
      case 'list': return 'list-outline';
      case 'detail': return 'document-text-outline';
      case 'form': return 'create-outline';
      case 'dashboard': return 'grid-outline';
      case 'modal': return 'albums-outline';
      case 'settings': return 'settings-outline';
      default: return 'document-outline';
    }
  }

  async togglePlatform(platform: string) {
    const index = this.usageContext.targetPlatforms.indexOf(platform);
    if (index === -1) {
      this.usageContext.targetPlatforms.push(platform);
    } else {
      this.usageContext.targetPlatforms.splice(index, 1);
    }
    await this.saveData();
  }

  async toggleAccessibility(option: string) {
    const index = this.usageContext.accessibilityRequirements.indexOf(option);
    if (index === -1) {
      this.usageContext.accessibilityRequirements.push(option);
    } else {
      this.usageContext.accessibilityRequirements.splice(index, 1);
    }
    await this.saveData();
  }

  // Action Sheet Selectors
  async openScreenTypeSelector() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Tipo de Tela',
      buttons: [
        ...this.screenTypes.map(type => ({
          text: type,
          handler: () => {
            this.screenForm.type = type;
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async openScreenPrioritySelector() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Prioridade',
      buttons: [
        ...this.priorityOptions.map(priority => ({
          text: priority,
          handler: () => {
            this.screenForm.priority = priority;
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async openCriticalitySelector() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Criticidade',
      buttons: [
        ...this.criticalityOptions.map(criticality => ({
          text: criticality,
          handler: () => {
            this.actionForm.criticality = criticality;
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }
}
