import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-glass-input',
  templateUrl: './glass-input.component.html',
  styleUrls: ['./glass-input.component.scss'],
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GlassInputComponent),
      multi: true,
    },
  ],
})
export class GlassInputComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'number' | 'email' | 'password' = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() rows = 3;

  value = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
