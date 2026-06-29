import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About SUNDUS — Modern Modest Fashion & Lifestyle Brand Bangladesh",
  description:
    "SUNDUS is Bangladesh's premium modest fashion & lifestyle brand. Discover our story, mission, and vision — elegant Panjabi, Abaya, Watches, Perfumes & more.",
  keywords: ["SUNDUS", "modest fashion Bangladesh", "Islamic fashion", "Panjabi", "Abaya", "lifestyle brand", "MD Foyshal Ahmed"],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://sundus.com.bd/about" },
  openGraph: {
    type: "website",
    url: "https://sundus.com.bd/about",
    title: "About SUNDUS — Modern Modest Fashion & Lifestyle Brand",
    description: "Premium fashion, Islamic elegance, and modern lifestyle — all in one place.",
    images: [{ url: "https://sundus.com.bd/og-about.jpg" }],
    locale: "en_BD",
    siteName: "SUNDUS",
  },
  twitter: {
    card: "summary_large_image",
    title: "About SUNDUS — Modern Modest Fashion & Lifestyle Brand",
    description: "Premium fashion, Islamic elegance, and modern lifestyle — all in one place.",
    images: ["https://sundus.com.bd/og-about.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SUNDUS",
  url: "https://sundus.com.bd",
  description: "Modern modest fashion & lifestyle brand from Bangladesh",
  foundingLocation: { "@type": "Place", name: "Bangladesh" },
  founder: { "@type": "Person", name: "MD Foyshal Ahmed", jobTitle: "Founder & CEO" },
  sameAs: ["https://facebook.com/sundusbd", "https://instagram.com/sundusbd"],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}