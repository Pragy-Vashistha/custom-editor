import { Routes } from '@angular/router';
import { ExpressionEditorComponent } from './expression-editor/expression-editor.component';
import { SimpleExpressionEditorComponent } from './simple-expression-editor/simple-expression-editor.component';

export const routes: Routes = [
  { path: '', component: ExpressionEditorComponent },
  { path: 'simple', component: SimpleExpressionEditorComponent },
  { path: '**', redirectTo: '' }
]; 