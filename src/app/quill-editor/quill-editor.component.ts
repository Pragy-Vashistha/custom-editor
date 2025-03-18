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
  styleUrls: ['./quill-editor.component.scss']
})
export class QuillEditorComponent implements AfterViewInit {
  properties: string[] = ['speed', 'temperature', 'pressure'];
  editorContent: string = '';
  selectedProperty: string = '';
  quillEditor: any;

  @ViewChild('propSelector') propSelector!: MatSelect;

  quillModules = {
    toolbar: {
      container: '#toolbar',
      handlers: {
        'operator-minus': () => this.insertOperator('-'),
        'operator-plus': () => this.insertOperator('+'),
        'operator-divide': () => this.insertOperator('/'),
        'function-avg': () => this.insertFunction('Avg'),
        'function-sum': () => this.insertFunction('Sum'),
        'function-scale': () => this.insertFunction('Scale')
      }
    },
    // readOnly: false, // Set as needed

    // Optional: You can still try Quill's keyboard bindings here,
    // but the 'text-change' listener below is the bulletproof method.
    keyboard: {
      bindings: {
        // Example partial: block a few keys inline.
        // This alone can be bypassed, so we *also* do text-change cleanup.
        'alpha': {
          key: null,
          handler: (range: any, context: any) => {
            const key = context.event.key;
            if (/[a-zA-Z]/.test(key)) {
              return false; // Block letters at the keyboard level
            }
            return true;    // Allow everything else
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

  onEditorCreated(editor: any) {
    this.quillEditor = editor;

    // -------------------------------------------
    // TEXT-CHANGE LISTENER: strip alphabets
    // -------------------------------------------
    this.quillEditor.on('text-change', (delta: any, oldDelta: any, source: string) => {
      if (source === 'user') {
        // 1) Get the current text
        const currentText = this.quillEditor.getText();

        // 2) Remove alphabets [a-z, A-Z]
        const sanitized = currentText.replace(/[a-zA-Z]+/g, '');

        // 3) If something changed, update the editor content
        if (sanitized !== currentText) {
          // Save current cursor position
          const selection = this.quillEditor.getSelection();

          // Replace *entire* text in Quill
          this.quillEditor.setText(sanitized);

          // Attempt to restore the cursor, adjusting if needed
          if (selection) {
            let newIndex = selection.index;
            if (newIndex > sanitized.length) {
              newIndex = sanitized.length;
            }
            this.quillEditor.setSelection(newIndex, 0);
          }
        }
      }
    });
  }

  insertProperty(property: string) {
    if (!this.quillEditor) return;
    const range = this.quillEditor.getSelection(true);
    const index = range ? range.index : this.quillEditor.getLength();

    // Insert property in red
    this.quillEditor.insertText(index, property, { color: 'red' });
    // Insert space in black
    this.quillEditor.insertText(index + property.length, ' ', { color: 'black' });
    // Move cursor
    this.quillEditor.setSelection(index + property.length + 1);
  }

  insertOperator(operator: string) {
    if (!this.quillEditor) return;
    const range = this.quillEditor.getSelection(true);
    const index = range ? range.index : this.quillEditor.getLength();
    this.quillEditor.insertText(index, ` ${operator} `, { color: 'black' });
    this.quillEditor.setSelection(index + 3);
  }

  insertFunction(func: string) {
    if (!this.quillEditor) return;
    const range = this.quillEditor.getSelection(true);
    if (!range) return;

    if (range.length > 0) {
      const contents = this.quillEditor.getContents(range.index, range.length);
      const propertyOps = contents.ops?.filter((op: any) =>
        op.attributes?.color === 'red' && op.insert?.trim()
      );

      if (propertyOps && propertyOps.length > 0) {
        this.quillEditor.deleteText(range.index, range.length);

        let currentIndex = range.index;
        this.quillEditor.insertText(currentIndex, `${func}(`, { color: 'black' });
        currentIndex += func.length + 1;

        propertyOps.forEach((op: any, idx: number) => {
          const text = op.insert.trim();
          this.quillEditor.insertText(currentIndex, text, { color: 'red' });
          currentIndex += text.length;
          if (idx < propertyOps.length - 1) {
            this.quillEditor.insertText(currentIndex, ', ', { color: 'black' });
            currentIndex += 2;
          }
        });

        this.quillEditor.insertText(currentIndex, ')', { color: 'black' });
        this.quillEditor.setSelection(currentIndex + 1);
      } else {
        this.quillEditor.insertText(range.index, `${func}()`, { color: 'black' });
        this.quillEditor.setSelection(range.index + func.length + 1);
      }
    } else {
      // Insert function with empty parentheses
      this.quillEditor.insertText(range.index, `${func}()`, { color: 'black' });
      this.quillEditor.setSelection(range.index + func.length + 1);
    }
  }

  clearEditor() {
    if (this.quillEditor) {
      this.quillEditor.setText('');
    }
    this.selectedProperty = '';
  }

  onSubmit() {
    if (this.quillEditor) {
      const plainText = this.quillEditor.getText();
      const htmlContent = this.quillEditor.root.innerHTML;
      console.log('Expression:', plainText);
      console.log('HTML:', htmlContent);
    }
  }
}
