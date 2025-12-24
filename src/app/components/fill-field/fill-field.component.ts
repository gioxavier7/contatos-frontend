import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-fill-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fill-field.component.html',
  styleUrls: ['./fill-field.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FillFieldComponent),
      multi: true
    }
  ]
})
export class FillFieldComponent implements ControlValueAccessor { 
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'email' | 'date' | 'tel' = 'text';
  @Input() disabled: boolean = false;
  @Input() maxLength: number = 0;
  @Output() valueChange = new EventEmitter<string>();
  
  showCharacterWarning: boolean = false;
  value: string = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInputChange(newValue: string) {
    if (this.maxLength > 0 && newValue.length > this.maxLength) {
      this.showCharacterWarning = true;
      return;
    }
    
    this.showCharacterWarning = false;
    this.value = newValue;
    this.onChange(newValue);
    this.onTouched();
    this.valueChange.emit(newValue);
  }

  formatPhoneNumber(value: string): string {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 14);
    } else {
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
    }
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatPhoneNumber(input.value);
    input.value = formatted;
    this.onInputChange(formatted);
  }

  onDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.onInputChange(value);
  }

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

  onFocus() {}

  onBlur() {
    this.onTouched();
  }
}