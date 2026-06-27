import { TestBed } from '@angular/core/testing';
import { CalloutComponent } from './callout.component';

describe('CalloutComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CalloutComponent] });
  });

  it('applies the variant class', async () => {
    const fixture = TestBed.createComponent(CalloutComponent);
    fixture.componentRef.setInput('variant', 'warning');
    fixture.componentRef.setInput('body', 'Be careful');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.callout--warning')).toBeTruthy();
  });

  it('falls back to the variant label when no title is given', async () => {
    const fixture = TestBed.createComponent(CalloutComponent);
    fixture.componentRef.setInput('variant', 'tip');
    fixture.componentRef.setInput('body', 'A handy tip');
    await fixture.whenStable();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.callout__title');
    expect(title?.textContent).toContain('Tip');
  });

  it('renders the markdown body', async () => {
    const fixture = TestBed.createComponent(CalloutComponent);
    fixture.componentRef.setInput('variant', 'info');
    fixture.componentRef.setInput('body', 'Hello **bold**');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('strong')?.textContent).toContain('bold');
  });
});
