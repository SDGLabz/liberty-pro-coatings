// Server-only: renders a branded Technical Data Sheet PDF from a product's
// catalog TDS data (no external assets — built entirely from lib/catalog).
// Uses @react-pdf/renderer's built-in Helvetica so no font files are needed.
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Product } from "./catalog";
import { CHEM_LABELS } from "./catalog";

const NAVY = "#0a3a6b";
const RED = "#d6212e";
const INK = "#0c1424";
const GRAY = "#5a6b80";
const LINE = "#d9dee6";

const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 56, paddingHorizontal: 44, fontSize: 9, color: INK, fontFamily: "Helvetica", lineHeight: 1.45 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 2, borderBottomColor: NAVY, paddingBottom: 8, marginBottom: 14 },
  brand: { fontSize: 14, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 0.5 },
  brandSub: { fontSize: 8, color: RED, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1 },
  sku: { fontSize: 8, color: GRAY, fontFamily: "Helvetica-Bold", letterSpacing: 1, marginBottom: 2 },
  title: { fontSize: 17, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 4 },
  descriptor: { fontSize: 9.5, color: GRAY, marginBottom: 14 },
  glanceRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  glanceCell: { flex: 1, backgroundColor: "#f3f6fa", borderRadius: 4, padding: 8 },
  glanceK: { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2, fontFamily: "Helvetica-Bold" },
  glanceV: { fontSize: 9.5, color: INK, fontFamily: "Helvetica-Bold" },
  h2: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 12, marginBottom: 4 },
  para: { fontSize: 9, color: INK, marginBottom: 2 },
  tableTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 14, marginBottom: 6 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINE, paddingVertical: 3 },
  cellK: { width: "42%", color: GRAY, paddingRight: 8 },
  cellStd: { width: "26%", color: GRAY, fontSize: 8, paddingRight: 8 },
  cellV: { flex: 1, color: INK, fontFamily: "Helvetica-Bold" },
  cellVWide: { flex: 1, color: INK, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 24, left: 44, right: 44, borderTopWidth: 0.5, borderTopColor: LINE, paddingTop: 7 },
  footerText: { fontSize: 7, color: GRAY, lineHeight: 1.4 },
});

function Section({ heading, body }: { heading: string; body: string }) {
  return (
    <View wrap={false}>
      <Text style={s.h2}>{heading}</Text>
      <Text style={s.para}>{body}</Text>
    </View>
  );
}

function tdsDocument(p: Product) {
  const tds = p.tds!;
  return (
    <Document title={`${p.sku} — ${p.name} TDS`} author="Liberty Pro Coatings">
      <Page size="A4" style={s.page}>
        <View style={s.brandRow}>
          <Text style={s.brand}>LIBERTY PRO COATINGS</Text>
          <Text style={s.brandSub}>Technical Data Sheet</Text>
        </View>

        <Text style={s.sku}>
          {p.sku} · {p.family} · {CHEM_LABELS[p.chem]}
        </Text>
        <Text style={s.title}>{p.name}</Text>
        <Text style={s.descriptor}>{p.desc}</Text>

        {p.glance && (
          <View style={s.glanceRow}>
            <View style={s.glanceCell}>
              <Text style={s.glanceK}>Coverage</Text>
              <Text style={s.glanceV}>{p.glance.coverage}</Text>
            </View>
            <View style={s.glanceCell}>
              <Text style={s.glanceK}>Recoat Window</Text>
              <Text style={s.glanceV}>{p.glance.recoat}</Text>
            </View>
            <View style={s.glanceCell}>
              <Text style={s.glanceK}>Full Cure</Text>
              <Text style={s.glanceV}>{p.glance.cure}</Text>
            </View>
          </View>
        )}

        <Section heading="Product Overview" body={tds.overview} />
        <Section heading="Uses & Benefits" body={tds.uses} />
        <Section heading="Limitations" body={tds.limitations} />
        <Section heading="Surface Preparation" body={tds.prep} />
        <Section heading="Mixing" body={tds.mixing} />
        <Section heading="Application" body={tds.application} />

        <View>
          <Text style={s.tableTitle}>Technical Data</Text>
          {tds.technical.map(([k, v], i) => (
            <View style={s.row} key={`t-${i}`} wrap={false}>
              <Text style={s.cellK}>{k}</Text>
              <Text style={s.cellVWide}>{v}</Text>
            </View>
          ))}
        </View>

        <View>
          <Text style={s.tableTitle}>Physical Properties</Text>
          {tds.physical.map(([k, std, v], i) => (
            <View style={s.row} key={`p-${i}`} wrap={false}>
              <Text style={s.cellK}>{k}</Text>
              <Text style={s.cellStd}>{std}</Text>
              <Text style={s.cellV}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Liberty Pro Coatings · 405 Oakwood Ave, Waukegan, IL 60085 · (224) 733-1919 ·
            info@libertyprocoatings.com · libertyprocoatings.com
          </Text>
          <Text style={s.footerText}>
            Data is typical and provided in good faith for guidance; verify suitability for your
            application. No warranty is implied. Confirm against the current published TDS/SDS.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/** Render a product's TDS to a PDF buffer. Throws if the product has no TDS. */
export async function renderTdsPdf(product: Product): Promise<Buffer> {
  if (!product.tds) throw new Error(`No TDS data for ${product.sku}`);
  return renderToBuffer(tdsDocument(product));
}
