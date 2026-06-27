import { DesignContent } from '../../../shared/models';
import { PAYMENT_GATEWAY_META } from './payment-gateway.meta';

const content: DesignContent = {
  meta: PAYMENT_GATEWAY_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Describe the system here. See the Netflix module for a full example of every available content block.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Getting started',
          body: "Replace this content. Once ready, set `status: 'published'` in the meta file.",
        },
      ],
    },
    // Add more sections: functional-requirements, high-level-architecture, etc.
  ],
};

export default content;
