export type CrossLink = {
  href: string;
  label: string;
  description: string;
  type: "document" | "service" | "advise" | "page";
};

export const crossLinks: Record<string, CrossLink[]> = {
  // ── Advises ────────────────────────────────────────────────────────────────
  "advise:safe-renting": [
    { href: "/documents/lease", label: "Lease Agreement Template", description: "Download a free residential lease agreement for Kenya.", type: "document" },
    { href: "/documents/house-rules", label: "House Rules Template", description: "Set clear house rules and attach them to your lease.", type: "document" },
    { href: "/services/legal", label: "Legal Consultation", description: "Get professional legal advice from Kenya property lawyers.", type: "service" },
  ],
  "advise:tenancy-relationships": [
    { href: "/documents/tenancy-agreement", label: "Tenancy Agreement Kenya", description: "Download a Kenya-specific tenancy agreement template.", type: "document" },
    { href: "/documents/eviction-notice", label: "Eviction Notice Template", description: "Serve a legally compliant eviction notice in Kenya.", type: "document" },
    { href: "/services/legal", label: "Legal Consultation", description: "Speak with a property lawyer about your tenancy situation.", type: "service" },
  ],
  "advise:tenant-questions": [
    { href: "/faq", label: "Frequently Asked Questions", description: "Answers to the most common questions about renting in Kenya.", type: "page" },
    { href: "/documents/tenancy-agreement", label: "Tenancy Agreement Kenya", description: "Download a Kenya-specific tenancy agreement template.", type: "document" },
    { href: "/services/help", label: "We Help You Buy, Sell & Rent", description: "Talk to an advisor about finding or listing a property.", type: "service" },
  ],
  "advise:find-reliable-tenant": [
    { href: "/documents/inventory-checklist", label: "Inventory Checklist", description: "Document every item in your furnished property at move-in.", type: "document" },
    { href: "/documents/move-in-checklist", label: "Move-in Checklist", description: "Record property condition before the tenant moves in.", type: "document" },
    { href: "/services/help", label: "We Help You Find Tenants", description: "Our team can help you find and screen reliable tenants.", type: "service" },
  ],
  "advise:short-term-rental": [
    { href: "/services/valuation", label: "Property Valuation", description: "Get a professional valuation to price your rental correctly.", type: "service" },
    { href: "/listings", label: "Browse Active Listings", description: "See current rental prices in your area on Rentnet.", type: "page" },
    { href: "/market", label: "Kenya Market Trends", description: "Asking-price data and rental yield estimates by city.", type: "page" },
  ],
  "advise:legal": [
    { href: "/services/legal", label: "Legal Consultation", description: "Get professional property legal advice in Kenya.", type: "service" },
    { href: "/services/notaries", label: "Notaries in Kenya", description: "Find a notary to certify your property documents.", type: "service" },
    { href: "/documents/eviction-notice", label: "Eviction Notice Template", description: "A legally compliant eviction notice for Kenyan landlords.", type: "document" },
  ],
  "advise:renting-tips": [
    { href: "/documents/move-in-checklist", label: "Move-in Checklist", description: "Protect your deposit — record everything before you move in.", type: "document" },
    { href: "/documents/tenancy-agreement", label: "Tenancy Agreement Kenya", description: "Download a Kenya-specific tenancy agreement template.", type: "document" },
    { href: "/listings", label: "Search Listings", description: "Find apartments and houses for rent across Kenya.", type: "page" },
  ],
  "advise:human-nature": [
    { href: "/services/help", label: "Talk to an Advisor", description: "Our team can help mediate landlord-tenant situations.", type: "service" },
    { href: "/faq", label: "Frequently Asked Questions", description: "Common questions about rights and responsibilities in Kenya.", type: "page" },
    { href: "/advises/tenancy-relationships", label: "Tenancy Relationships Guide", description: "Understand the key legal aspects of landlord-tenant law.", type: "advise" },
  ],
  "advise:humidity": [
    { href: "/services/help", label: "Property Support", description: "Get help resolving property maintenance issues.", type: "service" },
    { href: "/advises/safe-renting", label: "Tips for Safely Renting", description: "A complete landlord guide for managing your property.", type: "advise" },
    { href: "/documents/house-rules", label: "House Rules Template", description: "Include ventilation requirements in your house rules.", type: "document" },
  ],

  // ── Services ───────────────────────────────────────────────────────────────
  "service:legal": [
    { href: "/documents/eviction-notice", label: "Eviction Notice Template", description: "Download a legally compliant eviction notice for Kenya.", type: "document" },
    { href: "/documents/commercial-lease", label: "Commercial Lease Agreement", description: "Free commercial lease template under Cap 301.", type: "document" },
    { href: "/advises/tenancy-relationships", label: "Tenancy Relationships Guide", description: "Understand key areas of Kenyan tenancy law.", type: "advise" },
  ],
  "service:valuation": [
    { href: "/listings", label: "Browse Active Listings", description: "See current asking prices across Kenya on Rentnet.", type: "page" },
    { href: "/market", label: "Kenya Market Trends", description: "Median prices, avg/m² and 12-month trends by city.", type: "page" },
    { href: "/advises/short-term-rental", label: "Short-Term Rental Guide", description: "Weigh the pros and cons of short-term lettings.", type: "advise" },
  ],
  "service:help": [
    { href: "/listings", label: "Search All Listings", description: "Browse thousands of verified properties across Kenya.", type: "page" },
    { href: "/agents", label: "Find an Agent", description: "Connect with certified Rentnet agents in your area.", type: "page" },
    { href: "/post-listing", label: "Post a Listing", description: "List your property for free on Rentnet today.", type: "page" },
  ],
  "service:personal-documents": [
    { href: "/documents/tenancy-agreement", label: "Tenancy Agreement Kenya", description: "Download a free Kenya-specific tenancy agreement.", type: "document" },
    { href: "/documents/lease", label: "Lease Agreement Template", description: "Free residential lease agreement for Kenya.", type: "document" },
    { href: "/services/notaries", label: "Notaries in Kenya", description: "Have your documents certified by a Kenyan notary.", type: "service" },
  ],
  "service:notaries": [
    { href: "/documents/tenancy-agreement", label: "Tenancy Agreement Kenya", description: "Download a free tenancy agreement ready for notarisation.", type: "document" },
    { href: "/services/legal", label: "Legal Consultation", description: "Get property legal advice from Kenya lawyers.", type: "service" },
    { href: "/documents/lease", label: "Lease Agreement Template", description: "Free residential lease agreement for Kenya.", type: "document" },
  ],
  "service:lawyers": [
    { href: "/documents/eviction-notice", label: "Eviction Notice Template", description: "Serve a compliant eviction notice before engaging a lawyer.", type: "document" },
    { href: "/documents/commercial-lease", label: "Commercial Lease Agreement", description: "Free commercial lease template under Cap 301.", type: "document" },
    { href: "/services/legal", label: "Legal Consultation", description: "Get general property legal advice on Rentnet.", type: "service" },
  ],

  // ── Documents ──────────────────────────────────────────────────────────────
  "document:lease": [
    { href: "/documents/tenancy-agreement", label: "Tenancy Agreement Kenya", description: "A Kenya-specific tenancy agreement with M-PESA clauses.", type: "document" },
    { href: "/services/legal", label: "Legal Consultation", description: "Have your lease reviewed by a Kenyan property lawyer.", type: "service" },
    { href: "/advises/safe-renting", label: "Tips for Safely Renting", description: "A guide for landlords covering every step of letting safely.", type: "advise" },
  ],
  "document:tenancy-agreement": [
    { href: "/documents/lease", label: "Lease Agreement Template", description: "Standard residential lease for Kenya.", type: "document" },
    { href: "/services/legal", label: "Legal Consultation", description: "Get a lawyer to review your tenancy agreement.", type: "service" },
    { href: "/advises/tenancy-relationships", label: "Tenancy Relationships Guide", description: "Understand landlord and tenant rights in Kenya.", type: "advise" },
  ],
  "document:eviction-notice": [
    { href: "/services/legal", label: "Legal Consultation", description: "Get legal advice before serving an eviction notice.", type: "service" },
    { href: "/advises/tenancy-relationships", label: "Tenancy Relationships Guide", description: "Understand your legal rights as a landlord in Kenya.", type: "advise" },
    { href: "/documents/rent-increase-notice", label: "Rent Increase Notice", description: "Formally notify tenants of a rent increase.", type: "document" },
  ],
  "document:move-in-checklist": [
    { href: "/documents/inventory-checklist", label: "Inventory Checklist", description: "List all furnished items alongside the move-in checklist.", type: "document" },
    { href: "/documents/property-handover-form", label: "Property Handover Form", description: "Document the key handover on move-in day.", type: "document" },
    { href: "/advises/find-reliable-tenant", label: "Finding a Reliable Tenant", description: "Tips for screening and selecting good tenants in Kenya.", type: "advise" },
  ],
  "document:move-out-checklist": [
    { href: "/documents/property-handover-form", label: "Property Handover Form", description: "Formally record the return of keys on move-out day.", type: "document" },
    { href: "/documents/return", label: "Minutes of Return", description: "Document property condition in detail at end of tenancy.", type: "document" },
    { href: "/advises/safe-renting", label: "Tips for Safely Renting", description: "Landlord guide covering move-out and deposit return.", type: "advise" },
  ],
  "document:commercial-lease": [
    { href: "/services/legal", label: "Legal Consultation", description: "Commercial leases need professional legal review.", type: "service" },
    { href: "/services/lawyers", label: "Real Estate Lawyers", description: "Connect with a Kenya commercial property lawyer.", type: "service" },
    { href: "/documents/subletting-agreement", label: "Subletting Agreement", description: "Template for subletting commercial or residential space.", type: "document" },
  ],
  "document:subletting-agreement": [
    { href: "/documents/lease", label: "Lease Agreement Template", description: "The head lease the subletting agreement sits under.", type: "document" },
    { href: "/services/legal", label: "Legal Consultation", description: "Ensure your subletting arrangement is legally sound.", type: "service" },
    { href: "/advises/tenancy-relationships", label: "Tenancy Relationships Guide", description: "Understand subletting rights and obligations in Kenya.", type: "advise" },
  ],
  "document:inventory-checklist": [
    { href: "/documents/move-in-checklist", label: "Move-in Checklist", description: "Complete alongside the inventory on move-in day.", type: "document" },
    { href: "/documents/property-handover-form", label: "Property Handover Form", description: "Record the key handover and overall property condition.", type: "document" },
    { href: "/advises/find-reliable-tenant", label: "Finding a Reliable Tenant", description: "Tips for selecting and managing tenants in Kenya.", type: "advise" },
  ],
  "document:property-handover-form": [
    { href: "/documents/move-in-checklist", label: "Move-in Checklist", description: "Room-by-room condition report to complete at handover.", type: "document" },
    { href: "/documents/inventory-checklist", label: "Inventory Checklist", description: "List all items included with the furnished property.", type: "document" },
    { href: "/documents/takeover", label: "Minutes of Takeover", description: "Detailed takeover minutes to accompany the handover form.", type: "document" },
  ],
  "document:house-rules": [
    { href: "/documents/lease", label: "Lease Agreement Template", description: "Attach house rules as an appendix to the lease.", type: "document" },
    { href: "/advises/safe-renting", label: "Tips for Safely Renting", description: "A full landlord guide covering tenant management.", type: "advise" },
    { href: "/services/legal", label: "Legal Consultation", description: "Ensure your house rules are legally enforceable.", type: "service" },
  ],
  "document:rent-increase-notice": [
    { href: "/services/legal", label: "Legal Consultation", description: "Get advice on the correct rent increase process.", type: "service" },
    { href: "/advises/tenancy-relationships", label: "Tenancy Relationships Guide", description: "Understand rent increase rules under Kenyan law.", type: "advise" },
    { href: "/documents/eviction-notice", label: "Eviction Notice Template", description: "Use if a tenant rejects the increase and refuses to vacate.", type: "document" },
  ],
  "document:takeover": [
    { href: "/documents/move-in-checklist", label: "Move-in Checklist", description: "Complete a room-by-room checklist on the same day.", type: "document" },
    { href: "/documents/inventory-checklist", label: "Inventory Checklist", description: "List furnished items alongside the takeover minutes.", type: "document" },
    { href: "/advises/safe-renting", label: "Tips for Safely Renting", description: "Best practices for starting a tenancy the right way.", type: "advise" },
  ],
  "document:return": [
    { href: "/documents/move-out-checklist", label: "Move-out Checklist", description: "Compare property condition against the move-in record.", type: "document" },
    { href: "/documents/takeover", label: "Minutes of Takeover", description: "Read alongside return minutes to identify damage.", type: "document" },
    { href: "/advises/safe-renting", label: "Tips for Safely Renting", description: "Landlord guide covering deposit deductions and move-out.", type: "advise" },
  ],
};

