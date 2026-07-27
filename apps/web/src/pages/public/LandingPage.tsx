import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Building2, FileText, Home, Landmark, Laptop, MapPin, Shield, PhoneCall } from "lucide-react";
import { HomepageLoginPanel } from "@/components/auth/HomepageLoginPanel";
import { homepageContent } from "@/data/homepageContent";

const featureCards = [
  {
    title: "Secure Banking",
    icon: Shield,
    description: "Bank with confidence using encrypted online banking, fraud monitoring, and multi-factor authentication."
  },
  {
    title: "Community Focused",
    icon: Building2,
    description: "Visit one of our Ohio branches for personalized service and financial guidance."
  },
  {
    title: "Always Accessible",
    icon: Laptop,
    description: "Manage your accounts anytime using our secure online banking platform and mobile services."
  }
];

const trustBadges = [
  { label: "Equal Housing Lender", icon: Landmark },
  { label: "Equal Housing Opportunity", icon: Home },
  { label: "NCUA Insured", icon: BadgeCheck },
  { label: "Member FDIC", icon: FileText }
];

export function LandingPage() {
  const [isBranchPickerOpen, setIsBranchPickerOpen] = useState(false);
  const blendedImageUrl = useMemo(() => {
    const { blendedImages } = homepageContent.hero;
    return blendedImages[Math.floor(Math.random() * blendedImages.length)] ?? "";
  }, []);

  const featuredBranches = [
    { city: "Toledo, Ohio", label: "Downtown Toledo Branch", description: "Downtown Toledo, near the riverfront business district." },
    { city: "Akron, Ohio", label: "Akron Main Branch", description: "Akron’s main branch for everyday banking support." },
    { city: "Cincinnati, Ohio", label: "Central Cincinnati Branch", description: "Central Cincinnati access for personal banking and support." },
    { city: "Cleveland, Ohio", label: "Cleveland Financial District Branch", description: "Cleveland downtown branch for members and business banking." }
  ];

  return (
    <section className="space-y-8">
      {/* Hero split layout */}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-card ring-1 ring-slate-200 sm:p-8">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 blur-[1px]"
              style={{ backgroundImage: `url(${blendedImageUrl})` }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-[#eaf5f2]/85" aria-hidden="true" />
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#0f5f57]/10 blur-2xl" aria-hidden="true" />
            <div className="absolute -bottom-12 -left-10 h-56 w-56 rounded-full bg-[#d09c45]/15 blur-2xl" aria-hidden="true" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <p className="inline-flex items-center rounded-full bg-[#e7f5f0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f5f57]">
              {homepageContent.hero.badge}
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">{homepageContent.hero.heading}</h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              {homepageContent.hero.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={homepageContent.hero.primaryCtaHref} className="rounded-full bg-[#0f5f57] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0c4f48]">
                {homepageContent.hero.primaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:pt-2">
          <HomepageLoginPanel />
        </div>
      </div>

      <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-white px-4 py-[60px] sm:px-6 lg:px-8 lg:py-[70px]">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-10">
          <div className="max-w-3xl space-y-3 text-center animate-fade-in">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0D5C63]">Why Bank With Superior One Credit Union</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight text-slate-900">Why Bank With Superior One Credit Union</h2>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Serving our members with secure, convenient, and trusted banking services since our founding.
            </p>
          </div>

          <div className="grid w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((card, index) => (
              <article
                key={card.title}
                className="group bank-hover-lift animate-slide-up rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,.08)] transition duration-300"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e6f3f2] text-[#0D5C63] transition-transform duration-300 group-hover:scale-105">
                    <card.icon size={26} strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{card.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <article className="w-full rounded-[20px] bg-[#F8FAFC] p-6 shadow-[0_10px_30px_rgba(0,0,0,.08)] sm:p-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#14746F]">Accessibility</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Superior One Credit Union is committed to providing an accessible website for all members.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                If you experience difficulty using this website or require assistance, please contact our Member Services team.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:justify-items-center">
                <div className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-700">
                  <PhoneCall size={18} className="text-[#0D5C63]" />
                  <div className="text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phone</p>
                    <p className="text-base font-bold text-slate-900">413 475 7788</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBranchPickerOpen((value) => !value)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#14746F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5f57]"
                >
                  <MapPin size={16} />
                  Branch Locator
                </button>
              </div>
            </div>
          </article>

          <div className="w-full">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0D5C63]">Trust &amp; Protection</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Trusted bank-level protections and disclosures</h3>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {trustBadges.map((badge, index) => (
                <div
                  key={badge.label}
                  className="bank-hover-lift flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,.08)] transition duration-300"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef7f6] text-[#0D5C63]">
                    <badge.icon size={20} strokeWidth={1.8} />
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{badge.label}</p>
                </div>
              ))}
            </div>
          </div>

          {isBranchPickerOpen ? (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
              <div className="w-full max-w-3xl rounded-[24px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-8">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0D5C63]">Branch Locator</p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Choose a location</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBranchPickerOpen(false)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {featuredBranches.map((branch) => (
                    <article key={branch.city} className="rounded-[20px] border border-slate-200 bg-[#f8fbfc] p-5 transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,.08)]">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e6f3f2] text-[#0D5C63]">
                          <MapPin size={18} />
                        </span>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{branch.city}</h4>
                          <p className="mt-1 text-sm font-medium text-slate-600">{branch.label}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-500">{branch.description}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}
