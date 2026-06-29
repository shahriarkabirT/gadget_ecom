import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions | SUNDUS",
  description:
    "Find answers to common questions about SUNDUS — our products, ordering, delivery, quality, and more. Bangladesh's modern modest fashion & lifestyle brand.",
  keywords: ["SUNDUS FAQ", "SUNDUS help", "order SUNDUS", "SUNDUS delivery", "modest fashion Bangladesh"],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://sundus.com.bd/faq" },
  openGraph: {
    type: "website",
    url: "https://sundus.com.bd/faq",
    title: "FAQ | SUNDUS — Modern Modest Fashion & Lifestyle",
    description: "Answers to everything you need to know about SUNDUS.",
    images: [{ url: "https://sundus.com.bd/og-faq.jpg" }],
    locale: "en_BD",
    siteName: "SUNDUS",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is SUNDUS?", acceptedAnswer: { "@type": "Answer", text: "SUNDUS is a modern modest fashion & lifestyle brand offering premium quality fashion and lifestyle products for men, women, and kids." } },
    { "@type": "Question", name: "What products are available at SUNDUS?", acceptedAnswer: { "@type": "Answer", text: "Men's Fashion, Women's Fashion, Kids Collection, Watches, Perfumes, Fashion Accessories, and Lifestyle Essentials." } },
    { "@type": "Question", name: "Does SUNDUS provide home delivery?", acceptedAnswer: { "@type": "Answer", text: "Yes. We provide delivery services to ensure customers receive their products safely and conveniently." } },
    { "@type": "Question", name: "Can I order online from SUNDUS?", acceptedAnswer: { "@type": "Answer", text: "Yes. Customers can easily place orders online through our website and social media platforms." } },
    { "@type": "Question", name: "Who is the founder of SUNDUS?", acceptedAnswer: { "@type": "Answer", text: "SUNDUS was founded by MD Foyshal Ahmed, Founder & CEO." } },
    { "@type": "Question", name: "What is the mission of SUNDUS?", acceptedAnswer: { "@type": "Answer", text: "To provide premium quality fashion and lifestyle products that combine elegance, comfort, modesty, and modern trends." } },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqClient />
    </>
  );
}