# MASTER TEST CASE DOCUMENT — Tumbuhin SaaS ERP Platform

**Document Version:** 1.0  
**Date:** 2026-04-30  
**System Under Test:** Tumbuhin ERP (NestJS Backend / Next.js Web / Expo Mobile)  
**Prepared By:** QA Engineering Team

---

## 1. SALES / POS MODULE

---

**Test Case ID:** TC-POS-001  
**Module:** Sales / POS  
**Priority:** Critical  
**Precondition:** User is authenticated as Cashier or Owner. At least one product with sufficient stock exists. COA accounts (Kas, Penjualan, HPP, Persediaan) are seeded.  
**Test Steps:**  
1. Open POS interface.  
2. Add one product (qty: 1) to the cart.  
3. Confirm payment method as Cash.  
4. Submit the transaction via POST /api/v1/sales.  
**Expected Result:**  
- HTTP 201 returned with `{ journalId, status: 'COMMITTED' }`.  
- A new `journal_entries` record is created with matching `tenant_id`.  
- Exactly two journal line pairs exist: Debit Kas = Credit Penjualan, Debit HPP = Credit Persediaan.  
- `Math.abs(totalDebit - totalCredit) <= 0.001` for the journal entry.  
- Raw material stock is decremented by the recipe quantity.  
- A `SaleCreated` event is persisted in `event_log`.

---

**Test Case ID:** TC-POS-002  
**Module:** Sales / POS  
**Priority:** Critical  
**Precondition:** User is authenticated. Multiple products exist with valid recipes and sufficient stock.  
**Test Steps:**  
1. Add 3 different products to the cart with quantities 2, 1, and 5 respectively.  
2. Submit the transaction.  
**Expected Result:**  
- A single `journal_entries` record is created.  
- Total sale amount equals the sum of (price * quantity) for all 3 items.  
- HPP is calculated as sum of (unit_price * quantity_needed * qty) across all recipe materials.  
- Each raw material stock is decremented by the exact calculated amount.  
- `sale_items` table contains exactly 3 rows linked to the journal entry.

---

**Test Case ID:** TC-POS-003  
**Module:** Sales / POS  
**Priority:** High  
**Precondition:** An active promotion of type `discount_percentage` (e.g., 10%) exists for the tenant. Product is eligible for promo.  
**Test Steps:**  
1. Add eligible product to cart.  
2. Call POST /api/v1/promotions/apply with cart items.  
3. Verify discount is applied.  
4. Submit the sale with `discount_amount` populated.  
**Expected Result:**  
- PromoService returns the correct discounted price (original * 0.9).  
- Journal includes a Debit line on Diskon Penjualan (4-41000) for the discount amount.  
- Net cash received (Debit Kas) = totalSaleAmount - discountAmount.  
- Total Debit still equals Total Credit across all journal lines.

---

**Test Case ID:** TC-POS-004  
**Module:** Sales / POS  
**Priority:** Critical  
**Precondition:** Product A exists with raw material stock = 2 units. Recipe requires 1 unit per product.  
**Test Steps:**  
1. Add Product A to cart with quantity = 5.  
2. Submit the transaction.  
**Expected Result:**  
- Transaction is rejected with an error indicating insufficient stock.  
- No `journal_entries` record is created (transaction rolled back).  
- Raw material stock remains at 2 units (unchanged).  
- No `SaleCreated` event is emitted to `event_log`.

---

**Test Case ID:** TC-POS-005  
**Module:** Sales / POS  
**Priority:** Critical  
**Precondition:** User is authenticated. Product with sufficient stock exists.  
**Test Steps:**  
1. Send two identical POST /api/v1/sales requests simultaneously (same idempotency key).  
**Expected Result:**  
- Only one transaction is processed and committed.  
- The second request is either rejected by IdempotencyMiddleware or returns the same result.  
- Stock is decremented only once.  
- Only one journal entry exists.

---

