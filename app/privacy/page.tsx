import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
                1. Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Welcome to Wealth. We respect your privacy and are committed to
                protecting your personal and financial data. This Privacy Policy
                explains how we collect, use, store, and protect your
                information when you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                2.1 Account Information
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                When you sign in with Google, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>Your name</li>
                <li>Email address</li>
                <li>Profile picture (if provided)</li>
                <li>Google account ID for authentication</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                2.2 Financial Data
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                You voluntarily provide financial information including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>Investment assets and their values</li>
                <li>Ledger names and categories</li>
                <li>Transaction details (amounts, descriptions, dates)</li>
                <li>Custom categories and tags</li>
                <li>Currency preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
                2.3 Usage Information
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                We may collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Session information and timestamps</li>
                <li>Feature usage patterns for service improvement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>Provide and maintain the Service</li>
                <li>Authenticate your identity and manage your account</li>
                <li>Store and display your financial data</li>
                <li>Generate charts, reports, and analytics</li>
                <li>Improve and optimize the Service</li>
                <li>Respond to your requests and provide support</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Data Storage and Security
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                We take security seriously:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>
                  Data is stored securely using industry-standard encryption
                </li>
                <li>We use Supabase for secure database management</li>
                <li>
                  Access to your data is restricted to authenticated users only
                </li>
                <li>We implement row-level security policies</li>
                <li>Regular security audits and updates are performed</li>
                <li>HTTPS/TLS encryption protects data in transit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Sharing and Disclosure
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                We do not sell, rent, or trade your personal information. We may
                share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>
                  <strong>With your consent:</strong> When you explicitly
                  authorize us to share information
                </li>
                <li>
                  <strong>Service providers:</strong> With trusted third-party
                  services (like Supabase) that help us operate the Service
                </li>
                <li>
                  <strong>Legal requirements:</strong> When required by law,
                  court order, or government regulations
                </li>
                <li>
                  <strong>Security and fraud prevention:</strong> To protect
                  rights, property, or safety
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Your Rights and Choices
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>
                  <strong>Access:</strong> Request access to your personal data
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct inaccurate
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account
                  and associated data
                </li>
                <li>
                  <strong>Export:</strong> Download your data in a portable
                  format
                </li>
                <li>
                  <strong>Opt-out:</strong> Disable optional data collection
                  features
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Data Retention
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We retain your data as long as your account is active or as
                needed to provide the Service. If you delete your account, we
                will delete your personal and financial data within 30 days,
                except where we are required to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Cookies and Tracking
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>Maintain your login session</li>
                <li>Remember your preferences (theme, display settings)</li>
                <li>Analyze service usage and performance</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
                You can control cookies through your browser settings, but
                disabling them may affect Service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Third-Party Services
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>
                  <strong>Google OAuth:</strong> For authentication (subject to
                  Google&apos;s Privacy Policy)
                </li>
                <li>
                  <strong>Supabase:</strong> For database and authentication
                  services
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
                These services have their own privacy policies, and we encourage
                you to review them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Children&apos;s Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Wealth is not intended for use by children under the age of 13.
                We do not knowingly collect personal information from children.
                If you believe we have collected information from a child,
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. International Data Transfers
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Your data may be stored and processed in different countries
                where our service providers operate. We ensure appropriate
                safeguards are in place to protect your data in accordance with
                this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of significant changes by posting the new policy on
                this page and updating the &quot;Last updated&quot; date. Your
                continued use of the Service after changes are posted
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                If you have questions, concerns, or requests regarding this
                Privacy Policy or your data, please contact us through the
                application settings or support channels.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Your privacy matters to us. We are committed to protecting your
            financial data and maintaining transparency in how we handle your
            information.
          </p>
        </div>
      </div>
    </div>
  );
}
