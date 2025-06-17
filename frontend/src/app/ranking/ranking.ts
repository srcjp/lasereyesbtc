import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Contributor {
  name: string;
  nostr: string;
  twitter: string;
  instagram: string;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.css']
})
export class Ranking {
  contributors: Contributor[] = [
    { name: 'Contributor 1', nostr: '#', twitter: '#', instagram: '#' },
    { name: 'Contributor 2', nostr: '#', twitter: '#', instagram: '#' },
    { name: 'Contributor 3', nostr: '#', twitter: '#', instagram: '#' },
    { name: 'Contributor 4', nostr: '#', twitter: '#', instagram: '#' },
    { name: 'Contributor 5', nostr: '#', twitter: '#', instagram: '#' },
    { name: 'Contributor 6', nostr: '#', twitter: '#', instagram: '#' },
    { name: 'Contributor 7', nostr: '#', twitter: '#', instagram: '#' },
    { name: 'Contributor 8', nostr: '#', twitter: '#', instagram: '#' },
    { name: 'Contributor 9', nostr: '#', twitter: '#', instagram: '#' },
    { name: 'Contributor 10', nostr: '#', twitter: '#', instagram: '#' }
  ];
}