**Test Case ID:** TC-POS-006  
**Module:** Sales / POS  
**Priority:** Critical  
**Precondition:** Product exists. AccountingService is configured to reject unbalanced journals.  
**Test Steps:**  
1. Simulate a failure during journal line insertion (e.g., invalid account_id).  
2. Observe the UnitOfWork transaction behavior.  
**Expected Result:**  
- PostgreSQL ROLLBACK is executed.  
- No partial data exists in `journal_entries`, `journal_lines`, or `sale_items`.  
- Stock is not decremented.  
- Transaction status is set to 'FAILED' via accountingRepository.updateTransactionStatus.  
- Error is logged with trace ID.

---

**Test Case ID:** TC-POS-007  
**Module:** Sales / POS  
**Priority:** High  
**Precondition:** Tenant is on Starter tier. 499 transactions already exist for the current month.  
**Test Steps:**  
1. Submit transaction #500 (should succeed).  
2. Submit transaction #501.  
**Expected Result:**  
- Transaction #500 succeeds normally.  
- Transaction #501 returns HTTP 403 with message: "Limit 500 transaksi per bulan tercapai untuk Tier STARTER."  
- No journal or stock changes occur for #501.

---

## 2. ACCOUNTING MODULE

---

**Test Case ID:** TC-ACC-001  
**Module:** Accounting  
**Priority:** Critical  
**Precondition:** Valid tenant with seeded COA.  
**Test Steps:**  
1. Call AccountingService.createJournalEntry with lines where Debit = 100,000 and Credit = 100,000.  
**Expected Result:**  
- JournalEntry.validateBalance() returns true.  
- Journal entry is persisted in `journal_entries`.  
- Journal lines are persisted in `journal_lines`.

---

**Test Case ID:** TC-ACC-002  
**Module:** Accounting  
**Priority:** Critical  
**Precondition:** Valid tenant with seeded COA.  
**Test Steps:**  
1. Call AccountingService.createJournalEntry with lines where Debit = 100,000 and Credit = 99,000.  
**Expected Result:**  
- JournalEntry.validateBalance() throws Error: "Debit and Credit must be balanced."  
- No records are inserted into `journal_entries` or `journal_lines`.

---

**Test Case ID:** TC-ACC-003  
**Module:** Accounting  
**Priority:** Critical  
**Precondition:** Tenant has 10 completed sales transactions and 3 expense journal entries.  
**Test Steps:**  
1. Query `monthly_profit_loss` materialized view for current month.  
2. Manually compute: Revenue (sum of credit on 4-40000) minus COGS (sum of debit on 5-50000) minus Expenses (sum of debit on 6-xxxxx).  
**Expected Result:**  
- Materialized view net profit matches manual calculation exactly.  
- No discrepancy greater than 0.01 IDR.

---

**Test Case ID:** TC-ACC-004  
**Module:** Accounting  
**Priority:** Critical  
**Precondition:** Tenant has active financial data across all account types.  
**Test Steps:**  
1. Query `ledger_balances` materialized view.  
2. Compute: Total Assets = Total Liabilities + Total Equity.  
3. Verify the accounting equation.  
**Expected Result:**  
- Assets = Liabilities + Equity (within 0.01 tolerance).  
- All account balances reflect correct normal balance direction.

---

**Test Case ID:** TC-ACC-005  
**Module:** Accounting  
**Priority:** High  
**Precondition:** Tenant has 20+ journal entries across various accounts.  
**Test Steps:**  
1. For each account in COA, sum all debit and credit lines from `journal_lines`.  
2. Compare computed balance with `ledger_balances` view.  
**Expected Result:**  
- Every account balance in ledger_balances matches the computed sum from journal_lines.  
- No orphaned journal_lines exist (every line references a valid entry_id).

---

## 3. INVENTORY MODULE

---

**Test Case ID:** TC-INV-001  
**Module:** Inventory  
**Priority:** Critical  
**Precondition:** Raw material "Gula" has current_stock = 100 units. Product recipe requires 5 units of Gula per product.  
**Test Steps:**  
1. Sell 3 units of the product via POS.  
**Expected Result:**  
- Gula stock is decremented by 15 (5 * 3).  
- New stock = 85.  
- Stock change is atomic (within the same DB transaction as the sale).

