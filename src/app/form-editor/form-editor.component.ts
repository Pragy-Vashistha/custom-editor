import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-form-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './form-editor.component.html',
  styleUrls: ['./form-editor.component.scss']
})
export class FormEditorComponent {
  // Sample list of properties
  properties: string[] = ['speed', 'temperature', 'pressure'];

  // The content we bind to the editable div
  editorContent: string = '';

  // For demonstration: We'll log this on submission
  submittedData: string = '';

  // For ngModel binding
  selectedProperty: string = '';

  /**
   * Called when the user selects a property from the mat-select.
   * We wrap it in a styled <span> and append to the current content.
   */
  onPropertySelect(selectedProp: string) {
    if (!selectedProp) return;

    // Example: <span class="property-highlight">speed</span>
    const snippet = `<span class="property-highlight">${selectedProp}</span>`;

    // Append the snippet plus a space at the end (simple approach).
    this.editorContent = (this.editorContent + ' ' + snippet).trim();
  }

  /**
   * Called whenever content in the editable div changes (user typing, pasting).
   */
  onEditableInput(event: Event) {
    const target = event.target as HTMLDivElement;
    this.editorContent = target.innerHTML;
  }

  /**
   * Submit handler for our <form>.
   */
  onSubmit(form: NgForm) {
    const plainText = this.stripHtmlTags(this.editorContent);
    
    this.submittedData =
      'Plain Text: ' + plainText + '\n' +
      'Full HTML: ' + this.editorContent + '\n' +
      'Selected Property: ' + this.selectedProperty;

    console.log('Form submitted!', this.submittedData);
  }

  /**
   * Utility: strip HTML tags to get raw text
   */
  private stripHtmlTags(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || '';
  }
} 