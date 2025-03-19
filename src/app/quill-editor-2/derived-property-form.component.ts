import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ParentEditorComponent } from './parent-editor.component';

@Component({
  selector: 'app-derived-property-form',
  templateUrl: './derived-property-form.component.html',
  styleUrls: ['./derived-property-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ParentEditorComponent]
})
export class DerivedPropertyFormComponent implements OnInit {
  form!: FormGroup;
  formSubmitted = false;
  // Example dynamic properties (could be fetched from an API in a real app)
  propertyOptionsList = [
    { label: 'Company Name', value: '{{companyName}}' },
    { label: 'Address', value: '{{address}}' },
    { label: 'First Name', value: '{{firstName}}' },
    { label: 'Last Name', value: '{{lastName}}' },
    { label: 'Email', value: '{{email}}' }
  ];
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.form = this.fb.group({
      content: ['Hello, {{firstName}}']  // initial content for the editor
    });
  }
  
  onSubmit(): void {
    this.formSubmitted = true;
    console.log('Form submitted with content:', this.form.value.content);
    // ...you can handle the form submission (e.g., send data to backend)
  }
} 