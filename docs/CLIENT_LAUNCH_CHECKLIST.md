# Liberty Pro Coatings — Information & Assets Needed to Launch

Your Liberty Pro Coatings website is **live in test mode** at liberty-pro-coatings.vercel.app and is **feature-complete** — every page, product, and the full checkout flow are already built. The items below are the **product, pricing, color, freight, and accounting details** we still need from you (and, for the Sage section, from Brent / your accounting admin) before products can go fully live.

---

## 1) Product Pricing

- [ ] **Confirm the public list price for every product** — These pages show prices publicly, so we need the final list price (and any published tiers) for all ~20 products. Real sheet prices are loaded now, but they stay labeled "placeholder" until you sign off. *(unblocks: showing prices and building carts on every product page)*
- [ ] **Two in-development urethanes have placeholder prices** — UG-21 and UG-31 (water-based urethanes, gloss/satin) currently show a stand-in $112; UG-55 (high-wear matte) shows $215.57 but is on R&D hold. Confirm whether each launches, the real list price, and the pack size (e.g. confirm UG-31 is sold in a 2 Gal pack). *(unblocks: making these products buyable instead of showing a placeholder)*
- [ ] **Confirm the 5-gallon polyaspartic prices** — For PG-61, PG-71, and PG-81 we currently set the 5-gal price to exactly double the 2.5-gal price, with no per-gallon volume break. Send the real 5-gal list price for each (and confirm 2.5 gal = $211.54). *(unblocks: charging the correct price for the larger pack instead of likely overcharging)*
- [ ] **Price the supporting / media SKUs** — 15 flake, metallic, quartz, aggregate, grit, and cleaner items (e.g. 1375 flake, 1338 metallic, 1321 quartz, 1440 Scapes, 1441 Poly-T, C-23 degreaser, C-99 solvent) have no price yet. Send a list price and pack size for each. *(unblocks: making these add-on products buyable)*
- [ ] **Confirm the volume-discount rule** — The −5% at $5,000+ tier isn't built yet. Confirm the exact discount(s) and order-total threshold(s) if they should apply at launch. *(unblocks: large orders getting the right discount instead of small-order pricing)*
- [ ] **Where contract pricing lives** — Public list pricing is decided. If approved contractors get negotiated/contract pricing, send the per-account rules — or confirm that pricing stays in Sage and the website only shows list prices (see Sage question 6 below). *(unblocks: correct pricing for approved accounts)*

## 2) Colors & Aggregate Names

- [ ] **Real names and blends for the color & aggregate lines** — Confirm the customer-facing names/blends for the flake (1375), quartz (1321 broadcast and trowel), metallic (1338), Scapes (1440), and Poly-T (1441) lines. These currently use generic internal descriptions and appear on the Colors page, in system build-ups, and in product color options. *(unblocks: the Colors page and every color picker)*
- [ ] **Marketing names for the solid colors** — The 12 solid-color options display internal codes (C-01, C-02, …). Send the real color names (e.g. "Slate Gray," "Safety Yellow") for each, and confirm the 12-color set is correct. *(unblocks: customers seeing real color names instead of codes)*
- [ ] **Confirm the decorative swatch set is yours** — The flake/metallic/quartz swatches (Basalt, Cabin Fever, Amber, Cobalt, etc. — 47 in all) were carried over from the sister brand. Confirm LPC stocks and sells this exact set under the LPC name with the names unchanged. *(unblocks: not advertising colors you don't carry)*
- [ ] **(Optional) Official color specs** — The small color chips use eyeballed/sampled colors, not official specs. If exact on-screen color matters, send official hex/spec values per swatch. *(unblocks: more accurate mini-swatches; otherwise the sampled colors stay)*

## 3) Freight & Shipping (live quoting)

- [ ] **Fill out the freight spreadsheet (one row per product AND pack size)** — Complete the prepared freight/hazmat sheet at `docs/freight/lpc-freight-hazmat-template.csv` (33 rows already keyed by SKU and pack size — don't change the first 4 columns). Fill in, per row: freight class, NMFC code, hazmat Y/N, UN number, proper shipping name, hazard class, packing group, unit weight, units per pallet, pallet weight, pallet length/width/height, default accessorials (e.g. liftgate, residential), and any handling notes (e.g. freeze-sensitive). **Pull hazmat values from each product's SDS Section 14 — and do NOT assume every coating is hazmat:** many waterborne and 100%-solids products (much of the Epo-Guard / Poly-Guard line) are frequently **not** DOT-regulated, so confirm per product rather than over-classifying (over-classifying adds bogus surcharges and mis-rates freight). A wrong freight class is the #1 cause of quoted-vs-billed losses, and any product missing this data can't be turned on. *(unblocks: real freight quotes at checkout and flipping products to buyable)*
- [ ] **Live freight carrier access** — Set up a Banyan LIVE Connect account and send its API/sandbox credentials so we can return real, binding LTL freight at checkout — OR, if you ship with two or fewer carriers on good rates, send those carriers' account/developer credentials (Estes, Old Dominion, Saia, R+L, FedEx Freight) and we'll use their APIs directly. Until then, checkout shows only a clearly labeled estimate and doesn't charge freight. *(unblocks: charging real freight instead of a display-only estimate)*
- [ ] **Confirm the ship-from location** — Confirm all orders ship from 405 Oakwood Ave, Waukegan, IL 60085 and that there's exactly one shipping origin. If any products ship from a different location, send those ZIP codes. *(unblocks: accurate freight on every order — origin is the start point of every quote)*
- [ ] **What to do when no rate comes back** — Confirm the fallback behavior when a carrier returns no rate (we retry and show a clear message rather than silently blocking the order). *(unblocks: a freight hiccup not killing a checkout)*
- [ ] **Confirm hazmat shipping operations are ready** — Confirm the physical hazmat shipping operation exists before launch: bills of lading, placarding, and trained staff. (Outside the website itself, but required to legally ship what the site sells.) *(unblocks: legally shipping the hazmat products you list)*

## 4) Sage / ERP

- [ ] **Answer the Sage setup questions (forward to Brent)** — We need to understand your Sage system to push orders and customers into it. Depending on the answers this is either a simple direct connection or a larger middleware project — it's the biggest unknown in the build. Please have Brent / your Sage admin answer:
  1. Which Sage product and version/year? (Intacct, 100, 300, or X3 — and if 100, Standard/Advanced or Premium/SQL?)
  2. Cloud-hosted or on-premise? If on-prem, is there a server/VPN path an outside app can reach, or do we need a middleware/agent that polls?
  3. Is an API / Web API module already licensed and installed, or any middleware (Celigo, Boomi, Kissinger, ROI, Greytrix)?
  4. Real-time push required, or is batch/queue acceptable?
  5. Who owns the data model and the order/customer numbering rules, so we map customers, SKUs, pricing, and tax codes correctly?
  6. Is customer-specific/contract pricing held in Sage — does it flow to the website, or does the website own pricing?
  7. What's the sandbox/test path (especially Intacct, which has no free sandbox)?

  *(unblocks: connecting website orders and customers to your accounting system)*
