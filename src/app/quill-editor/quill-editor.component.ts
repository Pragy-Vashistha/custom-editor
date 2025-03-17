import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelect } from '@angular/material/select';
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
    MatButtonModule,
    MatCardModule,
    QuillModule
  ],
  templateUrl: './quill-editor.component.html',
  styleUrl: './quill-editor.component.scss'
})
export class QuillEditorComponent implements AfterViewInit {
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

  // Quill editor configuration with custom toolbar and keyboard bindings
  quillModules = {
    toolbar: {
      container: '#toolbar',  // Point to the toolbar container
      handlers: {
        'operator-minus': () => this.insertOperator('-'),
        'operator-plus': () => this.insertOperator('+'),
        'operator-divide': () => this.insertOperator('/'),
        'function-avg': () => this.insertFunction('Avg'),
        'function-sum': () => this.insertFunction('Sum'),
        'function-scale': () => this.insertFunction('Scale')
      }
    },
    keyboard: {
      bindings: {
        'restrict-input': {
          key: null,
          handler: (range: any, context: any) => {
            const key = context.event.key;
            if (/[a-zA-Z]/.test(key)) return false;
            if (/[0-9]/.test(key) || ['-', '+', '/'].includes(key)) return true;
            return false;
          }
        }
      }
    }
  };

  ngAfterViewInit() {
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

  /** Called when the Quill editor is created */
  onEditorCreated(editor: any) {
    this.quillEditor = editor;
  }

  /** Insert a property with highlighting and proper cursor placement */
  insertProperty(property: string) {
    if (!this.quillEditor) return;

    const range = this.quillEditor.getSelection(true);
    const index = range ? range.index : this.quillEditor.getLength();

    this.quillEditor.insertText(index, property, 'color', 'red');
    const range1 = this.quillEditor.getSelection();
    const index1 = range1 ? range1.index : this.quillEditor.getLength();
    this.quillEditor.insertText(index1, ' ', 'color', 'black');
  }

  /** Insert an operator at the cursor position */
  insertOperator(operator: string) {
    if (!this.quillEditor) return;

    const range = this.quillEditor.getSelection(true);
    const index = range ? range.index : this.quillEditor.getLength();

    this.quillEditor.insertText(index, ` ${operator} `);
    this.quillEditor.setSelection(index + 3);
  }

  /** Insert a function, wrapping selected text if present */
  insertFunction(func: string) {
    if (!this.quillEditor) return;

    const range = this.quillEditor.getSelection(true);
    if (!range) return;

    if (range.length > 0) {
      const contents = this.quillEditor.getContents(range.index, range.length);
      
      // Filter out only the property ops (red text)
      const propertyOps = contents.ops?.filter((op: { attributes?: { color: string }, insert?: string }) => 
        op.attributes?.color === 'red' && op.insert?.trim()
      );

      // If we have properties, handle them specially
      if (propertyOps && propertyOps.length > 0) {
        this.quillEditor.deleteText(range.index, range.length);
        
        // Insert function name and opening parenthesis
        let currentIndex = range.index;
        this.quillEditor.insertText(currentIndex, `${func}(`, 'color', 'black');
        currentIndex += func.length + 1;

        // Insert properties with commas
        propertyOps.forEach((op: { attributes?: { color: string }, insert?: string }, index: number) => {
          if (op.insert) {
            // Insert the property in red
            this.quillEditor.insertText(currentIndex, op.insert.trim(), 'color', 'red');
            currentIndex += op.insert.trim().length;

            // Add comma and space if it's not the last property
            if (index < propertyOps.length - 1) {
              this.quillEditor.insertText(currentIndex, ', ', 'color', 'black');
              currentIndex += 2;
            }
          }
        });

        // Close the function
        this.quillEditor.insertText(currentIndex, ')', 'color', 'black');
        this.quillEditor.setSelection(currentIndex + 1);
      } else {
        // No properties found, just wrap the selection
        this.quillEditor.insertText(range.index, `${func}()`, 'color', 'black');
        this.quillEditor.setSelection(range.index + func.length + 1);
      }
    } else {
      // No selection, insert empty function
      this.quillEditor.insertText(range.index, `${func}()`, 'color', 'black');
      this.quillEditor.setSelection(range.index + func.length + 1);
    }
  }

  /** Clear the editor content */
  clearEditor() {
    if (this.quillEditor) {
      this.quillEditor.setText('');
    }
    this.selectedProperty = '';
  }

  /** Submit handler */
  onSubmit() {
    if (this.quillEditor) {
      const plainText = this.quillEditor.getText();
      const htmlContent = this.quillEditor.root.innerHTML;
      console.log('Expression:', plainText);
      console.log('HTML:', htmlContent);
    }
  }
}
