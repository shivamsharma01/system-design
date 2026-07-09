import { DesignContent } from '../../../shared/models';
import { MVP_META } from './mvp.meta';

const content: DesignContent = {
  meta: MVP_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Model-View-Presenter (MVP)** keeps the **View passive**: it displays data and forwards user actions. The **Presenter** contains UI logic, talks to the **Model**, and tells the view what to show. This makes presenters easy to unit-test without launching a real UI.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Variants',
          body: '**Passive View**: view has almost no logic. **Supervising Controller**: view may bind simple data; presenter handles complex flow. Interviews usually mean Passive View.',
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
          body: 'A **TV news anchor (view)** reads what the producer (presenter) prepares from research (model). The anchor does not decide the story structure — they present what they are given.',
        },
        {
          type: 'mermaid',
          caption: 'Presenter mediates view and model.',
          definition: `flowchart LR
  V[View interface] <--> P[Presenter]
  P --> M[Model / Services]`,
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
            ['Android (legacy/common)', 'Activity/Fragment as view; Presenter class'],
            ['Desktop WinForms / early .NET', 'Passive forms driven by presenters'],
            ['Test-heavy UI', 'Teams that mock `LoginView` in unit tests'],
            ['Games / tools', 'HUD view + presenter coordinating game state'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'LoginPresenter.java',
          code: `public interface LoginView {
  String getUsername();
  String getPassword();
  void showError(String message);
  void navigateToHome();
  void setLoading(boolean loading);
}

public class LoginPresenter {
  private final LoginView view;
  private final AuthService auth;

  public LoginPresenter(LoginView view, AuthService auth) {
    this.view = view;
    this.auth = auth;
  }

  public void onLoginClicked() {
    view.setLoading(true);
    try {
      auth.login(view.getUsername(), view.getPassword());
      view.navigateToHome();
    } catch (AuthException ex) {
      view.showError(ex.getMessage());
    } finally {
      view.setLoading(false);
    }
  }
}

// Activity implements LoginView and delegates clicks to presenter.
// Tests: mock LoginView + AuthService, assert showError/navigate calls.`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Presenter logic is unit-testable without UI frameworks.',
            'Clear contract via view interfaces.',
            'Good for complex screen workflows.',
          ],
          cons: [
            'Boilerplate interfaces and wiring.',
            'Presenters can become god classes for large screens.',
            'Less natural with heavy data-binding frameworks (MVVM often preferred).',
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
              question: 'How does MVP differ from MVC?',
              answer:
                'In MVP the **presenter** owns UI logic and updates a **passive view** through an interface. In MVC the controller is often framework-owned (HTTP), and views may observe the model more directly.',
            },
            {
              question: 'Why is MVP considered testable?',
              answer:
                'You mock the `View` interface and assert that the presenter calls `showError` / `showData` correctly — no emulator or browser needed.',
            },
            {
              question: 'What should the view contain?',
              answer:
                'Mostly widgets and forwarding events. Little or no business logic, formatting rules, or API calls.',
            },
            {
              question: 'MVP vs MVVM?',
              answer:
                'MVP: presenter **imperatively** calls view methods. MVVM: view-model exposes **observable state**; the view binds to it. MVVM reduces glue code when a binding engine exists.',
            },
            {
              question: 'Android interview angle?',
              answer:
                'Explain Activity as `LoginView`, Presenter surviving config changes (or not), and how this preceded widespread ViewModel adoption.',
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
          body: '1. MVP = **passive view + presenter**.\n2. Great for **unit-testing UI logic**.\n3. Real uses: **Android, desktop forms, test-heavy UIs**.\n4. Contrast with MVC (controller) and MVVM (binding).',
        },
      ],
    },
  ],
};

export default content;
