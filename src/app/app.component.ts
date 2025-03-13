import { Component } from '@angular/core';
import { ExpressionEditorComponent } from './expression-editor/expression-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ExpressionEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Expression Editor Demo';
}
