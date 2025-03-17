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

  // Store the current selection
  private savedSelection: { start: number, end: number } | null = null;

  // Allowed characters for input restriction
  private readonly allowedChars = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '(', ')', ',', '.', ' ']);

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
        this.insertProperty(this.selectedPropertyToInsert);
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
   * Save selection on focus out
   */
  onFocusOut() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      this.savedSelection = {
        start: range.startOffset,
        end: range.endOffset
      };
    }
  }

  /**
   * Insert a property with red color
   */
  private insertProperty(property: string) {
    if (!this.editableDiv) return;

    const el = this.editableDiv.nativeElement;
    el.focus();

    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = 'red';
    span.textContent = property;
    
    range.deleteContents();
    range.insertNode(span);

    // Add a space after with black color
    const space = document.createElement('span');
    space.style.color = 'black';
    space.textContent = ' ';
    range.insertNode(space);

    // Move cursor after the space
    range.setStartAfter(space);
    range.setEndAfter(space);
    selection.removeAllRanges();
    selection.addRange(range);

    this.editorContent = el.innerHTML;
  }

  /**
   * Insert an operator
   */
  insertOperator(operator: string) {
    if (!this.editableDiv) return;

    const el = this.editableDiv.nativeElement;
    el.focus();

    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = 'black';
    span.textContent = ` ${operator} `;
    
    range.deleteContents();
    range.insertNode(span);

    // Move cursor after the operator
    range.setStartAfter(span);
    range.setEndAfter(span);
    selection.removeAllRanges();
    selection.addRange(range);

    this.editorContent = el.innerHTML;
  }

  /**
   * Insert a function, handling properties specially
   */
  insertFunction(funcName: string) {
    if (!this.editableDiv) return;

    const el = this.editableDiv.nativeElement;
    el.focus();

    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    
    if (range.toString().trim()) {
      // We have a selection
      const fragment = range.cloneContents();
      const redSpans = fragment.querySelectorAll('span[style*="color: red"]');
      
      if (redSpans.length > 0) {
        // We have properties selected
        const properties = Array.from(redSpans)
          .map(span => span.textContent?.trim())
          .filter(text => text)
          .join(', ');

        const funcSpan = document.createElement('span');
        funcSpan.style.color = 'black';
        funcSpan.textContent = `${funcName}(${properties})`;
        
        range.deleteContents();
        range.insertNode(funcSpan);
      } else {
        // Regular text selection
        const text = range.toString().trim();
        const funcSpan = document.createElement('span');
        funcSpan.style.color = 'black';
        funcSpan.textContent = `${funcName}(${text})`;
        
        range.deleteContents();
        range.insertNode(funcSpan);
      }
    } else {
      // No selection, insert empty function
      const funcSpan = document.createElement('span');
      funcSpan.style.color = 'black';
      funcSpan.textContent = `${funcName}()`;
      
      range.insertNode(funcSpan);
    }

    // Move cursor after the function
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    this.editorContent = el.innerHTML;
  }

  /**
   * Handle keydown events to restrict input
   */
  onKeyDown(event: KeyboardEvent) {
    // Allow navigation keys
    if (event.key.length > 1 || event.ctrlKey || event.metaKey) {
      return;
    }

    // Check if the pressed key is allowed
    if (!this.allowedChars.has(event.key)) {
      event.preventDefault();
    }
  }

  /**
   * Called whenever content in the editable div changes
   */
  onEditableInput(event: Event) {
    const target = event.target as HTMLDivElement;
    this.editorContent = target.innerHTML;
  }

  /**
   * Submit handler
   */
  onSubmit(form: NgForm) {
    const plainText = this.stripHtmlTags(this.editorContent);
    
    this.submittedData =
      'Plain Text: ' + plainText + '\n' +
      'Full HTML: ' + this.editorContent;

    console.log('Form submitted!', this.submittedData);
  }

  /**
   * Clear the editor
   */
  clearEditor() {
    this.editorContent = '';
    this.selectedProperty = '';
    
    if (this.editableDiv) {
      this.editableDiv.nativeElement.innerHTML = '';
    }
  }

  /**
   * Strip HTML tags to get plain text
   */
  private stripHtmlTags(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || '';
  }
} 