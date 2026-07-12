import { DesignMeta } from '../../../shared/models';

export const HOTEL_RESERVATION_META: DesignMeta = {
  slug: 'hotel-reservation',
  title: 'Design a Hotel Reservation System',
  tagline:
    'Room types, date-range availability, booking hold/confirm, overbooking policy, and optimistic locking on room-night inventory — LLD marketplace interview favorite.',
  section: 'low-level-design',
  category: 'Marketplace',
  tags: [
    'hotel-reservation',
    'lld',
    'booking',
    'availability',
    'optimistic-locking',
    'overbooking',
  ],
  technologies: ['Java', 'OOP', 'Optimistic Locking', 'PostgreSQL'],
  difficulty: 'intermediate',
  readingTimeMin: 22,
  status: 'published',
  keywords: [
    'hotel booking system design',
    'room night inventory',
    'date range availability',
    'booking hold',
    'overbooking policy',
  ],
  dateAdded: '2026-07-12',
  popularity: 112,
  icon: 'HR',
  heroGradient: 'linear-gradient(135deg, #b45309 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
