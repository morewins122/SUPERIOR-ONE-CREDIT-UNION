import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Privacy Policy", to: "/about" },
  { label: "Security", to: "/faq" },
  { label: "Accessibility", to: "/contact" },
  { label: "Contact", to: "/contact" }
];

const badgeLabels = ["Equal Housing Lender", "NCUA Insured", "Member FDIC"];

export function Footer() {
  return (
    <footer className="mt-16 bg-[#0D5C63] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-3">
            <p className="text-lg font-extrabold tracking-tight">Superior One Credit Union</p>
            <p className="text-sm text-white/80">© 2026 Superior One Credit Union</p>
            <p className="text-sm text-white/80">All Rights Reserved.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {footerLinks.map((item) => (
              <Link key={item.label} to={item.to} className="text-sm font-medium text-white/85 transition hover:text-[#c9f1ec]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            {badgeLabels.map((label) => (
              <span key={label} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white/90 transition hover:bg-white/15">
                {label}
              </span>
            ))}
          </div>
          <p className="text-xs text-white/70">Secure digital banking</p>
        </div>
      </div>
    </footer>
  );
}
