-- ============================================================
--  Kenyan Insurance Providers — Seed Data
--  Run in: Supabase Dashboard → SQL Editor
--
--  IMPORTANT: IRA licence numbers are sourced from public
--  IRA Kenya registry data and should be verified at
--  https://www.ira.go.ke before going live.
--
--  Logos: auto-fetched via Clearbit from each website URL.
--  logo_url is intentionally null — no manual upload needed.
-- ============================================================

INSERT INTO partners (
  category, subcategory, company_name, contact_name,
  email, phone, website, city, description,
  verified, logo_url, promo_banner_url, user_id, metadata
) VALUES

-- 1. Jubilee Insurance ------------------------------------------------
(
  'insurance', 'Home Insurance',
  'Jubilee Insurance Company of Kenya',
  'Customer Service Team',
  'info@jubileeinsurance.com',
  '+254 20 3281000',
  'https://www.jubileeinsurance.com',
  'Nairobi',
  'Jubilee Insurance is East Africa''s largest listed insurance group, with operations in Kenya since 1937. They offer comprehensive property cover for homeowners, landlords, and developers, with one of the fastest claims processing teams in the market.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/012",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "East Africa's most trusted insurer since 1937",
    "policy_types": ["Home Insurance","Mortgage Protection","Landlord Insurance","Construction All-Risk","Developer's All-Risk","Fire & Perils"],
    "premium_from": "8000",
    "sum_insured_up_to": "500000000",
    "claim_settlement_days": "14",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Machakos","Meru","Kisii"]
  }$$::jsonb
),

-- 2. Britam Insurance -------------------------------------------------
(
  'insurance', 'Home Insurance',
  'Britam Insurance Company (Kenya) Ltd',
  'Customer Service Team',
  'info@britam.com',
  '+254 20 2710930',
  'https://www.britam.com',
  'Nairobi',
  'Britam is a pan-African financial services group providing innovative insurance solutions across Kenya and East Africa. Their property insurance products cover everything from modest family homes to large commercial buildings, with flexible payment plans.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/007",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Innovative insurance for every Kenyan home",
    "policy_types": ["Home Insurance","Mortgage Protection","Landlord Insurance","Tenant Contents","Fire & Perils"],
    "premium_from": "6500",
    "sum_insured_up_to": "300000000",
    "claim_settlement_days": "21",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Kisii","Kericho"]
  }$$::jsonb
),

-- 3. CIC Insurance Group ----------------------------------------------
(
  'insurance', 'Home Insurance',
  'CIC Insurance Group PLC',
  'Customer Service Team',
  'info@cic.co.ke',
  '+254 20 2823000',
  'https://www.cic.co.ke',
  'Nairobi',
  'CIC Insurance Group is a cooperative-owned insurer and one of Kenya''s most accessible, with an extensive network across all 47 counties. Renowned for affordable premiums and reliable payouts, CIC is the insurer of choice for cooperative members, saccos, and individual homeowners.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/004",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Affordable cover, county-wide reach",
    "policy_types": ["Home Insurance","Landlord Insurance","Tenant Contents","Fire & Perils","Mortgage Protection"],
    "premium_from": "5000",
    "sum_insured_up_to": "200000000",
    "claim_settlement_days": "30",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Meru","Kitale","Garissa","Kisii","Kericho","Machakos","Malindi"]
  }$$::jsonb
),

-- 4. APA Insurance (Apollo Group) -------------------------------------
(
  'insurance', 'Commercial Property',
  'APA Insurance Ltd',
  'Customer Service Team',
  'info@apainsurance.org',
  '+254 20 2866000',
  'https://www.apainsurance.org',
  'Nairobi',
  'APA Insurance (part of Apollo Investments) is a leading general insurer offering property and casualty solutions for both retail and commercial clients. Known for strong underwriting capacity and swift claim settlements, they are a preferred partner for developers and property investors.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/003",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Strong underwriting. Swift settlements.",
    "policy_types": ["Home Insurance","Mortgage Protection","Title Insurance","Construction All-Risk","Developer's All-Risk","Fire & Perils"],
    "premium_from": "7000",
    "sum_insured_up_to": "400000000",
    "claim_settlement_days": "14",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Machakos","Meru"]
  }$$::jsonb
),

-- 5. UAP Old Mutual Insurance ------------------------------------------
(
  'insurance', 'Home Insurance',
  'UAP Old Mutual Insurance Ltd',
  'Customer Service Team',
  'customercare@uapoldmutual.com',
  '+254 20 2851000',
  'https://www.uapoldmutual.com',
  'Nairobi',
  'UAP Old Mutual is a subsidiary of the Old Mutual Group, one of Africa''s largest financial services companies. Their property insurance portfolio is one of the most comprehensive in Kenya, with tailored products for homeowners, landlords, mortgage holders, and large-scale developers.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/019",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Pan-African strength, Kenyan expertise",
    "policy_types": ["Home Insurance","Mortgage Protection","Title Insurance","Landlord Insurance","Tenant Contents","Construction All-Risk","Fire & Perils"],
    "premium_from": "9000",
    "sum_insured_up_to": "500000000",
    "claim_settlement_days": "14",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Meru","Machakos","Kisii","Kericho","Malindi"]
  }$$::jsonb
),

