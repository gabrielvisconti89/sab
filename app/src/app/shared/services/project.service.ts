import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import {
  Project,
  DatabaseType,
  UxData,
  RequirementsData,
  DesignData,
  FrontendStackData,
  BackendStackData,
  IntegrationsData,
  EnvironmentsData,
  EnvironmentConfig,
  GlossaryData,
} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Subject to notify when a project is updated
  private projectUpdatedSource = new Subject<number>();
  projectUpdated$ = this.projectUpdatedSource.asObservable();

  constructor(private storageService: StorageService) {}

  // === Project CRUD ===

  async getAllProjects(): Promise<Project[]> {
    const projectIds = await this.storageService.get<number[]>(STORAGE_KEYS.PROJECTS_INDEX) ?? [];
    const projects: Project[] = [];

    for (const id of projectIds) {
      const project = await this.getProject(id);
      if (project) {
        projects.push(project);
      }
    }

    return projects.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  async getProject(id: number): Promise<Project | null> {
    try {
      return await this.storageService.get<Project>(STORAGE_KEYS.project(id));
    } catch (error) {
      console.error(`Failed to get project ${id}:`, error);
      return null;
    }
  }

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const now = new Date();
    const id = this.generateId();

    const project: Project = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await this.storageService.set(STORAGE_KEYS.project(id), project);
    await this.addToIndex(id);

    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | null> {
    const project = await this.getProject(id);
    if (!project) return null;

    const updated: Project = {
      ...project,
      ...updates,
      id,
      updatedAt: new Date(),
    };

    await this.storageService.set(STORAGE_KEYS.project(id), updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      await this.storageService.remove(STORAGE_KEYS.project(id));
      await this.storageService.remove(STORAGE_KEYS.tables(id));
      await this.storageService.remove(STORAGE_KEYS.relationships(id));
      await this.removeFromIndex(id);
      return true;
    } catch (error) {
      console.error(`Failed to delete project ${id}:`, error);
      return false;
    }
  }

  async duplicateProject(id: number, newName: string): Promise<Project | null> {
    const original = await this.getProject(id);
    if (!original) return null;

    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = original;

    return this.createProject({
      ...rest,
      name: newName,
      isFavorite: false,
    });
  }

  // === Tab Data Updates ===

  async updateUxData(projectId: number, uxData: UxData): Promise<Project | null> {
    const result = await this.updateProject(projectId, { uxData });
    if (result) {
      await this.recalculateProgress(projectId);
    }
    return result;
  }

  async updateRequirementsData(projectId: number, requirementsData: RequirementsData): Promise<Project | null> {
    const result = await this.updateProject(projectId, { requirementsData });
    if (result) {
      await this.recalculateProgress(projectId);
    }
    return result;
  }

  async updateDesignData(projectId: number, designData: DesignData): Promise<Project | null> {
    const result = await this.updateProject(projectId, { designData });
    if (result) {
      await this.recalculateProgress(projectId);
    }
    return result;
  }

  async updateFrontendStackData(projectId: number, frontendStackData: FrontendStackData): Promise<Project | null> {
    const result = await this.updateProject(projectId, { frontendStackData });
    if (result) {
      await this.recalculateProgress(projectId);
    }
    return result;
  }

  async updateBackendStackData(projectId: number, backendStackData: BackendStackData): Promise<Project | null> {
    const result = await this.updateProject(projectId, { backendStackData });
    if (result) {
      await this.recalculateProgress(projectId);
    }
    return result;
  }

  async updateIntegrationsData(projectId: number, integrationsData: IntegrationsData): Promise<Project | null> {
    const result = await this.updateProject(projectId, { integrationsData });
    if (result) {
      await this.recalculateProgress(projectId);
    }
    return result;
  }

  async updateEnvironmentsData(projectId: number, environmentsData: EnvironmentsData): Promise<Project | null> {
    const result = await this.updateProject(projectId, { environmentsData });
    if (result) {
      await this.recalculateProgress(projectId);
    }
    return result;
  }

  async updateGlossaryData(projectId: number, glossaryData: GlossaryData): Promise<Project | null> {
    const result = await this.updateProject(projectId, { glossaryData });
    if (result) {
      await this.recalculateProgress(projectId);
    }
    return result;
  }

  // === Utility Methods ===

  async toggleFavorite(id: number): Promise<Project | null> {
    const project = await this.getProject(id);
    if (!project) return null;

    return this.updateProject(id, { isFavorite: !project.isFavorite });
  }

  async calculateProgress(id: number): Promise<number> {
    const project = await this.getProject(id);
    if (!project) return 0;

    let completedSections = 0;
    const totalSections = 9;

    // UX Research
    if (project.uxData && this.hasUxData(project.uxData)) completedSections++;

    // Requirements
    if (project.requirementsData && this.hasRequirementsData(project.requirementsData)) completedSections++;

    // Design System
    if (project.designData && this.hasDesignData(project.designData)) completedSections++;

    // Frontend Stack - CORRIGIDO: valida se há dependência habilitada
    if (project.frontendStackData && this.hasFrontendStackData(project.frontendStackData)) completedSections++;

    // Backend Stack - CORRIGIDO: valida se framework foi escolhido
    if (project.backendStackData && this.hasBackendStackData(project.backendStackData)) completedSections++;

    // Integrations
    if (project.integrationsData && this.hasIntegrationsData(project.integrationsData)) completedSections++;

    // Environments - CORRIGIDO: valida se há URL definida
    if (project.environmentsData && this.hasEnvironmentsData(project.environmentsData)) completedSections++;

    // Glossary
    if (project.glossaryData && project.glossaryData.terms.length > 0) completedSections++;

    // Data Architecture (tabelas)
    const tables = await this.storageService.get<unknown[]>(STORAGE_KEYS.tables(id));
    if (tables && tables.length > 0) completedSections++;

    return Math.round((completedSections / totalSections) * 100);
  }

  async recalculateProgress(projectId: number): Promise<void> {
    const progress = await this.calculateProgress(projectId);
    await this.updateProject(projectId, { progressPercentage: progress });
    // Notify subscribers that the project was updated
    this.projectUpdatedSource.next(projectId);
  }

  private hasUxData(uxData: UxData): boolean {
    return uxData.personas.length > 0 ||
           !!uxData.problemCentral?.problemStatement ||
           uxData.journey.length > 0 ||
           uxData.screens.length > 0;
  }

  private hasRequirementsData(data: RequirementsData): boolean {
    return data.functional?.crudEntities?.length > 0 ||
           data.moscow?.mustHave?.length > 0;
  }

  private hasDesignData(data: DesignData): boolean {
    return !!data.colors?.primary;
  }

  private hasIntegrationsData(data: IntegrationsData): boolean {
    return data.externalApis?.length > 0 ||
           data.webhooksReceived?.length > 0 ||
           data.webhooksSent?.length > 0;
  }

  private hasFrontendStackData(data: FrontendStackData): boolean {
    // Considera preenchido se tem ao menos uma dependência habilitada
    return data.dependencies?.some(d => d.enabled) || false;
  }

  private hasBackendStackData(data: BackendStackData): boolean {
    // Considera preenchido se framework foi escolhido (não é 'none')
    return data.framework !== 'none';
  }

  private hasEnvironmentsData(data: EnvironmentsData): boolean {
    // Considera preenchido se pelo menos um ambiente tem URL definida
    const hasEnvData = (env: EnvironmentConfig) =>
      !!env.frontendUrl || !!env.apiUrl;

    return hasEnvData(data.local) ||
           hasEnvData(data.development) ||
           hasEnvData(data.staging) ||
           hasEnvData(data.production);
  }

  // === Data Migration / Seeding ===

  async hasData(): Promise<boolean> {
    const projectIds = await this.storageService.get<number[]>(STORAGE_KEYS.PROJECTS_INDEX);
    return Array.isArray(projectIds) && projectIds.length > 0;
  }

  async seedMockData(): Promise<void> {
    const mockProjects: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'E-commerce Platform',
        description: 'Sistema de e-commerce completo com carrinho, checkout e gestão de pedidos',
        databaseType: 'mysql' as DatabaseType,
        databaseCharset: 'utf8mb4',
        databaseCollation: 'utf8mb4_unicode_ci',
        isFavorite: true,
        progressPercentage: 75,
      },
      {
        name: 'Task Manager API',
        description: 'API REST para gerenciamento de tarefas e projetos com autenticação JWT',
        databaseType: 'postgresql' as DatabaseType,
        databaseCharset: 'utf8',
        databaseCollation: 'utf8_general_ci',
        isFavorite: false,
        progressPercentage: 45,
      },
      {
        name: 'Blog CMS',
        description: 'Sistema de gerenciamento de conteúdo para blogs com editor WYSIWYG',
        databaseType: 'mysql' as DatabaseType,
        databaseCharset: 'utf8mb4',
        databaseCollation: 'utf8mb4_unicode_ci',
        isFavorite: true,
        progressPercentage: 90,
      },
    ];

    for (const projectData of mockProjects) {
      await this.createProject(projectData);
    }
  }

  async clearAllData(): Promise<void> {
    const projectIds = await this.storageService.get<number[]>(STORAGE_KEYS.PROJECTS_INDEX) ?? [];

    for (const id of projectIds) {
      await this.storageService.remove(STORAGE_KEYS.project(id));
      await this.storageService.remove(STORAGE_KEYS.tables(id));
      await this.storageService.remove(STORAGE_KEYS.relationships(id));
    }

    await this.storageService.remove(STORAGE_KEYS.PROJECTS_INDEX);
  }

  // === Private Helpers ===

  private generateId(): number {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
  }

  private async addToIndex(id: number): Promise<void> {
    const projectIds = await this.storageService.get<number[]>(STORAGE_KEYS.PROJECTS_INDEX) ?? [];
    if (!projectIds.includes(id)) {
      projectIds.push(id);
      await this.storageService.set(STORAGE_KEYS.PROJECTS_INDEX, projectIds);
    }
  }

  private async removeFromIndex(id: number): Promise<void> {
    const projectIds = await this.storageService.get<number[]>(STORAGE_KEYS.PROJECTS_INDEX) ?? [];
    const filtered = projectIds.filter(pid => pid !== id);
    await this.storageService.set(STORAGE_KEYS.PROJECTS_INDEX, filtered);
  }
}
