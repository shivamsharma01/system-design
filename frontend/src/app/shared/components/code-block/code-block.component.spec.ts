import { TestBed } from '@angular/core/testing';
import { CodeBlockComponent } from './code-block.component';

describe('CodeBlockComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CodeBlockComponent] });
  });

  it('renders one row per line of code', async () => {
    const fixture = TestBed.createComponent(CodeBlockComponent);
    fixture.componentRef.setInput('code', 'line one\nline two\nline three');
    fixture.componentRef.setInput('language', 'plaintext');
    await fixture.whenStable();
    fixture.detectChanges();

    const lines = fixture.nativeElement.querySelectorAll('.code-block__line');
    expect(lines.length).toBe(3);
  });

  it('shows the filename when provided', async () => {
    const fixture = TestBed.createComponent(CodeBlockComponent);
    fixture.componentRef.setInput('code', 'x = 1');
    fixture.componentRef.setInput('language', 'python');
    fixture.componentRef.setInput('filename', 'main.py');
    await fixture.whenStable();
    fixture.detectChanges();

    const filename = fixture.nativeElement.querySelector('.code-block__filename');
    expect(filename?.textContent).toContain('main.py');
  });

  it('marks highlighted lines', async () => {
    const fixture = TestBed.createComponent(CodeBlockComponent);
    fixture.componentRef.setInput('code', 'a\nb\nc');
    fixture.componentRef.setInput('highlightLines', [2]);
    await fixture.whenStable();
    fixture.detectChanges();

    const highlighted = fixture.nativeElement.querySelectorAll('.is-highlighted');
    expect(highlighted.length).toBe(1);
  });
});
