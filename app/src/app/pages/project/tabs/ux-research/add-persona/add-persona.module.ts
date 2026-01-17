import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AddPersonaPageRoutingModule } from './add-persona-routing.module';
import { AddPersonaPage } from './add-persona.page';
import { SharedModule } from '../../../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPersonaPageRoutingModule,
    SharedModule,
  ],
  declarations: [AddPersonaPage],
})
export class AddPersonaPageModule {}
