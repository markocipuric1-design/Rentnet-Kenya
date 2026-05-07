export type FaqSection = {
  category: string;
  items: { q: string; a: string }[];
};

export const faqs: FaqSection[] = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is Rentnet?",
        a: "Rentnet is Kenya's real estate platform where you can search, list, buy, sell, and rent properties across the country. We connect property seekers with landlords, sellers, and professional agencies.",
      },
      {
        q: "Is Rentnet free to use?",
        a: "Browsing listings and searching for properties is completely free. Posting a listing requires a free account. Premium listing features and agency subscriptions are available on paid plans — see our Pricing page for details.",
      },
      {
        q: "How do I create an account?",
        a: "Click 'Sign In' in the top navigation and select 'Create account'. You can register with your email address. Once registered you can post listings, save favourites, and contact agents.",
      },
      {
        q: "What areas does Rentnet cover?",
        a: "We cover properties across all 47 counties in Kenya, with the strongest concentration in Nairobi, Mombasa, Kisumu, Nakuru, and Eldoret. Listings from smaller towns and rural areas are also welcome.",
      },
    ],
  },
  {
    category: "Searching for Property",
    items: [
      {
        q: "How do I search for a property?",
        a: "Use the search bar at the top of any page to search by location or keyword. On the Listings page you can filter by property type, listing type (For Sale / For Rent), price range, number of bedrooms, and more.",
      },
      {
        q: "Can I save listings I like?",
        a: "Yes. Click the bookmark icon on any listing card to save it to your favourites. You need a free account to save listings — they'll be accessible from your dashboard.",
      },
      {
        q: "How do I contact a landlord or agent?",
        a: "Open the property listing page and click the 'Contact' button to send a message or view the agent's phone number. You can also send a WhatsApp message directly from the listing page.",
      },
      {
        q: "Are all listings verified?",
        a: "All listings are reviewed before going live. Listings from Rentnet Certified agents carry an additional verification badge, indicating the agent has been vetted by our team. Always arrange a physical viewing before making any payment.",
      },
    ],
  },
  {
    category: "Posting a Listing",
    items: [
      {
        q: "How do I post a listing?",
        a: "Click 'Post Listing' in the top navigation. Fill in the property details, upload photos, set your price, and submit. Your listing will be reviewed and published within 24 hours.",
      },
      {
        q: "How many photos can I upload?",
        a: "You can upload up to 20 photos per listing. We recommend at least 5 high-quality photos showing the exterior, living area, bedroom, kitchen, and bathroom. Listings with more photos receive significantly more enquiries.",
      },
      {
        q: "Can I edit my listing after it goes live?",
        a: "Yes. Go to your dashboard, find the listing, and click 'Edit'. Changes to price and description are updated immediately. Photo changes may take a short time to reflect.",
      },
      {
        q: "How long does a listing stay active?",
        a: "Standard listings remain active for 30 days and can be renewed for free. Premium listings stay active for the duration of your subscription. You can manually deactivate a listing at any time from your dashboard.",
      },
      {
        q: "Can I list commercial properties?",
        a: "Yes. Rentnet supports all property types including apartments, houses, land, commercial spaces, industrial properties, garages, holiday homes, and new developments.",
      },
    ],
  },
  {
    category: "Payments & M-PESA",
    items: [
      {
        q: "What payment methods does Rentnet accept?",
        a: "We accept M-PESA (Lipa Na M-PESA), Visa and Mastercard for subscription and advertising payments. M-PESA is the fastest and most convenient option for Kenyan users.",
      },
      {
        q: "How does M-PESA payment work?",
        a: "Select M-PESA at checkout, enter your Safaricom number, and you will receive an STK push prompt on your phone. Enter your M-PESA PIN to confirm. Payment is confirmed instantly.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. We do not store your M-PESA PIN or card details. All transactions are processed through encrypted, PCI-compliant payment gateways. We only retain the transaction reference for record purposes.",
      },
      {
        q: "Can I get a refund?",
        a: "Refund requests for subscription payments are handled on a case-by-case basis. Contact our support team within 48 hours of payment. We do not offer refunds for advertising placements that have already gone live.",
      },
    ],
  },
  {
    category: "For Agents & Agencies",
    items: [
      {
        q: "How do I register as an agent or agency?",
        a: "Create an account and select 'Agency' as your account type during registration. Once registered, complete your agency profile with your business name, logo, contact details, and licence number.",
      },
      {
        q: "What is the Rentnet Certified badge?",
        a: "The Rentnet Certified badge is awarded to agents and agencies that have been verified by our team. Verification includes confirming your business registration, reviewing your track record, and a brief onboarding call. Apply from your dashboard.",
      },
      {
        q: "Can agencies manage multiple listings?",
        a: "Yes. Agency accounts have access to a full dashboard where you can manage all your listings, view enquiry statistics, track listing performance, and manage agent profiles under your agency.",
      },
      {
        q: "How do I advertise on Rentnet?",
        a: "We offer four advertising placements: Sidebar banners, In-feed sponsored cards, Featured Partner spotlights, and Homepage Banners. Click 'Advertise' in the navigation or visit our Advertise page for pricing and booking.",
      },
    ],
  },
  {
    category: "Legal & Safety",
    items: [
      {
        q: "How do I report a suspicious listing?",
        a: "Click the 'Report' button on any listing page. Our team reviews all reports within 24 hours. Listings found to be fraudulent are removed immediately and the account is suspended.",
      },
      {
        q: "What should I check before paying a deposit?",
        a: "Always view the property in person, verify the landlord's identity and ownership documents (title deed or lease agreement), and never pay a deposit without a signed tenancy agreement. Be cautious of deals that seem too good to be true.",
      },
      {
        q: "Does Rentnet handle tenancy agreements?",
        a: "We provide template tenancy agreements in our Resources section and connect users with legal professionals through our Legal Advice service. However, Rentnet is a listing platform — we are not a party to any tenancy or sale agreement.",
      },
      {
        q: "How does Rentnet protect my personal data?",
        a: "We comply with Kenya's Data Protection Act 2019. Your personal data is stored securely, never sold to third parties, and used only to provide our services. See our Privacy Policy for full details.",
      },
    ],
  },
];