---

**Test Case ID:** TC-INV-002  
**Module:** Inventory  
**Priority:** High  
**Precondition:** Two warehouses exist (Main and Branch). Product stock in Main = 50.  
**Test Steps:**  
1. Create stock transfer: from Main to Branch, quantity = 20.  
2. Approve the transfer.  
**Expected Result:**  
- Main warehouse stock = 30.  
- Branch warehouse stock increases by 20.  
- `stock_transfers` record has status = 'completed'.  
- `stock_transfer_items` contains the correct product and quantity.

---

**Test Case ID:** TC-INV-003  
**Module:** Inventory  
**Priority:** Critical  
**Precondition:** Raw material stock = 3 units.  
**Test Steps:**  
1. Attempt to deduct 5 units via InventoryRepository.deductStock.  
**Expected Result:**  
- Operation is rejected with an error.  
- Stock remains at 3 units.  
- No negative stock values exist in the database.

---

**Test Case ID:** TC-INV-004  
**Module:** Inventory  
**Priority:** High  
**Precondition:** Product has a complex recipe: 2 units of Material A, 0.5 units of Material B, 1 unit of Material C.  
**Test Steps:**  
1. Sell 4 units of the product.  
**Expected Result:**  
- Material A decremented by 8 (2 * 4).  
- Material B decremented by 2 (0.5 * 4).  
- Material C decremented by 4 (1 * 4).  
- HPP = (A.unit_price * 8) + (B.unit_price * 2) + (C.unit_price * 4).

---

**Test Case ID:** TC-INV-005  
**Module:** Inventory  
**Priority:** High  
**Precondition:** Tenant is on Starter tier. 149 products exist.  
**Test Steps:**  
1. Create product #150 (should succeed).  
2. Create product #151.  
**Expected Result:**  
- Product #150 is created successfully.  
- Product #151 returns HTTP 403: "Limit 150 produk tercapai untuk Tier FREE."

---

## 4. PROCUREMENT MODULE

---

**Test Case ID:** TC-PROC-001  
**Module:** Procurement  
**Priority:** High  
**Precondition:** Tenant has 3 products with current_stock <= 5. Cron job is scheduled.  
**Test Steps:**  
1. Trigger ProcurementCronService manually or wait for EVERY_DAY_AT_MIDNIGHT.  
**Expected Result:**  
- 3 procurement draft records are inserted into `business_memory` with type = 'procurement_draft'.  
- Each draft contains correct product_id, current_stock, and suggested reorder quantity.  
- No AI/LLM service is called during this process.

---

**Test Case ID:** TC-PROC-002  
**Module:** Procurement  
**Priority:** High  
**Precondition:** A procurement draft exists in business_memory.  
**Test Steps:**  
1. Owner opens /tenant/procurement/drafts on web dashboard.  
2. Reviews the draft, edits quantity.  
3. Approves the draft.  
**Expected Result:**  
- A new `purchase_orders` record is created with status = 'draft' or 'sent'.  
- PO contains correct vendor, items, and updated quantities.  
- Original draft in business_memory is marked as processed.

---

**Test Case ID:** TC-PROC-003  
**Module:** Procurement  
**Priority:** Medium  
**Precondition:** Tenant has no products with current_stock <= 5.  
**Test Steps:**  
1. Trigger ProcurementCronService.  
**Expected Result:**  
- No procurement drafts are created.  
- Cron completes without error.  
- Log indicates "No low-stock products found for tenant X."

---

**Test Case ID:** TC-PROC-004  
**Module:** Procurement  
**Priority:** High  
**Precondition:** Multiple tenants exist with varying stock levels.  
**Test Steps:**  
1. Trigger ProcurementCronService.  
**Expected Result:**  
- Drafts are generated only for tenants with low-stock products.  
- No cross-tenant data leakage (tenant A's draft does not reference tenant B's products).

---

## 5. AI SYSTEM MODULE

---

