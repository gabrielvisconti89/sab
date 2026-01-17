import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { IntegrationsPage } from './integrations.page';
import { SharedModule } from '../../../../shared/shared.module';

const routes: Routes = [{ path: '', component: IntegrationsPage }];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), SharedModule],
  declarations: [IntegrationsPage],
})
export class IntegrationsPageModule {}
