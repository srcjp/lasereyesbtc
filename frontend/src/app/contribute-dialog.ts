import { Component, OnInit } from '@angular/core';
import { toDataURL } from 'qrcode';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contribute-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Contribute</h2>
    <mat-dialog-content>
      <img [src]="qrSrc" alt="wallet QR" />
      <p><code>{{ walletAddress }}</code></p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
})
export class ContributeDialog implements OnInit {
  walletAddress = 'YOUR_WALLET_ADDRESS';
  qrSrc = '';

  async ngOnInit() {
    this.qrSrc = await toDataURL(this.walletAddress);
  }
}
