'use strict';

/*
 * DukanPilot POS
 * A focused, offline-first front end for Pakistani motorcycle parts retailers.
 * The state layer is deliberately small and auditable; replace it with the
 * authenticated API adapter in a production deployment.
 */

const STORAGE_KEY = 'dukanpilot-pos-v1';
const DAY = 24 * 60 * 60 * 1000;

const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h3l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.5L21 8H7"/>',
  box: '<path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  users: '<path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 2 18.5V20"/><circle cx="9" cy="7" r="4"/><path d="M16 4.2a4 4 0 0 1 0 7.6M22 20v-1.5a4.5 4.5 0 0 0-3.3-4.3"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 16 4-5 3 2 5-7"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 5l3 3M14 7l3 3"/>',
  settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.6l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  search: '<circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  chevrons: '<path d="m7 8 5-5 5 5M7 16l5 5 5-5"/>',
  more: '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  'arrow-right': '<path d="M4 12h16M13 5l7 7-7 7"/>',
  'arrow-left': '<path d="M20 12H4M11 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  printer: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.7-4L3 10M3 4v6h6M4 13a8 8 0 0 0 14.7 4L21 14m0 6v-6h-6"/>',
  filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M14 8v8M17 8v8"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  dollar: '<path d="M12 2v20M17 6.5C16.2 5.5 14.6 5 12.5 5 9.5 5 7 6.5 7 9s2 3.5 5 4 5 1.5 5 4-2.4 4-5.5 4c-2.1 0-4-.7-5-2"/>',
  receipt: '<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M8 8h8M8 12h8M8 16h4"/>',
  shield: '<path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  warning: '<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v4M12 17h.01"/>',
  phone: '<path d="M6 3h3l2 5-2 1.5a14 14 0 0 0 5.5 5.5L16 13l5 2v3a2 2 0 0 1-2 2C10.2 20 4 13.8 4 5a2 2 0 0 1 2-2Z"/>',
  map: '<path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  truck: '<path d="M3 5h11v12H3zM14 9h4l3 3v5h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M20 19V5a2 2 0 0 0-2-2h-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 7 20l1.2-1.2"/>'
};

function icon(name, size = '') {
  return `<svg class="icon ${size}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    const name = el.getAttribute('data-icon');
    if (ICONS[name]) el.innerHTML = icon(name, el.dataset.size || '');
  });
}

const seedProducts = [
  { id: 'p001', name: 'Clutch Plate Set', brand: 'Honda Genuine', category: 'Engine', models: ['CD 70', 'CG 125'], sku: 'HND-ENG-001', barcode: '896400100001', price: 1250, cost: 890, stock: 14, reorder: 5, unit: 'set', initials: 'CP', tone: 'teal' },
  { id: 'p002', name: 'Chain Sprocket Kit', brand: 'Super Power', category: 'Transmission', models: ['CD 70'], sku: 'CD70-TRN-014', barcode: '896400100002', price: 1850, cost: 1320, stock: 8, reorder: 5, unit: 'kit', initials: 'CS', tone: 'purple' },
  { id: 'p003', name: 'Front Brake Shoe', brand: 'Atlas', category: 'Brake', models: ['CD 70', 'Pridor'], sku: 'HND-BRK-021', barcode: '896400100003', price: 680, cost: 440, stock: 22, reorder: 8, unit: 'pair', initials: 'BS', tone: 'amber' },
  { id: 'p004', name: 'Air Filter Element', brand: 'Honda Genuine', category: 'Engine', models: ['CD 70', 'Pridor'], sku: 'HND-ENG-034', barcode: '896400100004', price: 430, cost: 285, stock: 4, reorder: 8, unit: 'piece', initials: 'AF', tone: 'blue' },
  { id: 'p005', name: 'Spark Plug NGK C7HSA', brand: 'NGK Japan', category: 'Electrical', models: ['CD 70', 'United US 70'], sku: 'NGK-ELC-007', barcode: '896400100005', price: 350, cost: 220, stock: 36, reorder: 10, unit: 'piece', initials: 'SP', tone: 'pink' },
  { id: 'p006', name: 'Carburetor Assembly', brand: 'Honda OEM', category: 'Engine', models: ['CD 70'], sku: 'HND-ENG-052', barcode: '896400100006', price: 3150, cost: 2420, stock: 3, reorder: 4, unit: 'piece', initials: 'CA', tone: 'teal' },
  { id: 'p007', name: 'Piston Ring Set 0.50', brand: 'Riken', category: 'Engine', models: ['CD 70'], sku: 'CD70-ENG-061', barcode: '896400100007', price: 760, cost: 490, stock: 11, reorder: 5, unit: 'set', initials: 'PR', tone: 'purple' },
  { id: 'p008', name: 'Accelerator Cable', brand: 'Hi-Speed', category: 'Controls', models: ['CD 70', 'Pridor'], sku: 'HND-CTL-010', barcode: '896400100008', price: 280, cost: 155, stock: 18, reorder: 7, unit: 'piece', initials: 'AC', tone: 'amber' },
  { id: 'p009', name: 'Engine Oil 20W-40 · 700ml', brand: 'ZIC M9', category: 'Consumables', models: ['CD 70', 'CG 125', 'Pridor', 'GS 150'], sku: 'OIL-20W-040', barcode: '896400100009', price: 620, cost: 515, stock: 48, reorder: 12, unit: 'bottle', initials: 'EO', tone: 'blue' },
  { id: 'p010', name: 'Rear Brake Shoe', brand: 'Honda Genuine', category: 'Brake', models: ['CG 125'], sku: 'CG125-BRK-018', barcode: '896400100010', price: 790, cost: 535, stock: 6, reorder: 8, unit: 'pair', initials: 'RB', tone: 'pink' },
  { id: 'p011', name: 'Chain Sprocket Kit', brand: 'D.I.D', category: 'Transmission', models: ['CG 125'], sku: 'CG125-TRN-019', barcode: '896400100011', price: 2450, cost: 1810, stock: 9, reorder: 4, unit: 'kit', initials: 'CS', tone: 'teal' },
  { id: 'p012', name: 'Clutch Cable', brand: 'Hi-Speed', category: 'Controls', models: ['CG 125', 'Pridor'], sku: 'HND-CTL-023', barcode: '896400100012', price: 360, cost: 210, stock: 2, reorder: 7, unit: 'piece', initials: 'CC', tone: 'purple' },
  { id: 'p013', name: 'Carburetor Assembly', brand: 'Pak Hero', category: 'Engine', models: ['CG 125'], sku: 'CG125-ENG-033', barcode: '896400100013', price: 3850, cost: 2950, stock: 5, reorder: 3, unit: 'piece', initials: 'CA', tone: 'amber' },
  { id: 'p014', name: 'Complete Gasket Kit', brand: 'NOK', category: 'Engine', models: ['CG 125'], sku: 'CG125-ENG-041', barcode: '896400100014', price: 980, cost: 650, stock: 13, reorder: 5, unit: 'kit', initials: 'GK', tone: 'blue' },
  { id: 'p015', name: 'Front Fork Seal Pair', brand: 'SKF', category: 'Suspension', models: ['CG 125', 'GS 150'], sku: 'FKS-SUS-002', barcode: '896400100015', price: 780, cost: 490, stock: 7, reorder: 5, unit: 'pair', initials: 'FS', tone: 'pink' },
  { id: 'p016', name: 'Headlight Bulb 12V 35/35W', brand: 'Osram', category: 'Electrical', models: ['CD 70', 'CG 125', 'Pridor'], sku: 'ELC-LGT-012', barcode: '896400100016', price: 420, cost: 275, stock: 16, reorder: 6, unit: 'piece', initials: 'HB', tone: 'teal' },
  { id: 'p017', name: 'CDI Unit', brand: 'Honda OEM', category: 'Electrical', models: ['CG 125'], sku: 'CG125-ELC-016', barcode: '896400100017', price: 2250, cost: 1640, stock: 1, reorder: 3, unit: 'piece', initials: 'CD', tone: 'purple' },
  { id: 'p018', name: 'Front Brake Pad Set', brand: 'Yamaha Genuine', category: 'Brake', models: ['YBR 125', 'YBR 125G'], sku: 'YBR-BRK-003', barcode: '896400100018', price: 1720, cost: 1210, stock: 8, reorder: 4, unit: 'set', initials: 'BP', tone: 'amber' },
  { id: 'p019', name: 'Chain Set 428H', brand: 'D.I.D', category: 'Transmission', models: ['YBR 125', 'YBR 125G'], sku: 'YBR-TRN-005', barcode: '896400100019', price: 4250, cost: 3180, stock: 3, reorder: 4, unit: 'kit', initials: 'CH', tone: 'blue' },
  { id: 'p020', name: 'Oil Filter Element', brand: 'Yamaha Genuine', category: 'Consumables', models: ['YBR 125', 'GS 150'], sku: 'YBR-ENG-009', barcode: '896400100020', price: 580, cost: 390, stock: 12, reorder: 5, unit: 'piece', initials: 'OF', tone: 'pink' },
  { id: 'p021', name: 'Clutch Plate Set', brand: 'Yamaha Genuine', category: 'Engine', models: ['YBR 125'], sku: 'YBR-ENG-014', barcode: '896400100021', price: 3150, cost: 2360, stock: 5, reorder: 3, unit: 'set', initials: 'CP', tone: 'teal' },
  { id: 'p022', name: 'Rear Brake Shoe', brand: 'Honda Genuine', category: 'Brake', models: ['Pridor'], sku: 'PRD-BRK-004', barcode: '896400100022', price: 720, cost: 480, stock: 4, reorder: 6, unit: 'pair', initials: 'RB', tone: 'purple' },
  { id: 'p023', name: 'Chain Sprocket Kit', brand: 'Super Power', category: 'Transmission', models: ['Pridor'], sku: 'PRD-TRN-008', barcode: '896400100023', price: 1950, cost: 1390, stock: 7, reorder: 4, unit: 'kit', initials: 'CS', tone: 'amber' },
  { id: 'p024', name: 'Brake Shoe Pair', brand: 'United Parts', category: 'Brake', models: ['United US 70'], sku: 'U70-BRK-001', barcode: '896400100024', price: 540, cost: 325, stock: 0, reorder: 6, unit: 'pair', initials: 'BS', tone: 'blue' },
  { id: 'p025', name: 'Rectifier 4-Pin', brand: 'Suzuki Genuine', category: 'Electrical', models: ['GS 150', 'GD 110S'], sku: 'SZK-ELC-007', barcode: '896400100025', price: 1850, cost: 1320, stock: 2, reorder: 4, unit: 'piece', initials: 'RC', tone: 'pink' },
  { id: 'p026', name: 'Throttle Cable', brand: 'Suzuki Genuine', category: 'Controls', models: ['GS 150', 'CB 150F'], sku: 'SZK-CTL-011', barcode: '896400100026', price: 590, cost: 370, stock: 10, reorder: 4, unit: 'piece', initials: 'TC', tone: 'teal' },
  { id: 'p027', name: 'Indicator Set · 4 Piece', brand: 'Ravi Genuine', category: 'Electrical', models: ['Ravi Piaggio'], sku: 'RVP-ELC-003', barcode: '896400100027', price: 1450, cost: 1010, stock: 6, reorder: 3, unit: 'set', initials: 'IS', tone: 'purple' },
  { id: 'p028', name: 'Tubeless Tyre 2.75-18', brand: 'Servis', category: 'Wheels', models: ['YBR 125', 'GS 150', 'CB 150F'], sku: 'TYR-275-018', barcode: '896400100028', price: 4650, cost: 3740, stock: 4, reorder: 3, unit: 'piece', initials: 'TT', tone: 'amber' }
];

const seedCustomers = [
  { id: 'c001', name: 'Walk-in customer', phone: '', city: 'Lahore', balance: 0, purchases: 28, lastPurchase: 'Today' },
  { id: 'c002', name: 'Bilal Workshop', phone: '0301 456 7821', city: 'Kot Lakhpat', balance: 18500, purchases: 46, lastPurchase: 'Yesterday' },
  { id: 'c003', name: 'Aslam Autos', phone: '0322 781 0903', city: 'Township', balance: 7200, purchases: 31, lastPurchase: '24 Aug 2026' },
  { id: 'c004', name: 'Mian Brothers Motors', phone: '0300 219 4456', city: 'Faisal Town', balance: 0, purchases: 19, lastPurchase: '21 Aug 2026' },
  { id: 'c005', name: 'Raza Bike Repair', phone: '0333 602 1188', city: 'Green Town', balance: 25600, purchases: 52, lastPurchase: '18 Aug 2026' },
  { id: 'c006', name: 'Usman Khan', phone: '0315 944 1207', city: 'Johar Town', balance: 0, purchases: 8, lastPurchase: '16 Aug 2026' }
];

function daysAgo(days, hour = 12, minute = 15) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setTime(d.getTime() - days * DAY);
  return d.toISOString();
}

function makeSeedSales() {
  return [
    { id: 'INV-1042', createdAt: daysAgo(0, 15, 42), customerId: 'c002', customerName: 'Bilal Workshop', items: [{ productId: 'p002', qty: 1, price: 1850 }, { productId: 'p009', qty: 3, price: 620 }, { productId: 'p005', qty: 2, price: 350 }], amount: 4410, payment: 'Cash', status: 'Paid' },
    { id: 'INV-1041', createdAt: daysAgo(0, 13, 10), customerId: 'c001', customerName: 'Walk-in customer', items: [{ productId: 'p003', qty: 1, price: 680 }, { productId: 'p008', qty: 1, price: 280 }, { productId: 'p016', qty: 1, price: 420 }], amount: 1380, payment: 'Easypaisa', status: 'Paid' },
    { id: 'INV-1040', createdAt: daysAgo(1, 18, 5), customerId: 'c003', customerName: 'Aslam Autos', items: [{ productId: 'p011', qty: 1, price: 2450 }, { productId: 'p015', qty: 2, price: 780 }], amount: 4010, payment: 'Credit', status: 'Credit' },
    { id: 'INV-1039', createdAt: daysAgo(1, 14, 30), customerId: 'c001', customerName: 'Walk-in customer', items: [{ productId: 'p004', qty: 2, price: 430 }, { productId: 'p007', qty: 1, price: 760 }], amount: 1620, payment: 'Cash', status: 'Paid' },
    { id: 'INV-1038', createdAt: daysAgo(2, 17, 22), customerId: 'c005', customerName: 'Raza Bike Repair', items: [{ productId: 'p018', qty: 1, price: 1720 }, { productId: 'p020', qty: 2, price: 580 }, { productId: 'p028', qty: 1, price: 4650 }], amount: 7530, payment: 'JazzCash', status: 'Paid' },
    { id: 'INV-1037', createdAt: daysAgo(3, 12, 7), customerId: 'c001', customerName: 'Walk-in customer', items: [{ productId: 'p001', qty: 1, price: 1250 }, { productId: 'p010', qty: 1, price: 790 }], amount: 2040, payment: 'Cash', status: 'Paid' },
    { id: 'INV-1036', createdAt: daysAgo(4, 16, 45), customerId: 'c004', customerName: 'Mian Brothers Motors', items: [{ productId: 'p021', qty: 1, price: 3150 }, { productId: 'p026', qty: 2, price: 590 }], amount: 4330, payment: 'Cash', status: 'Paid' },
    { id: 'INV-1035', createdAt: daysAgo(5, 11, 12), customerId: 'c001', customerName: 'Walk-in customer', items: [{ productId: 'p023', qty: 1, price: 1950 }, { productId: 'p005', qty: 4, price: 350 }], amount: 3350, payment: 'Cash', status: 'Paid' },
    { id: 'INV-1034', createdAt: daysAgo(6, 15, 2), customerId: 'c006', customerName: 'Usman Khan', items: [{ productId: 'p014', qty: 1, price: 980 }, { productId: 'p016', qty: 2, price: 420 }], amount: 1820, payment: 'Easypaisa', status: 'Paid' },
    { id: 'INV-1033', createdAt: daysAgo(8, 13, 50), customerId: 'c002', customerName: 'Bilal Workshop', items: [{ productId: 'p006', qty: 1, price: 3150 }, { productId: 'p009', qty: 4, price: 620 }], amount: 5630, payment: 'Credit', status: 'Credit' },
    { id: 'INV-1032', createdAt: daysAgo(10, 17, 34), customerId: 'c005', customerName: 'Raza Bike Repair', items: [{ productId: 'p019', qty: 1, price: 4250 }, { productId: 'p018', qty: 1, price: 1720 }], amount: 5970, payment: 'Cash', status: 'Paid' },
    { id: 'INV-1031', createdAt: daysAgo(13, 12, 8), customerId: 'c001', customerName: 'Walk-in customer', items: [{ productId: 'p012', qty: 2, price: 360 }, { productId: 'p022', qty: 1, price: 720 }], amount: 1440, payment: 'Cash', status: 'Paid' }
  ];
}

function addDays(date, number) {
  const d = new Date(date);
  d.setTime(d.getTime() + number * DAY);
  return d.toISOString();
}

function makeDefaultState() {
  const issued = addDays(new Date(), -239);
  const expires = addDays(new Date(), 126);
  return {
    view: 'dashboard',
    products: seedProducts,
    customers: seedCustomers,
    sales: makeSeedSales(),
    cart: [],
    discount: 0,
    saleCustomerId: 'c001',
    paymentMethod: 'Cash',
    filters: { productSearch: '', model: 'All bikes', inventorySearch: '', inventoryCategory: 'All categories', inventoryModel: 'All models', customerSearch: '', reportPeriod: '7d', dashboardPeriod: '7d' },
    currentUser: { id: 'u001', name: 'Hassan Ali', role: 'seller', title: 'Seller / Owner' },
    users: [
      { id: 'u001', name: 'Hassan Ali', email: 'hassan@naveedautoparts.pk', role: 'seller', status: 'Active', lastActive: 'Now' },
      { id: 'u002', name: 'Waqas Ahmed', email: 'waqas@naveedautoparts.pk', role: 'staff', status: 'Active', lastActive: '12 min ago' }
    ],
    license: { plan: 'Annual', key: 'DP-ANNUAL-8C7R-4M9P-2Q6K', issuedAt: issued, expiresAt: expires, shop: 'Naveed Auto Parts', device: 'Main shop terminal' },
    generatedKeys: [
      { id: 'key001', key: 'DP-ANNUAL-8C7R-4M9P-2Q6K', plan: 'Annual', shop: 'Naveed Auto Parts', device: 'Main shop terminal', issuedAt: issued, expiresAt: expires, status: 'Active', issuedBy: 'Hassan Ali' },
      { id: 'key000', key: 'DP-HALF-2Q8M-6K1A-9T4V', plan: 'Half-yearly', shop: 'Naveed Auto Parts', device: 'Counter 2', issuedAt: addDays(new Date(), -305), expiresAt: addDays(new Date(), -123), status: 'Expired', issuedBy: 'Hassan Ali' }
    ],
    settings: {
      shopName: 'Naveed Auto Parts', phone: '0321 845 1910', city: 'Lahore', address: 'Shop 14, Bilal Ganj Auto Market', ntn: '—', taxEnabled: false, taxRate: 0, receiptFooter: 'Thank you for shopping with us. Parts once sold are not returnable without a receipt.', lowStockAlerts: true, autoBackup: true, licenseEnforcement: true
    },
    audit: [
      { text: 'Annual license activated', by: 'Hassan Ali', at: issued },
      { text: 'Stock received · Engine Oil 20W-40', by: 'Waqas Ahmed', at: daysAgo(1, 10, 15) },
      { text: 'New customer added · Raza Bike Repair', by: 'Hassan Ali', at: daysAgo(4, 16, 40) }
    ]
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeDefaultState();
    const parsed = JSON.parse(raw);
    const base = makeDefaultState();
    return {
      ...base,
      ...parsed,
      filters: { ...base.filters, ...(parsed.filters || {}) },
      settings: { ...base.settings, ...(parsed.settings || {}) },
      currentUser: { ...base.currentUser, ...(parsed.currentUser || {}) },
      license: { ...base.license, ...(parsed.license || {}) },
      products: Array.isArray(parsed.products) ? parsed.products : base.products,
      customers: Array.isArray(parsed.customers) ? parsed.customers : base.customers,
      sales: Array.isArray(parsed.sales) ? parsed.sales : base.sales,
      generatedKeys: Array.isArray(parsed.generatedKeys) ? parsed.generatedKeys : base.generatedKeys,
      users: Array.isArray(parsed.users) ? parsed.users : base.users,
      audit: Array.isArray(parsed.audit) ? parsed.audit : base.audit,
      cart: Array.isArray(parsed.cart) ? parsed.cart : []
    };
  } catch (error) {
    console.warn('Starting with a clean local workspace', error);
    return makeDefaultState();
  }
}

let state = loadState();

const PAGE_META = {
  dashboard: { label: 'Overview', title: 'Overview' },
  sale: { label: 'New sale', title: 'New sale' },
  products: { label: 'Products', title: 'Products' },
  stock: { label: 'Stock control', title: 'Stock control' },
  customers: { label: 'Customers', title: 'Customers' },
  reports: { label: 'Reports', title: 'Reports' },
  licenses: { label: 'Licenses', title: 'Licenses' },
  settings: { label: 'Admin settings', title: 'Admin settings' }
};

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { console.warn('Could not save local workspace', error); }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function formatMoney(value) {
  return `Rs. ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(Math.round(Number(value) || 0))}`;
}

function shortMoney(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) return `Rs. ${(n / 1000000).toFixed(1)}m`;
  if (n >= 1000) return `Rs. ${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return formatMoney(n);
}

