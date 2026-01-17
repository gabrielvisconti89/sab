import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-btn-pill',
  templateUrl: './btn-pill.component.html',
  styleUrls: ['./btn-pill.component.scss'],
  standalone: false,
})
export class BtnPillComponent {
  @Input() icon = '';
  @Input() color: 'blue' | 'green' | 'red' | 'gray' = 'blue';
  @Input() disabled = false;
  @Output() btnClick = new EventEmitter<void>();

  get colorClasses(): string {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30',
      green: 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30',
      red: 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30',
      gray: 'bg-slate-700/50 border-slate-600/40 text-white/70 hover:bg-slate-700',
    };
    return colors[this.color];
  }

  onClick(): void {
    if (!this.disabled) {
      this.btnClick.emit();
    }
  }
}
