import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Globe, Users, Home, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/footer";
import { createClient } from "@/lib/supabase/server";
import { generateListingSlug } from "@/lib/utils";
import { AgentFormButton } from "./agent-form-button";

type Agent = {
  id: string;
  slug: string | null;
  contact_name: string;
  company_name: string | null;
  phone: string | null;
  website: string | null;
  city: string;
  description: string | null;
  profile_image_url: string | null;
  listing_ids: string[] | null;
};

function AgentCard({ agent }: { agent: Agent }) {
  const initials = agent.contact_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const listingCount = agent.listing_ids?.length ?? 0;

  return (
    <Link
      href={`/partners/rentnet-agents/${agent.slug ?? `${generateListingSlug(agent.contact_name)}-${agent.id.replace(/-/g, "")}`}`}
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
          {agent.profile_image_url
            ? <img src={agent.profile_image_url} alt={agent.contact_name} className="w-full h-full object-cover" />
            : <span className="text-primary font-bold text-lg">{initials}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-foreground text-sm">{agent.contact_name}</h3>
            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full flex-shrink-0">
              <ShieldCheck className="h-3 w-3" /> Rentnet Certified
            </span>
          </div>
          {agent.company_name && agent.company_name !== agent.contact_name && (
            <p className="text-xs text-primary font-semibold mt-0.5">{agent.company_name}</p>
          )}
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
            <span className="text-xs">{agent.city}</span>
          </div>
        </div>
      </div>

      {agent.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{agent.description}</p>
      )}

      {listingCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 px-3 py-1.5 rounded-xl w-fit">
          <Home className="h-3.5 w-3.5" />
          {listingCount} active listing{listingCount > 1 ? "s" : ""}
        </div>
      )}

      <div className="flex flex-col gap-1.5 pt-3 border-t border-border">
        {agent.phone && (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            {agent.phone}
          </span>
        )}
        {agent.website && (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            {agent.website.replace(/^https?:\/\//, "")}
          </span>
        )}
      </div>
    </Link>
  );
}

export default async function RentnetAgentsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("id, slug, contact_name, company_name, phone, website, city, description, profile_image_url, listing_ids")
    .eq("category", "rentnet-agents")
    .eq("verified", true)
    .order("contact_name");
  const agents = data ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Users className="h-3.5 w-3.5" /> Agent Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">Rentnet Agents</h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              Verified agents on the Rentnet platform. Browse agents, view their active listings and get in touch directly.
            </p>
          </div>
          <AgentFormButton className="flex-shrink-0 flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 whitespace-nowrap" />
        </div>

        {agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-foreground mb-2">No agents listed yet</p>
            <p className="text-sm text-muted-foreground mb-6">Be the first to register as a Rentnet Agent.</p>
            <AgentFormButton className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        {agents.length > 0 && (
          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Are you a real estate agent in Kenya?</p>
              <p className="text-sm text-muted-foreground mt-1">Register your profile, link your listings and get discovered by buyers and renters.</p>
            </div>
            <AgentFormButton className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex-shrink-0" />
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
