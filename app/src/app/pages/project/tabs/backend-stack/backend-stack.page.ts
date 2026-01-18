import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendStackData, BackendFrameworkType, LaravelConfig, NodejsConfig, Project } from '../../../../models';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-backend-stack',
  templateUrl: './backend-stack.page.html',
  styleUrls: ['./backend-stack.page.scss'],
  standalone: false,
})
export class BackendStackPage implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  isLoading = true;

  selectedFramework: BackendFrameworkType = 'laravel';
  laravelConfig: LaravelConfig = { version: '12.x', apiAuth: 'Sanctum' };
  nodejsConfig: NodejsConfig = { framework: 'Express', auth: 'JWT' };
  database = { driver: 'mysql' };

  frameworkOptions = [
    { value: 'none' as BackendFrameworkType, label: 'Nenhum', icon: 'close-circle-outline' },
    { value: 'laravel' as BackendFrameworkType, label: 'Laravel', icon: 'logo-laravel' },
    { value: 'nodejs' as BackendFrameworkType, label: 'NodeJS', icon: 'logo-nodejs' },
  ];

  laravelVersions = ['11.x', '12.x'];
  laravelAuthOptions = ['Sanctum', 'Passport', 'Nenhuma'];
  nodejsFrameworks = ['Express', 'NestJS'];
  nodejsAuthOptions = ['JWT', 'Session', 'Nenhuma'];
  databaseDrivers = ['mysql', 'postgresql', 'sqlite'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
      if (this.project?.backendStackData) {
        this.loadFromProject(this.project.backendStackData);
      } else {
        this.loadDefaultData();
      }
    } catch (error) {
      console.error('Failed to load backend stack data:', error);
      this.loadDefaultData();
    } finally {
      this.isLoading = false;
    }
  }

  private loadFromProject(data: BackendStackData) {
    // Handle new format
    if (data.framework) {
      this.selectedFramework = data.framework;
      if (data.laravel) {
        this.laravelConfig = { ...this.laravelConfig, ...data.laravel };
      }
      if (data.nodejs) {
        this.nodejsConfig = { ...this.nodejsConfig, ...data.nodejs };
      }
      if (data.database) {
        this.database = { ...this.database, ...data.database };
      }
    } else {
      // Migrate from old format
      const oldData = data as any;
      if (oldData.laravel) {
        this.selectedFramework = 'laravel';
        this.laravelConfig = {
          version: oldData.laravel.version || '12.x',
          apiAuth: oldData.laravel.apiAuth || 'Sanctum',
        };
      }
      if (oldData.database?.driver) {
        this.database.driver = oldData.database.driver;
      }
    }
  }

  loadDefaultData() {
    this.selectedFramework = 'laravel';
    this.laravelConfig = { version: '12.x', apiAuth: 'Sanctum' };
    this.nodejsConfig = { framework: 'Express', auth: 'JWT' };
    this.database = { driver: 'mysql' };
  }

  async selectFramework(framework: BackendFrameworkType) {
    this.selectedFramework = framework;
    await this.saveData();
  }

  async onFieldChange() {
    await this.saveData();
  }

  private async saveData() {
    const backendStack: BackendStackData = {
      framework: this.selectedFramework,
    };

    if (this.selectedFramework === 'laravel') {
      backendStack.laravel = { ...this.laravelConfig };
      backendStack.database = { ...this.database };
    } else if (this.selectedFramework === 'nodejs') {
      backendStack.nodejs = { ...this.nodejsConfig };
      backendStack.database = { ...this.database };
    }

    try {
      await this.projectService.updateBackendStackData(this.projectId, backendStack);
    } catch (error) {
      console.error('Failed to save backend stack data:', error);
    }
  }
}
