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

  // Store the current selection range
  private savedRange: Range | null = null;

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
      this.savedRange = selection.getRangeAt(0);
    }
  }

  /**
   * Insert a property with red color
   */
  private insertProperty(property: string) {
    if (!this.editableDiv) return;

    const el = this.editableDiv.nativeElement;

    setTimeout(() => {
      el.focus();

      if (this.savedRange) {
        const selection = window.getSelection();
        if (!selection) return;
        
        selection.removeAllRanges();
        selection.addRange(this.savedRange);

        const range = this.savedRange;
        // Create property token span
        const tokenSpan = document.createElement('span');
        tokenSpan.className = 'property-token';
        tokenSpan.style.color = 'red';
        tokenSpan.contentEditable = 'false';
        tokenSpan.dataset['property'] = property;
        tokenSpan.textContent = property;
        range.deleteContents();
        range.insertNode(tokenSpan);

        // Add a space after with black color in a separate editable span
        const spaceSpan = document.createElement('span');
        spaceSpan.style.color = 'black';
        spaceSpan.textContent = '\u00A0'; // Non-breaking space
        range.insertNode(spaceSpan);

        // Move cursor after the space
        range.setStartAfter(spaceSpan);
        range.setEndAfter(spaceSpan);
        selection.removeAllRanges();
        selection.addRange(range);

        this.savedRange = null; // Clear the saved range
      } else {
        // Fallback: insert at current selection or end
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          // Create property token span
          const tokenSpan = document.createElement('span');
          tokenSpan.className = 'property-token';
          tokenSpan.style.color = 'red';
          tokenSpan.contentEditable = 'false';
          tokenSpan.dataset['property'] = property;
          tokenSpan.textContent = property;
          range.deleteContents();
          range.insertNode(tokenSpan);

          // Add a space after with black color in a separate editable span
          const spaceSpan = document.createElement('span');
          spaceSpan.style.color = 'black';
          spaceSpan.textContent = '\u00A0'; // Non-breaking space
          range.insertNode(spaceSpan);

          // Move cursor after the space
          range.setStartAfter(spaceSpan);
          range.setEndAfter(spaceSpan);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // No selection, insert at end
          const tokenSpan = document.createElement('span');
          tokenSpan.className = 'property-token';
          tokenSpan.style.color = 'red';
          tokenSpan.contentEditable = 'false';
          tokenSpan.dataset['property'] = property;
          tokenSpan.textContent = property;
          el.appendChild(tokenSpan);

          const spaceSpan = document.createElement('span');
          spaceSpan.style.color = 'black';
          spaceSpan.textContent = '\u00A0'; // Non-breaking space
          el.appendChild(spaceSpan);

          // Move cursor after the space
          const range = document.createRange();
          range.setStartAfter(spaceSpan);
          range.setEndAfter(spaceSpan);
          const newSelection = window.getSelection();
          if (newSelection) {
            newSelection.removeAllRanges();
            newSelection.addRange(range);
          }
        }
      }

      this.editorContent = el.innerHTML;
    }, 0);
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
      const propertyTokens = fragment.querySelectorAll('.property-token');
      
      if (propertyTokens.length > 0) {
        // We have properties selected
        const properties = Array.from(propertyTokens)
          .map(span => span.textContent?.trim())
          .filter(text => text)
          .join(', ');

        // Create function wrapper
        const funcWrapper = document.createElement('span');
        funcWrapper.className = 'function-call';

        // Function name (non-editable)
        const funcNameSpan = document.createElement('span');
        funcNameSpan.className = 'function-name';
        funcNameSpan.style.color = 'black';
        funcNameSpan.contentEditable = 'false';
        funcNameSpan.textContent = `${funcName}(`;
        funcWrapper.appendChild(funcNameSpan);

        // Function arguments (editable)
        const argsSpan = document.createElement('span');
        argsSpan.className = 'function-args';
        argsSpan.contentEditable = 'true';
        argsSpan.textContent = properties;
        funcWrapper.appendChild(argsSpan);

        // Closing parenthesis (non-editable)
        const closeParenSpan = document.createElement('span');
        closeParenSpan.className = 'function-name';
        closeParenSpan.style.color = 'black';
        closeParenSpan.contentEditable = 'false';
        closeParenSpan.textContent = ')';
        funcWrapper.appendChild(closeParenSpan);
        
        range.deleteContents();
        range.insertNode(funcWrapper);

        // Add a space after
        const spaceSpan = document.createElement('span');
        spaceSpan.style.color = 'black';
        spaceSpan.textContent = '\u00A0';
        range.insertNode(spaceSpan);

        // Move cursor after the space
        range.setStartAfter(spaceSpan);
        range.setEndAfter(spaceSpan);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Regular text selection
        const text = range.toString().trim();
        
        // Create function wrapper
        const funcWrapper = document.createElement('span');
        funcWrapper.className = 'function-call';

        // Function name (non-editable)
        const funcNameSpan = document.createElement('span');
        funcNameSpan.className = 'function-name';
        funcNameSpan.style.color = 'black';
        funcNameSpan.contentEditable = 'false';
        funcNameSpan.textContent = `${funcName}(`;
        funcWrapper.appendChild(funcNameSpan);

        // Function arguments (editable)
        const argsSpan = document.createElement('span');
        argsSpan.className = 'function-args';
        argsSpan.contentEditable = 'true';
        argsSpan.textContent = text;
        funcWrapper.appendChild(argsSpan);

        // Closing parenthesis (non-editable)
        const closeParenSpan = document.createElement('span');
        closeParenSpan.className = 'function-name';
        closeParenSpan.style.color = 'black';
        closeParenSpan.contentEditable = 'false';
        closeParenSpan.textContent = ')';
        funcWrapper.appendChild(closeParenSpan);
        
        range.deleteContents();
        range.insertNode(funcWrapper);

        // Add a space after
        const spaceSpan = document.createElement('span');
        spaceSpan.style.color = 'black';
        spaceSpan.textContent = '\u00A0';
        range.insertNode(spaceSpan);

        // Move cursor after the space
        range.setStartAfter(spaceSpan);
        range.setEndAfter(spaceSpan);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      // No selection, insert empty function
      // Create function wrapper
      const funcWrapper = document.createElement('span');
      funcWrapper.className = 'function-call';

      // Function name (non-editable)
      const funcNameSpan = document.createElement('span');
      funcNameSpan.className = 'function-name';
      funcNameSpan.style.color = 'black';
      funcNameSpan.contentEditable = 'false';
      funcNameSpan.textContent = `${funcName}(`;
      funcWrapper.appendChild(funcNameSpan);

      // Function arguments (editable)
      const argsSpan = document.createElement('span');
      argsSpan.className = 'function-args';
      argsSpan.contentEditable = 'true';
      argsSpan.textContent = '\u200B'; // Zero-width space for cursor positioning
      funcWrapper.appendChild(argsSpan);

      // Closing parenthesis (non-editable)
      const closeParenSpan = document.createElement('span');
      closeParenSpan.className = 'function-name';
      closeParenSpan.style.color = 'black';
      closeParenSpan.contentEditable = 'false';
      closeParenSpan.textContent = ')';
      funcWrapper.appendChild(closeParenSpan);
      
      range.insertNode(funcWrapper);

      // Add a space after
      const spaceSpan = document.createElement('span');
      spaceSpan.style.color = 'black';
      spaceSpan.textContent = '\u00A0';
      range.insertNode(spaceSpan);

      // Move cursor inside the function arguments
      range.setStart(argsSpan, 0);
      range.setEnd(argsSpan, 0);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    this.editorContent = el.innerHTML;
  }

  /**
   * Handle keydown events to restrict input and handle special cases
   */
  onKeyDown(event: KeyboardEvent) {
    // Allow navigation keys
    if (event.key.length > 1 || event.ctrlKey || event.metaKey) {
      // Handle backspace for empty functions
      if (event.key === 'Backspace') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const container = range.startContainer;
          
          // Check if we're in an empty function's arguments span
          if (container.nodeType === Node.TEXT_NODE && 
              container.textContent === '\u200B' &&
              container.parentElement?.classList.contains('function-args')) {
            const functionCall = container.parentElement.parentElement;
            if (functionCall) {
              event.preventDefault();
              functionCall.remove();
              this.editorContent = this.editableDiv.nativeElement.innerHTML;
            }
          }
        }
      }
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