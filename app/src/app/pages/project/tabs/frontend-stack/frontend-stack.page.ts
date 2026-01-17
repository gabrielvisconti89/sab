import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FrontendStackData, Dependency, Project } from '../../../../models';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-frontend-stack',
  templateUrl: './frontend-stack.page.html',
  styleUrls: ['./frontend-stack.page.scss'],
  standalone: false,
})
export class FrontendStackPage implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  isLoading = true;

  ionic = { version: '8.x' };
  angular = { version: '19.x', strictMode: true, standaloneComponents: false, ssr: false };
  capacitor = { version: '6.x', platforms: ['iOS', 'Android'] };
  dependencies: Dependency[] = [];
  buildConfig: Record<string, boolean> = {};

  platformOptions = ['iOS', 'Android', 'Web', 'PWA'];

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
      if (this.project?.frontendStackData) {
        const data = this.project.frontendStackData;
        this.ionic = data.ionic ?? this.ionic;
        this.angular = data.angular ?? this.angular;
        this.capacitor = data.capacitor ?? this.capacitor;
        this.dependencies = data.dependencies ?? [];
        this.buildConfig = data.buildConfig ?? {};
      } else {
        this.loadDefaultData();
      }
    } catch (error) {
      console.error('Failed to load frontend stack data:', error);
      this.loadDefaultData();
    } finally {
      this.isLoading = false;
    }
  }

  private async saveData() {
    const frontendStack: FrontendStackData = {
      ionic: this.ionic,
      angular: this.angular,
      capacitor: this.capacitor,
      dependencies: this.dependencies,
      buildConfig: this.buildConfig,
    };

    try {
      await this.projectService.updateFrontendStackData(this.projectId, frontendStack);
    } catch (error) {
      console.error('Failed to save frontend stack data:', error);
    }
  }

  loadDefaultData() {
    this.ionic = { version: '8.x' };
    this.angular = { version: '19.x', strictMode: true, standaloneComponents: false, ssr: false };
    this.capacitor = { version: '6.x', platforms: ['iOS', 'Android'] };

    this.dependencies = [
      { name: '@ionic/angular', version: '^8.0.0', isDev: false, enabled: true },
      { name: '@capacitor/core', version: '^6.0.0', isDev: false, enabled: true },
      { name: '@capacitor/ios', version: '^6.0.0', isDev: false, enabled: true },
      { name: '@capacitor/android', version: '^6.0.0', isDev: false, enabled: true },
      { name: 'tailwindcss', version: '^3.4.0', isDev: true, enabled: true },
      { name: '@angular/forms', version: '^19.0.0', isDev: false, enabled: true },
      { name: 'prismjs', version: '^1.29.0', isDev: false, enabled: false },
      { name: '@capacitor/filesystem', version: '^6.0.0', isDev: false, enabled: true },
      { name: '@capacitor/share', version: '^6.0.0', isDev: false, enabled: true },
    ];

    this.buildConfig = {
      sourceMap: false,
      optimization: true,
      extractLicenses: true,
      aot: true,
      buildOptimizer: true,
    };
  }

  async togglePlatform(platform: string) {
    const index = this.capacitor.platforms.indexOf(platform);
    if (index === -1) {
      this.capacitor.platforms.push(platform);
    } else {
      this.capacitor.platforms.splice(index, 1);
    }
    await this.saveData();
  }

  async onFieldChange() {
    await this.saveData();
  }

  async toggleDependency(dep: Dependency) {
    dep.enabled = !dep.enabled;
    await this.saveData();
  }
}
