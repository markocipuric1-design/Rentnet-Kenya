// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentSection = {
  heading?: string;
  body: string;
  bullets?: string[];
};

export type AdviseItem = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: number;
  sections: ContentSection[];
};

export type ServiceItem = {
  slug: string;
  title: string;
  tagline: string;
  excerpt: string;
  sections: ContentSection[];
  cta?: { label: string; href: string };
};

export type DocumentItem = {
  slug: string;
  title: string;
  excerpt: string;
  sections: ContentSection[];
  downloadLabel: string;
  category: "agreement" | "inspection" | "notice" | "guide";
  seoDescription?: string;
};

export type YouthItem = {
  slug: string;
  title: string;
  excerpt: string;
  sections: ContentSection[];
};

export type PartnerCategory = {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  subcategories?: string[];
};

// ─── Advises ─────────────────────────────────────────────────────────────────

export const advisesData: AdviseItem[] = [
  {
    slug: "safe-renting",
    title: "Tips for Safely Renting Out Your Property",
    category: "Landlord Guide",
    excerpt: "Protect yourself and your property with these essential steps before handing over the keys.",
    readTime: 5,
    sections: [
      {
        heading: "Screen Every Tenant Carefully",
        body: "Renting without screening is one of the most common mistakes landlords in Kenya make. Before signing any agreement, verify the tenant's employment or income source, check references from previous landlords, and confirm their identity with a national ID or passport.",
        bullets: [
          "Request 3 months of payslips or bank statements",
          "Call at least two previous landlords for references",
          "Verify their workplace with a letter from their employer",
          "Run a basic background check if possible",
        ],
      },
      {
        heading: "Always Use a Written Lease Agreement",
        body: "A verbal agreement has no legal standing in Kenyan courts. Your lease should clearly state the monthly rent, payment due date, deposit amount, notice period, and rules about subletting, pets, and alterations to the property.",
      },
      {
        heading: "Document the Property Condition Before Handover",
        body: "Take detailed photographs and video of every room before the tenant moves in. Create a written inventory of all fixtures, fittings, and appliances. Both parties should sign this document. This protects you from disputes about damage when the tenancy ends.",
      },
      {
        heading: "Collect an Adequate Security Deposit",
        body: "In Kenya, the standard deposit is one to three months' rent. The deposit must be returned within a reasonable period after the tenancy ends, minus any legitimate deductions for unpaid rent or damage beyond normal wear and tear.",
      },
    ],
  },
  {
    slug: "tenancy-relationships",
    title: "Main Areas of Tenancy Relationships",
    category: "Legal Guide",
    excerpt: "Understanding your rights and obligations as a landlord or tenant under Kenyan law.",
    readTime: 6,
    sections: [
      {
        heading: "Landlord Obligations",
        body: "Under the Landlord and Tenant Act of Kenya, landlords are required to maintain the property in a habitable condition. This includes ensuring the roof, walls, plumbing, and electrical installations are in good working order at the start of the tenancy and throughout.",
        bullets: [
          "Provide a property that is safe and fit for habitation",
          "Carry out repairs for structural issues promptly",
          "Give reasonable notice before entering the property",
          "Return the security deposit within a fair timeframe",
        ],
      },
      {
        heading: "Tenant Rights",
        body: "Tenants in Kenya have the right to peaceful enjoyment of the property without unreasonable interference from the landlord. You cannot be evicted without proper written notice and a valid legal reason. Unlawful eviction — such as changing locks without a court order — is a criminal offence.",
      },
      {
        heading: "Rent and Payment",
        body: "Rent increases must be communicated in writing and are subject to the notice period specified in the lease. A landlord cannot arbitrarily double or triple rent overnight. Tenants should always request and keep receipts for every rent payment.",
      },
      {
        heading: "Ending the Tenancy",
        body: "Either party may end the tenancy by giving notice as stated in the lease — typically one to three months. If no notice period is written, the law implies a reasonable period. Always send notice in writing and keep a copy. Disputes are handled by the Business Premises Tribunal or local courts.",
      },
    ],
  },
  {
    slug: "tenant-questions",
    title: "Additional Questions from Tenants",
    category: "FAQ",
    excerpt: "Answers to the most common questions tenants ask about renting property in Kenya.",
    readTime: 4,
    sections: [
      {
        heading: "Can my landlord enter without notice?",
        body: "No. Your landlord must give reasonable notice — generally 24 to 48 hours — before entering the property, except in genuine emergencies such as a burst pipe or fire. Entering without notice is a breach of your right to quiet enjoyment.",
      },
      {
        heading: "What can be deducted from my deposit?",
        body: "A landlord may only deduct costs for unpaid rent, damage caused by the tenant beyond normal wear and tear, and cleaning costs if the property was not returned in the same condition. They cannot deduct for general ageing of paint, carpet wear, or minor scuffs.",
        bullets: [
          "Unpaid rent or utility bills",
          "Damage caused beyond normal wear and tear",
          "Professional cleaning if property is returned dirty",
          "Replacement of items lost or broken by the tenant",
        ],
      },
      {
        heading: "Can I sublet my apartment?",
        body: "Only if your lease agreement specifically allows it. Most leases in Kenya prohibit subletting without written consent from the landlord. Subletting without permission is grounds for eviction. Always ask in writing and keep the landlord's written response.",
      },
      {
        heading: "What do I do if repairs are not done?",
        body: "First, send a written request to your landlord specifying the repair needed and a reasonable deadline. If there is no response, send a formal notice. If still ignored, you may approach the relevant local authority or the Business Premises Tribunal for assistance.",
      },
    ],
  },
  {
    slug: "find-reliable-tenant",
    title: "How to Find a Reliable Tenant",
    category: "Landlord Guide",
    excerpt: "A step-by-step process to attract, screen, and select tenants you can trust.",
    readTime: 5,
    sections: [
      {
        heading: "Write a Clear and Accurate Listing",
        body: "Your listing is the first filter. State the rent clearly, list what is and isn't included (water, security, parking), specify the minimum lease term, and be honest about the neighbourhood. Accurate listings attract serious applicants and reduce time-wasters.",
      },
      {
        heading: "Create a Simple Application Form",
        body: "Ask all prospective tenants to complete a short application form. Collect their full name, national ID number, current employer and income, current address, and contact details for two references. This creates a paper trail and lets you compare applicants fairly.",
        bullets: [
          "Full name and national ID number",
          "Current employer, job title, and monthly income",
          "Emergency contact and previous landlord contact",
          "Reason for moving from current residence",
        ],
      },
      {
        heading: "Interview the Applicant",
        body: "A 10-minute conversation — in person or by phone — tells you a lot. Ask why they are moving, how long they intend to stay, and whether they have pets or plan to share the unit. Trust your instincts, but base your final decision on facts, not impressions alone.",
      },
      {
        heading: "Verify and Decide",
        body: "Call each reference, confirm employment, and review the bank statements. Choose the applicant with the strongest verified income, good references, and the longest intended stay. Avoid selecting tenants purely based on how quickly they can pay — urgency can be a red flag.",
      },
    ],
  },
  {
    slug: "short-term-rental",
    title: "Advantages and Disadvantages of Short-Term Rental",
    category: "Investment",
    excerpt: "Is Airbnb-style short-term letting right for your property in Kenya? A balanced look at the options.",
    readTime: 5,
    sections: [
      {
        heading: "Advantages",
        body: "Short-term rentals, such as Airbnb or direct holiday lets, can generate significantly higher income per month compared to long-term tenancies — particularly in Nairobi, Mombasa, and Diani. They also offer flexibility: you can block out dates for personal use and adjust pricing based on demand.",
        bullets: [
          "Higher monthly revenue during peak periods",
          "Flexibility to use the property yourself",
          "Ability to adjust pricing dynamically",
          "No long-term commitment to a single tenant",
        ],
      },
      {
        heading: "Disadvantages",
        body: "Short-term rentals require significantly more management. You will deal with more frequent check-ins, cleaning between guests, maintenance calls, and the occasional difficult guest. Income is also seasonal and inconsistent — a month with low occupancy can yield less than a long-term tenant would pay.",
        bullets: [
          "Higher management time and cost",
          "More wear and tear on furniture and fittings",
          "Inconsistent and seasonal income",
          "Risk of property damage with unknown guests",
        ],
      },
      {
        heading: "Kenyan Market Considerations",
        body: "Nairobi's Westlands, Kilimani, and Kileleshwa areas have strong short-term demand from business travellers, expats, and tourists. Coastal areas in Mombasa and Diani peak during December and August. Outside these hotspots, long-term tenancy typically provides more reliable returns.",
      },
      {
        heading: "Making the Decision",
        body: "If you live nearby, have reliable cleaning staff, and the property is furnished to a good standard, short-term letting can be highly profitable. If you want passive income with minimal involvement, a carefully screened long-term tenant is the safer choice.",
      },
    ],
  },
  {
    slug: "human-nature",
    title: "Human Nature in Landlord-Tenant Relationships",
    category: "Relationships",
    excerpt: "Understanding the psychology behind conflicts, trust, and communication in tenancy.",
    readTime: 4,
    sections: [
      {
        heading: "Why Conflicts Start",
        body: "Most tenancy disputes in Kenya do not start with malicious intent. They begin with mismatched expectations. A landlord who assumes the tenant knows not to hang nails, and a tenant who assumes minor repairs will be handled quickly — neither communicates, and resentment builds. The lease agreement is not enough on its own: regular, respectful communication matters.",
      },
      {
        heading: "The Importance of First Impressions",
        body: "The way a tenancy begins sets the tone for its entire duration. A landlord who is responsive, hands over a clean property, and explains the house rules clearly inspires tenants to be responsible in return. A neglected handover often predicts a neglected tenancy.",
      },
      {
        heading: "Handling Conflict Professionally",
        body: "When issues arise, avoid confrontational language or threats. Put concerns in writing, be specific about the problem and what you expect, and give a reasonable deadline. Most people respond better to calm, clear communication than to pressure. If a situation escalates, involve a neutral third party before resorting to legal action.",
      },
      {
        heading: "Building Long-Term Relationships",
        body: "A tenant who stays for 3–5 years is worth more than a new tenant every year. Reduced vacancy, less wear and tear from frequent moves, and the value of reliability all add up. Treat long-term tenants with respect, respond to their requests, and review rent increases moderately. Loyalty is built — and retained — through fairness.",
      },
    ],
  },
  {
    slug: "humidity",
    title: "Humidity in the Apartment",
    category: "Property Care",
    excerpt: "How to identify, prevent, and deal with moisture and mould in Kenyan rental properties.",
    readTime: 4,
    sections: [
      {
        heading: "Why Humidity is a Problem",
        body: "Kenya's tropical climate means many properties — especially in Nairobi's rainy months of April, May, and November — are susceptible to high indoor humidity. Sustained humidity above 65% encourages mould growth, which damages surfaces, ruins furniture, triggers respiratory issues, and can make a property legally uninhabitable.",
      },
      {
        heading: "Common Causes in Kenyan Properties",
        body: "The most frequent causes of excess humidity are poor ventilation, cooking without extractor fans, drying clothes indoors, leaking roofs or pipes, and inadequate window sealing.",
        bullets: [
          "Cooking with no ventilation or extractor hood",
          "Drying laundry inside, especially in smaller units",
          "Leaking gutters, flat roofs, or window frames",
          "Blocked or absent air vents in bathrooms and kitchens",
        ],
      },
      {
        heading: "Prevention Tips for Tenants",
        body: "Open windows regularly to allow air circulation, especially after cooking or showering. Wipe down condensation on windows and tiles before it settles. Use bathroom ventilation fans. Report any leaks or damp patches to your landlord in writing — do not wait for the problem to worsen.",
      },
      {
        heading: "Landlord Responsibilities",
        body: "Landlords are responsible for structural causes of damp — leaking roofs, failed plumbing, and inadequate ventilation. If mould appears due to structural issues, the landlord must address the root cause, not simply paint over the affected area. Persistent mould that affects health is a valid ground for rent reduction or lease termination.",
      },
    ],
  },
  {
    slug: "renting-tips",
    title: "Tips for Successfully Renting",
    category: "General Guide",
    excerpt: "Practical advice for tenants looking to secure and maintain good rental accommodation in Kenya.",
    readTime: 4,
    sections: [
      {
        heading: "Before You Sign",
        body: "Never sign a lease under pressure. Read every clause carefully, ask about anything unclear, and do not pay any money before seeing the property in person. Verify that the person renting to you is the actual owner or a registered agent — ask to see the title deed or their agency licence.",
        bullets: [
          "Inspect the property in daylight and check all taps, lights, and locks",
          "Confirm what utilities are included in the rent",
          "Ask for the landlord's contact details and alternative number",
          "Take photos of any existing damage before moving in",
        ],
      },
      {
        heading: "During the Tenancy",
        body: "Pay your rent on time and always request a written receipt. Report maintenance issues in writing and keep copies. Be a considerate neighbour — noise complaints are a leading cause of early lease terminations. Keep common areas clean and follow the house rules.",
      },
      {
        heading: "When Moving Out",
        body: "Give proper written notice as specified in your lease. Clean the property thoroughly, remove all your belongings, and return all keys. Request a joint inspection with the landlord to agree on the condition of the property before leaving. This significantly reduces deposit disputes.",
      },
      {
        heading: "Avoiding Common Scams",
        body: "In Kenya, rental scams are common — particularly online. Never pay a deposit before viewing the property, and never pay to a personal M-Pesa number without verifying the identity of the recipient. If a deal seems too good to be true, verify independently before committing any money.",
      },
    ],
  },
];

