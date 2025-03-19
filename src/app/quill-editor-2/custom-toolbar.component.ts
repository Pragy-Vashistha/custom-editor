import { Component, Input, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyDropdownComponent } from './property-dropdown.component';

@Component({
  selector: 'app-custom-toolbar',
  templateUrl: './custom-toolbar.component.html',
  styleUrls: ['./custom-toolbar.component.scss'],
  standalone: true,
  imports: [CommonModule, PropertyDropdownComponent]
})
export class CustomToolbarComponent {
  @Input() propertyOptions: Array<{ label: string, value: string }> = [];
  @Output() selectProperty = new EventEmitter<string>();
  @ViewChild('toolbar', { static: true }) toolbarEl!: ElementRef<HTMLElement>;
  
  // Expose native toolbar element for Quill configuration
  get toolbarElement(): HTMLElement {
    return this.toolbarEl.nativeElement;
  }
  
  onPropertySelected(propertyKey: string): void {
    this.selectProperty.emit(propertyKey);
  }
} 