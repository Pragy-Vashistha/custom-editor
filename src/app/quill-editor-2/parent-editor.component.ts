import { Component, Input, ViewChild, forwardRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuillEditorDirective } from './quill-editor.directive';
import { CustomToolbarComponent } from './custom-toolbar.component';

@Component({
  selector: 'app-parent-editor',
  templateUrl: './parent-editor.component.html',
  styleUrls: ['./parent-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomToolbarComponent, QuillEditorDirective],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ParentEditorComponent),
    multi: true
  }]
})
export class ParentEditorComponent implements ControlValueAccessor, AfterViewInit {
  @Input() placeholder: string = 'Start writing...';
  @Input() propertyOptions: Array<{ label: string, value: string }> = [];
  @Output() textChange = new EventEmitter<{ html: string, delta: any, source: string }>();
  @Output() selectionChange = new EventEmitter<{ range: any, oldRange: any, source: string }>();
  
  @ViewChild(QuillEditorDirective) editor!: QuillEditorDirective;
  @ViewChild(CustomToolbarComponent) toolbar!: CustomToolbarComponent;
  
  private _value: string = '';
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  
  writeValue(value: any): void {
    this._value = value || '';
    if (this.editor) {
      // Update inner editor content if already initialized
      this.editor.writeValue(this._value);
    }
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {
    if (this.editor) {
      this.editor.setDisabledState?.(isDisabled);
    }
  }
  
  ngAfterViewInit(): void {
    // After child components are ready, apply any initial value
    if (this._value) {
      this.editor.writeValue(this._value);
    }
  }
  
  // Handle text changes from the editor directive
  onTextChanged(event: { html: string, delta: any, source: string }): void {
    this._value = event.html;
    this.onChange(this._value);       // propagate value to form
    this.textChange.emit(event);     // optional: emit to parent if needed
  }
  // Handle selection changes (focus/blur) from the editor
  onSelectionChanged(event: { range: any, oldRange: any, source: string }): void {
    if (event.range === null) {
      this.onTouched();  // mark as touched (blur)
    }
    this.selectionChange.emit(event);
  }
  
  // Insert selected property placeholder into the editor
  insertProperty(propertyKey: string): void {
    if (this.editor) {
      this.editor.insertProperty(propertyKey);
    }
  }
} 