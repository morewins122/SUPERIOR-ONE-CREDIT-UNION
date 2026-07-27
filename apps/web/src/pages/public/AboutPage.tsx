export function AboutPage() {
  return (
    <section className="space-y-8">
      <article className="panel rounded-[24px] p-6 sm:p-8">
        <div className="max-w-4xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0D5C63]">Privacy Policy</p>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight text-slate-900">Superior One Credit Union Privacy Policy</h1>
          <p className="text-base leading-7 text-slate-600">
            Superior One Credit Union is committed to protecting the privacy and security of our members’ personal and financial information.
            This Privacy Policy explains how we collect, use, disclose, and safeguard information when you access our website, mobile services,
            and online banking tools.
          </p>
        </div>
      </article>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="panel rounded-[24px] p-6">
          <h2 className="text-2xl font-bold text-slate-900">Information We Collect</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <li>• Contact information such as your name, email address, phone number, and mailing address.</li>
            <li>• Account information, transaction history, balances, and payment activity.</li>
            <li>• Device, browser, and session information used to secure and improve online banking.</li>
            <li>• Communication records when you contact Member Services or submit a request.</li>
          </ul>
        </article>

        <article className="panel rounded-[24px] p-6">
          <h2 className="text-2xl font-bold text-slate-900">How We Use Information</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <li>• To provide account access, process transactions, and deliver banking services.</li>
            <li>• To verify identity, prevent fraud, and maintain account security.</li>
            <li>• To personalize your experience and improve digital banking features.</li>
            <li>• To send service notices, security alerts, and important account updates.</li>
          </ul>
        </article>

        <article className="panel rounded-[24px] p-6">
          <h2 className="text-2xl font-bold text-slate-900">Information Sharing</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            We do not sell your personal information. We may share information only as permitted by law, including with service providers,
            payment networks, government agencies, or other financial institutions involved in processing your requests or transactions.
          </p>
        </article>

        <article className="panel rounded-[24px] p-6">
          <h2 className="text-2xl font-bold text-slate-900">Security Practices</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            We use layered security controls including encryption, multi-factor authentication, account monitoring, and access controls.
            While no digital system can guarantee complete protection, we continuously work to reduce risk and protect member data.
          </p>
        </article>

        <article className="panel rounded-[24px] p-6">
          <h2 className="text-2xl font-bold text-slate-900">Cookies and Online Tracking</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            We use cookies and similar technologies to recognize your device, remember preferences, support secure sign-in, and analyze website usage.
            You can adjust browser settings to limit cookies, but some features may not function properly.
          </p>
        </article>

        <article className="panel rounded-[24px] p-6">
          <h2 className="text-2xl font-bold text-slate-900">Your Choices</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            You may update certain account details through online banking, contact Member Services to correct information, or manage communication
            preferences through your profile settings where available.
          </p>
        </article>
      </div>

      <article className="panel rounded-[24px] p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Contact Information</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          If you have questions about this Privacy Policy or how your information is handled, please contact Member Services through the
          secure contact channels provided on our website.
        </p>
        <p className="mt-4 text-sm font-semibold tracking-[0.08em] text-[#0D5C63]">Superior One Credit Union</p>
      </article>
    </section>
  );
}
