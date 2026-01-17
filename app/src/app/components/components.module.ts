import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ExportModalComponent } from './export-modal/export-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [ExportModalComponent],
  exports: [ExportModalComponent]
})
export class ComponentsModule {}
