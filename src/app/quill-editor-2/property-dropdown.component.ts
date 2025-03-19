import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-dropdown',
  templateUrl: './property-dropdown.component.html',
  styleUrls: ['./property-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PropertyDropdownComponent implements OnInit {
  @Input() propertyOptions: Array<{ label: string, value: string }> = [];
  @Output() selectProperty = new EventEmitter<string>();
  
  ngOnInit(): void {
    if (this.propertyOptions.length === 0) {
      // Load options (replace with real API call as needed)
      this.propertyOptions = [
        { label: 'First Name', value: '{{firstName}}' },
        { label: 'Last Name', value: '{{lastName}}' },
        { label: 'Email', value: '{{email}}' }
      ];
    }
  }
  
  onSelect(value: string): void {
    if (value) {
      this.selectProperty.emit(value);
      // (The select element will be reset to placeholder in the template)
    }
  }
} 