**Test Case ID:** TC-AI-001  
**Module:** AI System  
**Priority:** High  
**Precondition:** Tenant has financial data. User is on Business tier or higher.  
**Test Steps:**  
1. Send POST /api/v1/ai/chat with prompt: "Bagaimana kondisi keuangan saya?"  
**Expected Result:**  
- Response contains a text-based financial insight.  
- AggregatorService queries ledger_balances (read-only).  
- MemoryService queries business_memory (read-only).  
- No INSERT, UPDATE, or DELETE operations occur on financial tables.

---

**Test Case ID:** TC-AI-002  
**Module:** AI System  
**Priority:** High  
**Precondition:** Tenant is on Pro tier. A receipt image is available.  
**Test Steps:**  
1. Send POST /api/v1/ai/scan-receipt with the receipt image.  
**Expected Result:**  
- Response contains extracted line items (vendor, items, amounts).  
- A draft journal suggestion is returned but NOT automatically committed.  
- No records are inserted into journal_entries or journal_lines.

---

**Test Case ID:** TC-AI-003  
**Module:** AI System  
**Priority:** Critical  
**Precondition:** AI endpoint is accessible.  
**Test Steps:**  
1. Inspect all AI service methods (chat, scanReceipt, generateFinancialInsight).  
2. Verify that none of them call INSERT, UPDATE, or DELETE on financial tables.  
**Expected Result:**  
- AI services only perform SELECT queries via AggregatorService and MemoryService.  
- The only write operation permitted is saving insights to `business_memory` (non-financial table).  
- No mutation of journal_entries, journal_lines, transactions, products, or raw_materials.

---

**Test Case ID:** TC-AI-004  
**Module:** AI System  
**Priority:** Medium  
**Precondition:** Gemini API is unreachable or returns an error.  
**Test Steps:**  
1. Send POST /api/v1/ai/chat with a valid prompt while Gemini API is down.  
**Expected Result:**  
- System returns a graceful error message (not a raw stack trace).  
- No data corruption occurs.  
- Error is logged with trace ID for debugging.

---

**Test Case ID:** TC-AI-005  
**Module:** AI System  
**Priority:** Medium  
**Precondition:** Tenant is on Starter tier.  
**Test Steps:**  
1. Send POST /api/v1/ai/chat.  
**Expected Result:**  
- Request is rejected by TierGuard with HTTP 403.  
- Message indicates that AI chat requires Business tier or higher.

---

## 6. AUTH / SECURITY MODULE

---

**Test Case ID:** TC-AUTH-001  
**Module:** Auth / Security  
**Priority:** Critical  
**Precondition:** No authentication token is provided.  
**Test Steps:**  
1. Send GET /api/v1/finance/balance-sheet without Authorization header.  
**Expected Result:**  
- HTTP 401 Unauthorized.  
- No financial data is returned.

---

**Test Case ID:** TC-AUTH-002  
**Module:** Auth / Security  
**Priority:** Critical  
**Precondition:** User is authenticated as Cashier role.  
**Test Steps:**  
1. Send GET /api/v1/finance/balance-sheet.  
2. Send GET /api/v1/staff.  
3. Send POST /api/v1/sales (with valid payload).  
**Expected Result:**  
- Balance sheet request is rejected by RoleGuard (Cashier cannot access finance).  
- Staff list request is rejected (Cashier cannot view staff).  
- Sales request is permitted (Cashier can process sales).

---

**Test Case ID:** TC-AUTH-003  
**Module:** Auth / Security  
**Priority:** Critical  
**Precondition:** User is on Starter tier.  
**Test Steps:**  
1. Send GET /api/v1/finance/balance-sheet (requires Pro tier).  
2. Send GET /api/v1/finance/cash-flow (requires Pro tier).  
3. Send GET /api/v1/promotions (requires Business tier).  
**Expected Result:**  
- All three requests return HTTP 403 with tier restriction message.  
- No financial data is leaked.

---

