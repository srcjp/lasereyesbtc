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
      <p>
        <code>{{ invoice.payment_request }}</code>
      </p>
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
  ws: WebSocket | null = null;
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
        const invData = (this.invoice as any).invoice || this.invoice;
        const hash =
          invData.payment_hash ||
          invData.r_hash ||
          invData.paymentHash ||
          invData.hash ||
          invData.id;
        if (hash) {
          this.checking = true;
          const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
          this.ws = new WebSocket(
            `${protocol}://${location.host}/api/invoice/${hash}/ws`
          );
          this.ws.onmessage = (ev) => {
            try {
              const data = JSON.parse(ev.data);
              const invoice = data.invoice || data;
              if (this.isPaid(invoice)) {
                const amount =
                  Number(invoice.amount) ||
                  Number(invoice.value) ||
                  Number(invoice.tokens) ||
                  Number(invoice.settle_amount) ||
                  Number(invoice.settled_amount) ||
                  (invoice.amt_paid_msat
                    ? Number(invoice.amt_paid_msat) / 1000
                    : NaN) ||
                  (invoice.msatoshi ? Number(invoice.msatoshi) / 1000 : NaN);
                if (isNaN(amount) || amount >= 150) {
                  this.ws?.close();
                  this.ref.close(true);
                } else {
                  this.error = 'Payment below required 150 sats';
                  this.ws?.close();
                }
              }
            } catch {}
          };
          this.ws.onerror = () => {
            this.error = 'Cannot check payment';
            this.ws?.close();
            this.checking = false;
          };
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

  private isPaid(data: any): boolean {
    const inv = data.invoice || data;
    return (
      inv.state === 'paid' ||
      inv.state === 'settled' ||
      inv.state === 'complete' ||
      inv.status === 'paid' ||
      inv.status === 'settled' ||
      inv.settled ||
      inv.paid ||
      inv.paid_at ||
      inv.settled_at
    );
  }

  ngOnDestroy() {
    this.ws?.close();
  }
}
