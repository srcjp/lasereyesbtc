import { Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { toPng } from 'html-to-image';

interface Laser {
  id: number;
  url: string;
}

@Component({
  selector: 'app-laser-editor',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './laser-editor.html',
  styleUrls: ['./laser-editor.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(pointerdown)': 'onRootPointerDown($event)',
    '(document:keydown)': 'onKeydown($event)'
  }
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
    {
      id: 5,
      url:
        'https://cdn.glitch.com/a3cb1903-3df2-470f-9076-c2370808ed39%2Fthumbnails%2F5a5a21cb6140c.png?1537075863176',
    },
    {
      id: 6,
      url:
        'https://cdn.glitch.com/a3cb1903-3df2-470f-9076-c2370808ed39%2Fthumbnails%2F59ed23c7b36f67806d66409d592ce78a.png?1537078242814',
    },
    {
      id: 7,
      url:
        'https://cdn.glitch.com/a3cb1903-3df2-470f-9076-c2370808ed39%2Fthumbnails%2F5bec82019edb11efd46eb56e25c55bc1.png?1537075744418',
    },
    {
      id: 8,
      url:
        'https://cdn.glitch.com/a3cb1903-3df2-470f-9076-c2370808ed39%2Fthumbnails%2F0a2c2f06ee2c7fa2f04082d131deaded.png?1537075863785',
    },
  ];
  selectedLaser: Laser = this.lasers[0];
  overlays: HTMLElement[] = [];
  dragOffsets: { x: number; y: number }[] = [];
  draggingIndex: number | null = null;
  selectedOverlayIndex: number | null = null;
  resizingIndex: number | null = null;
  resizeStart: { width: number; height: number; x: number; y: number } | null = null;

  constructor(private host: ElementRef<HTMLElement>) {}

  selectLaser(l: Laser) {
    this.selectedLaser = l;
    this.addOverlay(l);
  }

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
    if (this.lasers.length >= 2) {
      this.addOverlay(this.lasers[0], '40%', '50%');
      this.addOverlay(this.lasers[1], '60%', '50%');
    } else {
      for (let i = 0; i < 2; i++) {
        this.addOverlay();
      }
    }
  }

  addOverlay(
    laser: Laser = this.selectedLaser,
    left: string = '50%',
    top: string = '50%'
  ) {
    const container = this.host.nativeElement.querySelector('.image-container') as HTMLElement;
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'laser';
    div.style.backgroundImage = `url('${laser.url}')`;
    div.dataset['index'] = this.overlays.length.toString();
    div.style.left = left;
    div.style.top = top;
    if (left.includes('%') || top.includes('%')) {
      div.style.transform = 'translate(-50%, -50%)';
    }
    div.addEventListener('pointerdown', this.startDrag.bind(this));
    div.addEventListener('pointermove', this.onDrag.bind(this));
    div.addEventListener('pointerup', this.endDrag.bind(this));
    div.addEventListener('pointercancel', this.endDrag.bind(this));
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.addEventListener('pointerdown', this.startResize.bind(this));
    handle.addEventListener('pointermove', this.onResize.bind(this));
    handle.addEventListener('pointerup', this.endResize.bind(this));
    handle.addEventListener('pointercancel', this.endResize.bind(this));
    div.appendChild(handle);
    container.appendChild(div);
    this.overlays.push(div);
    this.dragOffsets.push({ x: 0, y: 0 });
    this.selectedOverlayIndex = this.overlays.length - 1;
    this.overlays.forEach((el, idx) => {
      if (idx === this.selectedOverlayIndex) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  }

  startDrag(event: PointerEvent) {
    if ((event.target as HTMLElement).classList.contains('resize-handle')) return;
    const target = event.currentTarget as HTMLElement;
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

  startResize(event: PointerEvent) {
    const handle = event.target as HTMLElement;
    const parent = handle.parentElement as HTMLElement;
    const index = parseInt(parent.dataset['index'] || '0', 10);
    this.resizingIndex = index;
    this.selectedOverlayIndex = index;
    const rect = parent.getBoundingClientRect();
    this.resizeStart = {
      width: rect.width,
      height: rect.height,
      x: event.clientX,
      y: event.clientY,
    };
    handle.setPointerCapture(event.pointerId);
    event.stopPropagation();
  }

  onResize(event: PointerEvent) {
    if (this.resizingIndex === null || !this.resizeStart) return;
    const overlay = this.overlays[this.resizingIndex];
    const dx = event.clientX - this.resizeStart.x;
    const dy = event.clientY - this.resizeStart.y;
    overlay.style.width = `${this.resizeStart.width + dx}px`;
    overlay.style.height = `${this.resizeStart.height + dy}px`;
  }

  endResize(event: PointerEvent) {
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    this.resizingIndex = null;
    this.resizeStart = null;
    event.stopPropagation();
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

  clearSelection() {
    this.selectedOverlayIndex = null;
    this.overlays.forEach(el => el.classList.remove('selected'));
  }

  onRootPointerDown(event: PointerEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.image-container') && !target.closest('.laser')) {
      this.clearSelection();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      this.deleteSelected();
    }
  }

  async download() {
    const container = this.host.nativeElement.querySelector(
      '.image-container'
    ) as HTMLElement;
    if (!container) return;
    try {
      const selected = Array.from(container.querySelectorAll('.laser.selected')) as HTMLElement[];
      selected.forEach(el => el.classList.remove('selected'));
      const dataUrl = await toPng(container, { cacheBust: true, backgroundColor: undefined });
      selected.forEach(el => el.classList.add('selected'));
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'laser-eyes.png';
      link.click();
    } catch (err) {
      console.error(err);
    }
  }
}
