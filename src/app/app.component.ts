import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthCheckComponent } from './shared/components/auth-check/auth-check.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    SidebarComponent,
    AuthCheckComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MyAPP';
}