// ─── Services ─────────────────────────────────────────────────────────────────

export const servicesData: ServiceItem[] = [
  {
    slug: "legal",
    title: "Legal Consultation",
    tagline: "Expert legal guidance for every property transaction in Kenya.",
    excerpt: "From lease reviews to dispute resolution — our network of property lawyers has you covered.",
    sections: [
      {
        heading: "What We Offer",
        body: "Our legal consultation service connects landlords, tenants, buyers, and sellers with qualified Kenyan property lawyers. Whether you need a lease agreement reviewed, a dispute resolved, or guidance on a commercial transaction, we match you with the right expert.",
        bullets: [
          "Lease and tenancy agreement review",
          "Dispute resolution and mediation",
          "Title deed verification and transfer advice",
          "Eviction procedures and tenant notices",
          "Sale and purchase agreement drafting",
        ],
      },
      {
        heading: "Why Legal Advice Matters",
        body: "Property transactions in Kenya involve significant financial commitments. A poorly drafted lease or an unverified title deed can cost you far more than a consultation fee. Our vetted lawyers specialise exclusively in property law and understand both urban and rural land matters under Kenyan legislation.",
      },
      {
        heading: "How to Get Started",
        body: "Submit your enquiry through our contact form, briefly describe your situation, and we will connect you with an appropriate lawyer within 24 hours. Initial consultations are available by phone, video call, or in person in Nairobi and Mombasa.",
      },
    ],
    cta: { label: "Request a Consultation", href: "/advises/tenancy-relationships" },
  },
  {
    slug: "valuation",
    title: "Real-Estate Valuation",
    tagline: "Know the true value of your property before you buy, sell, or rent.",
    excerpt: "Independent, professional property valuations across Kenya by registered valuers.",
    sections: [
      {
        heading: "Why Get a Professional Valuation?",
        body: "A professional valuation gives you an independent, accurate picture of what a property is worth in the current market. Whether you are buying, selling, refinancing, settling an estate, or simply reviewing your portfolio, an objective valuation protects you from overpaying or underselling.",
      },
      {
        heading: "Our Valuation Process",
        body: "Our network of registered valuers — all members of the Institution of Surveyors of Kenya — conduct a thorough inspection of the property, review comparable sales in the area, and produce a formal written valuation report that meets bank and legal requirements.",
        bullets: [
          "Physical inspection by a registered valuer",
          "Comparative market analysis of recent sales",
          "Formal written report issued within 5 working days",
          "Accepted by all major Kenyan banks for mortgage purposes",
        ],
      },
      {
        heading: "Coverage",
        body: "We provide valuation services in Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, and surrounding areas. For rural or agricultural land, specialist valuers with knowledge of land use regulations are available on request.",
      },
    ],
    cta: { label: "Request a Valuation", href: "/listings" },
  },
  {
    slug: "help",
    title: "We Help You Buy, Sell, Rent or Lease",
    tagline: "End-to-end support through every step of your property journey.",
    excerpt: "From first enquiry to signed agreement — RentNet guides you through the entire process.",
    sections: [
      {
        heading: "Buying a Property",
        body: "We guide first-time buyers and seasoned investors through the entire purchase process. We help you identify suitable properties, verify titles, negotiate pricing, coordinate valuations, and connect you with conveyancing lawyers to complete the transfer cleanly and safely.",
      },
      {
        heading: "Selling a Property",
        body: "Our selling service includes professional photography, listing on RentNet and partner platforms, screening of prospective buyers, negotiation support, and coordination with your lawyer for the sale agreement and title transfer. We work to get your property sold at the right price, not just quickly.",
      },
      {
        heading: "Renting and Leasing",
        body: "For landlords, we manage the listing, screen tenants, handle viewings, prepare the lease agreement, and conduct the property handover. For tenants, we help identify suitable properties, review lease terms, and ensure the handover is properly documented.",
        bullets: [
          "Full-service property listing and marketing",
          "Tenant or buyer screening and verification",
          "Lease and sale agreement preparation",
          "Coordinated handover with inventory documentation",
        ],
      },
    ],
    cta: { label: "Talk to an Advisor", href: "/post-listing" },
  },
  {
    slug: "personal-documents",
    title: "Personal Real-Estate Document",
    tagline: "Custom property documents prepared by experts, for your specific situation.",
    excerpt: "Get professionally drafted lease agreements, handover minutes, and more — tailored to Kenyan law.",
    sections: [
      {
        heading: "What We Prepare",
        body: "Our team prepares a full range of property documents for individuals and businesses. All documents comply with Kenyan property legislation and are drafted clearly enough to be understood without a lawyer, while being robust enough to hold up in court.",
        bullets: [
          "Residential and commercial lease agreements",
          "Tenancy renewal and amendment letters",
          "Property handover and return minutes",
          "Eviction and notice letters",
          "Deed of assignment for lease transfers",
        ],
      },
      {
        heading: "Turnaround Time",
        body: "Standard documents are delivered within 2 working days. If you need a document urgently, express preparation is available within 24 hours for an additional fee. All documents are delivered digitally and can be signed electronically or printed for wet signature.",
      },
      {
        heading: "How to Order",
        body: "Complete the document request form with your details and specific requirements. Our team will confirm receipt, ask any clarifying questions, and deliver your document by email. Revisions within the original scope are included at no extra charge.",
      },
    ],
    cta: { label: "Order a Document", href: "/documents" },
  },
  {
    slug: "notaries",
    title: "Notaries in Kenya",
    tagline: "Find qualified notaries for property transactions across Kenya.",
    excerpt: "A curated directory of registered notaries available in major Kenyan cities.",
    sections: [
      {
        heading: "When Do You Need a Notary?",
        body: "In Kenya, a notary public is required to authenticate documents for international use, certify copies of title deeds, witness powers of attorney, and authenticate agreements for property transactions involving foreign nationals or overseas registration. A Commissioner for Oaths handles most domestic property documents.",
      },
      {
        heading: "Finding the Right Professional",
        body: "Not all documents require a full notary — many routine property documents only require a Commissioner for Oaths. Our directory lists both, clearly categorised by the services they provide and their location. All listed professionals are registered with the Law Society of Kenya.",
        bullets: [
          "Nairobi CBD and suburbs — 40+ listed professionals",
          "Mombasa — 12 listed professionals",
          "Kisumu, Nakuru, Eldoret — available on request",
          "Virtual notarisation available for select documents",
        ],
      },
    ],
    cta: { label: "Find a Notary", href: "/services/legal" },
  },
  {
    slug: "lawyers",
    title: "Real Estate Lawyers in Kenya",
    tagline: "Connect with specialist property lawyers across Kenya.",
    excerpt: "Our directory of vetted real estate lawyers makes finding the right legal help straightforward.",
    sections: [
      {
        heading: "Why Use a Specialist",
        body: "General practice lawyers can handle many legal matters, but property transactions in Kenya benefit enormously from a specialist. Kenyan property law involves the Land Registration Act, Land Act, and various county-level regulations. A specialist knows the current process for title searches, transfers, and compliance.",
      },
      {
        heading: "What Our Listed Lawyers Handle",
        body: "All lawyers in our directory specialise primarily in property and real estate law. They are available for buyer and seller representation, lease drafting and review, eviction proceedings, boundary disputes, land fraud cases, and conveyancing for commercial and residential properties.",
        bullets: [
          "Conveyancing — buying and selling",
          "Lease drafting, review, and disputes",
          "Eviction and tenant notice procedures",
          "Title deed searches and registration",
          "Land fraud and adverse possession cases",
        ],
      },
      {
        heading: "How to Choose",
        body: "Use our filters to narrow by city, type of matter, and language. Read the profile of each lawyer, check their listed experience, and use the contact form to make an initial enquiry. Most lawyers offer a free 15-minute initial call to assess whether they can help with your matter.",
      },
    ],
    cta: { label: "Find a Lawyer", href: "/services/legal" },
  },
];

