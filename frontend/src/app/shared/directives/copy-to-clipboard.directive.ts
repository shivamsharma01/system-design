import { Directive, ElementRef, inject, input, output, signal } from '@angular/core';

/**
 * Copies the given text to the clipboard on click and emits `copied`. Falls
 * back to a hidden textarea + `execCommand` when the async Clipboard API is
 * unavailable (e.g. insecure contexts).
 */
@Directive({
  selector: '[appCopyToClipboard]',
  exportAs: 'appCopyToClipboard',
  host: {
    '(click)': 'copy()',
    '[attr.data-copied]': 'copied()',
  },
})
export class CopyToClipboardDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly appCopyToClipboard = input<string>('');
  readonly copied = signal(false);
  readonly copiedChange = output<boolean>();

  async copy(): Promise<void> {
    const text = this.appCopyToClipboard();
    if (!text) {
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        this.fallbackCopy(text);
      }
      this.flagCopied();
    } catch {
      this.fallbackCopy(text);
      this.flagCopied();
    }
  }

  private flagCopied(): void {
    this.copied.set(true);
    this.copiedChange.emit(true);
    setTimeout(() => {
      this.copied.set(false);
      this.copiedChange.emit(false);
    }, 2000);
  }

  private fallbackCopy(text: string): void {
    const doc = this.host.nativeElement.ownerDocument;
    const textarea = doc.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    doc.body.appendChild(textarea);
    textarea.select();
    try {
      doc.execCommand('copy');
    } finally {
      doc.body.removeChild(textarea);
    }
  }
}
