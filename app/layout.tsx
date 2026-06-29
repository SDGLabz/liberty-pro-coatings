import type { Metadata, Viewport } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SiteProvider } from "@/components/site/SiteProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { MobileSheet } from "@/components/site/MobileSheet";
import { SurveyModal } from "@/components/site/SurveyModal";
import { Effects } from "@/components/site/Effects";
import { AccessibilityProvider } from "@/components/a11y/accessibility-provider";
import { AccessibilityMenu } from "@/components/a11y/accessibility-menu";
import { CookieConsent } from "@/components/site/CookieConsent";

// Weights pinned to exactly the faces globals.css uses, so the browser stops
// fetching the full variable axis (Oswald 500/600/700, Inter 400/600/700/800,
// JetBrains Mono 400/500/600). The `variable` names still match the CSS vars
// (--font-oswald / --font-inter / --font-jetbrains) globals.css already consumes.
const oswald = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-oswald", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Liberty Pro Coatings — Concrete Floor Coating Systems for the Trade",
    template: "%s · Liberty Pro Coatings",
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "Liberty Pro Coatings — Concrete Floor Coating Systems for the Trade",
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "Liberty Pro Coatings — Concrete Floor Coating Systems for the Trade",
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a3a6b",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      telephone: SITE.phone,
      email: SITE.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "405 Oakwood Ave",
        addressLocality: "Waukegan",
        addressRegion: "IL",
        postalCode: "60085",
        addressCountry: "US",
      },
      parentOrganization: { "@type": "Organization", name: SITE.parent },
    },
    {
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SiteProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <AccessibilityProvider>
            {/* #a11y-root wraps all page content so the accessibility widget's
                saturation / recolor / read-mode adjustments can target the site
                without affecting the fixed widget itself (mounted outside it). */}
            <div id="a11y-root">
              <Header />
              <main id="main">{children}</main>
              <Footer />
              <CartDrawer />
              <MobileSheet />
              <SurveyModal />
              <Effects />
            </div>
            <AccessibilityMenu />
          </AccessibilityProvider>
          <CookieConsent />
        </SiteProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
