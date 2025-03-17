import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-form-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './form-editor.component.html',
  styleUrls: ['./form-editor.component.scss']
})
export class FormEditorComponent implements AfterViewInit {
  // Sample list of properties
  properties: string[] = ['speed', 'temperature', 'pressure'];

  // The content we bind to the editable div
  editorContent: string = '';

  // For demonstration: We'll log this on submission
  submittedData: string = '';

  // For ngModel binding
  selectedProperty: string = '';

  // Reference to the contenteditable div
  @ViewChild('editableDiv') editableDiv!: ElementRef;
  
  // Reference to the property selector
  @ViewChild('propSelector') propSelector!: MatSelect;
  
  // Store the property to insert after dropdown closes
  private selectedPropertyToInsert: string | null = null;
  
  // Store the cursor position
  private savedRange: Range | null = null;

  /**
   * Initialize the contenteditable div with the initial content
   */
  ngAfterViewInit() {
    if (this.editableDiv && this.editorContent) {
      this.editableDiv.nativeElement.innerHTML = this.editorContent;
    }
    
    // Subscribe to dropdown open/close events
    this.propSelector.openedChange.subscribe((isOpen: boolean) => {
      if (!isOpen && this.selectedPropertyToInsert) {
        // Insert the property after dropdown closes
        const snippet = `<span class="property-highlight" contenteditable="false">${this.selectedPropertyToInsert}</span>`;
        this.insertAtCursor(snippet);
        this.selectedPropertyToInsert = null;
      }
    });
  }

  /**
   * Called when the user selects a property from the mat-select.
   * We store the property to insert after the dropdown closes.
   */
  onPropertySelect(selectedProp: string) {
    if (!selectedProp) return;
    this.selectedPropertyToInsert = selectedProp;
  }
  
  /**
   * Save the current selection when the div loses focus
   */
  onFocusOut(event: FocusEvent) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.savedRange = selection.getRangeAt(0).cloneRange();
    }
  }

  /**
   * Insert HTML at the current cursor position
   */
  private insertAtCursor(html: string) {
    if (!this.editableDiv) return;
    
    // Focus the editable div
    const el = this.editableDiv.nativeElement;
    el.focus();
    
    // Restore the saved selection if available
    if (this.savedRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.savedRange);
      }
    }
    
    // Get the current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Get the current range
    const range = selection.getRangeAt(0);
    
    // Create a temporary element to hold our HTML
    const fragment = document.createDocumentFragment();
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Move the contents of the temporary element to the fragment
    while (temp.firstChild) {
      fragment.appendChild(temp.firstChild);
    }
    
    // Delete the current selection content (if any)
    range.deleteContents();
    
    // Insert the fragment at the current position
    range.insertNode(fragment);
    
    // Add a space after the inserted property for better usability
    const spaceNode = document.createTextNode(' ');
    range.insertNode(spaceNode);
    
    // Move the cursor to the end of the inserted content (after the space)
    range.setStartAfter(spaceNode);
    range.setEndAfter(spaceNode);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Update our content tracking variable
    this.editorContent = this.editableDiv.nativeElement.innerHTML;
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
   * Clears the editor content
   */
  clearEditor() {
    this.editorContent = '';
    this.selectedProperty = '';
    
    if (this.editableDiv) {
      this.editableDiv.nativeElement.innerHTML = '';
    }
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