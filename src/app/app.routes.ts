import { Routes } from '@angular/router';
import { ExpressionEditorComponent } from './expression-editor/expression-editor.component';
import { SimpleExpressionEditorComponent } from './simple-expression-editor/simple-expression-editor.component';
import { FormEditorComponent } from './form-editor/form-editor.component';
// import { QuillEditorComponent } from './quill-editor/quill-editor.component';
import { DerivedPropertyFormComponent } from './quill-editor-2/derived-property-form.component';

export const routes: Routes = [
  { path: '', component: ExpressionEditorComponent },
  { path: 'simple', component: SimpleExpressionEditorComponent },
  { path: 'form', component: FormEditorComponent },
  // { path: 'quill', component: QuillEditorComponent },
  { path: 'quill', component: DerivedPropertyFormComponent }, // Redirect to our minimal implementation
  { path: 'quill-minimal', component: DerivedPropertyFormComponent },
  { path: '**', redirectTo: '' }
]; 