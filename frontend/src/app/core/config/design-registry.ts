import { DesignRegistryEntry } from './design-registry.model';

// --- Design metadata (statically imported; tiny, used for cards + search) ---
import { INTERVIEW_FRAMEWORK_META } from '../../features/system-designs/interview-framework/interview-framework.meta';
import { SOLID_PRINCIPLES_META } from '../../features/system-designs/solid-principles/solid-principles.meta';
import { SINGLETON_META } from '../../features/system-designs/singleton/singleton.meta';
import { FACTORY_METHOD_META } from '../../features/system-designs/factory-method/factory-method.meta';
import { ABSTRACT_FACTORY_META } from '../../features/system-designs/abstract-factory/abstract-factory.meta';
import { BUILDER_META } from '../../features/system-designs/builder/builder.meta';
import { PROTOTYPE_META } from '../../features/system-designs/prototype/prototype.meta';
import { OBJECT_POOL_META } from '../../features/system-designs/object-pool/object-pool.meta';
import { ADAPTER_META } from '../../features/system-designs/adapter/adapter.meta';
import { BRIDGE_META } from '../../features/system-designs/bridge/bridge.meta';
import { COMPOSITE_META } from '../../features/system-designs/composite/composite.meta';
import { DECORATOR_META } from '../../features/system-designs/decorator/decorator.meta';
import { FACADE_META } from '../../features/system-designs/facade/facade.meta';
import { FLYWEIGHT_META } from '../../features/system-designs/flyweight/flyweight.meta';
import { PROXY_META } from '../../features/system-designs/proxy/proxy.meta';
import { NETFLIX_META } from '../../features/system-designs/netflix/netflix.meta';
import { URL_SHORTENER_META } from '../../features/system-designs/url-shortener/url-shortener.meta';
import { WHATSAPP_META } from '../../features/system-designs/whatsapp/whatsapp.meta';
import { UBER_META } from '../../features/system-designs/uber/uber.meta';
import { TWITTER_META } from '../../features/system-designs/twitter/twitter.meta';
import { YOUTUBE_META } from '../../features/system-designs/youtube/youtube.meta';
import { INSTAGRAM_META } from '../../features/system-designs/instagram/instagram.meta';
import { DISCORD_META } from '../../features/system-designs/discord/discord.meta';
import { RATE_LIMITER_META } from '../../features/system-designs/rate-limiter/rate-limiter.meta';
import { NOTIFICATION_SYSTEM_META } from '../../features/system-designs/notification-system/notification-system.meta';
import { DISTRIBUTED_CACHE_META } from '../../features/system-designs/distributed-cache/distributed-cache.meta';
import { PAYMENT_GATEWAY_META } from '../../features/system-designs/payment-gateway/payment-gateway.meta';
import { ZOMATO_META } from '../../features/system-designs/zomato/zomato.meta';
import { SPOTIFY_META } from '../../features/system-designs/spotify/spotify.meta';
import { AMAZON_META } from '../../features/system-designs/amazon/amazon.meta';
import { DROPBOX_META } from '../../features/system-designs/dropbox/dropbox.meta';

/**
 * The single source of truth for the catalog.
 *
 * To add a System Design:
 *   1. Create `features/system-designs/<slug>/<slug>.meta.ts` and `<slug>.content.ts`.
 *   2. Add one entry below (import the meta + a lazy `load`).
 * Nothing else in the app needs to change. The `npm run new:design` script
 * automates all of the above.
 */
export const DESIGN_REGISTRY: DesignRegistryEntry[] = [
  {
    meta: INTERVIEW_FRAMEWORK_META,
    load: () =>
      import('../../features/system-designs/interview-framework/interview-framework.content'),
  },
  {
    meta: SOLID_PRINCIPLES_META,
    load: () => import('../../features/system-designs/solid-principles/solid-principles.content'),
  },
  {
    meta: SINGLETON_META,
    load: () => import('../../features/system-designs/singleton/singleton.content'),
  },
  {
    meta: FACTORY_METHOD_META,
    load: () => import('../../features/system-designs/factory-method/factory-method.content'),
  },
  {
    meta: ABSTRACT_FACTORY_META,
    load: () => import('../../features/system-designs/abstract-factory/abstract-factory.content'),
  },
  {
    meta: BUILDER_META,
    load: () => import('../../features/system-designs/builder/builder.content'),
  },
  {
    meta: PROTOTYPE_META,
    load: () => import('../../features/system-designs/prototype/prototype.content'),
  },
  {
    meta: OBJECT_POOL_META,
    load: () => import('../../features/system-designs/object-pool/object-pool.content'),
  },
  {
    meta: ADAPTER_META,
    load: () => import('../../features/system-designs/adapter/adapter.content'),
  },
  {
    meta: BRIDGE_META,
    load: () => import('../../features/system-designs/bridge/bridge.content'),
  },
  {
    meta: COMPOSITE_META,
    load: () => import('../../features/system-designs/composite/composite.content'),
  },
  {
    meta: DECORATOR_META,
    load: () => import('../../features/system-designs/decorator/decorator.content'),
  },
  {
    meta: FACADE_META,
    load: () => import('../../features/system-designs/facade/facade.content'),
  },
  {
    meta: FLYWEIGHT_META,
    load: () => import('../../features/system-designs/flyweight/flyweight.content'),
  },
  {
    meta: PROXY_META,
    load: () => import('../../features/system-designs/proxy/proxy.content'),
  },
  {
    meta: NETFLIX_META,
    load: () => import('../../features/system-designs/netflix/netflix.content'),
  },
  {
    meta: WHATSAPP_META,
    load: () => import('../../features/system-designs/whatsapp/whatsapp.content'),
  },
  {
    meta: URL_SHORTENER_META,
    load: () => import('../../features/system-designs/url-shortener/url-shortener.content'),
  },
  {
    meta: UBER_META,
    load: () => import('../../features/system-designs/uber/uber.content'),
  },
  {
    meta: TWITTER_META,
    load: () => import('../../features/system-designs/twitter/twitter.content'),
  },
  {
    meta: YOUTUBE_META,
    load: () => import('../../features/system-designs/youtube/youtube.content'),
  },
  {
    meta: INSTAGRAM_META,
    load: () => import('../../features/system-designs/instagram/instagram.content'),
  },
  {
    meta: DISCORD_META,
    load: () => import('../../features/system-designs/discord/discord.content'),
  },
  {
    meta: RATE_LIMITER_META,
    load: () => import('../../features/system-designs/rate-limiter/rate-limiter.content'),
  },
  {
    meta: NOTIFICATION_SYSTEM_META,
    load: () =>
      import('../../features/system-designs/notification-system/notification-system.content'),
  },
  {
    meta: DISTRIBUTED_CACHE_META,
    load: () => import('../../features/system-designs/distributed-cache/distributed-cache.content'),
  },
  {
    meta: PAYMENT_GATEWAY_META,
    load: () => import('../../features/system-designs/payment-gateway/payment-gateway.content'),
  },
  {
    meta: ZOMATO_META,
    load: () => import('../../features/system-designs/zomato/zomato.content'),
  },
  {
    meta: SPOTIFY_META,
    load: () => import('../../features/system-designs/spotify/spotify.content'),
  },
  {
    meta: AMAZON_META,
    load: () => import('../../features/system-designs/amazon/amazon.content'),
  },
  {
    meta: DROPBOX_META,
    load: () => import('../../features/system-designs/dropbox/dropbox.content'),
  },
];
