import { Injectable } from '@angular/core';
import hljs from 'highlight.js/lib/core';

import java from 'highlight.js/lib/languages/java';
import kotlin from 'highlight.js/lib/languages/kotlin';
import python from 'highlight.js/lib/languages/python';
import go from 'highlight.js/lib/languages/go';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import json from 'highlight.js/lib/languages/json';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import plaintext from 'highlight.js/lib/languages/plaintext';

/** Normalizes the many language labels authors use to a registered grammar. */
const ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  k8s: 'yaml',
  kubernetes: 'yaml',
  html: 'xml',
  docker: 'dockerfile',
  // highlight.js core has no Terraform grammar; render it cleanly as plaintext.
  terraform: 'plaintext',
  hcl: 'plaintext',
  tf: 'plaintext',
};

/**
 * Thin wrapper over highlight.js. Registers only the languages this platform
 * advertises (keeps the bundle lean vs. importing the full library) and exposes
 * a single `highlight()` that always returns safe, highlighted HTML.
 */
@Injectable({ providedIn: 'root' })
export class HighlightService {
  private registered = false;

  private register(): void {
    if (this.registered) {
      return;
    }
    hljs.registerLanguage('java', java);
    hljs.registerLanguage('kotlin', kotlin);
    hljs.registerLanguage('python', python);
    hljs.registerLanguage('go', go);
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('typescript', typescript);
    hljs.registerLanguage('sql', sql);
    hljs.registerLanguage('bash', bash);
    hljs.registerLanguage('yaml', yaml);
    hljs.registerLanguage('json', json);
    hljs.registerLanguage('dockerfile', dockerfile);
    hljs.registerLanguage('xml', xml);
    hljs.registerLanguage('css', css);
    hljs.registerLanguage('scss', scss);
    hljs.registerLanguage('plaintext', plaintext);
    this.registered = true;
  }

  resolveLanguage(language: string): string {
    const lower = (language || 'plaintext').toLowerCase();
    return ALIASES[lower] ?? lower;
  }

  /** Returns highlighted HTML for a single code string. */
  highlight(code: string, language: string): string {
    this.register();
    const lang = this.resolveLanguage(language);
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    }
    return hljs.highlightAuto(code).value;
  }
}
