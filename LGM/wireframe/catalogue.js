// Fictional single-warehouse opening balances; prices and costs are INR per pack.
const image = (group, id) => `assets/images/${group}/${id}.jpg`;

export const categories = [
  ['fruit', 'Fresh fruit'],
  ['pantry', 'Grains & pulses'],
  ['brews', 'Tea & coffee'],
  ['bath', 'Bath & grooming'],
  ['kitchen', 'Kitchen essentials'],
].map(([id, name], index) => ({
  id, name, image: image('categories', id), active: true, position: index + 1,
}));

function product(id, name, sku, category, pack, price, mrp, cost, stock, threshold, description, active = true) {
  return {
    id, name, sku, category, pack, price, mrp, cost, stock, opening: stock, threshold,
    barcode: `DEMO-${sku}`, image: image('products', id), description, active,
  };
}

export const products = [
  product('apple', 'Lunchbox red apples', 'FR-101', 'fruit', '4 pcs', 118, 130, 82, 42, 8,
    'Four crisp red apples for packing whole or slicing into a lunchbox.'),
  product('banana', 'Breakfast banana bunch', 'FR-102', 'fruit', '6 pcs', 46, 50, 32, 54, 12,
    'A small bunch to ripen on the counter. Slice over oats or blend into a lassi.'),
  product('orange', 'Juicing oranges', 'FR-103', 'fruit', '1 kg', 86, 95, 64, 7, 10,
    'Whole oranges for squeezing at breakfast or cutting into wedges.'),
  product('pomegranate', 'Ruby pomegranate pair', 'FR-104', 'fruit', '2 pcs', 112, 120, 79, 18, 6,
    'Two whole pomegranates with tart arils for chaat, raita or snacking.'),

  product('rice', 'Daily pot white rice', 'GR-201', 'pantry', '1 kg', 68, 75, 48, 85, 15,
    'Uncooked white rice for a pot of steamed rice alongside dal.'),
  product('chickpeas', 'Slow-pot kabuli chana', 'GR-202', 'pantry', '500 g', 72, 80, 52, 38, 8,
    'Whole dried chickpeas to soak and simmer for chole or a warm salad.'),
  product('oats', 'Morning rolled oats', 'GR-203', 'pantry', '400 g', 89, 99, 62, 26, 6,
    'Rolled oat flakes for stovetop porridge, overnight oats or oat biscuits.'),
  product('pantry-trio', 'Three-bowl pantry sampler', 'GR-204', 'pantry', '3 × 200 g', 108, 120, 78, 0, 6,
    'Separate trial packs of rice, lentils and oats; cook each grain or pulse separately.'),

  product('coffee-beans', 'First light whole beans', 'BR-301', 'brews', '250 g', 284, 310, 205, 22, 5,
    'Whole roasted coffee beans to grind just before brewing.'),
  product('filter-coffee', 'Breakfast filter grind', 'BR-302', 'brews', '200 g', 198, 220, 148, 34, 8,
    'Ground roast coffee for a slow filter brew. Serve black or with hot milk.'),
  product('mint-tea', 'Courtyard peppermint infusion', 'BR-303', 'brews', '20 bags', 116, 130, 84, 4, 5,
    'Portioned dried peppermint for a fragrant hot infusion; the photograph shows a serving suggestion.'),
  product('black-tea', 'Kettle black tea', 'BR-304', 'brews', '250 g', 122, 135, 86, 58, 10,
    'Loose black tea granules for a full-bodied cup, with or without milk.'),

  product('soap-duo', 'Soap & palm brush set', 'BA-401', 'bath', '2 bars + 1 brush', 218, 245, 160, 16, 4,
    'A pair of bath bars and a wooden palm brush. Allow the brush to dry between uses.'),
  product('towels', 'Linen shelf hand towels', 'BA-402', 'bath', '2 pcs', 249, 280, 178, 23, 5,
    'Two white loop-pile hand towels sized for the washbasin or guest shelf.'),
  product('comb', 'Pocket wooden comb', 'BA-403', 'bath', '1 pc', 85, 85, 52, 31, 7,
    'A flat wooden comb with rounded corners that slips into a wash bag.'),
  product('toothbrush', 'Two-tone bamboo toothbrush', 'BA-404', 'bath', '1 pc', 68, 75, 44, 11, 4,
    'A slim bamboo handle with a dark dipped end for easy identification.'),

  product('sink-kit', 'Sink-side cleaning caddy', 'KI-501', 'kitchen', '1 kit', 345, 380, 255, 14, 4,
    'A compact tray with a dispenser and scrub tools to keep the sink ledge tidy.'),
  product('sponge', 'Daily dish sponges', 'KI-502', 'kitchen', '3 pcs', 54, 60, 36, 46, 10,
    'Three handheld washing-up sponges for plates and bowls. Squeeze dry after use.'),
  product('cutlery', 'Wooden lunch cutlery', 'KI-503', 'kitchen', '1 fork + 1 spoon', 92, 105, 65, 6, 8,
    'A wooden fork and spoon for packed lunches. Hand wash and air dry.'),
  product('jars', 'Countertop spice jar pair', 'KI-504', 'kitchen', '2 × 150 ml', 148, 165, 105, 12, 4,
    'Two compact lidded glass jars for spices. Supplied empty, without the styling tray.', false),
];

export const banners = [
  ['fruit-counter', 'At the fruit counter', 'Pick a bunch for breakfast or a pair for the lunchbox.', 'fruit', true],
  ['tea-break', 'Put the kettle on', 'Demo selection: explore loose tea, mint infusions and coffee.', 'brews', true],
  ['pantry-shelf', 'A shelf of staples', 'Demo scheme slot: rice, oats and pulses for the week.', 'pantry', false],
].map(([id, title, description, category, active], index) => ({
  id, title, description, image: image('banners', id), active,
  position: index + 1, category, start: '', end: '',
}));