**Test Case ID:** TC-AUTH-004  
**Module:** Auth / Security  
**Priority:** Critical  
**Precondition:** Tenant A and Tenant B both have data. User belongs to Tenant A.  
**Test Steps:**  
1. User A sends GET /api/v1/finance/balance-sheet.  
2. Verify returned data contains only Tenant A records.  
3. Attempt to query Tenant B data by manipulating tenant_id in request body.  
**Expected Result:**  
- Only Tenant A data is returned (enforced by RLS and backend tenant_id injection).  
- Manipulated tenant_id is ignored; backend uses JWT-derived tenant_id.  
- Zero records from Tenant B appear in any response.

---

**Test Case ID:** TC-AUTH-005  
**Module:** Auth / Security  
**Priority:** High  
**Precondition:** Valid JWT token that has expired.  
**Test Steps:**  
1. Send any authenticated request with the expired token.  
**Expected Result:**  
- HTTP 401 Unauthorized.  
- Supabase strategy rejects the token.  
- No data is returned.

---

## 7. REPORTING / API MODULE

---

**Test Case ID:** TC-RPT-001  
**Module:** Reporting / API  
**Priority:** Critical  
**Precondition:** Tenant has 5 completed sales with known amounts.  
**Test Steps:**  
1. Call AnalyticsCronService to refresh materialized views.  
2. Query GET /api/v1/finance/balance-sheet.  
3. Manually verify totals against journal_lines.  
**Expected Result:**  
- Balance sheet data matches the aggregated journal lines.  
- Revenue accounts show correct credit totals.  
- Asset accounts show correct debit totals.

---

**Test Case ID:** TC-RPT-002  
**Module:** Reporting / API  
**Priority:** High  
**Precondition:** Tenant has data. User is on Pro tier.  
**Test Steps:**  
1. Call GET /api/v1/finance/cash-flow.  
2. Verify response structure.  
**Expected Result:**  
- Response contains array of objects with: id, debit, credit, created_at, accounts.name, journal_entries.description.  
- accounts.name is populated (not null) for all entries.  
- Total debit and credit values are non-negative.

---

**Test Case ID:** TC-RPT-003  
**Module:** Reporting / API  
**Priority:** High  
**Precondition:** A sale has been processed, then materialized views refreshed.  
**Test Steps:**  
1. Verify the sale amount appears in POS transaction history.  
2. Verify the same amount appears in journal_entries.  
3. Verify the ledger_balances reflect the updated account balances.  
**Expected Result:**  
- Sale amount is consistent across all three data sources.  
- No discrepancy in any amount field.

---

**Test Case ID:** TC-RPT-004  
**Module:** Reporting / API  
**Priority:** Medium  
**Precondition:** Tenant has no financial data.  
**Test Steps:**  
1. Call GET /api/v1/finance/balance-sheet.  
**Expected Result:**  
- Response is an empty array (not an error).  
- HTTP 200 with valid JSON.

---

## 8. END-TO-END FLOW

---

**Test Case ID:** TC-E2E-001  
**Module:** End-to-End  
**Priority:** Critical  
**Precondition:** Fresh system with no tenant data.  
**Test Steps:**  
1. Register a new user via Supabase Auth (email/password).  
2. Complete onboarding: POST /api/v1/onboarding with industry, scale, complexity.  
3. Verify COA is seeded (24 standard accounts).  
4. Add a raw material via Inventory.  
5. Create a product with a recipe referencing the raw material.  
6. Process a sale via POS.  
7. Trigger AnalyticsCronService to refresh views.  
8. Query balance sheet and profit/loss.  
**Expected Result:**  
- User registration succeeds; profile and tenant are created.  
- COA contains 24 accounts with correct codes and types.  
- Product is created with recipe linkage.  
- Sale generates a balanced journal entry.  
- Stock is decremented correctly.  
- Balance sheet reflects the new asset (cash) and equity changes.  
- Profit/Loss shows revenue minus COGS.

---

**Test Case ID:** TC-E2E-002  
**Module:** End-to-End  
**Priority:** High  
**Precondition:** Tenant exists on Starter tier with active subscription.  
**Test Steps:**  
1. Verify Starter tier restrictions are enforced (no balance sheet access, no AI chat).  
2. Upgrade tenant tier to Business in the database.  
3. Retry previously blocked operations.  
**Expected Result:**  
- After upgrade, AI chat endpoint returns HTTP 200.  
- Promotions CRUD endpoints become accessible.  
- Balance sheet remains blocked (requires Pro tier).