function formatDate(date, options = {}) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PK', { day: '2-digit', month: 'short', year: 'numeric', ...options }).format(new Date(date));
}

function formatDateLong(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));
}

function formatDateTime(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PK', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(date));
}

function formatTime(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PK', { hour: 'numeric', minute: '2-digit' }).format(new Date(date));
}

function initials(name) {
  return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '—';
}

function productById(id) { return state.products.find((product) => product.id === id); }
function customerById(id) { return state.customers.find((customer) => customer.id === id); }
function isSeller() { return state.currentUser?.role === 'seller'; }
function licenseDays() { return Math.ceil((new Date(state.license.expiresAt).getTime() - Date.now()) / DAY); }
function planDays(plan) { return plan === 'Monthly' ? 30 : plan === 'Half-yearly' ? 182 : 365; }
function licenseStatus() { return licenseDays() < 0 ? 'Expired' : licenseDays() <= 14 ? 'Renew soon' : 'Active'; }
function cartSubtotal() { return state.cart.reduce((total, item) => total + (Number(item.price) * Number(item.qty)), 0); }
function cartTax() { return state.settings.taxEnabled ? Math.max(0, cartSubtotal() - Number(state.discount || 0)) * Number(state.settings.taxRate || 0) / 100 : 0; }
function cartTotal() { return Math.max(0, cartSubtotal() - Number(state.discount || 0) + cartTax()); }
function inventoryValue() { return state.products.reduce((sum, product) => sum + Number(product.cost || 0) * Number(product.stock || 0), 0); }
function receivables() { return state.customers.reduce((sum, customer) => sum + Number(customer.balance || 0), 0); }
function today(date) { const a = new Date(date); const b = new Date(); return a.toDateString() === b.toDateString(); }
function recentSales(days = 7) { const since = Date.now() - days * DAY; return state.sales.filter((sale) => new Date(sale.createdAt).getTime() >= since); }
function saleItemsCount(sales = state.sales) { return sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + Number(item.qty || 0), 0), 0); }
function lowStockProducts() { return state.products.filter((product) => Number(product.stock) <= Number(product.reorder)); }

function setView(view) {
  if (!PAGE_META[view]) view = 'dashboard';
  if (view === 'licenses' && !isSeller()) {
    toast('Seller access required', 'Only the seller / owner account can manage license keys.', 'error');
    view = 'dashboard';
  }
  state.view = view;
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('sidebar')?.classList.remove('open');
}

function render() {
  const content = document.getElementById('pageContent');
  if (!content) return;
  const page = PAGE_META[state.view] || PAGE_META.dashboard;
  content.innerHTML = renderPage();
  const breadcrumb = document.getElementById('pageBreadcrumb');
  if (breadcrumb) breadcrumb.textContent = page.label;
  document.querySelectorAll('.nav-item[data-view]').forEach((item) => item.classList.toggle('active', item.dataset.view === state.view));
  document.querySelectorAll('.seller-only').forEach((item) => { item.hidden = !isSeller(); });
  const shopName = document.getElementById('sidebarShopName');
  if (shopName) shopName.textContent = state.settings.shopName;
  const navCount = document.getElementById('productNavCount');
  if (navCount) navCount.textContent = state.products.length;
  const days = licenseDays();
  const licenseText = document.getElementById('sidebarLicenseText');
  if (licenseText) licenseText.textContent = days < 0 ? 'License expired' : `${days} days left`;
  const progress = document.getElementById('sidebarLicenseProgress');
  if (progress) progress.style.width = `${Math.min(100, Math.max(4, Math.round((days / planDays(state.license.plan)) * 100)))}%`;
  const renewal = document.querySelector('.license-mini small');
  if (renewal) renewal.textContent = days < 0 ? 'Renew to keep selling' : `Renews ${formatDate(state.license.expiresAt)}`;
  hydrateIcons(document);
}

function renderPage() {
  switch (state.view) {
    case 'sale': return renderSale();
    case 'products': return renderProducts(false);
    case 'stock': return renderProducts(true);
    case 'customers': return renderCustomers();
    case 'reports': return renderReports();
    case 'licenses': return renderLicenses();
    case 'settings': return renderSettings();
    default: return renderDashboard();
  }
}

function pageHeading(eyebrow, title, description, actions = '', extraClass = '') {
  return `<div class="page-heading ${extraClass}">
    <div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>
    ${actions ? `<div class="heading-actions">${actions}</div>` : ''}
  </div>`;
}

