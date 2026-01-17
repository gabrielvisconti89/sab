import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-btn-primary',
  templateUrl: './btn-primary.component.html',
  styleUrls: ['./btn-primary.component.scss'],
  standalone: false,
})
export class BtnPrimaryComponent {
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = true;
  @Input() type: 'button' | 'submit' = 'button';
  @Output() btnClick = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit();
    }
  }
}
