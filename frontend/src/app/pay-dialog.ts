import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-pay-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Pay 150 sats to download</h2>
    <mat-dialog-content *ngIf="invoice; else errTpl">
      <img [src]="qrSrc" alt="invoice QR" />
      <p><code>{{ invoice.payment_request }}</code></p>
      <p *ngIf="checking">Checking payment...</p>
      <p *ngIf="error" class="error">{{ error }}</p>
    </mat-dialog-content>
    <ng-template #errTpl>
      <p *ngIf="error" class="error">{{ error }}</p>
    </ng-template>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
    </mat-dialog-actions>
  `,
})
export class PayDialog implements OnInit, OnDestroy {
  invoice: any = null;
  qrSrc = '';
  checking = false;
  interval: any;
  error = '';

  constructor(private ref: MatDialogRef<PayDialog>) {}

  async ngOnInit() {
    try {
      const res = await fetch('/api/invoice', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // Some Coinos responses wrap the invoice in an `invoice` object
        this.invoice = data.invoice || data;
        const pr =
          this.invoice.payment_request ||
          this.invoice.pr ||
          this.invoice.bolt11;
        if (!pr) {
          this.error = 'Invalid invoice received';
          return;
        }
        this.qrSrc =
          'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' +
          encodeURIComponent(pr);
        const hash = this.invoice.payment_hash || this.invoice.r_hash;
        if (hash) {
          this.checking = true;
          this.interval = setInterval(() => this.poll(hash), 5000);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        this.error = data.error || 'Failed to create invoice';
      }
    } catch (err) {
      console.error(err);
      this.error = 'Failed to create invoice';
    }
  }

  async poll(hash: string) {
    try {
      const res = await fetch('/api/invoice/' + hash);
      if (res.ok) {
        const data = await res.json();
        if (data.state === 'paid' || data.settled || data.paid) {
          clearInterval(this.interval);
          this.ref.close(true);
        }
      }
    } catch {}
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