function renderDashboard() {
  const todaysSales = state.sales.filter((sale) => today(sale.createdAt));
  const todayRevenue = todaysSales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const todayItems = saleItemsCount(todaysSales);
  const weekSales = recentSales(7);
  const previousWeek = state.sales.filter((sale) => {
    const age = (Date.now() - new Date(sale.createdAt).getTime()) / DAY;
    return age >= 7 && age < 14;
  });
  const weekRevenue = weekSales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const previousRevenue = previousWeek.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const revenueChange = previousRevenue ? ((weekRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const topProducts = getTopProducts(5);
  const alerts = lowStockProducts().sort((a, b) => a.stock - b.stock).slice(0, 5);
  const lowCount = lowStockProducts().length;
  const dueCount = state.customers.filter((customer) => Number(customer.balance || 0) > 0).length;
  const datesLabel = new Intl.DateTimeFormat('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const chartDays = state.filters.dashboardPeriod === '30d' ? 30 : 7;

  return `${pageHeading(`Good morning · ${datesLabel}`, `Welcome back, Hassan <span class="wave">✦</span>`, 'Here is the pulse of Naveed Auto Parts today.', `<button class="button" data-action="refresh"><span data-icon="refresh"></span>Refresh</button><button class="button primary" data-view="sale"><span data-icon="plus"></span>New sale <span class="button-key">F2</span></button>`)}
    <div class="stats-grid">
      ${statCard('Today\'s sales', formatMoney(todayRevenue), `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`, 'vs last week', 'dollar', 'teal', revenueChange >= 0)}
      ${statCard('Items sold', String(todayItems), '+8.2%', 'vs yesterday', 'cart', 'violet', true)}
      ${statCard('Inventory value', formatMoney(inventoryValue()), String(lowCount), 'items low in stock', 'box', 'orange', null)}
      ${statCard('Receivables', formatMoney(receivables()), String(dueCount), 'customers have dues', 'users', 'blue', null)}
    </div>
    <div class="dashboard-grid">
      <section class="card chart-card">
        <div class="card-header"><div><h2 class="card-title">Sales performance</h2><p class="card-subtitle">Gross sales collected · ${chartDays === 7 ? 'last 7 days' : 'last 30 days'}</p></div><div class="chart-tabs"><button class="${chartDays === 7 ? 'active' : ''}" data-action="dashboard-period" data-period="7d">7D</button><button class="${chartDays === 30 ? 'active' : ''}" data-action="dashboard-period" data-period="30d">30D</button></div></div>
        <div class="chart-wrap">${salesChartSvg(chartDays)}</div>
        <div class="chart-legend"><span class="legend-item"><i class="legend-dot"></i>Sales revenue</span><span class="legend-item"><i class="legend-dot secondary"></i>Previous period</span><span class="legend-item" style="margin-left:auto;color:#263248;font-weight:700">${shortMoney(weekRevenue)} <small style="color:#16a56f;font-weight:500">${revenueChange >= 0 ? '↑' : '↓'} ${Math.abs(revenueChange).toFixed(1)}%</small></span></div>
      </section>
      <section class="card top-products-card"><div class="list-header"><div><h2 class="card-title">Top selling parts</h2><p class="card-subtitle">By units sold this month</p></div><button class="text-link" data-view="reports">View report</button></div><div class="product-rank-list">${topProducts.map((item, index) => topProductRow(item, index)).join('')}</div></section>
    </div>
    <div class="dashboard-grid">
      <section class="card section-card"><div class="card-header"><div><h2 class="card-title">Recent sales</h2><p class="card-subtitle">Latest invoices from your counter</p></div><button class="text-link" data-view="reports">View all sales <span data-icon="arrow-right"></span></button></div>${salesTable(state.sales.slice(0, 5))}</section>
      <section class="card section-card"><div class="card-header"><div><h2 class="card-title">Stock alerts</h2><p class="card-subtitle">Reorder before you run out</p></div><button class="text-link" data-view="stock">Manage stock</button></div><div class="table-wrap"><table><thead><tr><th>Part</th><th>Available</th><th>Level</th></tr></thead><tbody>${alerts.length ? alerts.map(stockAlertRow).join('') : `<tr><td colspan="3"><div class="empty-state"><strong>All clear</strong>No low stock items right now.</div></td></tr>`}</tbody></table></div></section>
    </div>`;
}

function statCard(label, value, change, note, iconName, tone, positive) {
  const trend = positive === null ? '' : `<span class="${positive ? 'trend-up' : 'trend-down'}">${change}</span>`;
  return `<article class="stat-card ${tone}"><div class="stat-top"><span>${label}</span><span class="stat-icon" data-icon="${iconName}"></span></div><div class="stat-value">${value}</div><div class="stat-foot">${trend}<span>${note}</span></div></article>`;
}

function getTopProducts(limit = 5) {
  const quantities = {};
  state.sales.forEach((sale) => sale.items.forEach((item) => { quantities[item.productId] = (quantities[item.productId] || 0) + Number(item.qty || 0); }));
  return Object.entries(quantities).map(([productId, qty]) => ({ product: productById(productId), qty })).filter((row) => row.product).sort((a, b) => b.qty - a.qty).slice(0, limit);
}

function topProductRow(item, index) {
  const p = item.product;
  const tone = p.tone || 'teal';
  return `<div class="product-rank"><span class="rank-number">0${index + 1}</span><span class="part-avatar ${tone}">${escapeHTML(p.initials)}</span><div class="rank-info"><strong>${escapeHTML(p.name)}</strong><span>${escapeHTML(p.models.join(' · '))}</span></div><div class="rank-sales"><strong>${item.qty} sold</strong><span>${formatMoney(p.price * item.qty)}</span></div></div>`;
}

function salesChartData(days) {
  const values = [];
  const labels = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * DAY);
    const key = date.toDateString();
    const total = state.sales.filter((sale) => new Date(sale.createdAt).toDateString() === key).reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
    values.push(total);
    labels.push(days === 7 ? new Intl.DateTimeFormat('en-PK', { weekday: 'short' }).format(date) : (i % 5 === 0 || i === 0 ? new Intl.DateTimeFormat('en-PK', { day: 'numeric', month: 'short' }).format(date) : ''));
  }
  return { values, labels };
}

function salesChartSvg(days = 7, compact = false) {
  const { values, labels } = salesChartData(days);
  const width = 740;
  const height = compact ? 170 : 220;
  const left = 37;
  const right = 10;
  const top = 15;
  const bottom = 29;
  const max = Math.max(...values, 1000) * 1.22;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const points = values.map((value, index) => ({ x: left + (index / Math.max(1, values.length - 1)) * chartWidth, y: top + chartHeight - (value / max) * chartHeight, value }));
  const path = points.map((p, index) => `${index ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L${points[points.length - 1].x.toFixed(1)},${top + chartHeight} L${points[0].x.toFixed(1)},${top + chartHeight} Z`;
  const grid = [0, 1, 2, 3].map((line) => {
    const y = top + (line / 3) * chartHeight;
    return `<line class="chart-grid-line" x1="${left}" y1="${y}" x2="${width - right}" y2="${y}"/><text class="chart-label" x="0" y="${y + 3}">${shortMoney(max - (max / 3) * line).replace('Rs. ', '')}</text>`;
  }).join('');
  const labelStep = days > 7 ? 5 : 1;
  const xLabels = labels.map((label, index) => label && (days <= 7 || index % labelStep === 0 || index === labels.length - 1) ? `<text class="chart-label" x="${points[index].x}" y="${height - 6}" text-anchor="middle">${escapeHTML(label)}</text>` : '').join('');
  const circles = points.map((point, index) => (days <= 7 || index === points.length - 1) ? `<circle class="chart-point" cx="${point.x}" cy="${point.y}" r="3.5"/>` : '').join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Sales trend chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#13b8a6" stop-opacity=".2"/><stop offset="1" stop-color="#13b8a6" stop-opacity="0"/></linearGradient></defs>${grid}<path class="chart-area" d="${area}"/><path class="chart-line" d="${path}"/>${circles}${xLabels}</svg>`;
}

function salesTable(sales) {
  if (!sales.length) return `<div class="empty-state"><strong>No sales yet</strong>Complete your first sale to see it here.</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>Invoice</th><th>Customer</th><th>Time</th><th>Payment</th><th class="align-right">Total</th><th></th></tr></thead><tbody>${sales.map((sale) => `<tr><td><span class="invoice-id">${escapeHTML(sale.id)}</span></td><td><div class="table-primary"><span class="customer-avatar">${escapeHTML(initials(sale.customerName))}</span><div><strong>${escapeHTML(sale.customerName)}</strong><span>${sale.items.reduce((s, i) => s + i.qty, 0)} item${sale.items.reduce((s, i) => s + i.qty, 0) === 1 ? '' : 's'}</span></div></div></td><td>${formatTime(sale.createdAt)}<span style="display:block;color:#a0a8b4;font-size:9px">${today(sale.createdAt) ? 'Today' : formatDate(sale.createdAt)}</span></td><td><span class="status-pill ${sale.status === 'Credit' ? 'credit' : 'paid'}">${escapeHTML(sale.payment)}</span></td><td style="text-align:right;color:#263248;font-weight:700">${formatMoney(sale.amount)}</td><td><button class="action-menu-button" data-action="view-sale" data-id="${escapeHTML(sale.id)}" aria-label="View invoice">${icon('arrow-up-right', 'sm')}</button></td></tr>`).join('')}</tbody></table></div>`;
}

function stockAlertRow(product) {
  const out = Number(product.stock) === 0;
  return `<tr><td><div class="table-primary"><span class="part-avatar ${escapeHTML(product.tone || 'teal')}">${escapeHTML(product.initials)}</span><div><strong>${escapeHTML(product.name)}</strong><span>${escapeHTML(product.models[0])} · ${escapeHTML(product.sku)}</span></div></div></td><td><span class="stock-value ${out ? 'out' : 'low'}">${product.stock} ${escapeHTML(product.unit)}${product.stock === 1 ? '' : 's'}</span></td><td><span class="status-pill ${out ? 'out' : 'low'}">${out ? 'Out of stock' : `Reorder at ${product.reorder}`}</span></td></tr>`;
}

function renderSale() {
  const search = (state.filters.productSearch || '').toLowerCase().trim();
  const model = state.filters.model || 'All bikes';
  const filtered = state.products.filter((product) => {
    const matchesSearch = !search || [product.name, product.brand, product.sku, product.barcode, product.category, ...product.models].join(' ').toLowerCase().includes(search);
    const matchesModel = model === 'All bikes' || product.models.includes(model);
    return matchesSearch && matchesModel;
  });
  const models = ['All bikes', 'CD 70', 'CG 125', 'Pridor', 'YBR 125', 'YBR 125G', 'GS 150', 'GD 110S', 'United US 70'];
  const saleCustomer = state.saleCustomerId || 'c001';
  const customerOptions = state.customers.map((customer) => `<option value="${escapeHTML(customer.id)}" ${customer.id === saleCustomer ? 'selected' : ''}>${escapeHTML(customer.name)}${customer.balance ? ` · Due ${formatMoney(customer.balance)}` : ''}</option>`).join('');
  return `${pageHeading(`Counter · ${formatDate(new Date())}`, 'New sale', 'Find a part, add it to the cart, and collect payment.', `<button class="button" data-action="hold-sale"><span data-icon="receipt"></span>Hold sale</button><button class="button primary" data-action="focus-sale-search"><span data-icon="scan"></span>Scan / search</button>`, 'pos-heading')}
    <div class="pos-layout">
      <section class="card catalog-card">
        <div class="catalog-toolbar"><div class="search-field"><span data-icon="search"></span><input id="saleSearch" type="search" autocomplete="off" value="${escapeHTML(state.filters.productSearch)}" placeholder="Search by part name, SKU or barcode"/><kbd class="search-shortcut">F2</kbd></div><div class="filter-row">${models.map((item) => `<button class="filter-chip ${item === model ? 'active' : ''}" data-action="sale-model" data-model="${escapeHTML(item)}">${escapeHTML(item)}</button>`).join('')}</div></div>
        <div class="catalog-head"><strong>Popular parts</strong><span>${filtered.length} of ${state.products.length} parts · Prices in PKR</span></div>
        <div class="product-grid">${filtered.length ? filtered.map(productCard).join('') : `<div class="empty-state" style="grid-column:1/-1"><strong>No matching parts</strong>Try another name, SKU or bike model.</div>`}</div>
      </section>
      <aside class="card cart-card">
        <div class="cart-header"><div><h2>Current sale</h2><span class="cart-number">Draft · ${String(state.cart.length).padStart(2, '0')} line${state.cart.length === 1 ? '' : 's'}</span></div>${state.cart.length ? `<button class="text-link" data-action="clear-cart">Clear all</button>` : ''}</div>
        <div class="cart-customer"><label class="field-label" for="saleCustomer">Customer</label><div style="display:flex;gap:6px"><div class="select-wrap" style="flex:1"><select id="saleCustomer">${customerOptions}</select><span data-icon="chevron-down"></span></div><button class="icon-button" style="border:1px solid var(--line);width:36px;height:36px" data-action="open-add-customer" aria-label="Add customer"><span data-icon="plus"></span></button></div></div>
        <div class="cart-items">${state.cart.length ? state.cart.map(cartItem).join('') : `<div class="empty-state"><div style="width:42px;height:42px;background:var(--teal-soft);color:var(--teal-dark);border-radius:12px;display:grid;place-items:center;margin:0 auto 12px">${icon('cart')}</div><strong>Your cart is empty</strong>Search for a part or scan a barcode to get started.</div>`}</div>
        <div class="cart-summary"><div class="summary-line"><span>Subtotal</span><strong>${formatMoney(cartSubtotal())}</strong></div><div class="summary-line"><span>Discount</span><div class="discount-input"><span style="color:#a0a8b4">Rs.</span><input id="discountInput" type="number" min="0" max="${cartSubtotal()}" value="${Number(state.discount || 0)}" aria-label="Discount"/></div></div><div class="summary-line"><span>Tax <small style="color:#b2bac5">(${state.settings.taxEnabled ? `${state.settings.taxRate}%` : 'off'})</small></span><strong>${formatMoney(state.settings.taxEnabled ? ((cartSubtotal() - Number(state.discount || 0)) * Number(state.settings.taxRate || 0) / 100) : 0)}</strong></div><div class="summary-line total"><span>Total payable</span><strong>${formatMoney(cartTotal())}</strong></div><div class="payment-label">Payment method</div><div class="payment-methods">${['Cash', 'Easypaisa', 'JazzCash', 'Credit'].map((payment) => `<button class="payment-method ${state.paymentMethod === payment ? 'active' : ''}" data-action="sale-payment" data-payment="${payment}">${payment}</button>`).join('')}</div><button class="button primary full" data-action="open-checkout" ${state.cart.length ? '' : 'disabled'}><span data-icon="arrow-right"></span>Review & complete sale</button></div>
      </aside>
    </div>`;
}

function productCard(product) {
  const out = Number(product.stock) <= 0;
  const low = Number(product.stock) <= Number(product.reorder);
  return `<article class="product-card"><div class="product-card-top"><span class="part-avatar ${escapeHTML(product.tone || 'teal')}">${escapeHTML(product.initials)}</span><span class="product-tag">${escapeHTML(product.category)}</span></div><h3>${escapeHTML(product.name)}</h3><div class="compatibility">${escapeHTML(product.brand)} · ${escapeHTML(product.models.join(', '))}</div><div class="product-card-bottom"><div class="product-card-price"><strong>${formatMoney(product.price)}</strong><span class="${out ? 'trend-down' : low ? '' : 'trend-up'}">${out ? 'Out of stock' : `${product.stock} ${product.unit}${product.stock === 1 ? '' : 's'} available`}</span></div><button class="add-button" data-action="add-to-cart" data-id="${escapeHTML(product.id)}" aria-label="Add ${escapeHTML(product.name)}" ${out ? 'disabled' : ''}>${icon('plus', 'sm')}</button></div></article>`;
}

function cartItem(item) {
  const product = productById(item.productId) || { name: 'Unknown part', initials: '?', tone: 'teal', unit: 'piece', stock: 0 };
  return `<div class="cart-item"><span class="part-avatar ${escapeHTML(product.tone || 'teal')}">${escapeHTML(product.initials)}</span><div class="cart-item-info"><strong>${escapeHTML(product.name)}</strong><span>${formatMoney(item.price)} / ${escapeHTML(product.unit)}</span><div class="qty-control"><button data-action="cart-decrease" data-id="${escapeHTML(item.productId)}" aria-label="Decrease quantity">${icon('minus', 'sm')}</button><span>${item.qty}</span><button data-action="cart-increase" data-id="${escapeHTML(item.productId)}" aria-label="Increase quantity">${icon('plus', 'sm')}</button></div></div><div class="cart-item-total"><strong>${formatMoney(item.price * item.qty)}</strong><button class="remove-item" data-action="remove-cart" data-id="${escapeHTML(item.productId)}" aria-label="Remove item">${icon('x', 'sm')}</button></div></div>`;
}

function renderProducts(stockOnly = false) {
  const isStock = stockOnly;
  const query = (state.filters.inventorySearch || '').toLowerCase().trim();
  const category = state.filters.inventoryCategory || 'All categories';
  const model = state.filters.inventoryModel || 'All models';
  const products = state.products.filter((product) => {
    const matchesQuery = !query || [product.name, product.brand, product.sku, product.barcode, ...product.models].join(' ').toLowerCase().includes(query);
    const matchesCategory = category === 'All categories' || product.category === category;
    const matchesModel = model === 'All models' || product.models.includes(model);
    const matchesStock = !isStock || Number(product.stock) <= Number(product.reorder);
    return matchesQuery && matchesCategory && matchesModel && matchesStock;
  });
  const out = state.products.filter((product) => Number(product.stock) === 0).length;
  const low = lowStockProducts().length;
  const actions = `<button class="button" data-action="export-products"><span data-icon="download"></span>Export CSV</button><button class="button primary" data-action="open-add-product"><span data-icon="plus"></span>Add product</button>`;
  const categories = ['All categories', ...new Set(state.products.map((product) => product.category))];
  const models = ['All models', ...new Set(state.products.flatMap((product) => product.models))];
  return `${pageHeading(isStock ? 'Inventory · Reorder queue' : `Catalog · ${state.products.length} active SKUs`, isStock ? 'Stock control' : 'Products', isStock ? 'See what needs replenishing and keep every fast-moving part available.' : 'Manage your parts catalog, prices, and stock levels from one place.', actions)}
    <div class="page-stat-strip"><div class="mini-stat"><div class="mini-stat-label">Catalog value <span data-icon="box"></span></div><strong class="mini-stat-value">${formatMoney(inventoryValue())}</strong><span class="mini-stat-note">At purchase cost</span></div><div class="mini-stat"><div class="mini-stat-label">Active SKUs <span data-icon="layers"></span></div><strong class="mini-stat-value">${state.products.length}</strong><span class="mini-stat-note">Across ${categories.length - 1} categories</span></div><div class="mini-stat"><div class="mini-stat-label">Low stock <span data-icon="warning"></span></div><strong class="mini-stat-value" style="color:${low ? '#d47d19' : 'var(--green)'}">${low}</strong><span class="mini-stat-note">Need a reorder</span></div><div class="mini-stat"><div class="mini-stat-label">Out of stock <span data-icon="minus"></span></div><strong class="mini-stat-value" style="color:${out ? 'var(--red)' : 'var(--green)'}">${out}</strong><span class="mini-stat-note">Unavailable today</span></div></div>
    <section class="card section-card"><div class="toolbar-row"><div class="toolbar-left"><div class="inline-search"><span data-icon="search"></span><input id="inventorySearch" type="search" value="${escapeHTML(query)}" placeholder="Search name, SKU or barcode"/></div><select id="inventoryCategory" class="filter-select">${categories.map((item) => `<option ${item === category ? 'selected' : ''}>${escapeHTML(item)}</option>`).join('')}</select><select id="inventoryModel" class="filter-select">${models.map((item) => `<option ${item === model ? 'selected' : ''}>${escapeHTML(item)}</option>`).join('')}</select></div><div class="toolbar-right"><span style="font-size:10px;color:#98a2b3">Showing ${products.length} parts</span></div></div>${productTable(products)}</section>`;
}

function productTable(products) {
  if (!products.length) return `<div class="empty-state"><strong>No products found</strong>Adjust your filters or add a new part to the catalog.</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>Part / SKU</th><th>Bike fitment</th><th>Category</th><th>Sell price</th><th>In stock</th><th>Reorder at</th><th></th></tr></thead><tbody>${products.map((product) => { const stock = Number(product.stock); const level = stock === 0 ? 'out' : stock <= product.reorder ? 'low' : ''; return `<tr><td><div class="table-product"><span class="part-avatar ${escapeHTML(product.tone || 'teal')}">${escapeHTML(product.initials)}</span><div><strong>${escapeHTML(product.name)}</strong><span>${escapeHTML(product.brand)} · ${escapeHTML(product.sku)}</span></div></div></td><td><span style="font-size:10px;color:#667085">${escapeHTML(product.models.join(', '))}</span></td><td><span class="product-tag">${escapeHTML(product.category)}</span></td><td><strong style="color:#263248;font-size:11px">${formatMoney(product.price)}</strong><span style="display:block;color:#a0a8b4;font-size:9px">Cost ${formatMoney(product.cost)}</span></td><td><span class="stock-value ${level}">${stock} ${escapeHTML(product.unit)}${stock === 1 ? '' : 's'}</span></td><td><span style="font-size:10px;color:#8b95a5">${product.reorder} ${escapeHTML(product.unit)}${product.reorder === 1 ? '' : 's'}</span></td><td><button class="action-menu-button" data-action="product-actions" data-id="${escapeHTML(product.id)}" aria-label="Actions for ${escapeHTML(product.name)}">${icon('more', 'sm')}</button></td></tr>`; }).join('')}</tbody></table></div>`;
}

function renderCustomers() {
  const query = (state.filters.customerSearch || '').toLowerCase().trim();
  const customers = state.customers.filter((customer) => !query || [customer.name, customer.phone, customer.city].join(' ').toLowerCase().includes(query));
  const totalCustomers = state.customers.length;
  const dueCustomers = state.customers.filter((customer) => Number(customer.balance) > 0);
  const totalDue = dueCustomers.reduce((sum, customer) => sum + Number(customer.balance), 0);
  return `${pageHeading('Relationships · Credit ledger', 'Customers', 'Keep workshop accounts, phone numbers, and outstanding credit in view.', `<button class="button" data-action="export-customers"><span data-icon="download"></span>Export list</button><button class="button primary" data-action="open-add-customer"><span data-icon="plus"></span>Add customer</button>`)}
    <div class="page-stat-strip"><div class="mini-stat"><div class="mini-stat-label">Total customers <span data-icon="users"></span></div><strong class="mini-stat-value">${totalCustomers}</strong><span class="mini-stat-note">${state.customers.filter((c) => c.lastPurchase === 'Today').length} purchased today</span></div><div class="mini-stat"><div class="mini-stat-label">Credit accounts <span data-icon="receipt"></span></div><strong class="mini-stat-value">${dueCustomers.length}</strong><span class="mini-stat-note">Active customers with dues</span></div><div class="mini-stat"><div class="mini-stat-label">Total receivables <span data-icon="dollar"></span></div><strong class="mini-stat-value" style="color:#d47d19">${formatMoney(totalDue)}</strong><span class="mini-stat-note">Awaiting collection</span></div><div class="mini-stat"><div class="mini-stat-label">Average account <span data-icon="chart"></span></div><strong class="mini-stat-value">${formatMoney(dueCustomers.length ? totalDue / dueCustomers.length : 0)}</strong><span class="mini-stat-note">Per credit customer</span></div></div>
    <section class="card section-card"><div class="toolbar-row"><div class="toolbar-left"><div class="inline-search"><span data-icon="search"></span><input id="customerSearch" type="search" value="${escapeHTML(query)}" placeholder="Search name, phone or area"/></div></div><div class="toolbar-right"><span style="font-size:10px;color:#98a2b3">${customers.length} customers</span></div></div>${customerTable(customers)}</section>`;
}

function customerTable(customers) {
  if (!customers.length) return `<div class="empty-state"><strong>No customers found</strong>Try searching by a different name or phone number.</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>Customer</th><th>Phone</th><th>Area</th><th>Purchases</th><th>Outstanding</th><th>Last purchase</th><th></th></tr></thead><tbody>${customers.map((customer) => `<tr><td><div class="customer-cell"><span class="customer-avatar">${escapeHTML(initials(customer.name))}</span><div><strong style="font-size:11px;color:#263248">${escapeHTML(customer.name)}</strong><span style="display:block;font-size:9px;color:#98a2b3">${customer.id === 'c001' ? 'Default account' : 'Customer account'}</span></div></div></td><td>${customer.phone ? escapeHTML(customer.phone) : '<span style="color:#b4bdc8">Not added</span>'}</td><td>${escapeHTML(customer.city || '—')}</td><td>${customer.purchases || 0}</td><td><span class="balance ${customer.balance ? 'due' : 'clear'}">${customer.balance ? formatMoney(customer.balance) : 'Clear'}</span></td><td>${escapeHTML(customer.lastPurchase || '—')}</td><td><button class="action-menu-button" data-action="customer-actions" data-id="${escapeHTML(customer.id)}" aria-label="Actions for ${escapeHTML(customer.name)}">${icon('more', 'sm')}</button></td></tr>`).join('')}</tbody></table></div>`;
}

function renderReports() {
  const period = state.filters.reportPeriod || '7d';
  const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
  const sales = recentSales(days);
  const revenue = sales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const cash = sales.filter((sale) => sale.payment === 'Cash').reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const digital = sales.filter((sale) => ['Easypaisa', 'JazzCash'].includes(sale.payment)).reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const credit = sales.filter((sale) => sale.payment === 'Credit').reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const previous = state.sales.filter((sale) => { const age = (Date.now() - new Date(sale.createdAt).getTime()) / DAY; return age >= days && age < days * 2; }).reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
  const change = previous ? ((revenue - previous) / previous) * 100 : 100;
  const top = getTopProducts(5);
  return `${pageHeading(`Business intelligence · ${period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}`, 'Reports', 'Understand what is selling, what is owed, and where your margin is moving.', `<div class="chart-tabs"><button class="${period === '7d' ? 'active' : ''}" data-action="report-period" data-period="7d">7 days</button><button class="${period === '30d' ? 'active' : ''}" data-action="report-period" data-period="30d">30 days</button><button class="${period === '90d' ? 'active' : ''}" data-action="report-period" data-period="90d">90 days</button></div><button class="button" data-action="export-report"><span data-icon="download"></span>Export report</button>`)}
    <div class="stats-grid"><article class="stat-card"><div class="stat-top"><span>Gross sales</span><span class="stat-icon" data-icon="dollar"></span></div><div class="stat-value">${formatMoney(revenue)}</div><div class="stat-foot"><span class="${change >= 0 ? 'trend-up' : 'trend-down'}">${change >= 0 ? '+' : ''}${change.toFixed(1)}%</span><span>vs previous period</span></div></article><article class="stat-card violet"><div class="stat-top"><span>Invoices</span><span class="stat-icon" data-icon="receipt"></span></div><div class="stat-value">${sales.length}</div><div class="stat-foot"><span class="trend-up">${saleItemsCount(sales)}</span><span>parts sold</span></div></article><article class="stat-card orange"><div class="stat-top"><span>Average ticket</span><span class="stat-icon" data-icon="chart"></span></div><div class="stat-value">${formatMoney(sales.length ? revenue / sales.length : 0)}</div><div class="stat-foot"><span>Per invoice</span></div></article><article class="stat-card blue"><div class="stat-top"><span>Gross margin</span><span class="stat-icon" data-icon="bolt"></span></div><div class="stat-value">${formatMoney(estimateMargin(sales))}</div><div class="stat-foot"><span>Estimated from catalog cost</span></div></article></div>
    <div class="report-grid"><section class="card report-chart-card"><div class="card-header"><div><h2 class="card-title">Revenue trend</h2><p class="card-subtitle">Sales volume for the selected reporting period</p></div><span class="seller-badge"><span class="status-dot"></span>Live data</span></div><div class="report-chart-wrap">${salesChartSvg(days)}</div></section><section class="card"><div class="list-header"><div><h2 class="card-title">Payment mix</h2><p class="card-subtitle">How customers are paying</p></div></div><div class="breakdown-list">${breakdownRow('Cash', cash, revenue, 'dollar')}${breakdownRow('Easypaisa + JazzCash', digital, revenue, 'bolt')}${breakdownRow('Credit / account', credit, revenue, 'receipt')}${breakdownRow('Other', Math.max(0, revenue - cash - digital - credit), revenue, 'more')}</div><div class="report-summary"><div class="summary-line"><span>Total collected</span><strong>${formatMoney(cash + digital)}</strong></div><div class="summary-line"><span>On credit</span><strong style="color:#d47d19">${formatMoney(credit)}</strong></div></div></section></div>
    <section class="card section-card"><div class="card-header"><div><h2 class="card-title">Top parts by volume</h2><p class="card-subtitle">The products customers are asking for most</p></div></div>${salesTable(state.sales.slice(0, 6))}</section>`;
}

function estimateMargin(sales) {
  return sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => { const p = productById(item.productId); return itemSum + (Number(item.price) - Number(p?.cost || 0)) * Number(item.qty); }, 0), 0);
}

