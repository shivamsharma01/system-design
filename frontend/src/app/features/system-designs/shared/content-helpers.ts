import { DesignContent, DesignMeta } from '../../../shared/models';

/**
 * Builds a standard "coming soon" page for designs whose `meta.status` is
 * `draft`. Lets us list a topic on the home page (so contributors can claim it)
 * before its full content is written.
 */
export function draftContent(meta: DesignMeta): DesignContent {
  return {
    meta,
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        blocks: [
          {
            type: 'markdown',
            value: `**${meta.title}** — ${meta.tagline}`,
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'This design is a work in progress',
            body: `This page is a placeholder. Want to write it? Pick it up by following the [contribution guide](https://github.com/your-org/system-design) and open a pull request. Adding the full content is as simple as filling in the \`${meta.slug}.content.ts\` file.`,
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Suggested sections',
            body: 'Overview, Functional & Non-Functional Requirements, Capacity Estimation, High-Level Architecture, API Design, Database Design, Caching, Scaling, Trade-offs, Interview Questions, and References.',
          },
        ],
      },
    ],
  };
}
