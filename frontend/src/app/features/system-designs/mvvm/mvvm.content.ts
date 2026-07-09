import { DesignContent } from '../../../shared/models';
import { MVVM_META } from './mvvm.meta';

const content: DesignContent = {
  meta: MVVM_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Model-View-ViewModel (MVVM)** introduces a **ViewModel** that holds presentation state and commands. The **View** binds to the view-model (often two-way). The **Model** remains domain/data. Binding engines keep the UI in sync without manual `setText` glue.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Where you already use it',
          body: '**Angular** components + signals/RxJS state, **Android Jetpack ViewModel**, **WPF/SwiftUI**-style bindings — all MVVM-flavored.',
        },
      ],
    },
    {
      id: 'concept',
      title: 'Concept and analogy',
      blocks: [
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A **digital dashboard** bound to sensors: gauges (view) automatically reflect values from a display computer (view-model) that formats raw engine data (model). You do not rewire each needle by hand when a value changes.',
        },
        {
          type: 'mermaid',
          caption: 'View binds to ViewModel; ViewModel uses Model.',
          definition: `flowchart LR
  V[View] -->|data binding| VM[ViewModel]
  VM --> M[Model / APIs]`,
        },
      ],
    },
    {
      id: 'where-used',
      title: 'Where it is used',
      blocks: [
        {
          type: 'table',
          headers: ['Domain', 'Example'],
          rows: [
            ['Angular / frontend SPAs', 'Component template bound to component state / store'],
            ['Android', 'Jetpack `ViewModel` + LiveData/StateFlow'],
            ['Desktop', 'WPF, Avalonia, many XAML apps'],
            ['Cross-platform', 'MAUI, some Flutter architectures (similar idea)'],
            ['Design systems', 'Form screens with validation state in a VM'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'markdown',
          value: 'Checkout screen view-model (framework-agnostic sketch):',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'CheckoutViewModel.java',
          code: `import java.util.function.Consumer;

/** Presentation state for a checkout screen. */
public class CheckoutViewModel {
  private String address = "";
  private boolean submitting;
  private String error;
  private Consumer<Void> onChange = x -> {};

  private final CheckoutService checkout;

  public CheckoutViewModel(CheckoutService checkout) {
    this.checkout = checkout;
  }

  public void observe(Consumer<Void> onChange) { this.onChange = onChange; }

  public String getAddress() { return address; }
  public boolean isSubmitting() { return submitting; }
  public String getError() { return error; }

  public void setAddress(String address) {
    this.address = address;
    onChange.accept(null);
  }

  public void submit(String cartId) {
    submitting = true;
    error = null;
    onChange.accept(null);
    try {
      checkout.place(cartId, address);
    } catch (Exception ex) {
      error = ex.getMessage();
    } finally {
      submitting = false;
      onChange.accept(null);
    }
  }
}

// View binds fields to getters; button calls submit().
// In Angular/Android, replace observe() with Signals / StateFlow.`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Less manual UI update code with binding.',
            'ViewModels are testable with plain unit tests.',
            'Natural fit for reactive UI frameworks.',
          ],
          cons: [
            'Over-binding can hide performance issues.',
            'ViewModels may accumulate too much screen logic.',
            'Two-way binding bugs (feedback loops) need care.',
          ],
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions',
      blocks: [
        {
          type: 'interviewQa',
          items: [
            {
              question: 'What does the ViewModel do in MVVM?',
              answer:
                'It holds **presentation state and commands** for a screen, talks to the model/services, and exposes data in a form the view can bind to — not raw UI widgets.',
            },
            {
              question: 'MVVM vs MVP?',
              answer:
                'MVP presenters **call** view methods. MVVM view-models expose **state**; the view **reacts** via binding. MVVM needs a binding/reactive mechanism to shine.',
            },
            {
              question: 'Is an Angular component a ViewModel?',
              answer:
                'Often the component class plays the ViewModel role and the template is the View. Larger apps push state into stores/facades still in the VM spirit.',
            },
            {
              question: 'Should ViewModels know about Views?',
              answer:
                'No. Dependency should be View → ViewModel → Model. That keeps VMs framework-testable and reusable.',
            },
            {
              question: 'Android-specific point?',
              answer:
                'Jetpack `ViewModel` survives configuration changes and holds UI state; UI controllers (Activity/Fragment/Compose) observe it — textbook MVVM.',
            },
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'callout',
          variant: 'summary',
          title: 'Key takeaways',
          body: '1. MVVM = **View ↔ bind ↔ ViewModel → Model**.\n2. Real uses: **Angular, Android ViewModel, WPF**.\n3. Prefer one-way data flow when possible.\n4. Compare with MVP’s imperative view updates.',
        },
      ],
    },
  ],
};

export default content;
