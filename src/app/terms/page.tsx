import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";

export const metadata = {
  title: "Terms of Service | Rentnet",
  description: "Terms and conditions for using the Rentnet real estate platform in Kenya.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-8">

          <section>
            <h2 className="text-lg font-bold mb-2">1. Acceptance of terms</h2>
            <p className="text-muted-foreground leading-relaxed">By accessing or using Rentnet ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms are governed by the laws of Kenya.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. Use of the platform</h2>
            <p className="text-muted-foreground leading-relaxed">You must be at least 18 years old to use Rentnet. You agree to use the Platform only for lawful purposes and in a manner that does not infringe the rights of others. You are responsible for maintaining the confidentiality of your account credentials.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. Listings and content</h2>
            <p className="text-muted-foreground leading-relaxed">Users who post listings are solely responsible for the accuracy and legality of their content. Rentnet does not verify the ownership of properties listed. You must not post false, misleading, or fraudulent listings. Rentnet reserves the right to remove any listing at its discretion.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. Payments</h2>
            <p className="text-muted-foreground leading-relaxed">Payments for listings, subscriptions and advertising are processed via M-PESA. All payments are non-refundable unless otherwise stated. Rentnet is not liable for failed transactions due to network or third-party payment provider issues.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Intellectual property</h2>
            <p className="text-muted-foreground leading-relaxed">All content on the Platform — including logos, design, and software — is the property of Rentnet or its licensors. You may not copy, reproduce, or distribute any part of the Platform without prior written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. Disclaimer of warranties</h2>
            <p className="text-muted-foreground leading-relaxed">The Platform is provided "as is" without warranties of any kind. Rentnet does not guarantee the accuracy of listings, the availability of properties, or uninterrupted access to the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">7. Limitation of liability</h2>
            <p className="text-muted-foreground leading-relaxed">To the maximum extent permitted by Kenyan law, Rentnet shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including losses from property transactions arranged through the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">Rentnet reserves the right to suspend or terminate your account at any time for violation of these terms, fraudulent activity, or any other reason at its discretion.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">9. Changes to terms</h2>
            <p className="text-muted-foreground leading-relaxed">Rentnet may update these terms at any time. Continued use of the Platform after changes are posted constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">10. Governing law</h2>
            <p className="text-muted-foreground leading-relaxed">These terms are governed by and construed in accordance with the laws of Kenya. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kenya.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For any questions regarding these terms, contact us at <a href="mailto:legal@rentnet.co.ke" className="text-primary hover:underline">legal@rentnet.co.ke</a>.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