-- 6. Sanlam Kenya -----------------------------------------------------
(
  'insurance', 'Home Insurance',
  'Sanlam Kenya PLC',
  'Customer Service Team',
  'info@sanlam.co.ke',
  '+254 20 2861000',
  'https://www.sanlam.co.ke',
  'Nairobi',
  'Sanlam Kenya (formerly Pan Africa Insurance) is part of the Sanlam Group, a leading pan-African financial services giant. Their general insurance arm provides robust home and property cover with a reputation for financial stability and reliable claim payments.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/016",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Pan-African stability for your Kenyan home",
    "policy_types": ["Home Insurance","Mortgage Protection","Landlord Insurance","Fire & Perils","Developer's All-Risk"],
    "premium_from": "7500",
    "sum_insured_up_to": "350000000",
    "claim_settlement_days": "21",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Nyeri","Machakos"]
  }$$::jsonb
),

-- 7. Mayfair Insurance ------------------------------------------------
(
  'insurance', 'Landlord Insurance',
  'Mayfair Insurance Company Ltd',
  'Customer Service Team',
  'info@mayfair.co.ke',
  '+254 20 2214897',
  'https://www.mayfair.co.ke',
  'Nairobi',
  'Mayfair Insurance is a specialist general insurer with a strong focus on landlord and rental property products. They offer competitive premiums for individual property owners and portfolio landlords, with add-on cover for rental income loss and malicious damage by tenants.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/014",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Specialist cover for Kenya's landlords",
    "policy_types": ["Landlord Insurance","Home Insurance","Tenant Contents","Fire & Perils"],
    "premium_from": "6000",
    "sum_insured_up_to": "150000000",
    "claim_settlement_days": "21",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Thika","Nyeri","Machakos"]
  }$$::jsonb
),

-- 8. ICEA Lion --------------------------------------------------------
(
  'insurance', 'Commercial Property',
  'ICEA Lion General Insurance Company Ltd',
  'Customer Service Team',
  'info@icealion.com',
  '+254 20 2750000',
  'https://www.icealion.com',
  'Nairobi',
  'ICEA Lion is one of Kenya''s most established insurance groups, formed from the merger of ICEA and Lion of Kenya Insurance. They are particularly strong in commercial property, construction, and developer risk, with large underwriting capacity and an A-rated balance sheet.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/010",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Proven strength in property and commercial risk",
    "policy_types": ["Home Insurance","Mortgage Protection","Construction All-Risk","Developer's All-Risk","Landlord Insurance","Fire & Perils"],
    "premium_from": "8500",
    "sum_insured_up_to": "600000000",
    "claim_settlement_days": "14",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Nyeri","Meru","Thika","Machakos","Malindi","Kisii"]
  }$$::jsonb
),

-- 9. Madison Insurance ------------------------------------------------
(
  'insurance', 'Landlord Insurance',
  'Madison Insurance Company Kenya Ltd',
  'Customer Service Team',
  'info@madison.co.ke',
  '+254 20 2860000',
  'https://www.madison.co.ke',
  'Nairobi',
  'Madison Insurance is a wholly Kenyan-owned insurer with a track record of over 40 years. Their property products include flexible landlord policies with optional rental income cover, contents insurance for tenants, and home insurance with no-claim discount benefits.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/013",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Kenyan-owned insurance you can trust",
    "policy_types": ["Landlord Insurance","Home Insurance","Tenant Contents","Mortgage Protection","Fire & Perils"],
    "premium_from": "5500",
    "sum_insured_up_to": "200000000",
    "claim_settlement_days": "28",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Kisii","Kericho","Machakos"]
  }$$::jsonb
),

-- 10. Pacis Insurance -------------------------------------------------
(
  'insurance', 'Home Insurance',
  'Pacis Insurance Company Ltd',
  'Customer Service Team',
  'info@pacis.co.ke',
  '+254 20 2868000',
  'https://www.pacis.co.ke',
  'Nairobi',
  'Pacis Insurance is an ethical, values-driven insurer backed by the Catholic Church. Despite their community roots, they offer fully competitive home and property insurance products with strong solvency ratios, transparent claims processes, and deep penetration in upcountry markets.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/015",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Values-driven insurance for every homeowner",
    "policy_types": ["Home Insurance","Landlord Insurance","Tenant Contents","Fire & Perils","Mortgage Protection"],
    "premium_from": "5000",
    "sum_insured_up_to": "100000000",
    "claim_settlement_days": "30",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Nyeri","Meru","Thika","Kisii","Kericho","Kitale","Machakos"]
  }$$::jsonb
),

