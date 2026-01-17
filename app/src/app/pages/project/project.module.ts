import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProjectPageRoutingModule } from './project-routing.module';
import { ProjectPage } from './project.page';
import { ComponentsModule } from '../../components/components.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProjectPageRoutingModule,
    ComponentsModule,
    SharedModule
  ],
  declarations: [ProjectPage],
})
export class ProjectPageModule {}
