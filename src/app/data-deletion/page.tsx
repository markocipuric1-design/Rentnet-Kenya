import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";

export const metadata = {
  title: "Data Deletion | Rentnet",
  description: "How to request deletion of your personal data from Rentnet in accordance with Kenya's Data Protection Act 2019.",
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Data Deletion Request</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: May 2026</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-8">

          <section>
            <h2 className="text-lg font-bold mb-2">1. Your right to deletion</h2>
            <p className="text-muted-foreground leading-relaxed">
              Under the Kenya Data Protection Act 2019, you have the right to request the deletion of your personal data held by Rentnet. This includes your account information, property listings, messages, and any other data associated with your profile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. What gets deleted</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 leading-relaxed">
              <li>Your account and login credentials</li>
              <li>Your profile information (name, phone number, photo)</li>
              <li>All property listings you have posted</li>
              <li>Messages and communications sent through the platform</li>
              <li>Saved searches and favourited properties</li>
              <li>Any data linked to your Facebook or Google login</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. What cannot be deleted</h2>
            <p className="text-muted-foreground leading-relaxed">
              Certain data may be retained where required by law or for legitimate business purposes, including:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 leading-relaxed mt-2">
              <li>Transaction records required for tax and financial compliance</li>
              <li>Data necessary to resolve ongoing disputes or legal claims</li>
              <li>Anonymised or aggregated data that cannot identify you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. How to delete your account</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The fastest way to delete your data is directly through your account settings:
            </p>
            <ol className="list-decimal pl-5 text-muted-foreground space-y-1 leading-relaxed">
              <li>Log in to your Rentnet account</li>
              <li>Go to <strong className="text-foreground">Dashboard → Settings → Account</strong></li>
              <li>Click <strong className="text-foreground">Delete My Account</strong></li>
              <li>Confirm the deletion when prompted</li>
            </ol>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Your account and all associated data will be permanently deleted within <strong className="text-foreground">30 days</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Request by email</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are unable to access your account, you may submit a data deletion request by emailing us at{" "}
              <a href="mailto:info@rentnet.co.ke" className="text-primary hover:underline underline-offset-4">
                info@rentnet.co.ke
              </a>{" "}
              with the subject line <strong className="text-foreground">"Data Deletion Request"</strong>. Please include the email address associated with your account. We will process your request within <strong className="text-foreground">30 days</strong> and send a confirmation once completed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. Facebook login users</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you signed up using Facebook Login, you can also revoke Rentnet&apos;s access to your Facebook data directly through Facebook:
            </p>
            <ol className="list-decimal pl-5 text-muted-foreground space-y-1 leading-relaxed mt-2">
              <li>Go to <strong className="text-foreground">Facebook → Settings → Security and Login → Apps and Websites</strong></li>
              <li>Find <strong className="text-foreground">Rentnet</strong> and click <strong className="text-foreground">Remove</strong></li>
            </ol>
            <p className="text-muted-foreground leading-relaxed mt-3">
              This removes Facebook&apos;s connection but does not automatically delete your Rentnet account. Please follow the steps in Section 4 or 5 above to delete your account data from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions about data deletion or your privacy rights, contact us at{" "}
              <a href="mailto:info@rentnet.co.ke" className="text-primary hover:underline underline-offset-4">
                info@rentnet.co.ke
              </a>.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
