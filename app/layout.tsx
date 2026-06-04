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

// Variable fonts — names match the CSS vars globals.css already consumes
// (--font-oswald / --font-inter / --font-jetbrains).
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
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

const jsonLd = [
  {
    "@context": "https://schema.org",
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
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
  },
];

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
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <MobileSheet />
          <SurveyModal />
          <Effects />
        </SiteProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