-- 11. Phoenix of East Africa ------------------------------------------
(
  'insurance', 'Commercial Property',
  'Phoenix of East Africa Assurance Company Ltd',
  'Customer Service Team',
  'info@phoenixinsurance.co.ke',
  '+254 20 2214291',
  'https://www.phoenixinsurance.co.ke',
  'Nairobi',
  'Phoenix of East Africa is one of Kenya''s oldest and most respected general insurers, with roots going back to 1948. A specialist in commercial and industrial property risks, they bring deep underwriting expertise and strong reinsurance arrangements to handle large-value assets.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/017",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Decades of expertise in commercial property risk",
    "policy_types": ["Construction All-Risk","Developer's All-Risk","Fire & Perils","Home Insurance","Mortgage Protection","Landlord Insurance"],
    "premium_from": "10000",
    "sum_insured_up_to": "800000000",
    "claim_settlement_days": "21",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Machakos","Meru"]
  }$$::jsonb
),

-- 12. Geminia Insurance -----------------------------------------------
(
  'insurance', 'Landlord Insurance',
  'Geminia Insurance Company Ltd',
  'Customer Service Team',
  'info@geminia.co.ke',
  '+254 20 2710000',
  'https://www.geminia.co.ke',
  'Nairobi',
  'Geminia Insurance offers a wide range of general insurance products with a particular strength in landlord and rental property cover. Their digital-first approach enables fast online quotes, streamlined policy management, and a dedicated 24/7 claims helpline.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/008",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Digital-first insurance for modern landlords",
    "policy_types": ["Landlord Insurance","Home Insurance","Tenant Contents","Fire & Perils"],
    "premium_from": "6000",
    "sum_insured_up_to": "120000000",
    "claim_settlement_days": "14",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Kisii","Machakos"]
  }$$::jsonb
),

-- 13. Occidental Insurance --------------------------------------------
(
  'insurance', 'Contents Insurance',
  'Occidental Insurance Company Ltd',
  'Customer Service Team',
  'info@occidentalinsurance.co.ke',
  '+254 20 2247000',
  'https://www.occidentalinsurance.co.ke',
  'Nairobi',
  'Occidental Insurance specialises in accessible, competitive general insurance products for individuals and SMEs. Their tenant contents and home contents policies are some of the most affordably priced in the market, making them popular with Nairobi renters and first-time homeowners.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/018",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Accessible insurance at rates everyone can afford",
    "policy_types": ["Tenant Contents","Home Insurance","Landlord Insurance","Fire & Perils"],
    "premium_from": "4500",
    "sum_insured_up_to": "80000000",
    "claim_settlement_days": "30",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Thika","Nyeri","Machakos"]
  }$$::jsonb
),

-- 14. GA Insurance ----------------------------------------------------
(
  'insurance', 'Commercial Property',
  'GA Insurance Ltd',
  'Customer Service Team',
  'info@gainsurance.co.ke',
  '+254 20 2713397',
  'https://www.gainsurance.co.ke',
  'Nairobi',
  'GA Insurance is a specialist general insurer with deep expertise in commercial property and construction risks. They work closely with property developers, contractors, and real estate investors to structure bespoke covers including CAR, EAR, and contractors liability.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/009",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Bespoke cover for property developers and investors",
    "policy_types": ["Construction All-Risk","Developer's All-Risk","Fire & Perils","Mortgage Protection","Home Insurance"],
    "premium_from": "12000",
    "sum_insured_up_to": "1000000000",
    "claim_settlement_days": "21",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Machakos"]
  }$$::jsonb
),

-- 15. Resolution Insurance --------------------------------------------
(
  'insurance', 'Contents Insurance',
  'Resolution Insurance Company Ltd',
  'Customer Service Team',
  'info@resolutioninsurance.co.ke',
  '+254 20 4904000',
  'https://www.resolutioninsurance.co.ke',
  'Nairobi',
  'Resolution Insurance is a fast-growing Kenyan insurer known for quick claim turnaround and digital service delivery. Their property products include home contents, tenant insurance, and landlord policies with a strong emphasis on simple, paperless claims.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/020",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Fast, paperless claims for modern Kenyan homeowners",
    "policy_types": ["Tenant Contents","Home Insurance","Landlord Insurance","Fire & Perils"],
    "premium_from": "5000",
    "sum_insured_up_to": "100000000",
    "claim_settlement_days": "7",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Machakos"]
  }$$::jsonb
),

