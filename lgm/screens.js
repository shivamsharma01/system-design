// Generated from docs/wireframes/screen-inventory.md by npm run build.
export const screens = [
  {
    "id": "C-01",
    "name": "Home",
    "group": "Discovery",
    "brief": "Header, PIN selector, search, banners, category carousel, featured products, offers, footer",
    "refs": [
      "WEB-001",
      "WEB-002",
      "CUS-001",
      "CUS-006",
      "BNR-001",
      "BNR-002",
      "CAT-001",
      "PRI-002"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-02",
    "name": "Search results",
    "group": "Discovery",
    "brief": "Search query, suggestions, sort, filters, product grid, no-results state",
    "refs": [
      "CAT-007",
      "CAT-002",
      "CAT-004"
    ],
    "classification": "Proposed",
    "status": "Draft"
  },
  {
    "id": "C-03",
    "name": "Category listing",
    "group": "Discovery",
    "brief": "Category header/image, category selector, product grid, filters/sort",
    "refs": [
      "CAT-001",
      "CAT-002",
      "CAT-003",
      "CAT-004",
      "CAT-007"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-04",
    "name": "Product details",
    "group": "Discovery",
    "brief": "Gallery, product info, pack size, price, availability, quantity, add to cart",
    "refs": [
      "CAT-005",
      "CAT-008",
      "CAT-004",
      "PRI-001",
      "RET-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-05",
    "name": "Cart",
    "group": "Checkout",
    "brief": "Items, quantity editing, remove, subtotal, delivery estimate, continue shopping, checkout",
    "refs": [
      "CRT-001",
      "CRT-002",
      "CRT-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-06",
    "name": "Checkout — OTP",
    "group": "Checkout",
    "brief": "Phone entry, OTP entry, resend timer, verification/error states",
    "refs": [
      "CUS-002",
      "INT-003",
      "NFR-009"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-07",
    "name": "Checkout — address",
    "group": "Checkout",
    "brief": "Customer details, saved/new address, PIN validation, address form",
    "refs": [
      "CUS-003",
      "CUS-004",
      "CUS-006",
      "CRT-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-08",
    "name": "Checkout — review/payment",
    "group": "Checkout",
    "brief": "Items, address, delivery charge, totals, dummy payment option and submit",
    "refs": [
      "CRT-002",
      "LOG-002",
      "LOG-003",
      "PAY-001",
      "PAY-002",
      "PAY-005"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-09",
    "name": "Order confirmation",
    "group": "Checkout",
    "brief": "Order number, received/pending-review message, summary, next steps",
    "refs": [
      "ORD-005",
      "ORD-001",
      "PAY-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-10",
    "name": "Sign-in/OTP entry",
    "group": "My account",
    "brief": "Optional account entry for returning users; browsing remains guest-friendly",
    "refs": [
      "CUS-001",
      "CUS-002"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-11",
    "name": "My profile",
    "group": "My account",
    "brief": "Customer profile details, edit/save states, sign out",
    "refs": [
      "CUS-004",
      "NFR-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-12",
    "name": "My addresses",
    "group": "My account",
    "brief": "Address list, add/edit/delete, default address state",
    "refs": [
      "CUS-004",
      "CUS-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-13",
    "name": "My orders",
    "group": "My account",
    "brief": "Order list, status filters, order cards/table, empty state",
    "refs": [
      "CUS-004",
      "CUS-005",
      "ORD-002"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-14",
    "name": "Order details",
    "group": "My account",
    "brief": "Items, totals, current status, status history, cancel availability",
    "refs": [
      "ORD-002",
      "ORD-005",
      "ORD-006",
      "CUS-005"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-15",
    "name": "Shipment details",
    "group": "My account",
    "brief": "Shipment status timeline, courier/tracking placeholder, no live GPS",
    "refs": [
      "CUS-005",
      "LOG-004",
      "LOG-005",
      "LOG-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-16",
    "name": "Return request",
    "group": "My account",
    "brief": "Eligibility summary, reason, notes, photo upload simulation, submit",
    "refs": [
      "RET-001",
      "RET-002",
      "RET-004",
      "RET-005"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-17",
    "name": "Return status",
    "group": "My account",
    "brief": "Return status, approval/pickup/refund timeline, wallet placeholder",
    "refs": [
      "RET-003",
      "RET-004",
      "RET-005",
      "PAY-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-18",
    "name": "LGM Wallet",
    "group": "My account",
    "brief": "Balance, transaction list, refund credit and promotional credit placeholder",
    "refs": [
      "PAY-003",
      "PAY-004",
      "PAY-006"
    ],
    "classification": "Proposed",
    "status": "Draft"
  },
  {
    "id": "C-19",
    "name": "Contact Us",
    "group": "Customer care",
    "brief": "Support phone/email/address placeholders and contact guidance",
    "refs": [
      "SUP-001",
      "WEB-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "C-20",
    "name": "Policy/content page",
    "group": "Customer care",
    "brief": "About, terms, privacy, shipping, cancellation/refund and return policy placeholder",
    "refs": [
      "WEB-003"
    ],
    "classification": "Proposed",
    "status": "Draft"
  },
  {
    "id": "A-01",
    "name": "Admin sign-in",
    "group": "Workspace",
    "brief": "Login form, validation, access-denied state",
    "refs": [
      "ADM-002",
      "NFR-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-02",
    "name": "Admin dashboard",
    "group": "Workspace",
    "brief": "KPI cards, orders awaiting acceptance, packing, failed delivery, returns, low stock, sales",
    "refs": [
      "ADM-001",
      "REP-001",
      "REP-005",
      "OPS-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-03",
    "name": "Orders list",
    "group": "Order operations",
    "brief": "Search/filter by status/date/customer, order rows/cards, bulk-safe actions",
    "refs": [
      "ORD-001",
      "ORD-002",
      "ORD-003",
      "ORD-005",
      "ADM-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-04",
    "name": "Order details",
    "group": "Order operations",
    "brief": "Customer/address/items/totals, manual review, accept/reject, activity timeline",
    "refs": [
      "ORD-001",
      "ORD-002",
      "ORD-004",
      "ORD-005",
      "INV-009",
      "NFR-002",
      "NFR-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-05",
    "name": "Packing & dispatch",
    "group": "Order operations",
    "brief": "Customer-wise dispatch queue, packing state, dispatch details",
    "refs": [
      "ORD-003",
      "LOG-004",
      "LOG-007"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-06",
    "name": "Shipment & delivery exceptions",
    "group": "Order operations",
    "brief": "Shipment list, status mapping, failed delivery, retry/RTO states",
    "refs": [
      "LOG-004",
      "LOG-005",
      "LOG-006",
      "LOG-008",
      "INT-001",
      "NFR-004"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-07",
    "name": "Returns list",
    "group": "Order operations",
    "brief": "Return requests, eligibility, filters, status and pending approvals",
    "refs": [
      "RET-001",
      "RET-002",
      "RET-003",
      "RET-004",
      "RET-005"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-08",
    "name": "Return details",
    "group": "Order operations",
    "brief": "Photos, reason, order context, approve/reject, reverse pickup and refund state",
    "refs": [
      "RET-002",
      "RET-003",
      "RET-004",
      "RET-005",
      "PAY-003",
      "PAY-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-09",
    "name": "Product catalogue",
    "group": "Catalogue",
    "brief": "Search by name/SKU/barcode, filters, product status, add/edit actions",
    "refs": [
      "CAT-006",
      "CAT-007",
      "INV-001",
      "INV-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-10",
    "name": "Product create/edit",
    "group": "Catalogue",
    "brief": "Product fields, pack/unit, prices, category, images, visibility, food/product info",
    "refs": [
      "CAT-005",
      "CAT-006",
      "CAT-008",
      "INV-003",
      "INV-014",
      "PRI-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-11",
    "name": "Categories",
    "group": "Catalogue",
    "brief": "Category list, image/icon, order, visibility, create/edit",
    "refs": [
      "CAT-001",
      "CAT-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-12",
    "name": "Product import",
    "group": "Catalogue",
    "brief": "Template download, file selection, preview, validation results, new/existing rows",
    "refs": [
      "INV-002",
      "INV-003",
      "INV-004",
      "INV-013",
      "NFR-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-13",
    "name": "Inventory overview",
    "group": "Warehouse",
    "brief": "Stock summary, search, SKU, available quantity, low-stock indicator",
    "refs": [
      "INV-001",
      "INV-009",
      "INV-010",
      "INV-011"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-14",
    "name": "Stock IN",
    "group": "Warehouse",
    "brief": "Product search/scan simulation, product details, quantity/case pack, save",
    "refs": [
      "INV-005",
      "INV-006",
      "INV-008",
      "INV-012",
      "NFR-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-15",
    "name": "Stock movement history",
    "group": "Warehouse",
    "brief": "IN/OUT adjustments, operator/time/reference, filters",
    "refs": [
      "INV-009",
      "INV-010",
      "INV-012",
      "NFR-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-16",
    "name": "Barcode management",
    "group": "Warehouse",
    "brief": "Capture manufacturer barcode, generate internal code/label, print preview",
    "refs": [
      "INV-006",
      "INV-007",
      "DOC-002"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-17",
    "name": "Low stock & expiry",
    "group": "Warehouse",
    "brief": "Thresholds, low-stock items, optional expiry/best-before alerts",
    "refs": [
      "INV-011",
      "INV-014",
      "INV-015"
    ],
    "classification": "Proposed",
    "status": "Draft"
  },
  {
    "id": "A-18",
    "name": "Pricing",
    "group": "Merchandising",
    "brief": "Product price list, MRP, selling price, cost (permission-aware), price edit",
    "refs": [
      "PRI-001",
      "REP-003",
      "NFR-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-19",
    "name": "Offers & schemes",
    "group": "Merchandising",
    "brief": "Scheme list, schedule/status, products/categories, performance link",
    "refs": [
      "PRI-002",
      "BNR-002",
      "REP-002"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-20",
    "name": "Banner management",
    "group": "Merchandising",
    "brief": "Banner slots, mobile/desktop assets, schedule, active state, order, link",
    "refs": [
      "BNR-001",
      "BNR-002",
      "WEB-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-21",
    "name": "Reports hub",
    "group": "Reports & expenses",
    "brief": "Report categories and date filters",
    "refs": [
      "REP-001",
      "REP-002",
      "REP-005",
      "REP-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-22",
    "name": "Sales report",
    "group": "Reports & expenses",
    "brief": "Revenue/order metrics, date/status filters, table, chart placeholder, export",
    "refs": [
      "REP-001",
      "REP-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-23",
    "name": "Inventory report",
    "group": "Reports & expenses",
    "brief": "Opening, IN, OUT, closing, stock changes and product performance",
    "refs": [
      "INV-010",
      "REP-001",
      "REP-005",
      "REP-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-24",
    "name": "Scheme performance",
    "group": "Reports & expenses",
    "brief": "Scheme period, items sold, revenue, profit placeholder",
    "refs": [
      "REP-002",
      "REP-003",
      "PRI-002",
      "REP-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-25",
    "name": "Price/update report",
    "group": "Reports & expenses",
    "brief": "Product, price, scheme and inventory update history",
    "refs": [
      "REP-001",
      "REP-006",
      "NFR-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-26",
    "name": "Expenses",
    "group": "Reports & expenses",
    "brief": "Expense list, direct/indirect category, amount, frequency, date, notes",
    "refs": [
      "REP-004",
      "REP-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-27",
    "name": "Expense entry",
    "group": "Reports & expenses",
    "brief": "Add/edit expense form and validation",
    "refs": [
      "REP-004",
      "NFR-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-28",
    "name": "Customers",
    "group": "Administration",
    "brief": "Customer search/list and relevant profile/order summary",
    "refs": [
      "CUS-003",
      "CUS-004",
      "SUP-002",
      "ADM-002"
    ],
    "classification": "Proposed",
    "status": "Draft"
  },
  {
    "id": "A-29",
    "name": "Support records",
    "group": "Administration",
    "brief": "Complaint/ticket list, owner/status/priority and closure",
    "refs": [
      "SUP-001",
      "SUP-002",
      "ADM-002"
    ],
    "classification": "Proposed",
    "status": "Draft"
  },
  {
    "id": "A-30",
    "name": "Staff & roles",
    "group": "Administration",
    "brief": "Staff list, invite/create, role assignment, access summary",
    "refs": [
      "ADM-002",
      "ADM-003",
      "ADM-004",
      "NFR-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-31",
    "name": "Business settings",
    "group": "Administration",
    "brief": "Business profile, address, contact, PIN/serviceability and delivery charge settings",
    "refs": [
      "LOG-001",
      "LOG-002",
      "LOG-003",
      "WEB-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-32",
    "name": "Integration settings",
    "group": "Administration",
    "brief": "Logistics, SMS, WhatsApp and payment provider placeholders with connection state",
    "refs": [
      "INT-001",
      "INT-002",
      "INT-003",
      "PAY-002",
      "NFR-004"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "A-33",
    "name": "Notifications/templates",
    "group": "Administration",
    "brief": "SMS/WhatsApp template list and status placeholders",
    "refs": [
      "INT-002",
      "INT-003"
    ],
    "classification": "Proposed",
    "status": "Draft"
  },
  {
    "id": "A-34",
    "name": "Policy/content management",
    "group": "Administration",
    "brief": "Edit About, contact, terms, privacy, shipping, cancellation and returns copy",
    "refs": [
      "WEB-003"
    ],
    "classification": "Proposed",
    "status": "Draft"
  },
  {
    "id": "A-35",
    "name": "Activity history",
    "group": "Administration",
    "brief": "Who/when/action for important price, stock, scheme and order changes",
    "refs": [
      "INV-012",
      "NFR-003",
      "NFR-007"
    ],
    "classification": "Proposed",
    "status": "Draft"
  },
  {
    "id": "A-36",
    "name": "Invoice & label preview",
    "group": "Administration",
    "brief": "GST invoice and shipping label sample preview/print",
    "refs": [
      "DOC-001",
      "DOC-002",
      "PAY-005",
      "LOG-007"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "S-01",
    "name": "Global loading state",
    "group": "System states",
    "brief": "Skeletons/spinners for page and action loading",
    "refs": [
      "NFR-007",
      "NFR-004"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "S-02",
    "name": "Empty states",
    "group": "System states",
    "brief": "Helpful no-products, no-orders, no-results, no-records states",
    "refs": [
      "CAT-007",
      "CRT-001",
      "REP-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "S-03",
    "name": "Form validation",
    "group": "System states",
    "brief": "Inline field errors and form-level summary",
    "refs": [
      "NFR-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "S-04",
    "name": "Error/retry state",
    "group": "System states",
    "brief": "Human-readable failure, retry where sensible, no raw technical errors",
    "refs": [
      "NFR-004",
      "NFR-007"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "S-05",
    "name": "Confirmation dialog",
    "group": "System states",
    "brief": "Confirm destructive/high-impact actions such as accept, reject, delete or stock change",
    "refs": [
      "NFR-002",
      "NFR-003"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "S-06",
    "name": "Permission denied",
    "group": "System states",
    "brief": "Clear restricted-access state and safe navigation",
    "refs": [
      "ADM-002",
      "NFR-006"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "S-07",
    "name": "Toast/feedback",
    "group": "System states",
    "brief": "Success/error/info action feedback",
    "refs": [
      "NFR-001",
      "NFR-007"
    ],
    "classification": "Recorded",
    "status": "Draft"
  },
  {
    "id": "S-08",
    "name": "Mobile navigation drawer",
    "group": "System states",
    "brief": "Accessible open/close behavior and correct focus",
    "refs": [
      "WEB-002",
      "ADM-001"
    ],
    "classification": "Recorded",
    "status": "Draft"
  }
];
