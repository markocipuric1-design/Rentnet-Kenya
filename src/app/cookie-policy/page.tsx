import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";

export const metadata = {
  title: "Cookie Policy | Rentnet",
  description: "How Rentnet uses cookies and similar technologies on its platform.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-8">

          <section>
            <h2 className="text-lg font-bold mb-2">1. What are cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences and understand how you use it.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">2. Cookies we use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold text-foreground">Type</th>
                    <th className="text-left py-2 pr-4 font-semibold text-foreground">Purpose</th>
                    <th className="text-left py-2 font-semibold text-foreground">Required</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">Essential</td>
                    <td className="py-2 pr-4">Authentication, session management, security</td>
                    <td className="py-2">Yes</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">Functional</td>
                    <td className="py-2 pr-4">Remembering preferences (theme, filters)</td>
                    <td className="py-2">No</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">Analytics</td>
                    <td className="py-2 pr-4">Understanding how users navigate the site</td>
                    <td className="py-2">No</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Advertising</td>
                    <td className="py-2 pr-4">Measuring ad performance on the platform</td>
                    <td className="py-2">No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">3. Your choices</h2>
            <p className="text-muted-foreground leading-relaxed">When you first visit Rentnet, you can accept or decline non-essential cookies via the cookie banner. You can change your preference at any time by clearing your browser's local storage or cookies. Note that declining cookies may affect some site functionality.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">4. Third-party cookies</h2>
            <p className="text-muted-foreground leading-relaxed">Some features (such as maps via Mapbox) may place their own cookies. These are governed by the respective third party's privacy policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">5. Legal basis</h2>
            <p className="text-muted-foreground leading-relaxed">Non-essential cookies are set only with your consent, in accordance with Kenya's Data Protection Act 2019. Essential cookies are set on the basis of legitimate interest to operate the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">6. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">Questions about our cookie use? Contact us at <a href="mailto:privacy@rentnet.co.ke" className="text-primary hover:underline">privacy@rentnet.co.ke</a>.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
