import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-simple-expression-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './simple-expression-editor.component.html',
  styleUrls: ['./simple-expression-editor.component.scss']
})
export class SimpleExpressionEditorComponent {
  // The main expression input
  expression: string = '';
  
  // Highlighted expression for display
  highlightedExpression: string = '';

  // Available properties to choose from
  properties: string[] = ['speed', 'temperature', 'pressure'];

  // Available operators
  operators: string[] = ['+', '-', '*', '/', '(', ')'];

  // Available functions
  functions: string[] = ['Avg()', 'Sum()'];

  // Reference to the textarea element
  private textarea: HTMLTextAreaElement | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Handle textarea input
   */
  onTextAreaInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.expression = target.value;
    this.updateHighlightedExpression();
  }

  /**
   * Insert text at current cursor position
   */
  private insertAtCursor(text: string) {
    const textArea = this.textarea;
    if (!textArea) return;

    const startPos = textArea.selectionStart;
    const endPos = textArea.selectionEnd;
    
    // Get the current content and update it
    const currentContent = textArea.value;
    const newContent = currentContent.substring(0, startPos) + 
                      text + 
                      currentContent.substring(endPos);
    
    // Update the expression
    this.expression = newContent;
    
    // Update the highlighted content
    this.updateHighlightedExpression();
    
    // Set cursor position after inserted text
    setTimeout(() => {
      if (textArea) {
        textArea.value = this.highlightedExpression;
        textArea.focus();
        textArea.setSelectionRange(startPos + text.length, startPos + text.length);
      }
    });
  }

  /**
   * Store reference to textarea on focus
   */
  onTextAreaFocus(event: FocusEvent) {
    this.textarea = event.target as HTMLTextAreaElement;
  }

  /**
   * Handle property selection
   */
  onPropertySelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedProperty = select.value;
    if (selectedProperty) {
      this.insertAtCursor(selectedProperty);
      select.value = ''; // Reset selection
    }
  }

  /**
   * Insert operator
   */
  insertOperator(operator: string) {
    this.insertAtCursor(operator);
  }

  /**
   * Insert function
   */
  insertFunction(func: string) {
    this.insertAtCursor(func);
  }

  /**
   * Update the highlighted expression
   */
  private updateHighlightedExpression() {
    let highlighted = this.expression;
    
    // Highlight properties
    this.properties.forEach(prop => {
      const regex = new RegExp(prop, 'g');
      highlighted = highlighted.replace(regex, `<span class="highlighted-property">${prop}</span>`);
    });

    this.highlightedExpression = highlighted;
  }
} 