function breakdownRow(label, amount, total, iconName) {
  const width = total ? Math.max(2, Math.round((amount / total) * 100)) : 2;
  return `<div class="breakdown-row"><div class="breakdown-meta"><span><span data-icon="${iconName}" style="vertical-align:middle;margin-right:5px;color:#9aa3b1"></span>${label}</span><strong>${formatMoney(amount)} <small style="font-weight:400;color:#a0a8b4">${total ? Math.round((amount / total) * 100) : 0}%</small></strong></div><div class="breakdown-track"><span style="width:${width}%"></span></div></div>`;
}

function renderLicenses() {
  if (!isSeller()) return `${pageHeading('Restricted area', 'Seller access required', 'Only the seller / owner account can issue or revoke renewal keys.')}`;
  const days = licenseDays();
  const status = licenseStatus();
  const keyRows = state.generatedKeys.map((entry) => `<tr><td><div class="table-primary"><span class="part-avatar ${entry.plan === 'Annual' ? 'teal' : entry.plan === 'Half-yearly' ? 'purple' : 'amber'}">${entry.plan === 'Annual' ? 'A' : entry.plan === 'Half-yearly' ? '6M' : 'M'}</span><div><strong style="font-family:monospace;font-size:10px;letter-spacing:.02em">${escapeHTML(entry.key)}</strong><span>${escapeHTML(entry.shop)} · ${escapeHTML(entry.device || 'Unbound')}</span></div></div></td><td><span class="status-pill ${entry.status.toLowerCase() === 'active' ? 'active' : entry.status.toLowerCase() === 'revoked' ? 'revoked' : 'pending'}">${escapeHTML(entry.status)}</span></td><td>${escapeHTML(entry.plan)}</td><td>${formatDate(entry.issuedAt)}</td><td>${formatDate(entry.expiresAt)}</td><td><button class="action-menu-button" data-action="license-actions" data-id="${escapeHTML(entry.id)}" aria-label="License key actions">${icon('more', 'sm')}</button></td></tr>`).join('');
  return `${pageHeading('Seller console · Private controls', 'Licenses', 'Issue renewals for each shop terminal. Keys are only generated by the seller / owner account.', `<button class="button" data-action="open-activate-license"><span data-icon="key"></span>Activate key</button><button class="button primary" data-action="open-generate-license"><span data-icon="plus"></span>Generate renewal key</button>`)}
    <div class="license-hero"><section class="card current-license"><div class="license-card-top"><span class="license-card-label">Current workspace license</span><span class="plan-pill">${escapeHTML(state.license.plan)} · ${status}</span></div><h2>${days < 0 ? 'License expired' : `${days} days remaining`}</h2><p>${escapeHTML(state.license.shop)} · ${escapeHTML(state.license.device)}</p><div class="license-bottom"><div><strong>Renews ${formatDateLong(state.license.expiresAt)}</strong><span>Issued ${formatDate(state.license.issuedAt)} by ${escapeHTML(state.currentUser.name)}</span></div><span class="license-key-mask">${maskKey(state.license.key)}</span></div></section><section class="card plan-card"><h3>Renewal plans</h3><p>Generate a signed key for a shop or terminal.</p>${planOption('Monthly', '30 days', 'Rs. 2,499', false)}${planOption('Half-yearly', '182 days · save 20%', 'Rs. 11,999', false)}${planOption('Annual', '365 days · save 33%', 'Rs. 19,999', true)}<div class="info-callout"><span data-icon="shield"></span><span>Seller-only control. Generated keys are logged with issuer, terminal, and expiry for audit.</span></div></section></div>
    <section class="card license-table-card"><div class="card-header"><div><h2 class="card-title">Issued renewal keys</h2><p class="card-subtitle">${state.generatedKeys.length} keys in this workspace · keys should be shared securely with the customer</p></div><span class="seller-badge"><span data-icon="lock"></span>Seller only</span></div><div class="table-wrap"><table><thead><tr><th>Key / terminal</th><th>Status</th><th>Plan</th><th>Issued</th><th>Expires</th><th></th></tr></thead><tbody>${keyRows || `<tr><td colspan="6"><div class="empty-state"><strong>No keys generated</strong>Generate a plan above to issue the first renewal key.</div></td></tr>`}</tbody></table></div></section>`;
}

