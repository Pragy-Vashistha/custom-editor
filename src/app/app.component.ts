import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular Text Editor Examples';
  
  editors = [
    { path: '/', name: 'Original Editor', description: 'Original expression editor with property insertion' },
    { path: '/simple', name: 'Simple Editor', description: 'Simplified expression editor' },
    { path: '/form', name: 'Form Editor', description: 'Form-based expression editor' },
    { path: '/quill', name: 'Quill Editor', description: 'Rich text editor with Quill.js' },
    { path: '/quill-minimal', name: 'Minimal Quill', description: 'Minimal Quill editor with property insertion' }
  ];
}
