import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { BackendStackPage } from './backend-stack.page';
import { SharedModule } from '../../../../shared/shared.module';

const routes: Routes = [{ path: '', component: BackendStackPage }];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), SharedModule],
  declarations: [BackendStackPage],
})
export class BackendStackPageModule {}
