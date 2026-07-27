import { useMemo } from "react";
import { useLocation } from "react-router-dom";

const faqs = [
  {
    q: "How do I set up direct deposit?",
    a: "Use the routing number and account number from your checking account details, then share them with your employer or payroll provider."
  },
  {
    q: "How long do transfers and bill payments take?",
    a: "Most internal transfers process immediately, while external transfers and bill payments may take one to three business days depending on the receiving bank."
  },
  {
    q: "Can I freeze or replace my debit card?",
    a: "Yes. You can temporarily freeze your card, unfreeze it later, or request a replacement from the card controls section."
  },
  {
    q: "What is the mobile deposit limit?",
    a: "Deposit limits depend on account history and verification status. Limits are shown in the mobile deposit screen before you submit a check."
  },
  {
    q: "Where can I find my routing number?",
    a: "Your routing number is listed in account details and on printed account statements. You can also contact Member Services for assistance."
  },
  {
    q: "How do I contact customer support after hours?",
    a: "You can use the contact form, secure message center, or visit the branch locator page for nearby branch information and service hours."
  }
];

export function FAQPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query")?.trim().toLowerCase() ?? "";

  const filteredFaqs = useMemo(() => {
    if (!query) {
      return faqs;
    }

    return faqs.filter((faq) => `${faq.q} ${faq.a}`.toLowerCase().includes(query));
  }, [query]);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">FAQ</h1>
      {query ? <p className="text-sm text-slate-600 dark:text-slate-200">Search results for “{query}”.</p> : null}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <article key={faq.q} className="panel rounded-2xl p-5">
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">{faq.a}</p>
            </article>
          ))
        ) : (
          <p className="panel rounded-2xl p-5 text-sm text-slate-600 dark:text-slate-200">No FAQ results matched your search.</p>
        )}
      </div>
    </section>
  );
}
