import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectPage } from './project.page';

const routes: Routes = [
  {
    path: '',
    component: ProjectPage,
    children: [
      {
        path: '',
        redirectTo: 'ux-research',
        pathMatch: 'full',
      },
      {
        path: 'ux-research',
        loadChildren: () =>
          import('./tabs/ux-research/ux-research.module').then(
            (m) => m.UxResearchPageModule
          ),
      },
      {
        path: 'requirements',
        loadChildren: () =>
          import('./tabs/requirements/requirements.module').then(
            (m) => m.RequirementsPageModule
          ),
      },
      {
        path: 'design-system',
        loadChildren: () =>
          import('./tabs/design-system/design-system.module').then(
            (m) => m.DesignSystemPageModule
          ),
      },
      {
        path: 'data-architecture',
        loadChildren: () =>
          import('./tabs/data-architecture/data-architecture.module').then(
            (m) => m.DataArchitecturePageModule
          ),
      },
      {
        path: 'frontend-stack',
        loadChildren: () =>
          import('./tabs/frontend-stack/frontend-stack.module').then(
            (m) => m.FrontendStackPageModule
          ),
      },
      {
        path: 'backend-stack',
        loadChildren: () =>
          import('./tabs/backend-stack/backend-stack.module').then(
            (m) => m.BackendStackPageModule
          ),
      },
      {
        path: 'integrations',
        loadChildren: () =>
          import('./tabs/integrations/integrations.module').then(
            (m) => m.IntegrationsPageModule
          ),
      },
      {
        path: 'environments',
        loadChildren: () =>
          import('./tabs/environments/environments.module').then(
            (m) => m.EnvironmentsPageModule
          ),
      },
      {
        path: 'glossary',
        loadChildren: () =>
          import('./tabs/glossary/glossary.module').then(
            (m) => m.GlossaryPageModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectPageRoutingModule {}
