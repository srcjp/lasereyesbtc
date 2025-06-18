import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contribute-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatInputModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Contribute</h2>
    <mat-dialog-content *ngIf="invoice">
      <img [src]="qrSrc" alt="invoice QR" />
      <p><code>{{ invoice.payment_request }}</code></p>
      <form>
        <mat-form-field appearance="fill">
          <mat-label>Nickname</mat-label>
          <input matInput [(ngModel)]="form.nickname" name="nickname" />
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Nostr link</mat-label>
          <input matInput [(ngModel)]="form.nostr" name="nostr" />
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Twitter link</mat-label>
          <input matInput [(ngModel)]="form.twitter" name="twitter" />
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Instagram link</mat-label>
          <input matInput [(ngModel)]="form.instagram" name="instagram" />
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Message</mat-label>
          <textarea matInput [(ngModel)]="form.message" name="message"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="send()">Send</button>
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
})
export class ContributeDialog implements OnInit {
  invoice: any = null;
  form = { nickname: '', nostr: '', twitter: '', instagram: '', message: '' };

  qrSrc = '';

  async ngOnInit() {
    try {
      const res = await fetch('/api/invoice', { method: 'POST' });
      if (res.ok) {
        this.invoice = await res.json();
        const pr = this.invoice.payment_request || this.invoice.pr;
        this.qrSrc =
          'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' +
          encodeURIComponent(pr);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async send() {
    try {
      await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: this.invoice?.invoice?.amount || 0,
          ...this.form,
          date: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error(err);
    }
  }
}
