import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Origo",
  description: "How Origo handles your data and privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <Link href="/" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
          &larr; Back to Home
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: May 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>When you use Origo, we collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-white">Account information:</strong> email address and name when you sign up</li>
              <li><strong className="text-white">Project data:</strong> your questionnaire answers used to generate projects</li>
              <li><strong className="text-white">Payment information:</strong> processed securely by Stripe — we never store your card details</li>
              <li><strong className="text-white">Usage data:</strong> pages visited, features used, generation history</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide and improve the Service</li>
              <li>Process payments and manage your credit balance</li>
              <li>Generate project code based on your specifications</li>
              <li>Send transactional emails (purchase confirmations, generation status)</li>
              <li>Detect and prevent abuse or fraudulent activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Data Storage</h2>
            <p>
              Your data is stored securely on Supabase (PostgreSQL) with row-level security enabled.
              Generated project files are stored temporarily and associated with your account.
              We do not sell, trade, or rent your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-white">Supabase:</strong> database and authentication</li>
              <li><strong className="text-white">Stripe:</strong> payment processing</li>
              <li><strong className="text-white">Anthropic (Claude):</strong> AI code generation — your questionnaire data is sent to Claude to generate project files</li>
            </ul>
            <p className="mt-2">
              Each service has its own privacy policy. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              Your account data and generated projects are retained as long as your account is active.
              You can request deletion of your account and all associated data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your generated projects at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use
              third-party tracking cookies or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes by posting a notice on the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Contact</h2>
            <p>
              For privacy-related questions, contact us at{" "}
              <a href="mailto:flemmingravndal@hotmail.com" className="text-violet-400 hover:text-violet-300">
                flemmingravndal@hotmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
