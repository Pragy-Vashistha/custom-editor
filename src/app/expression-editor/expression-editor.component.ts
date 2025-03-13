import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ViewEncapsulation,
  Inject,
  PLATFORM_ID,
  NgZone
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Token } from '../models/token.model';

@Component({
  selector: 'app-expression-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expression-editor.component.html',
  styleUrls: ['./expression-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExpressionEditorComponent implements AfterViewInit {
  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;

  // Predefined properties
  properties: string[] = ['speed', 'temperature', 'pressure'];

  // Operators to choose from
  operators: string[] = ['+', '-', '*', '/', '(', ')'];

  // Additional "function"-style tokens if needed
  functions: string[] = ['avg()', 'sum()', 'scale()'];

  selectedProperty: string | null = null;
  private currentExpression: string = '';

  // Track selected tokens
  selectedTokens: Set<HTMLElement> = new Set();

  // Track total tokens
  private _totalTokens: number = 0;
  get totalTokens(): number {
    return this._totalTokens;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    // Only run browser-specific code if we're in a browser
    if (isPlatformBrowser(this.platformId)) {
      // Initialize the expression value
      this.updateRawExpression();

      // Add clipboard event handlers
      this.editorRef.nativeElement.addEventListener('copy', this.handleCopy.bind(this));
      this.editorRef.nativeElement.addEventListener('cut', this.handleCut.bind(this));
      this.editorRef.nativeElement.addEventListener('paste', this.handlePaste.bind(this));

      // Add click handler to clear selections when clicking editor background
      this.editorRef.nativeElement.addEventListener('click', (e: MouseEvent) => {
        if (e.target === this.editorRef.nativeElement) {
          this.clearAllSelections();
        }
      });
    }
  }

  /**
   * Insert a property token at the current cursor position.
   */
  addProperty(): void {
    if (this.selectedProperty) {
      this.insertToken({
        type: 'property',
        value: this.selectedProperty
      });
      this.selectedProperty = null;
      this.updateRawExpression();
    }
  }

  /**
   * Insert an operator token at the cursor.
   */
  addOperator(operator: string): void {
    this.insertToken({
      type: 'operator',
      value: operator
    });
    this.updateRawExpression();
  }

  /**
   * Insert a function token at the cursor.
   */
  addFunction(funcName: string): void {
    this.insertToken({
      type: 'function',
      value: funcName
    });
    this.updateRawExpression();
  }

  /**
   * Helper to insert a read-only token <span> into the contenteditable div.
   */
  private insertToken(token: Token): void {
    if (!this.editorRef?.nativeElement) return;

    const editorEl = this.editorRef.nativeElement;

    // Check if we're inserting inside a function content area
    const selection = window.getSelection();
    const isInsideFunctionContent = selection && this.isSelectionInsideFunctionContent(selection);

    // Create the outer span for the token
    const tokenSpan = document.createElement('span');
    tokenSpan.classList.add('token');
    tokenSpan.setAttribute('contenteditable', 'false');

    // Add click handler for selection
    tokenSpan.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      this.handleTokenClick(tokenSpan, e.ctrlKey || e.metaKey);
    });

    // Add type-based styling
    if (token.type === 'property') {
      tokenSpan.classList.add('property-token');
      tokenSpan.innerText = token.value;
    } else if (token.type === 'operator') {
      tokenSpan.classList.add('operator-token');
      tokenSpan.innerText = token.value;
    } else if (token.type === 'function') {
      tokenSpan.classList.add('function-token');
      
      // Create function name part
      const funcNameSpan = document.createElement('span');
      funcNameSpan.classList.add('function-name');
      funcNameSpan.innerText = token.value.split('(')[0]; // Get function name without parentheses
      
      // Create opening parenthesis
      const openBracket = document.createElement('span');
      openBracket.classList.add('function-bracket');
      openBracket.innerText = '(';
      
      // Create editable content area
      const contentSpan = document.createElement('span');
      contentSpan.classList.add('function-content');
      contentSpan.setAttribute('contenteditable', 'true');
      
      // Create closing parenthesis
      const closeBracket = document.createElement('span');
      closeBracket.classList.add('function-bracket');
      closeBracket.innerText = ')';
      
      // Add all parts to the token
      tokenSpan.appendChild(funcNameSpan);
      tokenSpan.appendChild(openBracket);
      tokenSpan.appendChild(contentSpan);
      tokenSpan.appendChild(closeBracket);

      // Listen for changes in the function content
      contentSpan.addEventListener('input', () => {
        this.updateRawExpression();
      });
    }

    // We store the "value" in a data attribute for easy retrieval
    tokenSpan.setAttribute('data-value', token.value);

    // Only add delete button for top-level tokens (not inside function content)
    if (!isInsideFunctionContent && (token.type === 'property' || token.type === 'function')) {
      const deleteBtn = document.createElement('span');
      deleteBtn.innerText = ' ×';
      deleteBtn.classList.add('delete-icon');

      // Stop clicks from blurring the contenteditable selection
      deleteBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });

      // On click, remove the entire token span and update expression
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tokenSpan.remove();
        this.updateRawExpression();
        this.updateTotalTokens();
      });

      tokenSpan.appendChild(deleteBtn);
    }

    // Insert the token at the current cursor position
    this.insertNodeAtCursor(tokenSpan, editorEl);

    // Move cursor after the inserted token
    this.placeCursorAfterNode(tokenSpan);

    // Update total tokens count
    this.updateTotalTokens();
  }

  /**
   * Check if the current selection is inside a function content area
   */
  private isSelectionInsideFunctionContent(selection: Selection): boolean {
    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;

    while (node && node !== this.editorRef?.nativeElement) {
      if (node instanceof HTMLElement && node.classList.contains('function-content')) {
        return true;
      }
      node = node.parentNode;
    }

    return false;
  }

  /**
   * Insert a given node at the current caret/selection in a contenteditable element.
   * Falls back to appending at the end if no selection or selection is outside the editor.
   */
  private insertNodeAtCursor(node: Node, editorElement: HTMLElement): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // If there's no valid selection, just append
      editorElement.appendChild(node);
      return;
    }

    // Check if selection is inside our editor
    const range = selection.getRangeAt(0);
    let container: Node | null = range.commonAncestorContainer;
    let isInEditor = false;
    while (container) {
      if (container === editorElement) {
        isInEditor = true;
        break;
      }
      container = container.parentNode;
    }

    if (!isInEditor) {
      // If the selection isn't in the editor, just append
      editorElement.appendChild(node);
      return;
    }

    // Insert node at current cursor
    range.deleteContents(); // remove any highlighted content
    range.insertNode(node);
  }

  /**
   * Helper to place the caret immediately after a given DOM node.
   */
  private placeCursorAfterNode(node: Node): void {
    const selection = window.getSelection();
    if (!selection) { return; }

    const range = document.createRange();
    range.setStartAfter(node);
    range.setEndAfter(node);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Updates the current expression by parsing the editor content
   */
  updateRawExpression(): void {
    if (!this.editorRef?.nativeElement) {
      this.currentExpression = '';
      return;
    }

    const editorEl = this.editorRef.nativeElement;
    let expression = '';

    editorEl.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        // Plain text the user typed
        expression += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        if (element.classList.contains('token')) {
          if (element.classList.contains('function-token')) {
            // For function tokens, combine name, brackets, and content
            const funcName = element.querySelector('.function-name')?.textContent || '';
            const content = element.querySelector('.function-content')?.textContent || '';
            expression += `${funcName}(${content})`;
          } else {
            // For other tokens, use the data-value
            const val = element.getAttribute('data-value') || '';
            expression += val;
          }
        } else {
          // Possibly a <br> or something else
          expression += element.textContent;
        }
      }
    });

    this.currentExpression = expression.trim();
  }

  /**
   * Returns the current expression string
   */
  getRawExpression(): string {
    return this.currentExpression;
  }

  /**
   * Handle token selection
   */
  private handleTokenClick(token: HTMLElement, isMultiSelect: boolean): void {
    if (!isMultiSelect) {
      // Clear other selections if not multi-selecting
      this.clearAllSelections();
    }

    // Toggle selection on clicked token
    if (token.classList.contains('selected')) {
      token.classList.remove('selected');
      this.selectedTokens.delete(token);
    } else {
      token.classList.add('selected');
      this.selectedTokens.add(token);
    }
  }

  /**
   * Clear all token selections
   */
  private clearAllSelections(): void {
    this.selectedTokens.forEach(token => {
      token.classList.remove('selected');
    });
    this.selectedTokens.clear();
  }

  /**
   * Get information about selected tokens for display
   */
  getSelectedTokensInfo(): Array<{ type: string; value: string }> {
    return Array.from(this.selectedTokens).map(token => {
      let type = '';
      if (token.classList.contains('property-token')) type = 'property';
      else if (token.classList.contains('function-token')) type = 'function';
      else if (token.classList.contains('operator-token')) type = 'operator';

      return {
        type,
        value: token.getAttribute('data-value') || token.textContent || ''
      };
    });
  }

  /**
   * Update total token count
   */
  private updateTotalTokens(): void {
    if (!this.editorRef?.nativeElement) {
      this._totalTokens = 0;
      return;
    }
    this._totalTokens = this.editorRef.nativeElement.querySelectorAll('.token').length;
  }

  /**
   * Handle copy event
   */
  private handleCopy(e: ClipboardEvent): void {
    // If we have selected tokens, handle the copy ourselves
    if (this.selectedTokens.size > 0) {
      e.preventDefault();
      const clipboardData = this.buildClipboardData();
      e.clipboardData?.setData('text/plain', clipboardData.text);
      e.clipboardData?.setData('text/html', clipboardData.html);
    }
  }

  /**
   * Handle cut event
   */
  private handleCut(e: ClipboardEvent): void {
    // If we have selected tokens, handle the cut ourselves
    if (this.selectedTokens.size > 0) {
      e.preventDefault();
      const clipboardData = this.buildClipboardData();
      e.clipboardData?.setData('text/plain', clipboardData.text);
      e.clipboardData?.setData('text/html', clipboardData.html);
      this.removeSelectedTokens();
    }
  }

  /**
   * Build clipboard data from selected tokens
   */
  private buildClipboardData(): { text: string; html: string } {
    let text = '';
    let html = '';

    // Get the native text selection first
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      text += selection.toString();
      const range = selection.getRangeAt(0);
      const div = document.createElement('div');
      div.appendChild(range.cloneContents());
      html += div.innerHTML;
    }

    // Then add selected tokens
    this.selectedTokens.forEach(token => {
      // For plain text
      const tokenText = this.getTokenText(token);
      text += (text ? ' ' : '') + tokenText;

      // For HTML
      html += (html ? ' ' : '') + token.outerHTML;
    });

    return { text, html };
  }

  /**
   * Get text representation of a token
   */
  private getTokenText(token: HTMLElement): string {
    if (token.classList.contains('function-token')) {
      const name = token.querySelector('.function-name')?.textContent || '';
      const content = token.querySelector('.function-content')?.textContent || '';
      return `${name}(${content})`;
    }
    return token.getAttribute('data-value') || token.textContent || '';
  }

  /**
   * Remove selected tokens from the editor
   */
  private removeSelectedTokens(): void {
    this.selectedTokens.forEach(token => {
      token.remove();
    });
    this.clearAllSelections();
    this.updateRawExpression();
    this.updateTotalTokens();
  }

  /**
   * Handle paste event
   */
  private handlePaste(e: ClipboardEvent): void {
    e.preventDefault();

    // Get clipboard content
    const text = e.clipboardData?.getData('text/plain') || '';
    const html = e.clipboardData?.getData('text/html') || '';

    // If we have HTML content that looks like our tokens, use that
    if (html && html.includes('token')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Process tokens before inserting
      const tokens = tempDiv.querySelectorAll('.token');
      tokens.forEach(token => {
        const tokenEl = token as HTMLElement;
        tokenEl.classList.remove('selected');
        
        // Add click handler for selection
        tokenEl.addEventListener('click', (e: MouseEvent) => {
          e.stopPropagation();
          this.handleTokenClick(tokenEl, e.ctrlKey || e.metaKey);
        });

        // If it's a function token, add input listener to content
        if (tokenEl.classList.contains('function-token')) {
          const content = tokenEl.querySelector('.function-content');
          if (content) {
            content.addEventListener('input', () => {
              this.updateRawExpression();
            });
          }
        }

        // Add delete button functionality
        const deleteBtn = tokenEl.querySelector('.delete-icon');
        if (deleteBtn) {
          deleteBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
          });

          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tokenEl.remove();
            this.updateRawExpression();
            this.updateTotalTokens();
          });
        }
      });

      // Insert at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Insert each child node individually
        while (tempDiv.firstChild) {
          range.insertNode(tempDiv.firstChild);
        }

        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      // Just insert plain text
      document.execCommand('insertText', false, text);
    }

    this.updateRawExpression();
    this.updateTotalTokens();
  }
} 