function planOption(plan, duration, price, selected) {
  return `<div class="plan-option ${selected ? 'selected' : ''}"><div class="plan-copy"><span class="radio-dot"></span><div><strong>${plan}</strong><span>${duration}</span></div></div><span class="plan-price">${price} <small>/term</small></span></div>`;
}

function maskKey(key) {
  const pieces = String(key || '').split('-');
  if (pieces.length < 3) return '••••••••';
  return `${pieces[0]}-${pieces[1]}-••••-••••-${pieces[pieces.length - 1]}`;
}

function renderSettings() {
  const s = state.settings;
  return `${pageHeading('Control centre · Seller / owner', 'Admin settings', 'Configure the shop profile, receipt rules, team access, and local workspace tools.', `<button class="button" data-action="download-backup"><span data-icon="download"></span>Backup data</button><button class="button primary" data-action="save-settings-shortcut"><span data-icon="check"></span>Save changes</button>`)}
    <div class="settings-grid"><div><section class="card settings-card"><h2>Shop profile</h2><p>This information appears on receipts and customer invoices.</p><form data-form="settings"><div class="form-grid"><div class="form-field"><label for="shopName">Shop name</label><input class="form-input" id="shopName" name="shopName" value="${escapeHTML(s.shopName)}" required /></div><div class="form-field"><label for="shopPhone">Phone / WhatsApp</label><input class="form-input" id="shopPhone" name="phone" value="${escapeHTML(s.phone)}" placeholder="03xx xxx xxxx" /></div><div class="form-field"><label for="shopCity">City</label><input class="form-input" id="shopCity" name="city" value="${escapeHTML(s.city)}" /></div><div class="form-field"><label for="shopNtn">NTN / tax number</label><input class="form-input" id="shopNtn" name="ntn" value="${escapeHTML(s.ntn)}" placeholder="Optional" /></div><div class="form-field full-width"><label for="shopAddress">Address</label><input class="form-input" id="shopAddress" name="address" value="${escapeHTML(s.address)}" /></div><div class="form-field full-width"><label for="receiptFooter">Receipt footer</label><textarea class="form-textarea" id="receiptFooter" name="receiptFooter">${escapeHTML(s.receiptFooter)}</textarea></div><div class="form-field"><label for="taxRate">Tax rate (%)</label><input class="form-input" id="taxRate" name="taxRate" type="number" min="0" max="100" step="0.1" value="${escapeHTML(s.taxRate)}" /></div></div><div class="form-actions"><button class="button" type="reset">Reset</button><button class="button primary" type="submit">Save shop profile</button></div></form></section><section class="card settings-card" style="margin-top:16px"><h2>Sales & receipt preferences</h2><p>Set how DukanPilot behaves at the counter.</p><div class="toggle-row"><div class="toggle-copy"><strong>Tax on receipts</strong><span>Apply a tax rate to new sales</span></div><button class="toggle ${s.taxEnabled ? 'on' : ''}" data-action="toggle-setting" data-setting="taxEnabled" aria-label="Toggle tax"><span></span></button></div><div class="toggle-row"><div class="toggle-copy"><strong>Low stock alerts</strong><span>Show reorder warnings across the workspace</span></div><button class="toggle ${s.lowStockAlerts ? 'on' : ''}" data-action="toggle-setting" data-setting="lowStockAlerts" aria-label="Toggle low stock alerts"><span></span></button></div><div class="toggle-row"><div class="toggle-copy"><strong>Automatic local backup</strong><span>Keep a backup snapshot in this browser</span></div><button class="toggle ${s.autoBackup ? 'on' : ''}" data-action="toggle-setting" data-setting="autoBackup" aria-label="Toggle automatic backup"><span></span></button></div><div class="toggle-row"><div class="toggle-copy"><strong>License enforcement</strong><span>Prevent new sales after license expiry</span></div><button class="toggle ${s.licenseEnforcement ? 'on' : ''}" data-action="toggle-setting" data-setting="licenseEnforcement" aria-label="Toggle license enforcement"><span></span></button></div></section></div><div><section class="card settings-card team-card"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h2>Team & permissions</h2><p>Seller access is required to issue license keys and change controls.</p></div><button class="button small" data-action="invite-user"><span data-icon="plus"></span>Invite</button></div><div class="table-wrap"><table class="team-table"><thead><tr><th>User</th><th>Role</th><th>Status</th></tr></thead><tbody>${state.users.map((user) => `<tr><td><div class="customer-cell"><span class="customer-avatar">${escapeHTML(initials(user.name))}</span><div><strong style="font-size:10px;color:#263248">${escapeHTML(user.name)}</strong><span style="display:block;font-size:9px;color:#98a2b3">${escapeHTML(user.email)}</span></div></div></td><td><span class="role-badge ${user.role}">${user.role === 'seller' ? 'Seller / Owner' : 'Staff'}</span></td><td><span class="status-pill active">${escapeHTML(user.status)}</span></td></tr>`).join('')}</tbody></table></div><div class="permission-list" style="margin-top:14px"><div class="permission-item"><span data-icon="key"></span><div><strong>License keys</strong><span>Seller only · generate, activate, revoke</span></div></div><div class="permission-item"><span data-icon="dollar"></span><div><strong>Pricing & stock</strong><span>Seller and staff · edit catalog and receive stock</span></div></div><div class="permission-item"><span data-icon="chart"></span><div><strong>Reports & exports</strong><span>Seller and staff · view business performance</span></div></div></div></section><section class="card settings-card" style="margin-top:16px"><h2>Workspace tools</h2><p>Take your data with you or review sensitive activity.</p><div class="data-tools"><button class="tool-button" data-action="download-backup"><span data-icon="download"></span><div><strong>Download workspace backup</strong><span>Products, customers, sales, and settings as JSON</span></div></button><button class="tool-button" data-action="export-products"><span data-icon="file"></span><div><strong>Export product catalog</strong><span>CSV ready for your accountant or supplier</span></div></button><button class="tool-button" data-action="view-audit"><span data-icon="shield"></span><div><strong>View audit activity</strong><span>See who changed important workspace records</span></div></button></div></section></div></div>`;
}

