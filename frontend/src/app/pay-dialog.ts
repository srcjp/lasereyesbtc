import { Component, OnInit, OnDestroy } from '@angular/core';
import { toDataURL } from 'qrcode';
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
          this.invoice.bolt11 ||
          this.invoice.payreq ||
          this.invoice.paymentRequest ||
          this.invoice.request ||
          this.invoice.text;
        if (!pr) {
          this.error =
            this.invoice.message ||
            this.invoice.error ||
            'Invalid invoice received';
          return;
        }
        this.qrSrc = await toDataURL(pr);
        const hash =
          this.invoice.payment_hash ||
          this.invoice.r_hash ||
          this.invoice.paymentHash ||
          this.invoice.hash ||
          this.invoice.id;
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
        if (
          data.state === 'paid' ||
          data.state === 'settled' ||
          data.state === 'complete' ||
          data.status === 'paid' ||
          data.status === 'settled' ||
          data.settled ||
          data.paid ||
          data.paid_at ||
          data.settled_at
        ) {
          const amount =
            Number(data.amount) ||
            Number(data.value) ||
            Number(data.tokens) ||
            Number(data.settle_amount) ||
            Number(data.settled_amount) ||
            (data.amt_paid_msat ? Number(data.amt_paid_msat) / 1000 : NaN) ||
            (data.msatoshi ? Number(data.msatoshi) / 1000 : NaN);
          if (isNaN(amount) || amount >= 150) {
            clearInterval(this.interval);
            this.ref.close(true);
          } else {
            this.error = 'Payment below required 150 sats';
            clearInterval(this.interval);
          }
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
