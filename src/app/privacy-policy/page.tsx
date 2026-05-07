import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";

export const metadata = {
  title: "Privacy Policy | Rentnet",
  description: "How Rentnet collects, uses and protects your personal data under Kenya's Data Protection Act 2019.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-8">

          <section>
            <h2 className="text-lg font-bold mb-2">1. Who we are</h2>
            <p className="text-muted-foreground leading-relaxed">Rentnet ("we", "us", "our") is a real estate platform operating in Kenya. We are committed to protecting your personal data in accordance with the Kenya Data Protection Act 2019 (DPA 2019) and any applicable regulations issued by the Office of the Data Protection Commissioner (ODPC).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. Data we collect</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 leading-relaxed">
              <li>Account information: name, email address, phone number</li>
              <li>Listing data: property details, photos, location</li>
              <li>Payment information: M-PESA transaction references (we do not store card details)</li>
              <li>Usage data: pages visited, search queries, device and browser information</li>
              <li>Communications: messages sent through our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. How we use your data</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 leading-relaxed">
              <li>To provide and improve our services</li>
              <li>To process payments and activate listings or subscriptions</li>
              <li>To send service-related communications</li>
              <li>To analyse site usage and improve user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. Legal basis for processing</h2>
            <p className="text-muted-foreground leading-relaxed">We process your data on the basis of: (a) your consent; (b) performance of a contract with you; (c) compliance with a legal obligation; or (d) our legitimate interests, where these are not overridden by your rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Data sharing</h2>
            <p className="text-muted-foreground leading-relaxed">We do not sell your personal data. We may share data with trusted third-party service providers (hosting, payments, analytics) who are bound by confidentiality obligations. We may disclose data where required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. Data retention</h2>
            <p className="text-muted-foreground leading-relaxed">We retain your data for as long as necessary to provide our services or as required by law. You may request deletion of your account and associated data at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">7. Your rights</h2>
            <p className="text-muted-foreground leading-relaxed">Under the DPA 2019 you have the right to: access your data, correct inaccurate data, delete your data, object to processing, and withdraw consent at any time. To exercise these rights, contact us at <a href="mailto:privacy@rentnet.co.ke" className="text-primary hover:underline">privacy@rentnet.co.ke</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">We use cookies to operate and improve our platform. See our <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a> for details.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For any privacy-related queries, contact us at <a href="mailto:privacy@rentnet.co.ke" className="text-primary hover:underline">privacy@rentnet.co.ke</a>.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