// ─── Documents ────────────────────────────────────────────────────────────────

export const documentsData: DocumentItem[] = [
  {
    slug: "lease",
    title: "Lease Agreement",
    category: "agreement",
    seoDescription: "Download a free residential lease agreement template for Kenya. Covers rent, deposit, notice period and tenant obligations — ready to sign.",
    excerpt: "A comprehensive, legally sound residential lease agreement template for use across Kenya.",
    downloadLabel: "Download Lease Agreement Template",
    sections: [
      {
        heading: "What This Document Covers",
        body: "This lease agreement template is designed for residential properties in Kenya. It covers all essential terms including rent amount and due date, security deposit, notice period, permitted use, maintenance responsibilities, and grounds for termination.",
        bullets: [
          "Parties — landlord and tenant details",
          "Property description and permitted use",
          "Rent amount, due date, and accepted payment methods",
          "Security deposit amount and conditions for return",
          "Notice period and grounds for termination",
          "Rules regarding subletting, pets, and alterations",
        ],
      },
      {
        heading: "How to Use This Template",
        body: "Fill in all highlighted fields with your specific details. Both parties should read the full document before signing. Sign two copies — one for the landlord and one for the tenant. If the rent exceeds KES 10,000 per month, consider having the agreement stamped by the Kenya Revenue Authority for additional legal standing.",
      },
      {
        heading: "Important Notes",
        body: "This template is a general guide and may not address every specific situation. For commercial leases, properties under the Rent Restriction Act, or complex arrangements, consult a property lawyer before signing. The Business Premises Tribunal has jurisdiction over most tenancy disputes in Kenya.",
      },
    ],
  },
  {
    slug: "takeover",
    title: "Minutes of Takeover",
    category: "inspection",
    seoDescription: "Free property takeover minutes template for Kenya landlords and tenants. Record room condition, meter readings and keys handed over on move-in day.",
    excerpt: "Document the condition of a property at the start of a tenancy to protect both parties.",
    downloadLabel: "Download Takeover Minutes Template",
    sections: [
      {
        heading: "Purpose of This Document",
        body: "The minutes of takeover — also known as a property condition report or inventory — is completed when a tenant moves in. It records the state of every room, all fixtures and fittings, meter readings, and the number of keys handed over. This document is the single most important tool for preventing deposit disputes.",
      },
      {
        heading: "What to Record",
        body: "Walk through every room together — landlord and tenant — and note the condition of walls, floors, ceilings, windows, doors, kitchen appliances, bathroom fixtures, and any furniture included. Use the categories: Excellent, Good, Fair, or Poor. Attach photographs.",
        bullets: [
          "Walls, floors, ceilings — condition and any existing marks",
          "Doors and windows — function, locks, glass",
          "Kitchen appliances — working order, cleanliness",
          "Bathroom — tiles, taps, toilet, shower",
          "Electricity and water meter readings on takeover date",
          "Number and type of keys handed to tenant",
        ],
      },
      {
        heading: "Signing and Storage",
        body: "Both landlord and tenant must sign the completed document on the day of handover. Each party keeps a copy. Photographs should be dated and stored securely. This document takes precedence over verbal claims in any future dispute about the deposit.",
      },
    ],
  },
  {
    slug: "return",
    title: "Minutes of Return",
    category: "inspection",
    seoDescription: "Free property return minutes template for Kenya. Use alongside takeover minutes to identify damage and justify deposit deductions at end of tenancy.",
    excerpt: "Formally document the condition of a property when a tenant moves out.",
    downloadLabel: "Download Return Minutes Template",
    sections: [
      {
        heading: "Purpose of This Document",
        body: "The minutes of return are completed when a tenant vacates the property. They are used alongside the minutes of takeover to identify any damage or deterioration beyond normal wear and tear, which may justify deductions from the security deposit.",
      },
      {
        heading: "What to Check",
        body: "Use the same structure as the takeover minutes — room by room, comparing the current condition against what was recorded at the start of the tenancy. Note any damage, missing items, or cleaning required. Record final meter readings for electricity and water.",
        bullets: [
          "Compare against the original takeover minutes",
          "Note all damage beyond normal wear and tear",
          "Record any missing keys, remotes, or access cards",
          "Take final electricity and water meter readings",
          "List any items left behind by the tenant",
        ],
      },
      {
        heading: "Deposit Deductions",
        body: "Any deductions from the deposit must be itemised in writing and supported by quotes or receipts. Normal wear and tear — faded paint, minor carpet wear, small scuffs — cannot be charged to the tenant. Deductions must be communicated within a reasonable time of the tenancy ending.",
      },
    ],
  },
  {
    slug: "house-rules",
    title: "House Rules",
    category: "agreement",
    seoDescription: "Free house rules template for Kenyan landlords and property managers. Covers noise, parking, waste, visitors and security in multi-unit residential buildings.",
    excerpt: "A clear set of house rules protects the community and prevents misunderstandings from day one.",
    downloadLabel: "Download House Rules Template",
    sections: [
      {
        heading: "Why House Rules Matter",
        body: "In multi-unit buildings and shared compounds across Kenya, house rules are essential for maintaining harmony. They set clear expectations around noise, shared space maintenance, waste disposal, visitor policies, and parking — issues that generate the majority of neighbour complaints.",
      },
      {
        heading: "Standard House Rules Clauses",
        body: "This template includes standard provisions covering the most common issues in Kenyan residential properties.",
        bullets: [
          "Quiet hours — no loud noise between 10pm and 7am",
          "Common areas — corridors, parking, and gardens to be kept clean",
          "Waste disposal — use designated bins only",
          "Visitors — no overnight guests without prior notice beyond two consecutive nights",
          "Parking — tenants may only use their allocated bay",
          "Security — gate codes and access cards are not to be shared",
          "Pets — subject to prior written approval by management",
          "Laundry — drying on balcony railings facing the street is not permitted",
        ],
      },
      {
        heading: "Enforcing House Rules",
        body: "House rules are typically attached to or incorporated by reference in the lease agreement, making them legally binding. Three written complaints about a rule breach within a tenancy period is usually sufficient grounds for issuing a formal notice to remedy or vacate.",
      },
    ],
  },
  {
    slug: "preparation",
    title: "Preparing the Property for Rental",
    category: "guide",
    excerpt: "A practical checklist to ensure your property is ready — and attractive — for new tenants.",
    downloadLabel: "Download Preparation Checklist",
    sections: [
      {
        heading: "First Impressions Count",
        body: "Tenants form an opinion within 30 seconds of entering a property. Clean, well-maintained properties in Kenya attract better tenants, rent faster, and command higher rents. A thorough preparation before each tenancy is an investment, not an expense.",
      },
      {
        heading: "The Essential Pre-Tenancy Checklist",
        body: "Work through this checklist before listing the property or allowing viewings.",
        bullets: [
          "Deep clean all rooms including inside cupboards and under appliances",
          "Touch up paint on walls and ceilings — use neutral colours",
          "Test all lights and replace any blown bulbs",
          "Check all taps and repair any dripping fixtures",
          "Flush and descale the toilet and shower head",
          "Service the boiler or water heater",
          "Check window and door locks — replace broken ones",
          "Clear all gutters and check for roof leaks",
          "Ensure the compound is swept and hedges are trimmed",
          "Check the electrical distribution board for any tripped breakers",
        ],
      },
      {
        heading: "Photography Tips",
        body: "Once the property is prepared, take professional or high-quality photographs on a bright day. Open all curtains, turn on all lights, and shoot from corner angles to show the full space. Good photographs can reduce vacancy periods by up to 40% in competitive markets like Nairobi.",
      },
    ],
  },
  {
    slug: "photo-instructions",
    title: "Photo Instructions for Renting",
    category: "guide",
    excerpt: "How to take great photographs of your rental property to attract more enquiries.",
    downloadLabel: "Download Photography Guide",
    sections: [
      {
        heading: "Why Good Photos Matter",
        body: "On RentNet and other platforms, listings with professional-quality photographs receive up to three times more enquiries than those with dark, cluttered, or low-resolution images. You do not need a professional photographer — a modern smartphone and these guidelines are enough.",
      },
      {
        heading: "Preparation Before Shooting",
        body: "Before taking a single photo, prepare the property fully.",
        bullets: [
          "Clean and declutter every room completely",
          "Remove personal items — family photos, toiletries, unmade beds",
          "Open all curtains and blinds fully to maximise natural light",
          "Turn on all overhead lights and lamps",
          "Make all beds with fresh linen",
          "Place fresh towels in the bathroom",
          "Clear the kitchen counter of everything except one or two decorative items",
        ],
      },
      {
        heading: "Shooting Technique",
        body: "Hold the phone horizontally (landscape mode) for interior shots. Stand in the corner of each room and shoot diagonally across to the opposite corner — this gives the widest, most spacious view. Avoid shooting directly at windows as the backlight will silhouette the room. Take at least 3 shots of each room and select the best.",
      },
      {
        heading: "What to Photograph",
        body: "Every listing should include photographs of the following, in this order:",
        bullets: [
          "Exterior — front of building, entrance, parking, garden",
          "Living room — two angles",
          "Kitchen — showing counter space and appliances",
          "Each bedroom — one or two angles",
          "Bathroom(s) — one clean, well-lit shot",
          "Any balcony, terrace, or outdoor space",
          "View from windows if notable",
        ],
      },
    ],
  },
  {
    slug: "tenancy-agreement",
    title: "Tenancy Agreement Kenya",
    category: "agreement",
    seoDescription: "Download a free tenancy agreement template for Kenya. Compliant with the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act and general Kenyan tenancy law.",
    excerpt: "A Kenya-specific tenancy agreement template that reflects local landlord and tenant law, payment norms, and dispute resolution processes.",
    downloadLabel: "Download Tenancy Agreement Kenya",
    sections: [
      {
        heading: "Why a Kenya-Specific Tenancy Agreement?",
        body: "Generic lease templates from other jurisdictions often miss critical Kenyan requirements — M-PESA payment references, Business Premises Tribunal jurisdiction clauses, and notice periods under Kenyan law. This template is drafted specifically for the Kenyan context and references the relevant statutes.",
        bullets: [
          "Aligned with the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act",
          "Covers the Rent Restriction Act applicability where rents are below the threshold",
          "References the Business Premises Tribunal as the dispute forum",
          "Includes M-PESA and bank transfer payment clauses",
          "Notice periods consistent with Kenyan common law — typically one rental period",
        ],
      },
      {
        heading: "Key Clauses to Complete",
        body: "Fill in the highlighted fields carefully. Both parties should review the completed agreement before signing. A lawyer review is recommended for properties with monthly rent above KES 100,000.",
        bullets: [
          "Landlord and tenant full legal names and ID numbers",
          "Property address including county, sub-county, and plot number",
          "Monthly rent in KES and M-PESA paybill or account details",
          "Security deposit amount — typically one to three months rent",
          "Commencement date and initial lease term",
          "Permitted use — residential only, or specific commercial use",
          "Utilities responsibility — who pays water, electricity, and refuse collection",
        ],
      },
      {
        heading: "Stamp Duty and Legal Standing",
        body: "In Kenya, tenancy agreements for properties above KES 10,000 per month should ideally be stamped by the Kenya Revenue Authority to give them the strongest legal standing. Stamping costs a nominal fee and can be done at any KRA office or online via iTax. Unstamped agreements are still valid but may carry less weight in tribunal proceedings.",
      },
    ],
  },
  {
    slug: "subletting-agreement",
    title: "Subletting Agreement",
    category: "agreement",
    seoDescription: "Free subletting agreement template for Kenya. Use when a tenant wants to sublet part or all of a property with the landlord's written consent.",
    excerpt: "A subletting agreement template for Kenyan tenants who have received written permission from their landlord to sublet part or all of the property.",
    downloadLabel: "Download Subletting Agreement Template",
    sections: [
      {
        heading: "When Is a Subletting Agreement Required?",
        body: "A subletting agreement is required whenever a tenant (the sublandlord) rents out the property — or part of it — to another person (the subtenant). In Kenya, subletting without the landlord's written consent is typically a breach of the head lease and grounds for eviction. Always obtain written permission before using this template.",
        bullets: [
          "Subletting an entire property while travelling or working away",
          "Renting out a spare room to a housemate",
          "Temporarily transferring tenancy during a long absence",
          "Commercial subletting of part of a business premise",
        ],
      },
      {
        heading: "What the Subletting Agreement Covers",
        body: "This template documents the arrangement between the original tenant and the subtenant, setting out rent, duration, shared areas, and each party's responsibilities.",
        bullets: [
          "Landlord's written consent reference and date",
          "Sublandlord and subtenant names and ID numbers",
          "Description of the sublet space — full property or specific rooms",
          "Sublet rent amount and payment method",
          "Duration of the sublease — must not exceed the head lease term",
          "Shared facilities and rules for common areas",
          "Liability for damage — subtenant's obligations mirror the head lease",
          "Notice period to end the sublease",
        ],
      },
      {
        heading: "Important Limits",
        body: "A sublease cannot grant the subtenant more rights than the original tenant holds. If the head lease ends, the sublease automatically terminates. The original tenant remains fully liable to the landlord for rent and property condition regardless of the subletting arrangement.",
      },
    ],
  },
  {
    slug: "commercial-lease",
    title: "Commercial Lease Agreement",
    category: "agreement",
    seoDescription: "Download a free commercial lease agreement template for Kenya. Covers office, retail and industrial spaces under the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act.",
    excerpt: "A commercial lease agreement template for offices, retail shops, and industrial properties in Kenya, referencing the Landlord and Tenant Act.",
    downloadLabel: "Download Commercial Lease Agreement",
    sections: [
      {
        heading: "Commercial vs Residential Leases in Kenya",
        body: "Commercial leases in Kenya are governed primarily by the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap 301). This gives business tenants significant protections including controlled rent increases and the right to compensation for disturbance when a lease is not renewed. Landlords and tenants should both understand these rights before signing.",
        bullets: [
          "Applies to shops, hotels, catering establishments, and similar business premises",
          "Controlled rent increases — disputes go to the Business Premises Tribunal",
          "Tenant right to new tenancy at end of fixed term in most cases",
          "Landlord must give six months notice of non-renewal",
          "Goodwill and disturbance compensation on eviction in some cases",
        ],
      },
      {
        heading: "Key Commercial Lease Terms",
        body: "Commercial leases involve more complex terms than residential leases. Negotiate these points carefully before signing.",
        bullets: [
          "Base rent and review mechanism — fixed increase percentage or market review",
          "Service charge — contribution to building maintenance, security, and common areas",
          "Permitted use — specify your business type precisely; changing use requires consent",
          "Fit-out and alterations — rights to install fixtures and who owns them at lease end",
          "Assignment and subletting rights — can you sell or transfer the lease?",
          "Break clauses — option to terminate early, subject to notice and conditions",
          "Dilapidations — obligation to return premises to original condition at expiry",
        ],
      },
      {
        heading: "Professional Advice",
        body: "Commercial leases typically run for three to ten years and involve significant financial commitments. We strongly recommend having a Kenyan property lawyer review or draft the final agreement. This template provides a starting framework — it is not a substitute for legal advice on a specific commercial transaction.",
      },
    ],
  },
  {
    slug: "eviction-notice",
    title: "Eviction Notice Template",
    category: "notice",
    seoDescription: "Free eviction notice template for Kenya landlords. Compliant with Kenyan tenancy law — covers notice to vacate, breach of lease, and non-payment of rent.",
    excerpt: "A legally compliant eviction notice template for Kenyan landlords, covering non-payment of rent, lease breach, and end-of-tenancy notices to vacate.",
    downloadLabel: "Download Eviction Notice Template",
    sections: [
      {
        heading: "Legal Requirements for Eviction in Kenya",
        body: "In Kenya, a landlord cannot forcibly evict a tenant without following the correct legal process. Self-help eviction — changing locks, removing doors, cutting utilities — is illegal and exposes landlords to criminal liability. The correct process begins with a formal written notice.",
        bullets: [
          "Non-payment of rent — serve a formal demand notice, then proceed to court",
          "Breach of lease terms — written notice to remedy within a specified period",
          "End of fixed term — notice must be given before the term expires",
          "Residential tenancies under the Rent Restriction Act require Rent Tribunal approval",
          "Business premises disputes go to the Business Premises Tribunal",
          "Court order required before physical eviction in all cases",
        ],
      },
      {
        heading: "Notice Periods in Kenya",
        body: "The required notice period depends on the type of tenancy and the ground for eviction.",
        bullets: [
          "Month-to-month tenancy — one month's notice minimum",
          "Fixed-term lease — notice as specified in the agreement, or one rental period",
          "Non-payment of rent — immediate demand, court proceedings if unpaid after 7–14 days",
          "Serious breach — reasonable period to remedy, typically 7–14 days",
          "Owner's personal occupation — six months notice for most business premises",
        ],
      },
      {
        heading: "How to Use This Template",
        body: "Complete all fields accurately. Serve the notice by hand with a witness, or by registered post. Keep a signed copy. If the tenant does not vacate or remedy the breach by the deadline, you must apply to the relevant tribunal or court — do not attempt to remove the tenant yourself. Consult a property lawyer before serving eviction notices in complex or contested cases.",
      },
    ],
  },
  {
    slug: "rent-increase-notice",
    title: "Rent Increase Notice",
    category: "notice",
    seoDescription: "Free rent increase notice template for Kenya. Formally notify tenants of a rent increase with the correct notice period under Kenyan tenancy law.",
    excerpt: "A formal rent increase notice template for Kenyan landlords, with the correct notice periods and legal requirements under Kenyan tenancy law.",
    downloadLabel: "Download Rent Increase Notice Template",
    sections: [
      {
        heading: "Rules for Rent Increases in Kenya",
        body: "Kenyan landlords cannot arbitrarily increase rent at any time. The rules depend on whether the tenancy is residential or commercial, and whether the property falls under the Rent Restriction Act.",
        bullets: [
          "Standard residential leases — rent can only be increased at renewal or as provided in the lease",
          "Rent Restriction Act properties (low-cost residential) — controlled increases, tribunal oversight",
          "Business premises under Cap 301 — controlled increases, disputes to Business Premises Tribunal",
          "Market-rate properties — increase as agreed in lease, with proper notice",
          "Minimum notice for rent increase — one full rental period (typically one month)",
        ],
      },
      {
        heading: "What the Notice Must Include",
        body: "A valid rent increase notice should contain all the following information to be enforceable.",
        bullets: [
          "Landlord's full name and contact details",
          "Tenant's full name",
          "Property address",
          "Current monthly rent in KES",
          "New monthly rent in KES and percentage increase",
          "Effective date of the increase — at least one full rental period from service",
          "Date the notice is served",
          "Landlord's signature",
        ],
      },
      {
        heading: "Serving the Notice",
        body: "Deliver the notice in person and ask the tenant to sign a copy as acknowledgement, or send by registered post. Keep a copy of the served notice and proof of delivery. If a tenant disputes the increase, they may refer the matter to the Rent Restriction Tribunal (residential) or Business Premises Tribunal (commercial). A reasonable, well-documented increase is much less likely to be challenged.",
      },
    ],
  },
  {
    slug: "move-in-checklist",
    title: "Move-in Checklist",
    category: "inspection",
    seoDescription: "Free move-in checklist for Kenya tenants and landlords. Record the property condition room by room before moving in to protect your deposit.",
    excerpt: "A thorough move-in checklist for Kenyan tenants and landlords to record the property condition, meter readings, and keys on the day of occupation.",
    downloadLabel: "Download Move-in Checklist",
    sections: [
      {
        heading: "Why Complete a Move-in Checklist?",
        body: "The move-in checklist — also called a property condition report — is the most important document you can complete at the start of a tenancy. It creates a dated, agreed record of the property's condition that protects the tenant from being charged for pre-existing damage and protects the landlord by documenting what was there at the start. Without it, deposit disputes are almost impossible to resolve fairly.",
      },
      {
        heading: "Room-by-Room Checklist",
        body: "Walk through every room together on the day the tenant takes occupation. Rate each item: Excellent, Good, Fair, or Poor. Note specific defects in the comments column. Take photographs of every room and any existing damage, and attach them to the signed checklist.",
        bullets: [
          "Living room — walls, floor, ceiling, windows, doors, light fittings, sockets",
          "Kitchen — cupboards, countertop, sink, taps, cooker/oven, fridge (if included)",
          "Each bedroom — walls, floor, built-in wardrobes, windows, lights",
          "Bathroom(s) — toilet, basin, shower/bath, taps, mirror, tiles",
          "Balcony or terrace — floor condition, railings, drainage",
          "Entrance and hallway — door locks, intercom, lighting",
          "Parking space — condition, allocated bay number",
        ],
      },
      {
        heading: "Meter Readings and Keys",
        body: "Record electricity and water meter readings on the day of move-in. Both parties should photograph the meters. List every key, access card, and remote control handed to the tenant. Both parties sign the completed checklist — one copy for each. This document should be kept for the full duration of the tenancy.",
        bullets: [
          "Electricity meter reading and unit number",
          "Water meter reading",
          "Number of front door keys",
          "Number of gate/compound keys",
          "Access cards or key fobs",
          "Remote controls (gate, garage)",
          "Letterbox key if applicable",
        ],
      },
    ],
  },
  {
    slug: "move-out-checklist",
    title: "Move-out Checklist",
    category: "inspection",
    seoDescription: "Free move-out checklist for Kenya landlords and tenants. Use at end of tenancy to compare property condition and calculate fair deposit deductions.",
    excerpt: "A move-out checklist for Kenyan landlords and tenants to assess the property condition at end of tenancy, compare against the move-in record, and agree on deposit deductions.",
    downloadLabel: "Download Move-out Checklist",
    sections: [
      {
        heading: "Using the Move-out Checklist",
        body: "The move-out checklist is completed on the day the tenant vacates. It should be used side by side with the original move-in checklist and photographs. The goal is to identify any deterioration beyond normal wear and tear that the landlord can legitimately deduct from the security deposit. Both parties should be present.",
      },
      {
        heading: "What Counts as Normal Wear and Tear?",
        body: "Kenyan law (and common law generally) distinguishes between fair wear and tear — which a tenant cannot be charged for — and damage caused by negligence or misuse.",
        bullets: [
          "Normal wear and tear: faded paint, minor carpet wear from regular foot traffic, small scuffs on walls, loose hinges from daily use",
          "Chargeable damage: holes in walls, broken tiles, burn marks, pet damage, mould from poor ventilation, missing fixtures",
          "Cleaning: tenants are expected to return the property in the same state of cleanliness as received",
          "Appliances: functional on move-in must be functional on move-out; normal mechanical wear is excluded",
        ],
      },
      {
        heading: "Deposit Deduction Process",
        body: "Any deductions from the security deposit must be itemised in writing, with supporting quotes or receipts for repair work. Communicate deductions within a reasonable period after move-out — typically within 14 days. Return the balance promptly. Disputes can be referred to the relevant tribunal. A clear, signed move-out checklist significantly reduces the risk of a deposit dispute escalating.",
      },
    ],
  },
  {
    slug: "property-handover-form",
    title: "Property Handover Form",
    category: "inspection",
    seoDescription: "Free property handover form for Kenya. Complete this form when transferring property keys and responsibility between landlord and tenant at start or end of tenancy.",
    excerpt: "A formal property handover form for Kenyan landlords and tenants, documenting the transfer of keys, access devices, and responsibility at the start or end of a tenancy.",
    downloadLabel: "Download Property Handover Form",
    sections: [
      {
        heading: "What Is a Property Handover Form?",
        body: "The property handover form is a brief but critical document signed when keys and responsibility for a property change hands — either at the start of a tenancy (move-in) or at the end (move-out). It confirms exactly what was handed over, to whom, on what date, and in what condition. It works alongside the detailed inventory checklist and move-in or move-out checklist.",
      },
      {
        heading: "Items to Record on Handover",
        body: "Complete every field carefully. Both parties should verify each item before signing.",
        bullets: [
          "Date and time of handover",
          "Names and signatures of both parties (and any witness)",
          "Property address",
          "Type of handover — move-in or move-out",
          "Number and type of keys exchanged (itemised)",
          "Access cards, gate remotes, and garage openers",
          "Overall property condition summary at time of handover",
          "Outstanding repairs agreed before occupation (if any)",
          "Utility meter readings at handover",
          "Security deposit amount paid and receipt reference",
        ],
      },
      {
        heading: "Best Practice",
        body: "Keep the property handover form together with the tenancy agreement, deposit receipt, and inspection checklist in a single file. For landlords managing multiple properties, a consistent handover process reduces disputes, protects rental income, and demonstrates professionalism that attracts quality long-term tenants.",
      },
    ],
  },
  {
    slug: "inventory-checklist",
    title: "Inventory Checklist",
    category: "inspection",
    seoDescription: "Free rental property inventory checklist for Kenya. List all furniture, appliances and fixtures included in a furnished or semi-furnished rental property.",
    excerpt: "A detailed inventory checklist for furnished and semi-furnished rental properties in Kenya, listing all items included with their condition at the start of tenancy.",
    downloadLabel: "Download Inventory Checklist",
    sections: [
      {
        heading: "When Is an Inventory Required?",
        body: "An inventory checklist is essential for any furnished or semi-furnished property. It lists every item of furniture, appliance, fixture, and fitting provided by the landlord, records its condition at move-in, and is checked again at move-out. Missing or damaged items identified at move-out can be deducted from the deposit — but only if they were properly documented at move-in.",
      },
      {
        heading: "Standard Inventory Categories",
        body: "Work through the property systematically, recording each item with its description, brand (if applicable), quantity, and condition rating (Excellent / Good / Fair / Poor).",
        bullets: [
          "Living room — sofa, chairs, coffee table, TV unit, curtains/blinds, rugs",
          "Kitchen — fridge, cooker/oven, microwave, kettle, pots and pans, cutlery, crockery",
          "Each bedroom — bed frame, mattress, wardrobe, bedside tables, lamps, bedding (if provided)",
          "Dining area — table, chairs",
          "Bathroom — shower curtain, towel rails, bathroom cabinet, toilet brush and holder",
          "General — light fittings, window locks, door handles, smoke alarms, fire extinguisher",
          "Outdoor — garden furniture, braai/BBQ, dustbins",
        ],
      },
      {
        heading: "Photography and Signatures",
        body: "Photograph every item on the inventory, particularly any that show existing wear or minor damage. Number the photographs to correspond with the inventory list. Both landlord and tenant sign the completed inventory on move-in day. At move-out, repeat the process using the same form. Any item missing from the list or returned in worse condition than recorded can be charged to the tenant — subject to fair wear and tear allowance.",
      },
    ],
  },
];

