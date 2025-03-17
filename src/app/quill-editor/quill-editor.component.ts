import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-quill-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    QuillModule
  ],
  templateUrl: './quill-editor.component.html',
  styleUrl: './quill-editor.component.scss'
})
export class QuillEditorComponent implements OnInit, AfterViewInit {
  // Sample list of properties
  properties: string[] = ['speed', 'temperature', 'pressure'];

  // For ngModel binding with Quill editor
  editorContent: string = '';
  
  // For ngModel binding with dropdown
  selectedProperty: string = '';

  // Quill editor instance
  quillEditor: any;

  // Reference to the property selector
  @ViewChild('propSelector') propSelector!: MatSelect;

  // Quill editor configuration
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  constructor() { }

  ngOnInit() {
    // Initialize any required data
    console.log('QuillEditorComponent initialized');
  }

  ngAfterViewInit() {
    // Subscribe to dropdown open/close events after a short delay to ensure the view is fully initialized
    setTimeout(() => {
      if (this.propSelector) {
        this.propSelector.openedChange.subscribe((isOpen: boolean) => {
          if (!isOpen && this.selectedProperty) {
            this.insertProperty(this.selectedProperty);
            this.selectedProperty = '';
          }
        });
      }
    }, 0);
  }

  /**
   * Called when the user selects a property from the mat-select.
   */
  onPropertySelect(selectedProp: string) {
    if (!selectedProp) return;
    this.selectedProperty = selectedProp;
  }

  /**
   * Called when the Quill editor is created
   */
  onEditorCreated(editor: any) {
    this.quillEditor = editor;
    console.log('Quill editor created', editor);
  }

  /**
   * Insert a property at the current cursor position in the Quill editor
   */
  insertProperty(property: string) {
    if (!this.quillEditor) {
      console.warn('Quill editor not initialized');
      return;
    }
    
    // Focus the editor first
    this.quillEditor.focus();
    
    // Get the current selection or create one at the end if none exists
    let range = this.quillEditor.getSelection();
    if (!range) {
      // If no selection, place cursor at the end
      const length = this.quillEditor.getLength();
      this.quillEditor.setSelection(length, 0);
      range = { index: length, length: 0 };
      console.log('Created selection at end of editor', range);
    }
    
    // Create a custom blot with the property
    const propertyHtml = `<span class="property-highlight">${property}</span>`;
    
    // Insert the HTML at the current cursor position
    this.quillEditor.clipboard.dangerouslyPasteHTML(
      range.index,
      propertyHtml,
      'user'
    );
    
    // Move cursor after the inserted property and ensure editor keeps focus
    this.quillEditor.setSelection(range.index + 1, 0);
    this.quillEditor.focus();
  }

  /**
   * Submit handler for our form
   */
  onSubmit(form: NgForm) {
    const plainText = this.stripHtmlTags(this.editorContent);
    
    const submittedData =
      'Plain Text: ' + plainText + '\n' +
      'Full HTML: ' + this.editorContent;

    console.log('Form submitted!', submittedData);
  }

  /**
   * Clears the editor content
   */
  clearEditor() {
    this.editorContent = '';
    this.selectedProperty = '';
  }

  /**
   * Utility: strip HTML tags to get raw text
   */
  stripHtmlTags(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || '';
  }
}
