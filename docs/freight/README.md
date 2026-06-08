# Liberty Pro Coatings — freight & hazmat data collection

This folder holds the data LPC needs to provide before live freight quoting and
purchasing can be switched on. Fill in **`lpc-freight-hazmat-template.csv`** (open
it in Excel or Google Sheets) and send it back.

## Why this is needed

Checkout shows a **real, freight-inclusive price** before payment — there is no
"request a quote" step. To return an accurate LTL rate, the freight carrier needs
the class, weight, dimensions and hazmat status of what's actually shipping.

> ⚠️ **Freight class accuracy is money.** A wrong NMFC freight class is the #1
> cause of "quoted vs. billed" gaps — if it's wrong, LPC eats the difference on
> every shipment. Please confirm against LPC's NMFC listing / carrier tariff
> rather than estimating.

## How to fill it in

- **One row per product *and* package size.** A 3-gal pail and a 165-gal tote of
  the same product ship completely differently, so each size is its own row.
- The first four columns (`sku`, `product_name`, `chemistry`, `package_size`) are
  pre-filled — don't change them. Fill everything to the right.
- Leave a cell blank only if it genuinely doesn't apply (e.g., hazmat fields for a
  non-hazmat product).

## Column guide

| Column | What to enter | Example |
|---|---|---|
| `freight_class` | NMFC freight class | `55`, `60`, `70` |
| `nmfc_code` | NMFC item number | `51060` |
| `is_hazmat_YN` | Is it DOT-regulated for transport? `Y` or `N` | `Y` |
| `un_number` | UN/ID number (hazmat only) | `UN1263` |
| `proper_shipping_name` | DOT proper shipping name (hazmat only) | `Paint` |
| `hazard_class` | DOT hazard class/division (hazmat only) | `3` (flammable liquid) |
| `packing_group` | Packing group (hazmat only) | `II` or `III` |
| `unit_weight_lb` | Shipping weight of **one** package | `38` |
| `units_per_pallet` | How many units ship on a full pallet | `36` |
| `pallet_weight_lb` | Total weight of a full pallet | `1450` |
| `pallet_length_in` / `pallet_width_in` / `pallet_height_in` | Palletized dimensions in inches | `48` / `40` / `48` |
| `default_accessorials` | Typical delivery needs | `liftgate; residential` |
| `notes` | Anything else (stackable? freeze-sensitive? etc.) | |

### Where most of the hazmat data already lives

Each product's **SDS, Section 14 (Transport Information)** has the UN number,
proper shipping name, hazard class and packing group. That's the authoritative
source — please use it rather than estimating. Many solvent-borne coatings are
flammable liquids (often "UN1263 Paint"), but **do not assume** — confirm per
product, since waterborne and 100%-solids products are frequently *not* regulated.

## What happens after you send it back

1. The data drops straight into the product catalog (the schema already holds
   these fields).
2. A build-time check confirms every product being switched on has complete
   freight data — an incomplete row fails the build instead of shipping a bad
   quote.
3. We wire the live freight call (Banyan LIVE Connect, or direct carrier APIs).

## Two more things we still need from LPC for live freight

- **Origin warehouse ZIP code(s)** — where orders ship from (one location or
  several).
- **Banyan LIVE Connect** demo + API credentials (or confirmation that LPC ships
  with ≤2 carriers, in which case we use those carriers' free direct APIs).
