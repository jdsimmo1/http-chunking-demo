import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  baseUrl = 'http://127.0.0.1:5000';
  chunks = 8;
  delayMs = 500;

  // signals for reactive state (Angular 16+)
  regularOutput = signal<string>('');
  chunkedOutput = signal<string>('');
  chunkedBytes = signal<number>(0);
  loadingRegular = false;
  loadingChunked = false;

  async callRegular() {
    this.loadingRegular = true;
    this.regularOutput.set('');
    try {
      const res = await fetch(`${this.baseUrl}/regular`);
      // simulate typical app behavior: parse JSON once complete
      const json = await res.json();
      this.regularOutput.set(JSON.stringify(json, null, 2));
    } catch (e:any) {
      this.regularOutput.set('Error: ' + (e?.message ?? e));
    } finally {
      this.loadingRegular = false;
    }
  }

  async callChunked(urlRequest: string) {
    this.loadingChunked = true;
    this.chunkedOutput.set('');
    this.chunkedBytes.set(0);
    try {
      const url = `${this.baseUrl}/${urlRequest}?chunks=${this.chunks}&delay_ms=${this.delayMs}` //`chunked?chunks=${this.chunks}&delay_ms=${this.delayMs}`;
      const res = await fetch(url);

      if (!res.body) {
        throw new Error('ReadableStream not supported in this environment');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let total = 0;

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const text = decoder.decode(value, { stream: true });
        total += value.byteLength;

        this.chunkedOutput.update(prev => prev + text);
        this.chunkedBytes.set(total);

        await new Promise(requestAnimationFrame);
      }
      // flush any remaining decoded text
      this.chunkedOutput.update(prev => prev + decoder.decode());
    } catch (e:any) {
      this.chunkedOutput.set('Error: ' + (e?.message ?? e));
    } finally {
      this.loadingChunked = false;
    }
  }

}
