import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Persona, Project, UxData } from '../../../../../models';
import { ProjectService } from '../../../../../shared/services/project.service';

@Component({
  selector: 'app-add-persona',
  templateUrl: './add-persona.page.html',
  styleUrls: ['./add-persona.page.scss'],
  standalone: false,
})
export class AddPersonaPage implements OnInit {
  projectId: number = 0;
  personaId: number | null = null;
  isEditing = false;
  project: Project | null = null;

  // Section navigation chips
  sections = [
    { id: 'personas', label: 'Personas', icon: 'people-outline' },
    { id: 'problem', label: 'Problema', icon: 'alert-circle-outline' },
    { id: 'journey', label: 'Jornada', icon: 'map-outline' },
    { id: 'screens', label: 'Telas', icon: 'phone-portrait-outline' },
    { id: 'actions', label: 'Ações', icon: 'flash-outline' },
    { id: 'context', label: 'Contexto', icon: 'globe-outline' },
    { id: 'onboarding', label: 'Onboarding', icon: 'school-outline' },
  ];
  activeSection = 'personas';

  form: Partial<Persona> = {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.extractIds();
  }

  private extractIds() {
    // Extract projectId from URL
    const urlParts = this.router.url.split('/');
    const projectIndex = urlParts.indexOf('project');
    if (projectIndex !== -1 && urlParts[projectIndex + 1]) {
      const idFromUrl = parseInt(urlParts[projectIndex + 1], 10);
      if (!isNaN(idFromUrl)) {
        this.projectId = idFromUrl;
      }
    }

    // Check if we're editing (personaId in route)
    const personaIdParam = this.route.snapshot.paramMap.get('personaId');
    if (personaIdParam && personaIdParam !== 'new') {
      this.personaId = parseInt(personaIdParam, 10);
      this.isEditing = true;
    }

    this.loadData();
  }

  async loadData() {
    try {
      this.project = await this.projectService.getProject(this.projectId);

      if (this.isEditing && this.project?.uxData?.personas) {
        const existingPersona = this.project.uxData.personas.find(
          (p) => p.id === this.personaId
        );
        if (existingPersona) {
          this.form = { ...existingPersona };
        }
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  }

  async save() {
    if (!this.form.name?.trim()) return;

    try {
      this.project = await this.projectService.getProject(this.projectId);
      if (!this.project) return;

      const personas = this.project.uxData?.personas ?? [];

      if (this.isEditing && this.personaId) {
        // Update existing persona
        const index = personas.findIndex((p) => p.id === this.personaId);
        if (index !== -1) {
          personas[index] = { ...this.form } as Persona;
        }
      } else {
        // Create new persona
        const newPersona: Persona = {
          ...(this.form as Persona),
          id: Date.now(),
        };
        personas.push(newPersona);
      }

      const existingUxData = this.project.uxData;
      const uxData: UxData = {
        personas,
        problemCentral: existingUxData?.problemCentral ?? {
          problemStatement: '',
          detailedDescription: '',
          proposedSolution: '',
          differential: '',
        },
        journey: existingUxData?.journey ?? [],
        screens: existingUxData?.screens ?? [],
        criticalActions: existingUxData?.criticalActions ?? [],
        usageContext: existingUxData?.usageContext ?? {
          frequency: '',
          priorityDevice: '',
          targetPlatforms: [],
          offlineRequired: false,
          accessibilityRequirements: [],
        },
        onboarding: existingUxData?.onboarding ?? {
          needsTutorial: false,
          skipAllowed: true,
        },
      };

      await this.projectService.updateUxData(this.projectId, uxData);
      this.goBack();
    } catch (error) {
      console.error('Failed to save persona:', error);
    }
  }

  goBack() {
    this.location.back();
  }

  selectSection(section: { id: string }) {
    // Navigate back to ux-research with the selected section
    this.router.navigate(['../../'], {
      relativeTo: this.route,
      queryParams: { section: section.id },
    });
  }
}
