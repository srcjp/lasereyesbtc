import { Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toPng } from 'html-to-image';

interface Laser {
  id: number;
  class: string;
}

@Component({
  selector: 'app-laser-editor',
  imports: [CommonModule],
  templateUrl: './laser-editor.html',
  styleUrls: ['./laser-editor.css'],
  encapsulation: ViewEncapsulation.None
})
export class LaserEditor {
  imageSrc: string | null = null;
  laser: Laser = { id: 1, class: 'eye-glow' };
  overlays: HTMLElement[] = [];
  dragOffsets: { x: number; y: number }[] = [];
  draggingIndex: number | null = null;

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
    if (!container || this.overlays.length) return;

    for (let i = 0; i < 2; i++) {
      const div = document.createElement('div');
      div.className = `laser ${this.laser.class}`;
      div.dataset['index'] = i.toString();
      div.style.left = '50%';
      div.style.top = '50%';
      div.style.transform = 'translate(-50%, -50%)';
      div.addEventListener('pointerdown', this.startDrag.bind(this));
      div.addEventListener('pointermove', this.onDrag.bind(this));
      div.addEventListener('pointerup', this.endDrag.bind(this));
      div.addEventListener('pointercancel', this.endDrag.bind(this));
      container.appendChild(div);
      this.overlays.push(div);
      this.dragOffsets.push({ x: 0, y: 0 });
    }
  }

  startDrag(event: PointerEvent) {
    const target = event.target as HTMLElement;
    const index = parseInt(target.dataset['index'] || '0', 10);
    this.draggingIndex = index;
    const rect = target.getBoundingClientRect();
    this.dragOffsets[index] = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    target.setPointerCapture(event.pointerId);
  }

  onDrag(event: PointerEvent) {
    if (this.draggingIndex === null) return;
    const overlay = this.overlays[this.draggingIndex];
    if (!overlay) return;
    const container = this.host.nativeElement.querySelector('.image-container') as HTMLElement;
    const rect = container.getBoundingClientRect();
    const offset = this.dragOffsets[this.draggingIndex];
    const x = event.clientX - rect.left - offset.x;
    const y = event.clientY - rect.top - offset.y;
    overlay.style.left = `${x}px`;
    overlay.style.top = `${y}px`;
    overlay.style.transform = '';
  }

  endDrag(event: PointerEvent) {
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    this.draggingIndex = null;
  }

  async download() {
    const container = this.host.nativeElement.querySelector(
      '.image-container'
    ) as HTMLElement;
    if (!container) return;
    try {
      const dataUrl = await toPng(container, { cacheBust: true, backgroundColor: undefined });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'laser-eyes.png';
      link.click();
    } catch (err) {
      console.error(err);
    }
  }
}
