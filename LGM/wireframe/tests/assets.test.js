import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { products, categories, banners } from '../catalogue.js';

test('each catalogue entry points to a local, documented and nonempty visual', () => {
  const manifest=readFileSync(new URL('../../docs/wireframes/image-assets.md',import.meta.url),'utf8');
  const categoriesById=new Set(categories.map(c=>c.id));
  assert.ok(products.length>=20 && products.length<=30);
  assert.equal(new Set(products.map(p=>p.sku)).size,products.length);
  assert.ok(banners.length>=2 && banners.length<=3);
  for(const p of products) {
    assert.ok(categoriesById.has(p.category),`${p.name}: category reference`);
    assert.ok(p.price>0 && p.mrp>=p.price,`${p.name}: sample price`);
  }
  for(const {image} of [...products,...categories,...banners]){
    assert.match(image,/^(?:\.\/)?assets\/images\/(?:products|categories|banners)\/[\w.-]+$/);
    assert.ok(statSync(new URL('../'+image,import.meta.url)).size>100,image);
    assert.ok(manifest.includes(image.split('/').at(-1)),image+' attribution');
  }
});
