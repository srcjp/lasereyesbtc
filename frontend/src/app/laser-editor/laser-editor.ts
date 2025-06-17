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
  laser: Laser = { id: 1, class: 'eye-glow' };
  overlay?: HTMLElement;
  dragOffsetX = 0;
  dragOffsetY = 0;
  dragging = false;

  constructor(private host: ElementRef<HTMLElement>) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => (this.imageSrc = reader.result as string);
      reader.readAsDataURL(input.files[0]);
    }
  }

  onImageLoaded() {
    const container = this.host.nativeElement.querySelector('.image-container') as HTMLElement;
    if (!container || this.overlay) return;
    const div = document.createElement('div');
    div.className = `laser ${this.laser.class}`;
    div.style.left = '50%';
    div.style.top = '50%';
    div.style.transform = 'translate(-50%, -50%)';
    div.addEventListener('pointerdown', this.startDrag.bind(this));
    div.addEventListener('pointermove', this.onDrag.bind(this));
    div.addEventListener('pointerup', this.endDrag.bind(this));
    div.addEventListener('pointercancel', this.endDrag.bind(this));
    container.appendChild(div);
    this.overlay = div;
  }

  startDrag(event: PointerEvent) {
    this.dragging = true;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onDrag(event: PointerEvent) {
    if (!this.dragging || !this.overlay) return;
    const container = this.host.nativeElement.querySelector('.image-container') as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left - this.dragOffsetX;
    const y = event.clientY - rect.top - this.dragOffsetY;
    this.overlay.style.left = `${x}px`;
    this.overlay.style.top = `${y}px`;
    this.overlay.style.transform = '';
  }

  endDrag(event: PointerEvent) {
    this.dragging = false;
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
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
