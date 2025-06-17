import { Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toPng } from 'html-to-image';

interface Laser {
  id: number;
  url: string;
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
  lasers: Laser[] = [
    {
      id: 1,
      url:
        'https://cdn.glitch.me/a3cb1903-3df2-470f-9076-c2370808ed39%2Fthumbnails%2Fglowing-red-eyes-png-4%20(1).png',
    },
    {
      id: 2,
      url:
        'https://cdn.glitch.me/a3cb1903-3df2-470f-9076-c2370808ed39%2Fthumbnails%2F879aa4d0246af1cc47f99a8c32d81773.png',
    },
    {
      id: 3,
      url:
        'https://cdn.glitch.me/a3cb1903-3df2-470f-9076-c2370808ed39%2Fthumbnails%2F8f06a8ef61738998e73cf4d404e254d2.png',
    },
    {
      id: 4,
      url:
        'https://cdn.glitch.me/a3cb1903-3df2-470f-9076-c2370808ed39%2Fthumbnails%2F041df0e054b8758c3bf248fdded66cb5.png',
    },
  ];
  selectedLaser: Laser = this.lasers[0];
  overlays: HTMLElement[] = [];
  dragOffsets: { x: number; y: number }[] = [];
  draggingIndex: number | null = null;
  selectedOverlayIndex: number | null = null;

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
    if (this.overlays.length) return;
    for (let i = 0; i < 2; i++) {
      this.addOverlay();
    }
  }

  addOverlay(laser: Laser = this.selectedLaser) {
    const container = this.host.nativeElement.querySelector('.image-container') as HTMLElement;
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'laser';
    div.style.backgroundImage = `url('${laser.url}')`;
    div.dataset['index'] = this.overlays.length.toString();
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

  startDrag(event: PointerEvent) {
    const target = event.target as HTMLElement;
    const index = parseInt(target.dataset['index'] || '0', 10);
    this.draggingIndex = index;
    this.selectedOverlayIndex = index;
    this.overlays.forEach((el, i) => {
      if (i === index) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
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

  scaleSelected(factor: number) {
    if (this.selectedOverlayIndex === null) return;
    const overlay = this.overlays[this.selectedOverlayIndex];
    const width = overlay.offsetWidth * factor;
    const height = overlay.offsetHeight * factor;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
  }

  deleteSelected() {
    if (this.selectedOverlayIndex === null) return;
    const overlay = this.overlays[this.selectedOverlayIndex];
    overlay.remove();
    this.overlays.splice(this.selectedOverlayIndex, 1);
    this.dragOffsets.splice(this.selectedOverlayIndex, 1);
    this.overlays.forEach((el, idx) => (el.dataset['index'] = idx.toString()));
    this.selectedOverlayIndex = null;
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
