import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/sign-in">
            <Button variant="ghost" className="mb-6 -ml-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last updated: October, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                By accessing and using Wealth (&quot;the Service&quot;), you
                accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to these Terms of Service, please
                do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                Wealth is a personal finance management application that allows
                users to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>Track investment assets and their performance</li>
                <li>Manage ledgers and categorize expenses</li>
                <li>Monitor financial health through charts and analytics</li>
                <li>Organize and view transaction history</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. User Accounts
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                To use the Service, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>Authenticate using a valid Google account</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>
                  Be responsible for all activities that occur under your
                  account
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. User Data and Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Your financial data is private and belongs to you. We store your
                data securely and will never share, sell, or use it for purposes
                other than providing the Service. For more details, please
                review our{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Acceptable Use
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>Use the Service for any illegal purpose</li>
                <li>
                  Attempt to gain unauthorized access to any part of the Service
                </li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Upload malicious code or harmful content</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Financial Disclaimer
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Wealth is a financial tracking tool and does not provide
                financial advice, investment recommendations, or tax guidance.
                The information displayed is based on data you provide. We are
                not responsible for any financial decisions you make based on
                the use of this Service. Always consult with qualified financial
                advisors for investment decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Service Availability
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                While we strive to provide reliable service, we do not guarantee
                that the Service will be uninterrupted or error-free. We reserve
                the right to modify, suspend, or discontinue the Service at any
                time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To the maximum extent permitted by law, Wealth and its creators
                shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use or
                inability to use the Service, including but not limited to loss
                of data, profits, or financial loss.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Data Accuracy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                You are responsible for the accuracy of all data entered into
                the Service. We are not liable for any errors, inaccuracies, or
                losses resulting from incorrect data entry or calculations based
                on inaccurate information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Modifications to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms of Service at any
                time. Changes will be effective immediately upon posting. Your
                continued use of the Service after changes are posted
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Termination
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                You may terminate your account at any time by contacting us or
                ceasing to use the Service. We reserve the right to terminate or
                suspend your account for violations of these Terms of Service
                without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Governing Law
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with applicable laws, without regard to conflict of law
                provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Contact Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please
                contact us through the application settings or support channels.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            By using Wealth, you acknowledge that you have read and understood
            these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
