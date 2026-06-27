#!/usr/bin/env node
/**
 * Scaffolds a new System Design module and registers it automatically.
 *
 * Usage (from the frontend/ folder):
 *   npm run new:design -- <slug> "Design Title"
 *
 * Example:
 *   npm run new:design -- paypal "Design PayPal"
 *
 * Creates:
 *   frontend/src/app/features/system-designs/<slug>/<slug>.meta.ts
 *   frontend/src/app/features/system-designs/<slug>/<slug>.content.ts
 * and inserts an entry into:
 *   frontend/src/app/core/config/design-registry.ts
 */
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const featuresDir = join(
  repoRoot,
  'frontend/src/app/features/system-designs',
);
const registryPath = join(
  repoRoot,
  'frontend/src/app/core/config/design-registry.ts',
);

const [slugArg, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ').trim();

if (!slugArg || !title) {
  console.error('Usage: npm run new:design -- <slug> "Design Title"');
  process.exit(1);
}

const slug = slugArg.toLowerCase();
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error(`Invalid slug "${slug}". Use kebab-case, e.g. "google-drive".`);
  process.exit(1);
}

const constName = slug.toUpperCase().replace(/-/g, '_') + '_META';
const designDir = join(featuresDir, slug);

if (existsSync(designDir)) {
  console.error(`Design "${slug}" already exists at ${designDir}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const metaTs = `import { DesignMeta } from '../../../shared/models';

export const ${constName}: DesignMeta = {
  slug: '${slug}',
  title: '${title.replace(/'/g, "\\'")}',
  tagline: 'One-line summary of the system you are designing.',
  category: 'Web Services',
  tags: ['tag-one', 'tag-two'],
  technologies: ['PostgreSQL', 'Redis'],
  difficulty: 'intermediate',
  readingTimeMin: 15,
  status: 'draft',
  keywords: [],
  dateAdded: '${today}',
  popularity: 50,
  icon: '${slug.slice(0, 2).toUpperCase()}',
  heroGradient: 'linear-gradient(135deg, #4f46e5 0%, #0f172a 100%)',
};
`;

const contentTs = `import { DesignContent } from '../../../shared/models';
import { ${constName} } from './${slug}.meta';

const content: DesignContent = {
  meta: ${constName},
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value: 'Describe the system here. See the Netflix module for a full example of every available content block.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Getting started',
          body: 'Replace this content. Once ready, set \`status: \\'published\\'\` in the meta file.',
        },
      ],
    },
    // Add more sections: functional-requirements, high-level-architecture, etc.
  ],
};

export default content;
`;

mkdirSync(designDir, { recursive: true });
writeFileSync(join(designDir, `${slug}.meta.ts`), metaTs);
writeFileSync(join(designDir, `${slug}.content.ts`), contentTs);

// --- Register in the catalog ---
let registry = readFileSync(registryPath, 'utf8');

const importLine = `import { ${constName} } from '../../features/system-designs/${slug}/${slug}.meta';\n`;
// Insert the import right before the JSDoc that documents DESIGN_REGISTRY.
const docMarker = '\n/**';
registry = registry.replace(docMarker, `${importLine}${docMarker}`);

const entry = `  {
    meta: ${constName},
    load: () =>
      import('../../features/system-designs/${slug}/${slug}.content'),
  },
`;
// Insert the entry before the closing bracket of the array.
const closeIndex = registry.lastIndexOf('];');
registry =
  registry.slice(0, closeIndex) + entry + registry.slice(closeIndex);

writeFileSync(registryPath, registry);

console.log(`\n✅ Created design "${slug}"`);
console.log(`   - features/system-designs/${slug}/${slug}.meta.ts`);
console.log(`   - features/system-designs/${slug}/${slug}.content.ts`);
console.log(`   - registered in core/config/design-registry.ts`);
console.log(`\nNext: edit the content, then set status to 'published'. Run "npm start" to preview.\n`);