// ─── Youth ────────────────────────────────────────────────────────────────────

export const youthData: YouthItem[] = [
  {
    slug: "real-estate-youth",
    title: "Real Estate and Kenya Youth",
    excerpt: "How young Kenyans can access, understand, and benefit from the property market.",
    sections: [
      {
        heading: "The Challenge for Young Kenyans",
        body: "For most young Kenyans between 18 and 35, owning or renting a home independently is a significant financial challenge. Rapid urbanisation, rising rents in Nairobi and Mombasa, and limited access to mortgage finance have made entering the property market harder for this generation than for any previous one.",
      },
      {
        heading: "Renting as a Starting Point",
        body: "Renting is not a failure to own — it is a valid, strategic choice that provides flexibility while building savings and credit history. Young professionals who rent in well-connected urban areas often build their career and financial standing faster than those who overextend into ownership prematurely.",
        bullets: [
          "Start with affordable studio or one-bedroom units",
          "Prioritise proximity to work to reduce transport costs",
          "Build a rental history — future landlords and banks review this",
          "Save a consistent portion of income towards a deposit fund",
        ],
      },
      {
        heading: "Pathways to Ownership",
        body: "Kenya has several government and private programmes that specifically support young first-time buyers. The Kenya Mortgage Refinance Company (KMRC) provides subsidised mortgage rates for incomes below KES 150,000 per month. Saccos remain one of the most accessible routes to property financing for young Kenyans without a formal payslip.",
      },
      {
        heading: "Real Estate as Investment",
        body: "Beyond personal housing, real estate investment — through REITs, land banking, or co-ownership with friends or family — is increasingly accessible to young Kenyans. Understanding how property markets work, how to evaluate locations, and how to read a title deed are skills that pay dividends for a lifetime.",
      },
    ],
  },
  {
    slug: "support-organizations",
    title: "Youth Support Organizations",
    excerpt: "A directory of organisations in Kenya that support young people with housing, finance, and property access.",
    sections: [
      {
        heading: "Government Programmes",
        body: "The Kenyan government operates several programmes relevant to young people seeking affordable housing.",
        bullets: [
          "Kenya Mortgage Refinance Company (KMRC) — subsidised mortgage rates for qualifying income brackets",
          "National Housing Corporation (NHC) — affordable housing units and tenant purchase schemes",
          "Boma Yangu — government affordable housing portal for registration and allocation",
          "Youth Enterprise Development Fund — financing for young entrepreneurs including property-related businesses",
        ],
      },
      {
        heading: "Savings and Co-operative Organisations",
        body: "Savings and Credit Co-operative Organisations (Saccos) are the most widely accessible route to property financing for young Kenyans who may not qualify for bank mortgages.",
        bullets: [
          "Kenya National Police Sacco — open to public sector employees",
          "Stima Sacco — one of the largest in Kenya with property loans",
          "Mwalimu National Sacco — open to teachers and the public",
          "Imarisha Sacco — strong history of property financing in Western Kenya",
          "Unaitas Sacco — strong coverage in Central and Rift Valley regions",
        ],
      },
      {
        heading: "NGOs and Civil Society",
        body: "Several civil society and non-governmental organisations advocate for housing rights and provide practical support to young people in urban areas.",
        bullets: [
          "Slum Dwellers International (Kenya chapter) — community-led housing solutions",
          "Pamoja Trust — urban land and housing rights advocacy",
          "Centre for Affordable Housing Finance in Africa (CAHF) — research and policy advocacy",
          "Habitat for Humanity Kenya — affordable housing construction and advocacy",
        ],
      },
      {
        heading: "Financial Literacy Resources",
        body: "Understanding personal finance is the foundation of any property goal. Free and low-cost financial literacy resources include the Central Bank of Kenya consumer education portal, the Kenya Bankers Association housing finance guide, and online platforms like Centonomy and OrangeMoney Kenya which offer savings planning tools.",
      },
    ],
  },
];

