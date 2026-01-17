import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddPersonaPage } from './add-persona.page';

const routes: Routes = [
  {
    path: '',
    component: AddPersonaPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddPersonaPageRoutingModule {}
