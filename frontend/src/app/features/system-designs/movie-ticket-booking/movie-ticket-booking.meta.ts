import { DesignMeta } from '../../../shared/models';

export const MOVIE_TICKET_BOOKING_META: DesignMeta = {
  slug: 'movie-ticket-booking',
  title: 'Design Movie Ticket Booking',
  tagline:
    'BookMyShow/Fandango-style LLD: cities, cinemas, shows, seat maps, temporary holds, and race-free booking.',
  section: 'low-level-design',
  category: 'Marketplace',
  tags: ['movie-booking', 'lld', 'concurrency', 'seat-locking', 'strategy-pattern', 'bookmyshow'],
  technologies: ['Java', 'Concurrency', 'Distributed Locks', 'Redis'],
  difficulty: 'advanced',
  readingTimeMin: 22,
  status: 'published',
  keywords: [
    'bookmyshow lld',
    'movie ticket booking system design',
    'seat locking',
    'seat hold expiry',
    'double booking prevention',
    'show seat map',
    'ticket booking class diagram',
  ],
  dateAdded: '2026-07-11',
  popularity: 122,
  icon: 'TK',
  heroGradient: 'linear-gradient(135deg, #ef4444 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
