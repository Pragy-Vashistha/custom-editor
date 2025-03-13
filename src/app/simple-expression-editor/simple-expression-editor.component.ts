import { Component, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('editor') editorRef!: ElementRef;

  // The main expression input
  expression: string = '';
  
  // Highlighted expression for display
  highlightedExpression: SafeHtml = '';

  // Available properties to choose from
  properties: string[] = ['speed', 'temperature', 'pressure'];

  // Available operators
  operators: string[] = ['+', '-', '*', '/', '(', ')'];

  // Available functions
  functions: string[] = ['Avg()', 'Sum()'];

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Handle content changes in the editable div
   */
  onContentChange(event: Event) {
    const div = event.target as HTMLDivElement;
    // Get text content without HTML
    this.expression = div.textContent || '';
    this.updateHighlightedExpression();
  }

  /**
   * Store reference on focus
   */
  onEditorFocus(event: FocusEvent) {
    // Not needed anymore as we use ViewChild
  }

  /**
   * Insert text at current cursor position
   */
  private insertAtCursor(text: string) {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (!selection || !range) return;

    // Create text node
    const textNode = document.createTextNode(text);
    
    // Insert the text
    range.deleteContents();
    range.insertNode(textNode);
    
    // Move cursor after inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Update expression
    this.expression = this.editorRef.nativeElement.textContent || '';
    this.updateHighlightedExpression();
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

    this.highlightedExpression = this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
} 