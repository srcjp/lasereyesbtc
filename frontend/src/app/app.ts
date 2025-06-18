import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LaserEditor } from './laser-editor/laser-editor';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContributeDialog } from './contribute-dialog';
import { PayDialog } from './pay-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    LaserEditor,
    MatDialogModule,
    ContributeDialog,
    PayDialog,
  ],
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