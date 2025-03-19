import { Directive, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Directive that provides a Quill editor with dynamic loading and two-way binding
 */
@Directive({
  selector: '[quillEditor]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => QuillEditorDirective),
    multi: true
  }]
})
export class QuillEditorDirective implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() modules: any = {}; 
  @Input() theme: string = 'snow';
  @Input() placeholder: string = '';
  /** Optional: custom toolbar container (CSS selector or HTMLElement) */
  @Input() customToolbar?: string | HTMLElement;
  
  @Output() textChange = new EventEmitter<{ html: string, delta: any, source: string }>();
  @Output() selectionChange = new EventEmitter<{ range: any, oldRange: any, source: string }>();
  
  private quill: any;
  private savedRange: any;  // stores last selection range (for inserting placeholders when blurred)
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private textChangeHandler!: (delta: any, oldDelta: any, source: string) => void;
  private selectionChangeHandler!: (range: any, oldRange: any, source: string) => void;
  private _initialContent: string | null = null;
  
  constructor(private el: ElementRef) {}
  
  ngOnInit(): void {
    // Function to initialize Quill once it's loaded
    const initializeQuill = (Quill: any) => {
      // Prepare modules configuration (merge in custom toolbar if provided)
      const modulesConfig = { ...this.modules };
      if (this.customToolbar) {
        modulesConfig.toolbar = this.customToolbar;
      } else if (!modulesConfig.toolbar) {
        // Use a default minimal toolbar if none provided
        modulesConfig.toolbar = [
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          ['clean']
        ];
      }
      // Initialize Quill editor on the host element
      this.quill = new Quill(this.el.nativeElement, {
        theme: this.theme,
        modules: modulesConfig,
        placeholder: this.placeholder
      });
      // Setup Quill event listeners
      this.textChangeHandler = (delta, oldDelta, source) => {
        const html = this.el.nativeElement.querySelector('.ql-editor').innerHTML;
        this.onChange(html);  // propagate change to form model
        this.textChange.emit({ html, delta, source });  // emit event with current HTML content
      };
      this.selectionChangeHandler = (range, oldRange, source) => {
        if (!range) {
          // Editor blurred
          this.onTouched();
        }
        this.selectionChange.emit({ range, oldRange, source });
        this.savedRange = range;
      };
      this.quill.on('text-change', this.textChangeHandler);
      this.quill.on('selection-change', this.selectionChangeHandler);
      // If an initial value was written before Quill was ready, apply it now
      if (this._initialContent !== null) {
        this.setContent(this._initialContent);
        this._initialContent = null;
      }
    };
    // Load Quill dynamically (to support lazy loading and reduce bundle size)
    const QuillGlobal = (window as any).Quill;
    if (QuillGlobal) {
      // Quill already loaded (e.g., via script or another instance)
      initializeQuill(QuillGlobal);
    } else {
      import('quill').then(mod => {
        const Quill = mod.default ? mod.default : mod;
        (window as any).Quill = Quill;  // optional: store globally for reuse
        initializeQuill(Quill);
      });
    }
  }
  
  /** Write value from outside (ControlValueAccessor) */
  writeValue(value: any): void {
    const content = value || '';
    if (!this.quill) {
      // Quill not initialized yet – save content to apply once ready
      this._initialContent = content;
    } else {
      this.setContent(content);
    }
  }
  
  /** Save the onChange callback (ControlValueAccessor) */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  /** Save the onTouched callback (ControlValueAccessor) */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  /** Allow Angular to disable/enable the editor */
  setDisabledState(isDisabled: boolean): void {
    if (this.quill) {
      this.quill.enable(!isDisabled);
    }
  }
  
  /** Insert a placeholder/property text at the current cursor position */
  insertProperty(text: string): void {
    if (!this.quill) return;
    const range = this.quill.getSelection() || this.savedRange;
    const index = range ? range.index : this.quill.getLength();
    // If a range is selected, replace it with the inserted text
    if (range && range.length) {
      this.quill.deleteText(index, range.length, 'user');
    }
    this.quill.insertText(index, text, 'user');
    this.quill.setSelection(index + text.length, 0, 'user');
  }
  
  /** Internal helper to set editor HTML content */
  private setContent(value: string): void {
    if (!this.quill) return;
    if (value) {
      // Use Quill clipboard to insert HTML content (with 'silent' to avoid triggering change event)
      this.quill.clipboard.dangerouslyPasteHTML(value, 'silent');
    } else {
      // Clear content
      this.quill.setText('', 'silent');
    }
  }
  
  ngOnDestroy(): void {
    if (this.quill) {
      // Remove event listeners to prevent memory leaks
      this.quill.off('text-change', this.textChangeHandler);
      this.quill.off('selection-change', this.selectionChangeHandler);
      // Note: Quill doesn't provide a destroy method. Removing the DOM element or letting Angular destroy it is usually sufficient.
    }
  }
} 