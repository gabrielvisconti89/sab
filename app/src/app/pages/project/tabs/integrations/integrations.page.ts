import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { IntegrationsData, ExternalApi, Webhook, Project } from '../../../../models';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.page.html',
  styleUrls: ['./integrations.page.scss'],
  standalone: false,
})
export class IntegrationsPage implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  isLoading = true;

  activeSection: 'apis' | 'webhooks-in' | 'webhooks-out' = 'apis';
  externalApis: ExternalApi[] = [];
  webhooksReceived: Webhook[] = [];
  webhooksSent: Webhook[] = [];

  showApiModal = false;
  showWebhookModal = false;
  webhookType: 'received' | 'sent' = 'received';

  apiForm: Partial<ExternalApi> = this.getEmptyApiForm();
  webhookForm: Partial<Webhook> = this.getEmptyWebhookForm();

  categoryOptions = ['Pagamento', 'Email', 'SMS', 'Analytics', 'Storage', 'Auth', 'Maps', 'Social', 'Outro'];
  authTypeOptions = ['API Key', 'Bearer Token', 'OAuth2', 'Basic Auth', 'None'];

  sections = [
    { id: 'apis', label: 'APIs Externas', icon: 'cloud-outline' },
    { id: 'webhooks-in', label: 'Webhooks Recebidos', icon: 'arrow-down-outline' },
    { id: 'webhooks-out', label: 'Webhooks Enviados', icon: 'arrow-up-outline' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetController: ActionSheetController,
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
      if (this.project?.integrationsData) {
        this.externalApis = this.project.integrationsData.externalApis ?? [];
        this.webhooksReceived = this.project.integrationsData.webhooksReceived ?? [];
        this.webhooksSent = this.project.integrationsData.webhooksSent ?? [];
      }
    } catch (error) {
      console.error('Failed to load integrations data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async saveData() {
    const integrationsData: IntegrationsData = {
      externalApis: this.externalApis,
      webhooksReceived: this.webhooksReceived,
      webhooksSent: this.webhooksSent,
    };

    try {
      await this.projectService.updateIntegrationsData(this.projectId, integrationsData);
    } catch (error) {
      console.error('Failed to save integrations data:', error);
    }
  }

  selectSection(section: any) {
    this.activeSection = section.id;
  }

  getEmptyApiForm(): Partial<ExternalApi> {
    return { id: 0, name: '', category: 'Outro', baseUrl: '', apiVersion: '', authType: 'API Key', envVariables: [], endpoints: '', purpose: '' };
  }

  getEmptyWebhookForm(): Partial<Webhook> {
    return { id: 0, source: '', event: '', endpoint: '', action: '', payload: '' };
  }

  openCreateApi() {
    this.apiForm = this.getEmptyApiForm();
    this.showApiModal = true;
  }

  openEditApi(api: ExternalApi) {
    this.apiForm = { ...api, envVariables: [...api.envVariables] };
    this.showApiModal = true;
  }

  async saveApi() {
    if (!this.apiForm.name?.trim()) return;
    if (this.apiForm.id === 0) {
      this.externalApis.push({ ...this.apiForm, id: Date.now() } as ExternalApi);
    } else {
      const index = this.externalApis.findIndex(a => a.id === this.apiForm.id);
      if (index !== -1) this.externalApis[index] = { ...this.apiForm } as ExternalApi;
    }
    this.showApiModal = false;
    await this.saveData();
  }

  async deleteApi(api: ExternalApi) {
    const alert = await this.alertController.create({
      header: 'Excluir API',
      message: `Remover "${api.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir', role: 'destructive', handler: async () => {
          this.externalApis = this.externalApis.filter(a => a.id !== api.id);
          await this.saveData();
        }},
      ],
    });
    await alert.present();
  }

  openCreateWebhook(type: 'received' | 'sent') {
    this.webhookType = type;
    this.webhookForm = this.getEmptyWebhookForm();
    this.showWebhookModal = true;
  }

  async saveWebhook() {
    if (!this.webhookForm.event?.trim()) return;
    const list = this.webhookType === 'received' ? this.webhooksReceived : this.webhooksSent;
    if (this.webhookForm.id === 0) {
      list.push({ ...this.webhookForm, id: Date.now() } as Webhook);
    }
    this.showWebhookModal = false;
    await this.saveData();
  }

  async deleteWebhook(webhook: Webhook, type: 'received' | 'sent') {
    const alert = await this.alertController.create({
      header: 'Excluir Webhook',
      message: `Remover "${webhook.event}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir', role: 'destructive', handler: async () => {
          if (type === 'received') this.webhooksReceived = this.webhooksReceived.filter(w => w.id !== webhook.id);
          else this.webhooksSent = this.webhooksSent.filter(w => w.id !== webhook.id);
          await this.saveData();
        }},
      ],
    });
    await alert.present();
  }

  onEnvVarsChange(event: any) {
    const value = event.target?.value || '';
    this.apiForm.envVariables = value.split(',').map((v: string) => v.trim()).filter((v: string) => v);
  }

  async openCategorySelector() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Categoria',
      buttons: [
        ...this.categoryOptions.map(category => ({
          text: category,
          handler: () => {
            this.apiForm.category = category;
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async openAuthTypeSelector() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Tipo de Autenticação',
      buttons: [
        ...this.authTypeOptions.map(authType => ({
          text: authType,
          handler: () => {
            this.apiForm.authType = authType;
          }
        })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }
}
