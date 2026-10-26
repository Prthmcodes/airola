import React from 'react';

const LegalPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-slate-700">
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Privacy, Terms &amp; Cookies</h1>
      <p className="text-slate-600 mb-12">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Privacy Policy</h2>
        <p className="mb-4 leading-relaxed">
          Airola ("we", "us") provides turnover cleaning services for short-let hosts in London, UK. When you request a
          quote, enter a giveaway, or create an account, we collect the personal information you provide: your name,
          email address, phone number, property address, and any notes you choose to share (such as access instructions).
          The data controller is Nandni Thakur trading as Airola, 44 Aylmer Road, Dagenham, RM8 3LP, United Kingdom
          (contact@airola.co.uk).
        </p>
        <p className="mb-4 leading-relaxed">
          We use this information solely to provide and schedule cleaning services, respond to your enquiries, and — if
          you opt in — send you offers. We do not sell your data. Your data is stored with our service providers (Supabase,
          Google, Vercel and Stripe), who may process it outside the UK under appropriate safeguards, and only authorised
          team members have access to it. Cleaning staff receive only the details
          needed to complete a job.
        </p>
        <p className="mb-4 leading-relaxed">
          Under UK GDPR you have the right to access, correct, or request deletion of your personal data at any time.
          To exercise these rights, email <a href="mailto:contact@airola.co.uk" className="text-[#2D6E5F] font-bold hover:underline">contact@airola.co.uk</a> and
          we will respond within 30 days.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Terms &amp; Conditions</h2>
        <p className="mb-4 leading-relaxed">
          Quotes shown on this site are estimates based on the information you provide; the final price is confirmed
          before any service takes place. There are no long-term contracts. Bookings can be cancelled or rescheduled
          by contacting us. The recurring turnover discount applies while you book every turnover with us; there is no
          membership fee and the arrangement can be ended at any time.
        </p>
        <p className="mb-4 leading-relaxed">
          Loyalty credits and giveaway prizes apply to future bookings only and are not redeemable for cash. Giveaway
          entry is open to people who host or manage a short-let in Airola's East London service area. Giveaway
          promoter: Nandni Thakur trading as Airola, 44 Aylmer Road, Dagenham, RM8 3LP, United Kingdom,
          contact@airola.co.uk. The name of the winners is available on request by emailing contact@airola.co.uk.
          Winners' names will only be published with their permission. We reserve the right to decline service
          for properties that cannot be verified.
        </p>
        {/* [CONFIRM: active public liability policy] */}
        <p className="mb-4 leading-relaxed">
          Airola is fully insured. Any damage claims must be reported within 48 hours of the completed clean.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookie Policy</h2>
        <p className="leading-relaxed">
          This site uses only essential storage needed to keep you logged in and operate the service. We do not use
          advertising or third-party tracking cookies.
        </p>
      </section>
    </div>
  );
};

export default LegalPage;
