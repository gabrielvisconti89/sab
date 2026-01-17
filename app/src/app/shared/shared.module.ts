import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Components
import { GlassCardComponent } from './components/glass-card/glass-card.component';
import { GlassInputComponent } from './components/glass-input/glass-input.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { BtnPrimaryComponent } from './components/btn-primary/btn-primary.component';
import { BtnPillComponent } from './components/btn-pill/btn-pill.component';

const COMPONENTS = [
  GlassCardComponent,
  GlassInputComponent,
  FormFieldComponent,
  BtnPrimaryComponent,
  BtnPillComponent,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [...COMPONENTS],
})
export class SharedModule {}
