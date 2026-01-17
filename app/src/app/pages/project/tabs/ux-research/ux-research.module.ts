import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { UxResearchPage } from './ux-research.page';
import { SharedModule } from '../../../../shared/shared.module';

const routes: Routes = [
  { path: '', component: UxResearchPage },
  {
    path: 'persona/new',
    loadChildren: () =>
      import('./add-persona/add-persona.module').then((m) => m.AddPersonaPageModule),
  },
  {
    path: 'persona/:personaId',
    loadChildren: () =>
      import('./add-persona/add-persona.module').then((m) => m.AddPersonaPageModule),
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), SharedModule],
  declarations: [UxResearchPage],
})
export class UxResearchPageModule {}