function openModal(markup, className = '') {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="modal-overlay" data-action="modal-overlay"><div class="modal ${className}" role="dialog" aria-modal="true">${markup}</div></div>`;
  hydrateIcons(root);
  const first = root.querySelector('input, select, textarea, button');
  if (first) setTimeout(() => first.focus(), 20);
}

function closeModal() { const root = document.getElementById('modalRoot'); if (root) root.innerHTML = ''; }

function modalHeader(title, description = '') {
  return `<div class="modal-head"><div><h2>${title}</h2>${description ? `<p>${description}</p>` : ''}</div><button class="close-button" data-action="close-modal" aria-label="Close">${icon('x', 'sm')}</button></div>`;
}

function openAddProductModal(productId = '') {
  const product = productId ? productById(productId) : null;
  const editing = Boolean(product);
  const p = product || { name: '', brand: '', models: [], category: 'Engine', sku: '', barcode: '', price: '', cost: '', stock: 0, reorder: 5, unit: 'piece' };
  const categories = ['Engine', 'Transmission', 'Electrical', 'Brake', 'Suspension', 'Controls', 'Consumables', 'Body', 'Wheels', 'Other'];
  openModal(`${modalHeader(editing ? 'Edit product' : 'Add product', editing ? 'Update the part details and selling price.' : 'Add a bike part to your counter catalog.')}
    <form data-form="product" data-id="${escapeHTML(productId)}"><div class="modal-body"><div class="form-grid"><div class="form-field full-width"><label for="productName">Part name *</label><input class="form-input" id="productName" name="name" value="${escapeHTML(p.name)}" placeholder="e.g. Clutch Plate Set" required /></div><div class="form-field"><label for="productBrand">Brand</label><input class="form-input" id="productBrand" name="brand" value="${escapeHTML(p.brand)}" placeholder="Honda Genuine" /></div><div class="form-field"><label for="productCategory">Category *</label><select class="form-select" id="productCategory" name="category">${categories.map((item) => `<option ${item === p.category ? 'selected' : ''}>${item}</option>`).join('')}</select></div><div class="form-field full-width"><label for="productModels">Bike fitment *</label><input class="form-input" id="productModels" name="models" value="${escapeHTML((p.models || []).join(', '))}" placeholder="CD 70, CG 125" required /><span class="form-note">Separate multiple models with commas. Use the common local model name.</span></div><div class="form-field"><label for="productSku">SKU *</label><input class="form-input" id="productSku" name="sku" value="${escapeHTML(p.sku)}" placeholder="HND-ENG-001" required /></div><div class="form-field"><label for="productBarcode">Barcode</label><input class="form-input" id="productBarcode" name="barcode" value="${escapeHTML(p.barcode)}" placeholder="Optional" /></div><div class="form-field"><label for="productPrice">Selling price (PKR) *</label><input class="form-input" id="productPrice" name="price" type="number" min="0" step="1" value="${escapeHTML(p.price)}" required /></div><div class="form-field"><label for="productCost">Purchase cost (PKR)</label><input class="form-input" id="productCost" name="cost" type="number" min="0" step="1" value="${escapeHTML(p.cost)}" /></div><div class="form-field"><label for="productStock">Opening stock</label><input class="form-input" id="productStock" name="stock" type="number" min="0" step="1" value="${escapeHTML(p.stock)}" ${editing ? 'readonly' : ''} /></div><div class="form-field"><label for="productReorder">Reorder level</label><input class="form-input" id="productReorder" name="reorder" type="number" min="0" step="1" value="${escapeHTML(p.reorder)}" /></div><div class="form-field"><label for="productUnit">Selling unit</label><select class="form-select" id="productUnit" name="unit">${['piece', 'pair', 'set', 'kit', 'bottle', 'box'].map((item) => `<option ${item === p.unit ? 'selected' : ''}>${item}</option>`).join('')}</select></div></div>${editing ? '<p class="form-note">Opening stock is locked while editing. Use Stock control to receive or issue inventory.</p>' : ''}</div><div class="modal-footer"><button class="button" type="button" data-action="close-modal">Cancel</button><button class="button primary" type="submit">${editing ? 'Save product' : 'Add to catalog'}</button></div></form>`, 'wide');
}

function openAdjustStockModal(productId) {
  const product = productById(productId);
  if (!product) return;
  openModal(`${modalHeader('Adjust stock', `${escapeHTML(product.name)} · ${escapeHTML(product.models.join(', '))}`)}<form data-form="adjust-stock" data-id="${escapeHTML(product.id)}"><div class="modal-body"><div class="key-display" style="display:flex;align-items:center;text-align:left;gap:12px;margin-bottom:17px;padding:12px"><span class="part-avatar ${escapeHTML(product.tone || 'teal')}">${escapeHTML(product.initials)}</span><div><strong style="font-size:12px;letter-spacing:0">${product.stock} ${escapeHTML(product.unit)} currently in stock</strong><span style="text-align:left">Reorder level: ${product.reorder} ${escapeHTML(product.unit)}${product.reorder === 1 ? '' : 's'}</span></div></div><div class="form-grid"><div class="form-field"><label for="stockAction">Action</label><select class="form-select" id="stockAction" name="action"><option value="receive">Receive stock</option><option value="issue">Issue / damage</option></select></div><div class="form-field"><label for="stockQuantity">Quantity *</label><input class="form-input" id="stockQuantity" name="quantity" type="number" min="1" step="1" value="1" required /></div><div class="form-field full-width"><label for="stockNote">Note</label><input class="form-input" id="stockNote" name="note" placeholder="Supplier invoice or reason" /></div></div></div><div class="modal-footer"><button class="button" type="button" data-action="close-modal">Cancel</button><button class="button primary" type="submit">Update stock</button></div></form>`);
}

function openCustomerModal(customerId = '') {
  const customer = customerId ? customerById(customerId) : null;
  const editing = Boolean(customer);
  const c = customer || { name: '', phone: '', city: '', balance: 0 };
  openModal(`${modalHeader(editing ? 'Edit customer' : 'Add customer', editing ? 'Update account details.' : 'Create a customer account for repeat buyers and workshop credit.')}
    <form data-form="customer" data-id="${escapeHTML(customerId)}"><div class="modal-body"><div class="form-grid"><div class="form-field full-width"><label for="customerName">Name *</label><input class="form-input" id="customerName" name="name" value="${escapeHTML(c.name)}" placeholder="Bilal Workshop" required /></div><div class="form-field"><label for="customerPhone">Phone / WhatsApp</label><input class="form-input" id="customerPhone" name="phone" value="${escapeHTML(c.phone)}" placeholder="03xx xxx xxxx" /></div><div class="form-field"><label for="customerCity">Area / city</label><input class="form-input" id="customerCity" name="city" value="${escapeHTML(c.city)}" placeholder="Lahore" /></div>${editing && customerId !== 'c001' ? `<div class="form-field"><label for="customerBalance">Outstanding balance (PKR)</label><input class="form-input" id="customerBalance" name="balance" type="number" min="0" value="${escapeHTML(c.balance)}" /></div>` : ''}</div><p class="form-note">Phone numbers are stored locally with this workspace and are never shown on a public page.</p></div><div class="modal-footer"><button class="button" type="button" data-action="close-modal">Cancel</button><button class="button primary" type="submit">${editing ? 'Save customer' : 'Add customer'}</button></div></form>`);
}

function openCheckoutModal() {
  if (!licenseAllowsSales()) return;
  if (!state.cart.length) { toast('Cart is empty', 'Add at least one part before checking out.', 'error'); return; }
  const customer = customerById(state.saleCustomerId) || customerById('c001');
  const total = cartTotal();
  const tax = state.settings.taxEnabled ? ((cartSubtotal() - Number(state.discount || 0)) * Number(state.settings.taxRate || 0) / 100) : 0;
  openModal(`${modalHeader('Review sale', 'Confirm the invoice before taking payment.')}
    <form data-form="checkout"><div class="modal-body"><div style="display:flex;align-items:center;justify-content:space-between;background:#f7fafb;border:1px solid #e7f1f0;border-radius:9px;padding:12px;margin-bottom:14px"><div><span style="display:block;font-size:9px;color:#98a2b3;text-transform:uppercase;font-weight:700">Customer</span><strong style="display:block;font-size:11px;color:#263248;margin-top:4px">${escapeHTML(customer?.name || 'Walk-in customer')}</strong></div><span class="status-pill ${state.paymentMethod === 'Credit' ? 'credit' : 'paid'}">${escapeHTML(state.paymentMethod)}</span></div><div class="receipt-preview">${state.cart.map((item) => { const p = productById(item.productId); return `<div class="receipt-preview-row"><span>${escapeHTML(p?.name || 'Part')} × ${item.qty}</span><strong>${formatMoney(item.price * item.qty)}</strong></div>`; }).join('')}<div class="receipt-preview-row" style="border-top:1px dashed #d8dde7;margin-top:6px;padding-top:9px"><span>Subtotal</span><strong>${formatMoney(cartSubtotal())}</strong></div>${Number(state.discount) ? `<div class="receipt-preview-row"><span>Discount</span><strong style="color:#16a56f">− ${formatMoney(state.discount)}</strong></div>` : ''}${tax ? `<div class="receipt-preview-row"><span>Tax</span><strong>${formatMoney(tax)}</strong></div>` : ''}<div class="receipt-preview-row" style="padding-top:8px"><span style="font-weight:700;color:#263248">Total payable</span><strong style="font-size:14px">${formatMoney(total)}</strong></div></div><div class="form-grid"><div class="form-field"><label for="amountPaid">Amount received (PKR)</label><input class="form-input" id="amountPaid" name="amountPaid" type="number" min="0" value="${state.paymentMethod === 'Credit' ? 0 : total}" ${state.paymentMethod === 'Credit' ? 'disabled' : ''} /></div><div class="form-field"><label for="paymentRef">Reference / note</label><input class="form-input" id="paymentRef" name="paymentRef" placeholder="Optional" /></div></div><p class="form-note">${state.paymentMethod === 'Credit' ? 'This sale will be added to the customer\'s outstanding balance.' : 'You can print the invoice after completing the sale.'}</p></div><div class="modal-footer"><button class="button" type="button" data-action="close-modal">Back to cart</button><button class="button primary" type="submit"><span data-icon="check"></span>Complete sale · ${formatMoney(total)}</button></div></form>`);
}

function openGenerateLicenseModal() {
  if (!isSeller()) { toast('Seller access required', 'Only the seller / owner can generate renewal keys.', 'error'); return; }
  openModal(`${modalHeader('Generate renewal key', 'Create a new time-bound key for a customer shop or terminal.')}
    <form data-form="generate-license"><div class="modal-body"><div class="info-callout" style="margin:0 0 16px"><span data-icon="shield"></span><span>Private seller control. This action is logged as <strong>${escapeHTML(state.currentUser.name)}</strong>.</span></div><div class="form-grid"><div class="form-field"><label for="licensePlan">Plan</label><select class="form-select" id="licensePlan" name="plan"><option>Monthly</option><option>Half-yearly</option><option selected>Annual</option></select></div><div class="form-field"><label for="licenseShop">Shop / customer *</label><input class="form-input" id="licenseShop" name="shop" value="${escapeHTML(state.settings.shopName)}" required /></div><div class="form-field full-width"><label for="licenseDevice">Terminal / device label</label><input class="form-input" id="licenseDevice" name="device" placeholder="Main counter, laptop, or shop branch" value="Main shop terminal" /></div></div><p class="form-note">The key is generated with browser cryptographic randomness. For a hosted commercial release, pair this UI with a private seller API and server-side signature validation.</p></div><div class="modal-footer"><button class="button" type="button" data-action="close-modal">Cancel</button><button class="button primary" type="submit"><span data-icon="key"></span>Generate key</button></div></form>`);
}

function openActivateLicenseModal() {
  if (!isSeller()) { toast('Seller access required', 'Only the seller / owner can activate keys.', 'error'); return; }
  openModal(`${modalHeader('Activate renewal key', 'Paste a key issued by the seller to extend this workspace.')}
    <form data-form="activate-license"><div class="modal-body"><div class="form-field"><label for="activationKey">Renewal key</label><input class="form-input" id="activationKey" name="key" placeholder="DP-ANNUAL-XXXX-XXXX-XXXX" autocomplete="off" required /></div><p class="form-note">Activation checks the keys issued in this seller workspace. A key can be active only once and cannot be activated after it is revoked.</p></div><div class="modal-footer"><button class="button" type="button" data-action="close-modal">Cancel</button><button class="button primary" type="submit"><span data-icon="check"></span>Activate license</button></div></form>`);
}

function openReceiptModal(sale) {
  openModal(`<div class="center-modal"><div class="success-mark">${icon('check', 'lg')}</div><h2>Sale completed</h2><p>${escapeHTML(sale.id)} was saved successfully. Stock levels and the customer ledger are updated.</p><div class="receipt-preview"><div class="receipt-preview-row"><span>Invoice</span><strong>${escapeHTML(sale.id)}</strong></div><div class="receipt-preview-row"><span>Customer</span><strong>${escapeHTML(sale.customerName)}</strong></div><div class="receipt-preview-row"><span>Payment</span><strong>${escapeHTML(sale.payment)}</strong></div><div class="receipt-preview-row" style="border-top:1px dashed #d8dde7;margin-top:6px;padding-top:9px"><span>Total</span><strong style="font-size:14px">${formatMoney(sale.amount)}</strong></div></div><div style="display:flex;gap:8px"><button class="button" style="flex:1" data-action="print-receipt"><span data-icon="printer"></span>Print receipt</button><button class="button primary" style="flex:1" data-action="close-and-dashboard">Done</button></div></div>`);
}

function openProductActions(productId) {
  const p = productById(productId);
  if (!p) return;
  openModal(`${modalHeader(escapeHTML(p.name), `${escapeHTML(p.brand)} · ${escapeHTML(p.sku)}`)}<div class="modal-body"><div class="key-display" style="display:flex;align-items:center;gap:12px;text-align:left"><span class="part-avatar ${escapeHTML(p.tone || 'teal')}" style="width:42px;height:42px">${escapeHTML(p.initials)}</span><div><strong style="letter-spacing:0;text-align:left;font-size:13px">${formatMoney(p.price)}</strong><span style="text-align:left">${p.stock} ${escapeHTML(p.unit)} in stock · Reorder at ${p.reorder}</span></div></div><div style="display:grid;gap:8px;margin-top:14px"><button class="button full" data-action="adjust-stock" data-id="${escapeHTML(p.id)}"><span data-icon="layers"></span>Receive or issue stock</button><button class="button full" data-action="edit-product" data-id="${escapeHTML(p.id)}"><span data-icon="file"></span>Edit product details</button><button class="button full danger" data-action="close-modal">Close</button></div></div>`);
}

function openCustomerActions(customerId) {
  const c = customerById(customerId);
  if (!c) return;
  openModal(`${modalHeader(escapeHTML(c.name), `${escapeHTML(c.phone || 'No phone')} · ${escapeHTML(c.city || 'No city')}`)}<div class="modal-body"><div class="key-display" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left"><div><span style="text-align:left">Purchases</span><strong style="letter-spacing:0;text-align:left">${c.purchases || 0}</strong></div><div><span style="text-align:left">Outstanding</span><strong style="letter-spacing:0;text-align:left;color:${c.balance ? '#d47d19' : '#16a56f'}">${c.balance ? formatMoney(c.balance) : 'Clear'}</strong></div></div><div style="display:grid;gap:8px;margin-top:14px"><button class="button full" data-action="edit-customer" data-id="${escapeHTML(c.id)}"><span data-icon="file"></span>Edit customer</button>${c.balance ? `<button class="button full teal" data-action="record-payment" data-id="${escapeHTML(c.id)}"><span data-icon="dollar"></span>Record payment</button>` : ''}<button class="button full" data-action="close-modal">Close</button></div></div>`);
}

function openSaleModal(saleId) {
  const sale = state.sales.find((item) => item.id === saleId);
  if (!sale) return;
  openModal(`${modalHeader(`Invoice ${escapeHTML(sale.id)}`, `${formatDateLong(sale.createdAt)} · ${escapeHTML(sale.customerName)}`)}<div class="modal-body"><div class="receipt-preview">${sale.items.map((item) => { const p = productById(item.productId); return `<div class="receipt-preview-row"><span>${escapeHTML(p?.name || 'Part')} × ${item.qty}</span><strong>${formatMoney(item.price * item.qty)}</strong></div>`; }).join('')}<div class="receipt-preview-row" style="border-top:1px dashed #d8dde7;margin-top:6px;padding-top:9px"><span>Payment method</span><strong>${escapeHTML(sale.payment)}</strong></div><div class="receipt-preview-row"><span>Total</span><strong style="font-size:14px">${formatMoney(sale.amount)}</strong></div></div><div style="display:flex;justify-content:flex-end;gap:8px"><button class="button" data-action="print-receipt"><span data-icon="printer"></span>Print</button><button class="button primary" data-action="close-modal">Close</button></div></div>`);
}

