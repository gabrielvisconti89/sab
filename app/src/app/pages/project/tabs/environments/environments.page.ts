import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvironmentsData, EnvironmentConfig, Project } from '../../../../models';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-environments',
  templateUrl: './environments.page.html',
  styleUrls: ['./environments.page.scss'],
  standalone: false,
})
export class EnvironmentsPage implements OnInit {
  projectId: number = 0;
  project: Project | null = null;
  isLoading = true;

  activeEnv: 'local' | 'development' | 'staging' | 'production' = 'local';

  environments: EnvironmentsData = {
    local: this.getEmptyEnv(),
    development: this.getEmptyEnv(),
    staging: this.getEmptyEnv(),
    production: this.getEmptyEnv(),
  };

  envTabs = [
    { id: 'local', label: 'Local', icon: 'laptop-outline' },
    { id: 'development', label: 'Dev', icon: 'code-outline' },
    { id: 'staging', label: 'Staging', icon: 'flask-outline' },
    { id: 'production', label: 'Prod', icon: 'rocket-outline' },
  ];

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
      if (this.project?.environmentsData) {
        this.environments = this.project.environmentsData;
      }
    } catch (error) {
      console.error('Failed to load environments data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async saveData() {
    try {
      await this.projectService.updateEnvironmentsData(this.projectId, this.environments);
    } catch (error) {
      console.error('Failed to save environments data:', error);
    }
  }

  getEmptyEnv(): EnvironmentConfig {
    return { frontendUrl: '', apiUrl: '', adminUrl: '', server: '', database: '', notes: '', envVariables: {} };
  }

  selectEnv(env: any) {
    this.activeEnv = env.id;
  }

  get currentEnv(): EnvironmentConfig {
    return this.environments[this.activeEnv];
  }

  async addEnvVar() {
    const key = prompt('Nome da variavel:');
    if (key && key.trim()) {
      this.currentEnv.envVariables[key.trim()] = '';
      await this.saveData();
    }
  }

  async removeEnvVar(key: string) {
    delete this.currentEnv.envVariables[key];
    await this.saveData();
  }

  async onFieldChange() {
    await this.saveData();
  }
}
