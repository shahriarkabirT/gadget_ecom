"use client";
import Image from "next/image";
import Link from "next/link";

const products = [
  { icon: "👔", label: "Men's Fashion", sub: "Panjabi & Pajama" },
  { icon: "🧕", label: "Women's Fashion", sub: "Abaya & More" },
  { icon: "👶", label: "Kids Collection", sub: "Adorable Styles" },
  { icon: "⌚", label: "Watches", sub: "Premium Timepieces" },
  { icon: "🌸", label: "Perfumes", sub: "Luxury Fragrances" },
  { icon: "💎", label: "Accessories", sub: "Finishing Touches" },
];

const chips = [
  "Panjabi", "Pajama", "Abaya", "Modest Wear", "Kids Wear",
  "Luxury Watches", "Arabian Perfumes", "Fashion Accessories", "Daily Essentials",
];

const values = [
  { word: "Elegance", ar: "أناقة" },
  { word: "Trust", ar: "ثقة" },
  { word: "Modesty", ar: "حشمة" },
  { word: "Quality", ar: "جودة" },
  { word: "Innovation", ar: "ابتكار" },
];

function SectionTag({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-block text-[11px] tracking-[0.2em] uppercase font-medium border-b pb-0.5 ${dark ? "text-white border-white" : "text-black border-black"}`}>
      {children}
    </span>
  );
}

function Divider({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className={`flex-1 h-px ${dark ? "bg-white/20" : "bg-black/15"}`} />
      <span className={`font-serif text-lg ${dark ? "text-white/40" : "text-black/30"}`}>✦</span>
      <div className={`flex-1 h-px ${dark ? "bg-white/20" : "bg-black/15"}`} />
    </div>
  );
}

export default function AboutClient({ brandName = 'CCloudLab' }: { brandName?: string }) {
  return (
    <main className="bg-white min-h-screen text-black font-sans antialiased">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-28 pb-24 text-center bg-white">
        {/* Subtle grid pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Decorative ring */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full border border-black/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full border border-black/5" />

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <SectionTag>Our Story</SectionTag>

          <h1 className="font-serif mt-5 mb-3 font-light leading-[1.0] tracking-[-0.02em] text-[clamp(64px,10vw,108px)] text-black">
            {brandName}
          </h1>

          <p className="font-serif italic font-light text-black/40 text-[clamp(17px,2.5vw,22px)] mb-8 leading-relaxed">
            Modern Modest Fashion &amp; Lifestyle Brand
          </p>

          <Divider />

          <p className="text-[15px] leading-[1.9] text-black/50 max-w-xl mx-auto">
            Welcome to {brandName} — built with passion, elegance, and trust.
            Where premium fashion meets Islamic grace, and every product tells a story of confidence.
          </p>
        </div>
      </section>

      {/* ── BRAND STORY ── */}
      <section className="bg-black py-28 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

          {/* Badge */}
          <div className="flex justify-center">
            <div className="relative flex flex-col items-center justify-center w-72 h-72 rounded-full border border-white/10 gap-2">
              <div className="absolute inset-[-16px] rounded-full border border-dashed border-white/8 pointer-events-none" />
              <Image 
                src="/images/about_logo.png" 
                alt={`${brandName} Logo`} 
                width={200} 
                height={200} 
                className="w-auto h-auto max-w-[180px] object-contain"
                priority
              />
            </div>
          </div>

          {/* Text */}
          <div>
            <SectionTag dark>Our Beginning</SectionTag>
            <h2 className="font-serif text-4xl font-normal leading-snug mt-4 mb-6 text-white">
              A Dream Woven Into Every Thread
            </h2>
            <p className="text-[15px] leading-[1.85] text-white/55 mb-5">
              {brandName} was founded with a dream — to bring premium fashion, Islamic elegance, and modern lifestyle together in one place. Our goal is not only to sell products, but to create a brand that reflects confidence, modesty, beauty, and quality for every generation.
            </p>
            <p className="text-[15px] leading-[1.85] text-white/55">
              At {brandName}, every product is carefully selected and designed to match today&apos;s fashion trends while maintaining elegance and comfort — because fashion is not just appearance. It is a reflection of personality, values, and lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <SectionTag>What We Offer</SectionTag>
            <h2 className="font-serif text-4xl font-normal mt-4 text-black">
              A Complete Lifestyle Destination
            </h2>
            <p className="text-[15px] text-black/45 mt-3 max-w-lg mx-auto leading-[1.8]">
              From everyday essentials to luxury items — everything our customers need to express their style with confidence.
            </p>
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {products.map(({ icon, label, sub }) => (
              <div
                key={label}
                className="group border border-black/8 rounded-xl p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] cursor-default"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <p className="text-sm font-medium text-black mb-1">{label}</p>
                <p className="text-xs text-black/40">{sub}</p>
              </div>
            ))}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2.5 justify-center">
            {chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 border border-black/12 rounded-full px-4 py-1.5 text-[13px] text-black/50 cursor-default transition-all duration-200 hover:bg-black hover:text-white hover:border-black before:content-['◆'] before:text-[7px] before:text-black/25"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-24 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <SectionTag>Purpose</SectionTag>
            <h2 className="font-serif text-4xl font-normal mt-4 text-black">
              Mission &amp; Vision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Mission — white */}
            <div className="relative bg-white border border-black/8 rounded-2xl p-12 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-black" />
              <p className="font-serif text-[80px] font-light text-black/6 leading-none mb-6 select-none">01</p>
              <SectionTag>Our Mission</SectionTag>
              <h3 className="font-serif text-2xl font-normal mt-4 mb-4 text-black leading-snug">
                Quality That Speaks for Itself
              </h3>
              <p className="text-[15px] leading-[1.85] text-black/50">
                To provide premium quality fashion and lifestyle products that combine elegance, comfort, modesty, and modern trends — making every customer feel confident and beautiful.
              </p>
            </div>

            {/* Vision — black */}
            <div className="relative bg-black border border-white/5 rounded-2xl p-12 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-white" />
              <p className="font-serif text-[80px] font-light text-white/6 leading-none mb-6 select-none">02</p>
              <SectionTag dark>Our Vision</SectionTag>
              <h3 className="font-serif text-2xl font-normal mt-4 mb-4 text-white leading-snug">
                A Global Name from Bangladesh
              </h3>
              <p className="text-[15px] leading-[1.85] text-white/50">
                To make {brandName} a trusted international brand representing luxury, modest fashion, and lifestyle excellence — carrying the pride of Bangladesh to the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CEO ── */}
      <section className="bg-white py-28 px-6">
        <div className="max-w-4xl mx-auto">

          <div className="text-center mb-16">
            <SectionTag>Leadership</SectionTag>
            <h2 className="font-serif text-4xl font-normal mt-4 text-black">
              The Visionary Behind {brandName}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-16 items-center border border-black/8 rounded-2xl p-12">

            {/* CEO avatar frame */}
            <div className="relative flex-shrink-0 w-52 h-64">
            <Image src="/images/faisal.jpeg" alt="MD Foyshal Ahmed" width={200} height={200} className="w-full h-full object-cover" />
              <div className="absolute inset-[-10px] border border-black/10 rounded " />
            </div>

            {/* Info */}
            <div className="flex-1">
              <SectionTag>Founder &amp; CEO</SectionTag>
              <h3 className="font-serif text-4xl font-normal mt-3 mb-1 text-black">
                MD Foyshal Ahmed
              </h3>
              <p className="text-xs tracking-[0.15em] uppercase text-black/35 mb-7">
                {brandName} — Bangladesh
              </p>
              <blockquote className="font-serif text-xl italic font-light text-black/50 leading-relaxed border-l-2 border-black pl-5 mb-7">
                &quot;Building a brand that represents elegance, trust, and modern lifestyle.&quot;
              </blockquote>
              <p className="text-sm leading-[1.85] text-black/50">
                With a strong vision and dedication, MD Foyshal Ahmed established {brandName} to create a trusted fashion destination for people who appreciate premium quality and elegant lifestyle products. His mission is to build {brandName} into a globally recognized modest fashion and lifestyle brand from Bangladesh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES STRIP ── */}
      <section className="bg-black py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-white/8">
            {values.map(({ word, ar }) => (
              <div key={word} className="text-center px-6 py-10">
                <p className="font-serif text-3xl font-light text-white/65 mb-2">{ar}</p>
                <p className="text-[11px] tracking-[0.2em] uppercase text-white/70 font-medium">{word}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUTURE VISION ── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <SectionTag>The Road Ahead</SectionTag>
          <h2 className="font-serif font-normal mt-4 mb-2 text-black leading-snug text-[clamp(30px,5vw,50px)]">
            Growing Into Your Complete Lifestyle Partner
          </h2>
          <Divider />
          <p className="text-[15px] leading-[1.9] text-black/50 mb-6">
            As our journey continues, {brandName} aims to introduce more modern fashion trends, lifestyle products, and daily essential items that meet the needs of individuals and families alike. Alongside Men&apos;s Fashion, Women&apos;s Fashion, and Kids Collection, we are expanding with premium watches, luxury perfumes, fashion accessories, and many more everyday essentials.
          </p>
          <p className="text-[15px] leading-[1.9] text-black/60 text-center max-w-3xl mx-auto">
            We are committed to bringing innovation, elegance, and trust into every collection we launch — making {brandName} not just a fashion brand, but a complete lifestyle destination you can trust.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-black py-24 px-6 text-center">
        <SectionTag dark>Join the Journey</SectionTag>
        <h2 className="font-serif text-4xl font-normal mt-4 mb-3 text-white">
          Explore {brandName} Today
        </h2>
        <p className="text-[15px] text-white/45 mb-10">
          Discover our latest collections and become part of our growing family.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/products"
            className="inline-block bg-white text-black px-9 py-3.5 rounded-full text-sm font-medium tracking-wide transition-all duration-200 hover:bg-white/90"
          >
            Shop Now
          </Link>
          <a
            href="/contact"
            className="inline-block bg-transparent text-white border border-white/25 px-9 py-3.5 rounded-full text-sm font-medium tracking-wide transition-all duration-200 hover:border-white/60"
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-black/8 py-10 px-6 text-center">
        <p className="font-serif text-2xl font-light text-black tracking-widest mb-2">{brandName}</p>
        <p className="text-xs tracking-[0.15em] uppercase text-black/30">
          Modern Modest Fashion &amp; Lifestyle — Bangladesh
        </p>
      </footer>

    </main>
  );
}