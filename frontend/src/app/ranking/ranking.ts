import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Contributor {
  name: string;
  nostr: string;
  twitter: string;
  instagram: string;
  message: string;
  amount: number;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.css']
})
export class Ranking implements OnInit {
  contributors: Contributor[] = [];

  async ngOnInit() {
    try {
      const res = await fetch('/api/donations');
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      this.contributors = data.map((d: any) => ({
        name: d.nickname || d.twitter || d.nostr || d.instagram || 'anon',
        nostr: d.nostr,
        twitter: d.twitter,
        instagram: d.instagram,
        message: d.message,
        amount: d.amount
      }));
    } catch (err) {
      console.error(err);
    }
  }
}
