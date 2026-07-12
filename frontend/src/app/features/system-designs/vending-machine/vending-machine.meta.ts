import { DesignMeta } from '../../../shared/models';

export const VENDING_MACHINE_META: DesignMeta = {
  slug: 'vending-machine',
  title: 'Design a Vending Machine',
  tagline:
    'Classic LLD state machine: Idle → HasMoney → Dispensing → OutOfStock, with inventory, coin payment, and change-making — State pattern and Java sample code.',
  section: 'low-level-design',
  category: 'Classic Systems',
  tags: ['vending-machine', 'lld', 'state-pattern', 'oop', 'change-making', 'inventory'],
  technologies: ['Java', 'OOP', 'State Pattern'],
  difficulty: 'intermediate',
  readingTimeMin: 20,
  status: 'published',
  keywords: [
    'vending machine design',
    'state machine lld',
    'coin change algorithm',
    'dispense product',
    'object oriented design interview',
  ],
  dateAdded: '2026-07-12',
  popularity: 110,
  icon: 'VM',
  heroGradient: 'linear-gradient(135deg, #059669 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
