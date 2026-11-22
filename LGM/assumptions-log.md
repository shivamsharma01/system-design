# LGM Hub decision log

These are defaults for a design review, not production rules. Requirement references remain in the [screen inventory](screen-inventory.md). The supplied pack identifies the BRD, FRD and RTM versions; their original files were not present in this workspace.

| Topic | Draft choice | Classification | Screens |
|---|---|---|---|
| Review access | Open the shop by default; a separate preview bar links to the screen index and back office. A demo Admin session is selected initially so reviewers can follow a new order into the warehouse without resetting it. | Proposed, UX-PROPOSAL | All |
| Persistence | Both experiences share memory in one tab. Refreshing resets everything, including cart and sample identity; this deliberately prioritizes privacy over cross-session cart retention. | Proposed | C-05–18, A-02–36 |
| Authentication | Demo OTP `123456`; a separate staff role selector uses access code `STAFF`. Neither establishes a secure session. Role availability is illustrative. | Proposed | C-06, C-10, A-01–36, S-06 |
| Delivery | Manual six-digit PIN entry only. Initially `124507` and `124508` are serviceable, `110001` is not. The sample delivery charge is ₹35 per nonempty order, configurable in settings. | Placeholder | C-01, C-05–09, A-31 |
| Assortment and layout | Whole sellable packs; maximum ten units per SKU, subject to available stock. Category navigation uses a rail on desktop and a strip on narrow screens (CAT-003). | Proposed | C-01–05, A-09–11 |
| Order lifecycle | Submission creates **Pending LGM Review** without moving stock. Manual acceptance posts stock OUT once for every line, only if all lines can be fulfilled. Packing and dispatch are later steps. | Recorded workflow; proposed status labels | C-08–09, C-13–15, A-02–06, A-13–15 |
| Returns and wallet | One request per delivered demo order within seven days of delivery. Sample refund is for items, excluding delivery; credit follows approval and simulated pickup. No money moves. | Proposed | C-14–18, A-07–08 |
| Contact, providers and documents | Fictional customer/contact details, policy text, shipping labels, tax particulars and provider states; no contact, payment or delivery service is invoked. | Placeholder | C-15, C-19–20, A-29, A-31–36 |
| Upload and import | Excel workbook preview uses example rows; the Excel-compatible UTF-8 CSV path reads local rows. SKU identifies updates; imported quantities add to the balance rather than replacing it. No file leaves the browser. | Proposed | A-12, C-16 |
| Reporting | Booked sales exclude pending, rejected, cancelled and RTO orders. Scheme figures estimate category sales in the offer period, not confirmed redemptions. Expense frequency is a label, not automatic recurrence. | Proposed | A-21–30 |

Asset provenance and individually identified fallbacks are listed in [image-assets.md](image-assets.md).
