import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  templateUrl: './glass-card.component.html',
  styleUrls: ['./glass-card.component.scss'],
  standalone: false,
})
export class GlassCardComponent {
  @Input() hoverable = true;
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() clickable = false;

  get paddingClass(): string {
    const paddingMap = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    };
    return paddingMap[this.padding];
  }
}
