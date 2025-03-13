import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExpressionEditorComponent } from './expression-editor/expression-editor.component';
import { SimpleExpressionEditorComponent } from './simple-expression-editor/simple-expression-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    ExpressionEditorComponent,
    SimpleExpressionEditorComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Expression Editor Demo';
}
