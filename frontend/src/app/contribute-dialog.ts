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
      <div class="method-buttons">
        <button mat-button (click)="select('lightning')" [class.active]="selected === 'lightning'">
          \u26A1 Lightning
        </button>
        <button mat-button (click)="select('bitcoin')" [class.active]="selected === 'bitcoin'">
          \u20BF Bitcoin
        </button>
      </div>
      <img [src]="qrSrc" alt="wallet QR" />
      <p><code>{{ walletAddress }}</code></p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./contribute-dialog.css']
})
export class ContributeDialog implements OnInit {
  lightningAddress = 'LIGHTNING_ADDRESS';
  bitcoinAddress = 'BITCOIN_ADDRESS';
  qrLightning = '';
  qrBitcoin = '';
  walletAddress = '';
  qrSrc = '';
  selected: 'lightning' | 'bitcoin' = 'lightning';

  async ngOnInit() {
    this.qrLightning = await toDataURL(this.lightningAddress);
    this.qrBitcoin = await toDataURL(this.bitcoinAddress);
    this.select('lightning');
  }

  select(method: 'lightning' | 'bitcoin') {
    this.selected = method;
    if (method === 'lightning') {
      this.walletAddress = this.lightningAddress;
      this.qrSrc = this.qrLightning;
    } else {
      this.walletAddress = this.bitcoinAddress;
      this.qrSrc = this.qrBitcoin;
    }
  }
}
