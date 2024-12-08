import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button2',
  standalone: true, // Define el componente como standalone
  imports: [CommonModule], // Importa el CommonModule si es necesario
  template: `<button class="button2">{{ label }}</button>`,
  styleUrls: ['./button2.component.css']
})
export class Button2Component {
  @Input() label: string = 'Botón'; // Texto por defecto del botón
}