// ─── Partner Categories ───────────────────────────────────────────────────────

export const partnerCategoriesData: PartnerCategory[] = [
  {
    slug: "agencies",
    title: "Real Estate Agencies",
    description: "Licensed agencies helping buyers, sellers, landlords and tenants across Kenya.",
    longDescription: "Real estate agencies listed on RentNet are licensed professionals who facilitate property transactions across Kenya. Whether you are looking for a buying agent, a letting manager, or a full property consultancy, this directory connects you with verified agencies in your area.",
    subcategories: [],
  },
  {
    slug: "rentnet-agents",
    title: "Rentnet Agents",
    description: "Professional property management services for landlords who want a hands-off approach.",
    longDescription: "Property managers handle everything from tenant sourcing and rent collection to maintenance coordination and legal compliance on behalf of landlords. If you own one or more rental properties and want professional management, connect with a listed manager in this directory.",
    subcategories: [],
  },
  {
    slug: "bank",
    title: "Banks & Mortgage Providers",
    description: "Banks and financial institutions offering mortgage and property finance products in Kenya.",
    longDescription: "Buying property in Kenya almost always involves financing. Our directory lists banks and mortgage providers operating in Kenya, with information on the types of products they offer, minimum deposit requirements, and contact details for their property finance desks.",
    subcategories: ["Commercial Bank", "Mortgage Specialist", "SACCO", "Microfinance"],
  },
  {
    slug: "insurance",
    title: "Insurance Providers",
    description: "Property, liability, and rental income insurance tailored to Kenyan property owners and tenants.",
    longDescription: "Property insurance is underutilised in Kenya but essential for protecting your asset. This directory lists insurance companies offering home, landlord, and tenant contents insurance products in Kenya, along with their coverage details and contact information.",
    subcategories: ["Home Insurance", "Landlord Insurance", "Contents Insurance", "Commercial Property"],
  },
  {
    slug: "ratings",
    title: "Ratings & Opinion Services",
    description: "Independent rating and review services for properties, agents, and landlords.",
    longDescription: "Transparency in the Kenyan property market is growing. This directory lists independent services that provide property ratings, neighbourhood assessments, landlord and agent reviews, and market intelligence reports to help buyers, tenants, and investors make better decisions.",
    subcategories: [],
  },
  {
    slug: "furniture",
    title: "Furniture & Interior Design",
    description: "Furniture suppliers and interior designers who specialise in residential and rental properties.",
    longDescription: "Furnishing a rental property or new home in Kenya is a significant investment. This directory lists furniture suppliers, interior designers, and home staging professionals who work with landlords, developers, and homeowners to create well-designed, durable spaces.",
    subcategories: ["Furniture Supplier", "Interior Designer", "Home Staging", "Curtains & Blinds", "Kitchen & Bathroom"],
  },
  {
    slug: "taxes",
    title: "Tax Advisors",
    description: "Tax consultants and accountants specialising in property income, capital gains, and compliance.",
    longDescription: "Property ownership and rental income in Kenya have tax implications that many landlords overlook. Rental income is taxable, and capital gains tax applies to property sales. This directory lists accountants and tax advisors who specialise in property-related taxation and KRA compliance.",
    subcategories: ["Tax Consultant", "Accountant", "KRA Compliance", "Estate Planning"],
  },
  {
    slug: "craftsmen",
    title: "Craftsmen Directory",
    description: "Skilled tradespeople for maintenance, repair, and renovation work on residential properties.",
    longDescription: "Finding reliable craftsmen in Kenya can be challenging. This directory lists vetted plumbers, electricians, painters, tilers, and other tradespeople who specialise in residential property maintenance and renovation. All listed professionals have been submitted by registered users and are displayed after verification.",
    subcategories: ["Plumber", "Gas Master", "Electrician", "Locksmith", "Painter", "Tiler", "Glazier", "Cornices installation", "Furniture assembly", "Roof repair", "Construction work", "Moving service", "Cleaning service"],
  },
  {
    slug: "advertising",
    title: "Advertising & Marketing",
    description: "Marketing agencies and platforms that help property professionals reach more clients.",
    longDescription: "Effective marketing is essential for property agents, developers, and landlords who want to stand out in a competitive market. This directory lists advertising agencies, digital marketers, photography studios, and print media providers who specialise in real estate marketing in Kenya.",
    subcategories: ["Digital Marketing", "Photography", "Print & Outdoor", "Social Media", "SEO & Web"],
  },
];