---

**Test Case ID:** TC-E2E-003  
**Module:** End-to-End  
**Priority:** Critical  
**Precondition:** Tenant has products, raw materials, and a recipe. Active promo exists.  
**Test Steps:**  
1. Apply promo to cart items.  
2. Process sale with discount.  
3. Verify journal: Debit Kas + Debit Diskon = Credit Penjualan.  
4. Verify HPP journal: Debit HPP = Credit Persediaan.  
5. Refresh views and check P&L: Net Revenue = Penjualan - Diskon.  
6. Verify stock deduction matches recipe.  
**Expected Result:**  
- All financial equations hold true.  
- No rounding errors exceed 0.01 IDR.  
- Event log contains the SaleCreated event with correct payload.

---

## 9. STRESS / LOAD TEST

---

**Test Case ID:** TC-STRESS-001  
**Module:** Stress / Load  
**Priority:** High  
**Precondition:** Tenant has 50 products with sufficient stock.  
**Test Steps:**  
1. Send 100 concurrent POST /api/v1/sales requests (each with 1 random product).  
**Expected Result:**  
- All successful transactions have balanced journal entries.  
- Total stock decrement across all products equals the sum of individual recipe deductions.  
- No duplicate journal entries exist (idempotency check).  
- Failed transactions (if any) are fully rolled back with no partial data.

---

**Test Case ID:** TC-STRESS-002  
**Module:** Stress / Load  
**Priority:** Critical  
**Precondition:** Product A has raw material stock = 10 units. Recipe requires 1 unit per product.  
**Test Steps:**  
1. Send 15 concurrent sale requests for Product A (qty = 1 each).  
**Expected Result:**  
- Exactly 10 transactions succeed.  
- Exactly 5 transactions fail with insufficient stock error.  
- Final stock = 0 (not negative).  
- No overselling occurs (total sold units <= 10).

---

**Test Case ID:** TC-STRESS-003  
**Module:** Stress / Load  
**Priority:** High  
**Precondition:** 10 tenants exist, each with active financial data.  
**Test Steps:**  
1. Trigger AnalyticsCronService to refresh materialized views for all tenants.  
2. Simultaneously, process sales on 3 different tenants.  
**Expected Result:**  
- Materialized view refresh completes without deadlock.  
- Concurrent sales are not blocked by the view refresh.  
- All journal entries remain balanced after both operations complete.

---

**Test Case ID:** TC-STRESS-004  
**Module:** Stress / Load  
**Priority:** Medium  
**Precondition:** BullMQ queue is active.  
**Test Steps:**  
1. Process 50 sales in rapid succession.  
2. Monitor event_log and BullMQ queue.  
**Expected Result:**  
- All 50 SaleCreated events are persisted in event_log.  
- All 50 events are enqueued in BullMQ with unique job IDs.  
- No events are lost or duplicated.  
- Queue processing completes with exponential backoff on failures.

---

## APPENDIX: TEST CASE SUMMARY

| Module | Total Cases | Critical | High | Medium | Low |
|---|---|---|---|---|---|
| Sales / POS | 7 | 5 | 2 | 0 | 0 |
| Accounting | 5 | 4 | 1 | 0 | 0 |
| Inventory | 5 | 2 | 3 | 0 | 0 |
| Procurement | 4 | 0 | 3 | 1 | 0 |
| AI System | 5 | 1 | 2 | 2 | 0 |
| Auth / Security | 5 | 4 | 1 | 0 | 0 |
| Reporting / API | 4 | 1 | 2 | 1 | 0 |
| End-to-End | 3 | 2 | 1 | 0 | 0 |
| Stress / Load | 4 | 1 | 2 | 1 | 0 |
| **TOTAL** | **42** | **20** | **17** | **5** | **0** |

---

END OF DOCUMENT