function openNotifications() {
  const alerts = lowStockProducts().slice(0, 4);
  openModal(`${modalHeader('Notifications', 'What needs your attention today?')}<div class="modal-body"><div style="display:grid;gap:8px">${alerts.length ? alerts.map((p) => `<div class="permission-item"><span data-icon="warning" style="color:#d47d19"></span><div><strong>${escapeHTML(p.name)} is ${p.stock === 0 ? 'out of stock' : 'running low'}</strong><span>${escapeHTML(p.models[0])} · ${p.stock} available · reorder at ${p.reorder}</span></div></div>`).join('') : '<div class="empty-state"><strong>You are all caught up</strong>No alerts for now.</div>'}<div class="permission-item"><span data-icon="shield"></span><div><strong>License status: ${licenseStatus()}</strong><span>${licenseDays() < 0 ? 'Renew before accepting more sales.' : `${licenseDays()} days remaining on ${state.license.plan} plan.`}</span></div></div></div></div>`);
}

function openUserMenu() {
  openModal(`${modalHeader('Your account', 'Signed in to this shop workspace.')}<div class="modal-body"><div class="customer-cell" style="padding-bottom:14px;border-bottom:1px solid #f0f2f5"><span class="user-avatar">HA</span><div><strong style="font-size:12px;color:#263248">${escapeHTML(state.currentUser.name)}</strong><span style="display:block;font-size:10px;color:#98a2b3">${escapeHTML(state.currentUser.title)}</span></div></div><div style="display:grid;gap:8px;margin-top:14px"><button class="button full" data-action="go-settings"><span data-icon="settings"></span>Open admin settings</button><button class="button full" data-action="close-modal"><span data-icon="logout"></span>Sign out</button></div><p class="form-note">Demo workspace · changes are stored in this browser for an offline counter experience.</p></div>`);
}

function openShopMenu() {
  openModal(`${modalHeader('Shop workspace', 'One shop, one source of truth.')}<div class="modal-body"><div class="permission-item"><span class="shop-avatar">NA</span><div><strong>${escapeHTML(state.settings.shopName)}</strong><span>${escapeHTML(state.settings.city)} · Main shop · Active workspace</span></div><span class="seller-badge">Current</span></div><p class="form-note">Multi-branch switching is available when this workspace is connected to the hosted seller console.</p></div>`);
}

function openAuditModal() {
  openModal(`${modalHeader('Audit activity', 'Recent sensitive actions in this workspace.')}<div class="modal-body"><div style="display:grid;gap:0">${state.audit.slice(0, 8).map((entry) => `<div style="display:flex;gap:10px;padding:11px 0;border-bottom:1px solid #f0f2f5"><span class="status-dot" style="margin-top:5px"></span><div style="flex:1"><strong style="display:block;font-size:10px;color:#475467">${escapeHTML(entry.text)}</strong><span style="display:block;font-size:9px;color:#98a2b3;margin-top:3px">${escapeHTML(entry.by)} · ${formatDateTime(entry.at)}</span></div></div>`).join('')}</div></div>`);
}

function toast(title, message = '', type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const item = document.createElement('div');
  item.className = `toast ${type}`;
  item.innerHTML = `<span data-icon="${type === 'error' ? 'warning' : 'check'}"></span><div><strong>${escapeHTML(title)}</strong>${message ? `<span>${escapeHTML(message)}</span>` : ''}</div>`;
  container.appendChild(item);
  hydrateIcons(item);
  setTimeout(() => item.remove(), 4200);
}

function rerenderWithFocus(id) {
  const old = document.getElementById(id);
  const value = old?.value || '';
  const position = old?.selectionStart ?? value.length;
  render();
  requestAnimationFrame(() => {
    const next = document.getElementById(id);
    if (next) { next.focus(); try { next.setSelectionRange(position, position); } catch (_) { /* no-op */ } }
  });
}

function licenseAllowsSales() {
  if (!state.settings.licenseEnforcement || licenseDays() >= 0) return true;
  toast('License expired', 'Activate a valid renewal key before accepting new sales.', 'error');
  if (isSeller()) setView('licenses');
  return false;
}

function addToCart(productId) {
  if (!licenseAllowsSales()) return;
  const product = productById(productId);
  if (!product || Number(product.stock) <= 0) { toast('Part unavailable', 'This item is out of stock.', 'error'); return; }
  const existing = state.cart.find((item) => item.productId === productId);
  if (existing) {
    if (existing.qty >= product.stock) { toast('Stock limit reached', `Only ${product.stock} ${product.unit}${product.stock === 1 ? '' : 's'} available.`, 'error'); return; }
    existing.qty += 1;
  } else state.cart.push({ productId, qty: 1, price: Number(product.price) });
  saveState();
  render();
  toast('Added to sale', product.name, 'success');
}

function changeCartQty(productId, amount) {
  const item = state.cart.find((line) => line.productId === productId);
  const product = productById(productId);
  if (!item || !product) return;
  const next = item.qty + amount;
  if (next <= 0) state.cart = state.cart.filter((line) => line.productId !== productId);
  else if (next > product.stock) toast('Stock limit reached', `Only ${product.stock} available.`, 'error');
  else item.qty = next;
  saveState();
  render();
}

function completeSale(form) {
  if (!state.cart.length) { closeModal(); toast('Cart is empty', 'Add a part before completing a sale.', 'error'); return; }
  const total = cartTotal();
  const amountPaid = Number(new FormData(form).get('amountPaid') || 0);
  if (state.paymentMethod !== 'Credit' && amountPaid < total) { toast('Amount is short', `Receive at least ${formatMoney(total)} to complete this sale.`, 'error'); return; }
  const invoiceNumber = 1043 + state.sales.length - 12;
  const sale = { id: `INV-${invoiceNumber}`, createdAt: new Date().toISOString(), customerId: state.saleCustomerId || 'c001', customerName: customerById(state.saleCustomerId)?.name || 'Walk-in customer', items: state.cart.map((item) => ({ ...item })), amount: total, payment: state.paymentMethod, status: state.paymentMethod === 'Credit' ? 'Credit' : 'Paid' };
  state.cart.forEach((item) => { const p = productById(item.productId); if (p) p.stock = Math.max(0, Number(p.stock) - Number(item.qty)); });
  const customer = customerById(state.saleCustomerId);
  if (customer) {
    customer.purchases = Number(customer.purchases || 0) + 1;
    customer.lastPurchase = 'Today';
    if (state.paymentMethod === 'Credit') customer.balance = Number(customer.balance || 0) + total;
  }
  state.sales.unshift(sale);
  state.cart = [];
  state.discount = 0;
  saveState();
  closeModal();
  render();
  openReceiptModal(sale);
  toast('Sale completed', `${sale.id} saved to the ledger.`, 'success');
}

function generateLicense(form) {
  if (!isSeller()) { closeModal(); toast('Seller access required', 'Only the seller / owner can generate keys.', 'error'); return; }
  const fd = new FormData(form);
  const plan = String(fd.get('plan') || 'Annual');
  const shop = String(fd.get('shop') || '').trim();
  const device = String(fd.get('device') || '').trim() || 'Unbound terminal';
  if (!shop) { toast('Shop name required', 'Add the customer or shop name first.', 'error'); return; }
  const key = makeLicenseKey(plan);
  const issuedAt = new Date().toISOString();
  const expiresAt = addDays(new Date(), planDays(plan));
  const entry = { id: `key-${Date.now()}`, key, plan, shop, device, issuedAt, expiresAt, status: 'Active', issuedBy: state.currentUser.name };
  state.generatedKeys.unshift(entry);
  state.audit.unshift({ text: `${plan} renewal key generated · ${shop}`, by: state.currentUser.name, at: issuedAt });
  saveState();
  closeModal();
  openModal(`${modalHeader('Renewal key generated', 'Copy this key and share it securely with the customer.') }<div class="modal-body"><div class="key-display"><strong>${escapeHTML(key)}</strong><span>${escapeHTML(plan)} · Expires ${formatDateLong(expiresAt)}</span></div><div class="info-callout" style="margin-top:0"><span data-icon="info"></span><span>For security, only the seller can see the issued key in this workspace. Revoke it from the key list if it is shared by mistake.</span></div></div><div class="modal-footer"><button class="button" data-action="copy-text" data-copy="${escapeHTML(key)}"><span data-icon="link"></span>Copy key</button><button class="button primary" data-action="close-and-licenses">Done</button></div>`);
  toast('Key generated', `${plan} key for ${shop} is ready.`, 'success');
}

function makeLicenseKey(plan) {
  const prefix = plan === 'Monthly' ? 'MONTHLY' : plan === 'Half-yearly' ? 'HALF' : 'ANNUAL';
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const values = new Uint32Array(12);
  if (window.crypto?.getRandomValues) window.crypto.getRandomValues(values); else values.forEach((_, i) => { values[i] = Math.floor(Math.random() * 0xffffffff); });
  const chunks = [];
  for (let i = 0; i < 12; i += 4) chunks.push(Array.from(values.slice(i, i + 4), (value) => alphabet[value % alphabet.length]).join(''));
  return `DP-${prefix}-${chunks.join('-')}`;
}

function activateLicense(form) {
  if (!isSeller()) { closeModal(); toast('Seller access required', 'Only the seller / owner can activate keys.', 'error'); return; }
  const key = String(new FormData(form).get('key') || '').trim().toUpperCase();
  const entry = state.generatedKeys.find((item) => item.key.toUpperCase() === key);
  if (!entry) { toast('Key not found', 'Check the key and try again.', 'error'); return; }
  if (entry.status === 'Revoked') { toast('Key revoked', 'This renewal key can no longer be activated.', 'error'); return; }
  if (new Date(entry.expiresAt).getTime() < Date.now()) { toast('Key expired', 'Generate a fresh renewal key for this terminal.', 'error'); return; }
  state.license = { plan: entry.plan, key: entry.key, issuedAt: entry.issuedAt, expiresAt: entry.expiresAt, shop: entry.shop, device: entry.device };
  entry.status = 'Active';
  state.audit.unshift({ text: `${entry.plan} license activated · ${entry.shop}`, by: state.currentUser.name, at: new Date().toISOString() });
  saveState();
  closeModal();
  render();
  toast('License activated', `This workspace is covered until ${formatDate(entry.expiresAt)}.`, 'success');
}

function handleFormSubmit(event) {
  const form = event.target;
  const kind = form.dataset.form;
  if (!kind) return;
  event.preventDefault();
  const fd = new FormData(form);
  if (kind === 'product') {
    const id = form.dataset.id;
    const name = String(fd.get('name') || '').trim();
    const models = String(fd.get('models') || '').split(',').map((value) => value.trim()).filter(Boolean);
    if (!name || !models.length || !String(fd.get('sku') || '').trim()) { toast('Missing product details', 'Part name, bike fitment, and SKU are required.', 'error'); return; }
    const values = { name, brand: String(fd.get('brand') || '').trim() || 'Local brand', category: String(fd.get('category') || 'Other'), models, sku: String(fd.get('sku') || '').trim().toUpperCase(), barcode: String(fd.get('barcode') || '').trim(), price: Number(fd.get('price') || 0), cost: Number(fd.get('cost') || 0), stock: Number(fd.get('stock') || 0), reorder: Number(fd.get('reorder') || 0), unit: String(fd.get('unit') || 'piece') };
    if (!values.price) { toast('Selling price required', 'Enter the price in Pakistani rupees.', 'error'); return; }
    if (id) { const product = productById(id); if (product) Object.assign(product, values); toast('Product updated', `${name} is up to date.`); }
    else { const tones = ['teal', 'purple', 'amber', 'blue', 'pink']; state.products.unshift({ ...values, id: `p${Date.now()}`, initials: initials(name.replace('Set', '').trim()), tone: tones[state.products.length % tones.length] }); toast('Product added', `${name} is ready to sell.`); }
    saveState(); closeModal(); render(); return;
  }
  if (kind === 'adjust-stock') {
    const product = productById(form.dataset.id);
    const quantity = Math.max(0, Number(fd.get('quantity') || 0));
    if (!product || !quantity) { toast('Quantity required', 'Enter a quantity greater than zero.', 'error'); return; }
    const action = String(fd.get('action')) === 'issue' ? 'issue' : 'receive';
    product.stock = action === 'receive' ? Number(product.stock) + quantity : Math.max(0, Number(product.stock) - quantity);
    state.audit.unshift({ text: `${action === 'receive' ? 'Stock received' : 'Stock issued'} · ${product.name} × ${quantity}`, by: state.currentUser.name, at: new Date().toISOString() });
    saveState(); closeModal(); render(); toast(action === 'receive' ? 'Stock received' : 'Stock updated', `${product.name} now has ${product.stock} ${product.unit}${product.stock === 1 ? '' : 's'}.`); return;
  }
  if (kind === 'customer') {
    const id = form.dataset.id;
    const name = String(fd.get('name') || '').trim();
    if (!name) { toast('Customer name required', 'Add a name before saving.', 'error'); return; }
    const values = { name, phone: String(fd.get('phone') || '').trim(), city: String(fd.get('city') || '').trim() || 'Lahore' };
    if (id) { const customer = customerById(id); if (customer) { Object.assign(customer, values); if (fd.has('balance')) customer.balance = Number(fd.get('balance') || 0); } toast('Customer updated', `${name} is up to date.`); }
    else { state.customers.push({ ...values, id: `c${Date.now()}`, balance: 0, purchases: 0, lastPurchase: 'New' }); toast('Customer added', `${name} is ready for the next sale.`); }
    saveState(); closeModal(); render(); return;
  }
  if (kind === 'checkout') { completeSale(form); return; }
  if (kind === 'generate-license') { generateLicense(form); return; }
  if (kind === 'activate-license') { activateLicense(form); return; }
  if (kind === 'settings') {
    state.settings.shopName = String(fd.get('shopName') || '').trim() || state.settings.shopName;
    state.settings.phone = String(fd.get('phone') || '').trim();
    state.settings.city = String(fd.get('city') || '').trim();
    state.settings.ntn = String(fd.get('ntn') || '').trim();
    state.settings.address = String(fd.get('address') || '').trim();
    state.settings.receiptFooter = String(fd.get('receiptFooter') || '').trim();
    state.settings.taxRate = Math.min(100, Math.max(0, Number(fd.get('taxRate') || 0)));
    state.license.shop = state.settings.shopName;
    state.audit.unshift({ text: 'Shop profile updated', by: state.currentUser.name, at: new Date().toISOString() });
    saveState(); render(); toast('Settings saved', 'Your shop profile has been updated.');
  }
}

