import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LaserEditor } from './laser-editor/laser-editor';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LaserEditor],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'frontend';
}