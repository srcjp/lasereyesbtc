import { Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';

interface Laser {
  id: number;
  class: string;
}

@Component({
  selector: 'app-laser-editor',
  imports: [CommonModule],
  templateUrl: './laser-editor.html',
  styleUrl: './laser-editor.css'
})
export class LaserEditor {
  imageSrc: string | null = null;
  lasers: Laser[] = [
    { id: 1, class: 'laser1' },
    { id: 2, class: 'laser2' },
    { id: 3, class: 'laser3' },
    { id: 4, class: 'laser4' },
    { id: 5, class: 'laser5' }
  ];
  placed: Laser[] = [];

  constructor(private host: ElementRef<HTMLElement>) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => (this.imageSrc = reader.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  onDragStart(event: DragEvent, laser: Laser) {
    event.dataTransfer?.setData('laser', JSON.stringify(laser));
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (this.placed.length >= 2) return;
    const data = event.dataTransfer?.getData('laser');
    if (data) {
      const laser = JSON.parse(data) as Laser;
      const container = this.host.nativeElement.querySelector('.image-container') as HTMLElement;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const div = document.createElement('div');
      div.className = `laser ${laser.class}`;
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
      container.appendChild(div);
      this.placed.push(laser);
    }
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  async download() {
    const container = this.host.nativeElement.querySelector(
      '.image-container'
    ) as HTMLElement;
    if (!container) return;
    const canvas = await html2canvas(container);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'laser-eyes.png';
    link.click();
  }
}