function exportCSV(filename, rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportProducts() {
  exportCSV('dukanpilot-products.csv', [['SKU', 'Part name', 'Brand', 'Bike fitment', 'Category', 'Selling price PKR', 'Cost PKR', 'Stock', 'Reorder level'], ...state.products.map((p) => [p.sku, p.name, p.brand, p.models.join(' / '), p.category, p.price, p.cost, p.stock, p.reorder])]);
  toast('Catalog exported', 'Your CSV download is ready.');
}

function exportCustomers() {
  exportCSV('dukanpilot-customers.csv', [['Name', 'Phone', 'City', 'Purchases', 'Outstanding PKR', 'Last purchase'], ...state.customers.map((c) => [c.name, c.phone, c.city, c.purchases, c.balance, c.lastPurchase])]);
  toast('Customer list exported', 'Your CSV download is ready.');
}

function exportReport() {
  const days = state.filters.reportPeriod === '90d' ? 90 : state.filters.reportPeriod === '30d' ? 30 : 7;
  const sales = recentSales(days);
  exportCSV(`dukanpilot-sales-${days}d.csv`, [['Invoice', 'Date', 'Customer', 'Payment', 'Amount PKR', 'Status'], ...sales.map((sale) => [sale.id, formatDateTime(sale.createdAt), sale.customerName, sale.payment, sale.amount, sale.status])]);
  toast('Report exported', 'Your sales report is ready to share.');
}

function downloadBackup() {
  const backup = { product: 'DukanPilot POS', version: 1, exportedAt: new Date().toISOString(), workspace: state };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `dukanpilot-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Backup downloaded', 'Keep this file somewhere safe for recovery.');
}

async function copyText(value) {
  try { await navigator.clipboard.writeText(value); toast('Copied to clipboard', 'The renewal key is ready to share.'); }
  catch (_) { toast('Copy unavailable', 'Select the key manually from the dialog.', 'error'); }
}

function handleClick(event) {
  const target = event.target;
  const viewTarget = target.closest('[data-view]');
  if (viewTarget) { setView(viewTarget.dataset.view); return; }
  const button = target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'modal-overlay') { if (event.target === button) closeModal(); return; }
  switch (action) {
    case 'toggle-sidebar': document.getElementById('sidebar')?.classList.toggle('open'); break;
    case 'close-modal': closeModal(); break;
    case 'refresh': toast('Workspace refreshed', 'Your latest local data is on screen.'); render(); break;
    case 'focus-sale-search': setView('sale'); setTimeout(() => document.getElementById('saleSearch')?.focus(), 30); break;
    case 'focus-search': document.getElementById('globalSearch')?.focus(); break;
    case 'license-summary': setView('licenses'); break;
    case 'hold-sale': toast('Sale held', 'This demo keeps one active draft. Add items again when you are ready.', 'success'); break;
    case 'dashboard-period': state.filters.dashboardPeriod = button.dataset.period; saveState(); render(); break;
    case 'report-period': state.filters.reportPeriod = button.dataset.period; saveState(); render(); break;
    case 'sale-model': state.filters.model = button.dataset.model; saveState(); render(); break;
    case 'add-to-cart': addToCart(button.dataset.id); break;
    case 'cart-increase': changeCartQty(button.dataset.id, 1); break;
    case 'cart-decrease': changeCartQty(button.dataset.id, -1); break;
    case 'remove-cart': state.cart = state.cart.filter((item) => item.productId !== button.dataset.id); saveState(); render(); break;
    case 'clear-cart': state.cart = []; state.discount = 0; saveState(); render(); toast('Cart cleared', 'The active draft sale was cleared.'); break;
    case 'sale-payment': state.paymentMethod = button.dataset.payment; saveState(); render(); break;
    case 'open-checkout': openCheckoutModal(); break;
    case 'open-add-product': openAddProductModal(); break;
    case 'edit-product': closeModal(); openAddProductModal(button.dataset.id); break;
    case 'adjust-stock': closeModal(); openAdjustStockModal(button.dataset.id); break;
    case 'product-actions': openProductActions(button.dataset.id); break;
    case 'open-add-customer': openCustomerModal(); break;
    case 'edit-customer': closeModal(); openCustomerModal(button.dataset.id); break;
    case 'customer-actions': openCustomerActions(button.dataset.id); break;
    case 'record-payment': openRecordPaymentModal(button.dataset.id); break;
    case 'open-generate-license': openGenerateLicenseModal(); break;
    case 'open-activate-license': openActivateLicenseModal(); break;
    case 'license-actions': openLicenseActions(button.dataset.id); break;
    case 'revoke-license': revokeLicense(button.dataset.id); break;
    case 'copy-text': copyText(button.dataset.copy); break;
    case 'close-and-licenses': closeModal(); setView('licenses'); break;
    case 'close-and-dashboard': closeModal(); setView('dashboard'); break;
    case 'print-receipt': window.print(); break;
    case 'notifications': openNotifications(); break;
    case 'user-menu': openUserMenu(); break;
    case 'go-settings': closeModal(); setView('settings'); break;
    case 'shop-menu': openShopMenu(); break;
    case 'toggle-setting': state.settings[button.dataset.setting] = !state.settings[button.dataset.setting]; saveState(); render(); toast('Preference updated'); break;
    case 'save-settings-shortcut': document.querySelector('form[data-form="settings"]')?.requestSubmit(); break;
    case 'download-backup': downloadBackup(); break;
    case 'export-products': exportProducts(); break;
    case 'export-customers': exportCustomers(); break;
    case 'export-report': exportReport(); break;
    case 'view-audit': openAuditModal(); break;
    case 'invite-user': toast('Invite flow ready', 'Connect the seller console to send staff invitations.', 'success'); break;
    case 'view-sale': openSaleModal(button.dataset.id); break;
    case 'global-search': document.getElementById('globalSearch')?.focus(); break;
    default: break;
  }
}

function openRecordPaymentModal(customerId) {
  const customer = customerById(customerId); if (!customer) return;
  openModal(`${modalHeader('Record customer payment', `${escapeHTML(customer.name)} · Outstanding ${formatMoney(customer.balance)}`)}<form data-form="record-payment" data-id="${escapeHTML(customer.id)}"><div class="modal-body"><div class="form-field"><label for="paymentAmount">Amount received (PKR)</label><input class="form-input" id="paymentAmount" name="amount" type="number" min="1" max="${customer.balance}" value="${customer.balance}" required /></div><div class="form-field" style="margin-top:12px"><label for="paymentNote">Note</label><input class="form-input" id="paymentNote" name="note" placeholder="Cash or transfer reference" /></div></div><div class="modal-footer"><button class="button" type="button" data-action="close-modal">Cancel</button><button class="button primary" type="submit"><span data-icon="check"></span>Save payment</button></div></form>`);
}

function revokeLicense(id) {
  if (!isSeller()) { closeModal(); toast('Seller access required', 'Only the seller / owner can revoke keys.', 'error'); return; }
  const entry = state.generatedKeys.find((item) => item.id === id);
  if (!entry || entry.status !== 'Active') return;
  if (entry.key === state.license.key) { toast('Current license is protected', 'Activate another license before revoking this key.', 'error'); return; }
  entry.status = 'Revoked';
  state.audit.unshift({ text: `${entry.plan} renewal key revoked · ${entry.shop}`, by: state.currentUser.name, at: new Date().toISOString() });
  saveState();
  closeModal();
  render();
  toast('Key revoked', 'The renewal key can no longer be activated.');
}

function openLicenseActions(id) {
  const entry = state.generatedKeys.find((item) => item.id === id); if (!entry) return;
  openModal(`${modalHeader('License key actions', `${escapeHTML(entry.plan)} · ${escapeHTML(entry.shop)}`)}<div class="modal-body"><div class="key-display"><strong>${escapeHTML(entry.key)}</strong><span>${escapeHTML(entry.status)} · expires ${formatDateLong(entry.expiresAt)}</span></div><div style="display:grid;gap:8px"><button class="button full" data-action="copy-text" data-copy="${escapeHTML(entry.key)}"><span data-icon="link"></span>Copy key</button>${entry.status === 'Active' && entry.key !== state.license.key ? `<button class="button full danger" data-action="revoke-license" data-id="${escapeHTML(entry.id)}"><span data-icon="lock"></span>Revoke key</button>` : ''}<button class="button full" data-action="close-modal">Close</button></div></div>`);
}

function handleInput(event) {
  const id = event.target.id;
  if (id === 'saleSearch') { state.filters.productSearch = event.target.value; saveState(); rerenderWithFocus(id); }
  else if (id === 'inventorySearch') { state.filters.inventorySearch = event.target.value; saveState(); rerenderWithFocus(id); }
  else if (id === 'customerSearch') { state.filters.customerSearch = event.target.value; saveState(); rerenderWithFocus(id); }
  else if (id === 'discountInput') { state.discount = Math.max(0, Math.min(cartSubtotal(), Number(event.target.value || 0))); saveState(); rerenderWithFocus(id); }
}

function handleChange(event) {
  const id = event.target.id;
  if (id === 'saleCustomer') { state.saleCustomerId = event.target.value; saveState(); render(); }
  else if (id === 'inventoryCategory') { state.filters.inventoryCategory = event.target.value; saveState(); render(); }
  else if (id === 'inventoryModel') { state.filters.inventoryModel = event.target.value; saveState(); render(); }
}

function handleFormSubmitExtended(event) {
  const form = event.target;
  if (form.dataset.form !== 'record-payment') return;
  event.preventDefault();
  const customer = customerById(form.dataset.id); const amount = Number(new FormData(form).get('amount') || 0);
  if (!customer || !amount || amount > Number(customer.balance)) { toast('Check payment amount', 'Enter an amount up to the outstanding balance.', 'error'); return; }
  customer.balance = Math.max(0, Number(customer.balance) - amount);
  state.audit.unshift({ text: `Customer payment recorded · ${customer.name} · ${formatMoney(amount)}`, by: state.currentUser.name, at: new Date().toISOString() });
  saveState(); closeModal(); render(); toast('Payment recorded', `${customer.name} now owes ${formatMoney(customer.balance)}.`);
}

function handleKeydown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommandPalette(); }
  if (event.key === 'F2') { event.preventDefault(); setView('sale'); setTimeout(() => document.getElementById('saleSearch')?.focus(), 40); }
  if (event.key === 'Escape') { closeCommandPalette(); if (document.getElementById('sidebar')?.classList.contains('open')) document.getElementById('sidebar').classList.remove('open'); }
}

function openCommandPalette() {
  const palette = document.getElementById('commandPalette'); if (!palette) return;
  palette.innerHTML = `<div class="command-search"><span data-icon="search"></span><input id="commandSearch" placeholder="Jump to a page or action" autofocus /></div><div class="command-list">${[['sale', 'New sale', 'Open the counter and scan a part', 'cart'], ['products', 'Products', 'Manage catalog and prices', 'box'], ['stock', 'Stock control', 'See low stock and receive inventory', 'layers'], ['customers', 'Customers', 'Accounts and outstanding credit', 'users'], ['reports', 'Reports', 'Sales and payment performance', 'chart'], ['licenses', 'Licenses', 'Seller-only renewal keys', 'key'], ['settings', 'Admin settings', 'Shop, staff, and preferences', 'settings']].map((item) => `<button class="command-item" data-view="${item[0]}"><span data-icon="${item[3]}"></span><div><strong>${item[1]}</strong><span>${item[2]}</span></div></button>`).join('')}</div>`;
  palette.classList.remove('hidden'); hydrateIcons(palette); setTimeout(() => document.getElementById('commandSearch')?.focus(), 30);
}
function closeCommandPalette() { document.getElementById('commandPalette')?.classList.add('hidden'); }

function handleCommandInput(event) {
  if (event.target.id !== 'commandSearch') return;
  const query = event.target.value.toLowerCase();
  document.querySelectorAll('.command-item').forEach((item) => { item.hidden = !item.textContent.toLowerCase().includes(query); });
}

function handleDocumentClick(event) {
  if (event.target.closest('#commandPalette .command-item')) { closeCommandPalette(); }
  if (event.target === document.getElementById('commandPalette')) closeCommandPalette();
}

function initialize() {
  document.addEventListener('click', handleClick);
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('submit', (event) => { handleFormSubmit(event); handleFormSubmitExtended(event); });
  document.addEventListener('input', (event) => { handleInput(event); handleCommandInput(event); });
  document.addEventListener('change', handleChange);
  document.addEventListener('keydown', handleKeydown);
  render();
}

initialize();
