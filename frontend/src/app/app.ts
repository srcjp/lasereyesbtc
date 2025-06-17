import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LaserEditor } from './laser-editor/laser-editor';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContributeDialog } from './contribute-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LaserEditor, MatDialogModule, ContributeDialog],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'frontend';

  constructor(private dialog: MatDialog) {}

  openContribute() {
    this.dialog.open(ContributeDialog);
  }
}