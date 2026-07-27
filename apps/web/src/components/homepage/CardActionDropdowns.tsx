import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { homepageContent } from "@/data/homepageContent";

export function CardActionDropdowns() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [openAccountType, setOpenAccountType] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (!sectionRef.current?.contains(event.target as Node)) {
        setOpenAccountType(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenAccountType(null);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSavingsAction = (accountType: string, action: string) => {
    // Replace with route navigation or feature handlers when destinations are implemented.
    // For now, this preserves the requested behavior and logs the interaction.
    // eslint-disable-next-line no-console
    console.log(`handleSavingsAction(${JSON.stringify(accountType)}, ${JSON.stringify(action)})`);
    setOpenAccountType(null);
  };

  return (
    <section ref={sectionRef} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {homepageContent.services.menus.map((menu) => {
          const isOpen = openAccountType === menu.accountType;
          const panelId = `savings-menu-${menu.accountType.toLowerCase().replace(/\s+/g, "-")}`;

          return (
            <div key={menu.accountType} className="flex h-full flex-col">
              <button
                type="button"
                className={`flex min-h-24 w-full items-center justify-between rounded-2xl bg-gradient-to-br ${menu.accent} px-4 py-4 text-left text-white shadow-lg ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#0f5f57]`}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenAccountType((value) => (value === menu.accountType ? null : menu.accountType))}
                onFocus={() => setOpenAccountType(menu.accountType)}
              >
                <span className="pr-3">
                  <span className="block text-xs uppercase tracking-[0.18em] text-white/70">Superior One</span>
                  <span className="mt-1 block text-lg font-semibold leading-tight">{menu.title}</span>
                  <span className="mt-1 block text-sm text-white/75">{menu.subtitle}</span>
                </span>
                <span className={`ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                  <ChevronDown size={16} />
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-label={`${menu.title} actions`}
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  isOpen ? "mt-3 max-h-[36rem] opacity-100 translate-y-0" : "pointer-events-none max-h-0 opacity-0 -translate-y-2"
                }`}
              >
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-slate-100 dark:border-slate-800 dark:bg-slate-950">
                  <ul className="space-y-2">
                    {menu.actions.map((action) => (
                      <li key={action.label}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-[#e7f5f0] hover:text-[#0f5f57] focus:outline-none focus:ring-2 focus:ring-[#0f5f57] dark:text-slate-200 dark:hover:bg-slate-900"
                          onClick={() => handleSavingsAction(menu.accountType, action.label)}
                        >
                          <i aria-hidden="true" className={`${action.iconClass} w-4 text-center text-[#0f5f57]`} />
                          <span className="leading-5">{action.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