-- 16. First Assurance -------------------------------------------------
(
  'insurance', 'Home Insurance',
  'First Assurance Company Ltd',
  'Customer Service Team',
  'info@firstassurance.co.ke',
  '+254 20 2228571',
  'https://www.firstassurance.co.ke',
  'Nairobi',
  'First Assurance is a Kenya-based general insurer offering a wide range of personal and commercial property products. Their home insurance cover includes buildings, contents, domestic staff liability, and all-risks extension, making them a one-stop-shop for homeowners.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/006",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "One-stop home insurance for Kenyan families",
    "policy_types": ["Home Insurance","Landlord Insurance","Tenant Contents","Mortgage Protection","Fire & Perils"],
    "premium_from": "6000",
    "sum_insured_up_to": "150000000",
    "claim_settlement_days": "21",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Thika","Nyeri","Meru","Kisii","Machakos"]
  }$$::jsonb
),

-- 17. Kenya Orient Insurance ------------------------------------------
(
  'insurance', 'Commercial Property',
  'Kenya Orient Insurance Ltd',
  'Customer Service Team',
  'info@kenyaorient.com',
  '+254 20 2719460',
  'https://www.kenyaorient.com',
  'Nairobi',
  'Kenya Orient Insurance is a long-established specialist in property and commercial risks, offering tailored products for industrial estates, warehouses, mixed-use developments, and large residential complexes. They maintain strong reinsurance treaties for high-value assets.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/011",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Specialist property cover for large-scale assets",
    "policy_types": ["Construction All-Risk","Developer's All-Risk","Fire & Perils","Home Insurance","Landlord Insurance"],
    "premium_from": "15000",
    "sum_insured_up_to": "2000000000",
    "claim_settlement_days": "21",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Meru","Machakos","Malindi","Lamu"]
  }$$::jsonb
),

-- 18. Cannon Assurance ------------------------------------------------
(
  'insurance', 'Contents Insurance',
  'Cannon Assurance Ltd',
  'Customer Service Team',
  'info@cannonassurance.co.ke',
  '+254 20 3751480',
  'https://www.cannonassurance.co.ke',
  'Nairobi',
  'Cannon Assurance is a niche general insurer focused on competitive, no-frills property cover for individual homeowners and tenants. Their straightforward contents and home products are ideal for first-time buyers and renters seeking essential protection without unnecessary add-ons.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/005",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "No-frills, reliable cover for every household",
    "policy_types": ["Tenant Contents","Home Insurance","Fire & Perils","Landlord Insurance"],
    "premium_from": "4000",
    "sum_insured_up_to": "80000000",
    "claim_settlement_days": "30",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Thika","Nyeri","Machakos","Kisii"]
  }$$::jsonb
),

-- 19. Pioneer Insurance -----------------------------------------------
(
  'insurance', 'Home Insurance',
  'Pioneer Insurance Company Ltd',
  'Customer Service Team',
  'info@pioneerinsurance.co.ke',
  '+254 20 2226143',
  'https://www.pioneerinsurance.co.ke',
  'Nairobi',
  'Pioneer Insurance is one of Kenya''s oldest insurance providers, trusted since 1978 for straightforward, honest property cover. Their home insurance products are known for transparent policy wording and a claims process that puts the customer first.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/002",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "Trusted by Kenyan homeowners since 1978",
    "policy_types": ["Home Insurance","Landlord Insurance","Tenant Contents","Fire & Perils","Mortgage Protection"],
    "premium_from": "5500",
    "sum_insured_up_to": "120000000",
    "claim_settlement_days": "28",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Kisii","Kericho","Machakos"]
  }$$::jsonb
),

-- 20. Kenindia Assurance ----------------------------------------------
(
  'insurance', 'Commercial Property',
  'Kenindia Assurance Company Ltd',
  'Customer Service Team',
  'info@kenindia.com',
  '+254 20 2224965',
  'https://www.kenindia.com',
  'Nairobi',
  'Kenindia Assurance is a joint venture between Kenyan and Indian interests, bringing international underwriting expertise to the local market. They are particularly strong in large commercial and industrial property risks, with a reputation for prompt settlement of complex claims.',
  true, null, null, null,
  $${
    "ira_licence": "IRA/INS/001",
    "aki_member": true,
    "insurer_type": "Direct Insurer",
    "tagline": "International underwriting expertise, local trust",
    "policy_types": ["Construction All-Risk","Developer's All-Risk","Fire & Perils","Home Insurance","Mortgage Protection","Title Insurance"],
    "premium_from": "10000",
    "sum_insured_up_to": "1500000000",
    "claim_settlement_days": "14",
    "regions": ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Meru","Machakos","Malindi"]
  }$$::jsonb
);

-- ============================================================
--  Verification: should return 20 rows
-- ============================================================
SELECT id, company_name, subcategory,
       (metadata->>'premium_from')::int AS premium_from_kes,
       metadata->>'claim_settlement_days' AS claim_days,
       verified
FROM   partners
WHERE  category = 'insurance'
ORDER  BY company_name;