// ── Blog category → cross-links ──────────────────────────────────────────────

export const blogCategoryLinks: Record<string, CrossLink[]> = {
  "Market Trends": [
    { href: "/market", label: "Kenya Property Market Trends", description: "Live asking-price data and 12-month trends by city.", type: "page" },
    { href: "/services/valuation", label: "Property Valuation Service", description: "Get a professional valuation of your Kenyan property.", type: "service" },
    { href: "/listings", label: "Search Active Listings", description: "Browse current asking prices across Kenya.", type: "page" },
  ],
  "Investment": [
    { href: "/market", label: "Kenya Market Trends", description: "Median prices, avg/m² and rental yield by city.", type: "page" },
    { href: "/services/valuation", label: "Property Valuation", description: "Get a professional valuation before investing.", type: "service" },
    { href: "/advises/short-term-rental", label: "Short-Term Rental Guide", description: "Pros and cons of short-term lets in Kenya.", type: "advise" },
  ],
  "Legal": [
    { href: "/services/legal", label: "Legal Consultation", description: "Get professional property legal advice in Kenya.", type: "service" },
    { href: "/documents/eviction-notice", label: "Eviction Notice Template", description: "Serve a legally compliant eviction notice.", type: "document" },
    { href: "/documents/tenancy-agreement", label: "Tenancy Agreement Kenya", description: "Download a Kenya-specific tenancy agreement.", type: "document" },
  ],
  "Tips": [
    { href: "/documents/move-in-checklist", label: "Move-in Checklist", description: "Protect your deposit — document everything at move-in.", type: "document" },
    { href: "/advises/safe-renting", label: "Tips for Safely Renting", description: "A complete landlord guide for the Kenyan market.", type: "advise" },
    { href: "/faq", label: "Frequently Asked Questions", description: "Quick answers about renting, buying and selling in Kenya.", type: "page" },
  ],
  "News": [
    { href: "/listings", label: "Search Latest Listings", description: "Browse newly added properties across Kenya.", type: "page" },
    { href: "/blog", label: "More from the Blog", description: "Market insights, tips and property news.", type: "page" },
    { href: "/market", label: "Kenya Market Trends", description: "Up-to-date asking-price data by city and category.", type: "page" },
  ],
  "General": [
    { href: "/advises", label: "Kenya Rental Guides", description: "Practical advice for landlords and tenants.", type: "advise" },
    { href: "/faq", label: "Frequently Asked Questions", description: "Common questions about renting and buying in Kenya.", type: "page" },
    { href: "/listings", label: "Search Listings", description: "Find your next property across all 47 counties.", type: "page" },
  ],
};
