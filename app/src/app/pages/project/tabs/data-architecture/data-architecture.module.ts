import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { DataArchitecturePage } from './data-architecture.page';
import { SharedModule } from '../../../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: DataArchitecturePage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [DataArchitecturePage],
})
export class DataArchitecturePageModule {}
