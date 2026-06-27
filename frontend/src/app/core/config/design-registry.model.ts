import { DesignContent, DesignMeta } from '../../shared/models';

/**
 * A single entry in the global catalog.
 *
 * `meta` is imported statically (tiny, used for cards + search). `load` lazily
 * imports the full content chunk only when a design page is opened, so the
 * catalog can grow to hundreds of designs without bloating the initial bundle.
 */
export interface DesignRegistryEntry {
  meta: DesignMeta;
  load: () => Promise<{ default: DesignContent }>;
}
