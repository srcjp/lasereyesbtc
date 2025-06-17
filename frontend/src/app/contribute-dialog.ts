import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contribute-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Contribute</h2>
    <mat-dialog-content>
      <p>Lightning: <code>lightning:example&#64;ln.example.com</code></p>
      <p>On-chain: <code>bc1qq0qscugm4444444example</code></p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
})
export class ContributeDialog {}