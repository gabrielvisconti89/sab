import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendStackData, Dependency, Project } from '../../../../models';
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

  php = { version: '8.3', extensions: ['mbstring', 'openssl', 'pdo', 'tokenizer', 'xml', 'ctype', 'json'] };
  laravel = { version: '12.x', starterKit: 'None', apiAuth: 'Sanctum' };
  packages: Dependency[] = [];
  database = { driver: 'mysql', redis: true };
  services: Record<string, string> = {};

  starterKitOptions = ['None', 'Breeze', 'Jetstream', 'Fortify'];
  apiAuthOptions = ['Sanctum', 'Passport', 'JWT', 'None'];
  databaseDrivers = ['mysql', 'postgresql', 'sqlite', 'sqlserver'];
  extensionOptions = ['mbstring', 'openssl', 'pdo', 'tokenizer', 'xml', 'ctype', 'json', 'fileinfo', 'gd', 'imagick', 'redis', 'zip'];

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
        const data = this.project.backendStackData;
        this.php = data.php ?? this.php;
        this.laravel = data.laravel ?? this.laravel;
        this.packages = data.packages ?? [];
        this.database = data.database ?? this.database;
        this.services = data.services ?? {};
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

  private async saveData() {
    const backendStack: BackendStackData = {
      php: this.php,
      laravel: this.laravel,
      packages: this.packages,
      database: this.database,
      services: this.services,
    };

    try {
      await this.projectService.updateBackendStackData(this.projectId, backendStack);
    } catch (error) {
      console.error('Failed to save backend stack data:', error);
    }
  }

  loadDefaultData() {
    this.packages = [
      { name: 'laravel/sanctum', version: '^4.0', isDev: false, enabled: true },
      { name: 'spatie/laravel-permission', version: '^6.0', isDev: false, enabled: true },
      { name: 'spatie/laravel-query-builder', version: '^5.0', isDev: false, enabled: false },
      { name: 'laravel/telescope', version: '^5.0', isDev: true, enabled: true },
      { name: 'laravel/pint', version: '^1.0', isDev: true, enabled: true },
      { name: 'pestphp/pest', version: '^2.0', isDev: true, enabled: true },
      { name: 'barryvdh/laravel-ide-helper', version: '^3.0', isDev: true, enabled: true },
    ];

    this.services = {
      mail: 'SMTP',
      queue: 'Redis',
      cache: 'Redis',
      session: 'Database',
      filesystem: 'S3',
    };
  }

  async toggleExtension(ext: string) {
    const index = this.php.extensions.indexOf(ext);
    if (index === -1) {
      this.php.extensions.push(ext);
    } else {
      this.php.extensions.splice(index, 1);
    }
    await this.saveData();
  }

  async onFieldChange() {
    await this.saveData();
  }

  async togglePackage(pkg: Dependency) {
    pkg.enabled = !pkg.enabled;
    await this.saveData();
  }
}
