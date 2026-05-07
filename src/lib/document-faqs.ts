export type FAQ = { q: string; a: string };

export const documentFaqs: Record<string, FAQ[]> = {
  "lease": [
    {
      q: "What must a residential lease agreement include in Kenya?",
      a: "A valid Kenyan lease agreement should state the full names and ID numbers of both parties, the property address, the monthly rent and due date, the security deposit amount, the lease start and end dates, permitted use of the property, notice period for termination, and each party's maintenance responsibilities.",
    },
    {
      q: "Does a lease agreement need to be stamped in Kenya?",
      a: "Stamping is not strictly required for a lease to be valid, but it significantly strengthens its legal standing. For properties with a monthly rent above KES 10,000, it is strongly advisable to have the agreement stamped by the Kenya Revenue Authority via iTax. An unstamped agreement is still admissible in the Business Premises Tribunal but may carry less weight.",
    },
    {
      q: "How much notice is required to end a lease in Kenya?",
      a: "For periodic (month-to-month) tenancies, either party must give at least one full rental period's notice — typically one calendar month. Fixed-term leases end on the agreed date, but notice of non-renewal should be given before that date as specified in the agreement. Longer notice periods can be agreed contractually.",
    },
    {
      q: "Can a landlord enter the property without notice?",
      a: "No. A landlord must give reasonable advance notice — generally 24 to 48 hours — before entering a leased property for inspections, repairs, or viewings. Entry without notice, except in genuine emergencies, is a breach of the tenant's right to quiet enjoyment and can expose the landlord to legal liability.",
    },
  ],

  "tenancy-agreement": [
    {
      q: "What is the difference between a tenancy agreement and a lease agreement in Kenya?",
      a: "In Kenyan usage the terms are often interchangeable. Technically, a 'lease' typically refers to a fixed-term arrangement of one year or more, while 'tenancy' can describe shorter or periodic arrangements. Both are legally binding contracts. This template is drafted specifically around Kenyan statutes, payment norms (M-PESA), and tribunal jurisdiction — making it more suitable for most Kenyan landlord-tenant relationships than a generic lease template.",
    },
    {
      q: "What notice period must a Kenyan landlord give before ending a tenancy?",
      a: "For a monthly tenancy, the landlord must give at least one calendar month's notice. For a fixed-term tenancy, the agreement expires on the stated end date; however, the landlord should confirm non-renewal in writing before that date. Business premises under the Landlord and Tenant Act (Cap 301) require six months' notice for non-renewal.",
    },
    {
      q: "Can a landlord increase rent during an active tenancy?",
      a: "A landlord cannot increase rent mid-tenancy unless the agreement expressly allows it and the correct notice period is given. For properties under the Rent Restriction Act (lower-value residential), increases are controlled by the Rent Restriction Tribunal. For market-rate properties, increases can only take effect at renewal or as provided in the lease clause.",
    },
    {
      q: "Which tribunal handles residential tenancy disputes in Kenya?",
      a: "The Rent Restriction Tribunal has jurisdiction over residential properties that fall under the Rent Restriction Act (generally lower-value properties). The Business Premises Tribunal handles disputes involving shops, hotels, and catering establishments. Disputes outside these categories may be referred to the magistrate's court. Many cases are also handled through negotiation or the Landlords and Tenants Association.",
    },
  ],

  "takeover": [
    {
      q: "What are takeover minutes and why are they important?",
      a: "Takeover minutes (also called a property condition report or check-in report) are a signed record of the property's condition on the day the tenant moves in. They note the state of every room, meter readings, and the keys handed over. This document is the primary evidence used to resolve deposit disputes — without it, neither party can prove what condition the property was in at the start of the tenancy.",
    },
    {
      q: "Who should be present when completing the takeover minutes?",
      a: "Both the landlord (or the landlord's agent) and the tenant should walk through the property together and complete the takeover minutes jointly. If either party cannot attend, a written representative can stand in, but this should be documented. Both parties must sign the completed form on the same day as handover.",
    },
    {
      q: "What happens if a tenant refuses to sign the takeover minutes?",
      a: "A tenant who refuses to sign should note their specific objections in writing rather than refusing outright. The landlord should serve a copy of the completed minutes to the tenant and retain proof of delivery. An unsigned document still has evidential value if the landlord can prove it was prepared on the handover date, especially if supported by photographs.",
    },
    {
      q: "How long should takeover minutes be kept?",
      a: "Takeover minutes should be retained for the full duration of the tenancy and for at least two years after the tenancy ends. In the event of a deposit dispute, they are essential evidence. Store them alongside the tenancy agreement and deposit receipt — ideally as a signed original and a scanned digital copy.",
    },
  ],

  "return": [
    {
      q: "What is the difference between takeover and return minutes?",
      a: "Takeover minutes document the property's condition at the start of the tenancy; return minutes document it at the end. The two are always read together — the return minutes identify any deterioration from the original condition. Damage listed in the return minutes that was not present in the takeover minutes (beyond fair wear and tear) is what justifies deposit deductions.",
    },
    {
      q: "How quickly must a landlord refund the deposit after move-out?",
      a: "Kenyan law does not specify a precise timeframe, but common practice and reasonableness requires the deposit to be returned — or a written statement of deductions provided — within 14 to 30 days of the tenancy ending. Unreasonable delay in returning a deposit can support a claim against the landlord in the relevant tribunal.",
    },
    {
      q: "What deductions can a landlord legitimately make from the deposit?",
      a: "A landlord can deduct for damage beyond normal wear and tear, unpaid rent, unpaid utilities for which the tenant was responsible, professional cleaning if the property was returned in a significantly dirtier state than received, and replacement of lost keys or access devices. Each deduction must be itemised in writing and supported by quotes or receipts.",
    },
    {
      q: "What counts as normal wear and tear in Kenya?",
      a: "Normal wear and tear refers to the gradual deterioration that occurs through ordinary, reasonable use — faded or slightly marked paintwork, minor scuffs on skirting boards, small carpet indentations from furniture, and slight fading of fabrics. Holes in walls, broken fixtures, pet damage, burn marks, mould caused by poor ventilation habits, and missing items are not wear and tear and can be charged to the tenant.",
    },
  ],

  "house-rules": [
    {
      q: "Are house rules legally binding on tenants in Kenya?",
      a: "Yes — provided they are incorporated into or attached to the tenancy agreement, or the tenant has separately acknowledged them in writing. House rules that are handed to a tenant after signing, without agreement, are harder to enforce. The best practice is to attach the house rules as an appendix to the lease and have the tenant sign both documents on the same day.",
    },
    {
      q: "Can a landlord introduce new house rules during a tenancy?",
      a: "A landlord cannot unilaterally impose new house rules on an existing tenant without consent. Any change to the terms under which the tenant entered the property requires mutual agreement. The landlord can propose new rules and ask the tenant to agree in writing, but the tenant is not obliged to accept mid-tenancy.",
    },
    {
      q: "What happens if a tenant repeatedly breaks house rules?",
      a: "A documented pattern of rule breaches constitutes a breach of the tenancy agreement. The landlord should issue a formal written notice to remedy the breach, specifying the rule broken and allowing a reasonable time to comply. If the breach continues, the landlord may issue a notice to vacate and, if necessary, apply to the relevant tribunal for an order for possession.",
    },
    {
      q: "Do house rules need to cover fire safety?",
      a: "In Kenya, landlords of multi-unit residential buildings have obligations under the Public Health Act and local building regulations regarding fire safety. House rules should reinforce these: no blocking fire exits, no storing flammable materials in common areas, correct disposal of cooking waste, and a clear procedure for reporting maintenance issues. Including fire safety provisions in house rules is both a legal and practical necessity.",
    },
  ],

  "subletting-agreement": [
    {
      q: "Can a tenant in Kenya sublet without the landlord's permission?",
      a: "No. Subletting without the landlord's prior written consent is a breach of the tenancy agreement in virtually all standard Kenyan leases, and can be grounds for eviction. Before using a subletting agreement, the original tenant must obtain the landlord's written approval. Some leases prohibit subletting entirely — check the original agreement carefully.",
    },
    {
      q: "Is the original tenant still liable if the subtenant does not pay rent?",
      a: "Yes. The original tenant remains fully liable to the landlord for rent and for the condition of the property regardless of the subletting arrangement. If the subtenant defaults, the landlord will pursue the original tenant. The original tenant's only recourse is against the subtenant under the subletting agreement.",
    },
    {
      q: "Can a sublease last longer than the original lease?",
      a: "No. A sublease cannot extend beyond the end date of the head (original) lease, and it cannot grant the subtenant more rights than the original tenant holds. If the head lease is terminated early — for any reason — the sublease automatically terminates as well. This is an important risk for subtenants to understand before signing.",
    },
    {
      q: "Does a subletting agreement need to be in writing?",
      a: "While an oral subletting agreement is technically enforceable, it is extremely difficult to prove and enforce in practice. A written subletting agreement signed by both parties, referencing the landlord's written consent, is essential to protect both the original tenant and the subtenant from disputes over rent, notice periods, and the return of any sub-deposit paid.",
    },
  ],

  "commercial-lease": [
    {
      q: "What law governs commercial leases in Kenya?",
      a: "The primary legislation is the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap 301), which applies to shops, hotels, restaurants, and similar business premises. It gives commercial tenants significant protections including controlled rent reviews and the right to a new tenancy at expiry. Industrial and office properties above certain thresholds may fall outside Cap 301 and be governed purely by the terms of the lease and common law.",
    },
    {
      q: "What is the Business Premises Tribunal and what does it do?",
      a: "The Business Premises Tribunal is a quasi-judicial body established under Cap 301 to resolve disputes between commercial landlords and tenants. It handles disputes over rent increases, refusal to grant a new tenancy, compensation on eviction, and other matters covered by the Act. It is faster and less expensive than the courts, and both parties are commonly represented by advocates.",
    },
    {
      q: "Can a commercial tenant be evicted without a court order in Kenya?",
      a: "No. Even for breach of lease, a commercial landlord cannot forcibly evict a tenant without obtaining a possession order from the Business Premises Tribunal or the court. Changing locks, removing doors, or cutting utilities to force a tenant out is illegal and can expose the landlord to criminal liability and a damages claim. The correct process is: serve a formal notice, apply to the Tribunal if unresolved, obtain an order, then enforce.",
    },
    {
      q: "Can a commercial landlord refuse to renew a lease at expiry?",
      a: "Under Cap 301, a landlord can refuse to renew for specific grounds — such as wanting the property for their own use, redevelopment, or persistent breach by the tenant. If the refusal is not on a valid statutory ground, the tenant may be entitled to compensation for disturbance. Landlords should give at least six months' written notice of non-renewal before the lease expires.",
    },
  ],

  "eviction-notice": [
    {
      q: "Can a landlord evict a tenant without going to court in Kenya?",
      a: "No. Regardless of the reason, a landlord must follow the correct legal process to evict a tenant in Kenya. This means serving a valid written notice, waiting for the notice period to expire, and — if the tenant has not vacated — applying to the appropriate tribunal or court for a possession order. Self-help eviction (changing locks, removing doors, cutting utilities) is illegal and can result in criminal charges against the landlord.",
    },
    {
      q: "What are the valid legal grounds for eviction in Kenya?",
      a: "Common valid grounds for eviction include: non-payment of rent, persistent or serious breach of the tenancy agreement, the landlord requiring the property for their own or a family member's occupation, planned demolition or major redevelopment, and expiry of a fixed-term tenancy with no right of renewal. The required notice period and procedure vary depending on the ground.",
    },
    {
      q: "How long does the eviction process typically take in Kenya?",
      a: "After serving the notice and waiting for the notice period (typically one month for most residential cases), if the tenant does not vacate the landlord must file for an eviction order. The Business Premises Tribunal or magistrate's court process can take between two and six months, depending on caseload and whether the tenant contests the eviction. Uncontested evictions in the tribunal are typically faster.",
    },
    {
      q: "What happens if a tenant ignores an eviction notice?",
      a: "If a tenant does not vacate by the deadline in the eviction notice, the landlord's next step is to file an application with the relevant tribunal or court. The landlord should not attempt physical eviction. Once a possession order is granted by the tribunal or court, it can be enforced through the court bailiff process if the tenant still refuses to leave.",
    },
  ],

  "rent-increase-notice": [
    {
      q: "How much notice must a Kenyan landlord give before increasing rent?",
      a: "For most residential properties, a landlord must give at least one full rental period's notice — typically one calendar month — before a rent increase takes effect. The increase should come into effect at the start of a new rental period, not mid-period. For business premises under Cap 301, rent increase disputes are referred to the Business Premises Tribunal.",
    },
    {
      q: "Is there a limit on how much rent can be increased in Kenya?",
      a: "For standard market-rate properties, there is no statutory cap on the percentage increase — any amount can be proposed. However, for properties under the Rent Restriction Act (generally lower-value residential properties), increases are controlled by the Rent Restriction Tribunal. Tenants can challenge any increase they consider unreasonable through the relevant tribunal.",
    },
    {
      q: "What can a tenant do if they disagree with a rent increase?",
      a: "A tenant who believes a proposed rent increase is unreasonable should first try to negotiate with the landlord in writing. If the property falls under the Rent Restriction Act, the tenant can apply to the Rent Restriction Tribunal to have the increase assessed. For market-rate properties, the tenant's practical options are to negotiate, accept, or give notice to vacate — the landlord is not obliged to accept a lower counter-offer.",
    },
    {
      q: "Does a rent increase notice need to be in writing?",
      a: "Yes. A rent increase must always be communicated in writing to be enforceable and to create a clear record. A written notice protects both the landlord (evidence that notice was properly given) and the tenant (ability to challenge the amount or the notice period). Verbal rent increases are extremely difficult to enforce and should never be relied upon by either party.",
    },
  ],

  "move-in-checklist": [
    {
      q: "Why is a move-in checklist important for a tenant?",
      a: "The move-in checklist creates a dated, agreed record of the property's condition before you take occupation. Without it, a landlord could attempt to charge you at move-out for damage that existed before you moved in. A signed checklist — especially with supporting photographs — is your primary defence against unfair deposit deductions.",
    },
    {
      q: "What happens if damage is discovered after the move-in checklist is signed?",
      a: "If you notice additional damage within the first 24 to 48 hours of moving in, contact the landlord in writing immediately and request an amendment to the checklist. Most landlords will agree to add newly discovered defects. The longer you wait, the harder it becomes to prove the damage was pre-existing. Always put requests for amendments in writing.",
    },
    {
      q: "Should I take photos when completing the move-in checklist?",
      a: "Yes — photos are essential. Photograph every room, every item on the checklist, and any existing damage in close-up. Make sure the photos are dated (most phone cameras add metadata automatically) and store them somewhere safe — cloud storage is ideal. Photos that are referenced in or attached to the signed checklist carry significant evidential weight.",
    },
    {
      q: "Who keeps the signed move-in checklist?",
      a: "Both parties should keep a copy. The landlord retains the original (or one signed copy) and the tenant receives a second signed copy. Keep your copy for the entire duration of the tenancy and for at least two years afterwards. Do not discard it when you move out — you will need it if any deposit dispute arises.",
    },
  ],

  "move-out-checklist": [
    {
      q: "When should the move-out checklist be completed?",
      a: "The move-out checklist should be completed on the final day of the tenancy, when the tenant hands back the keys. Both the landlord (or agent) and the tenant should walk through the property together with the original move-in checklist as a reference. Do not complete it days in advance — the tenant's final cleaning and any last-minute repairs should already be done before the inspection.",
    },
    {
      q: "What counts as normal wear and tear in Kenya?",
      a: "Normal wear and tear is the reasonable deterioration expected from ordinary everyday use: slightly faded paintwork, small scuffs on skirting boards, minor carpet thinning from foot traffic, and light marks from furniture placement. What is not wear and tear — and can be deducted from the deposit — includes holes in walls, broken fixtures, pet damage, burn marks, significant staining, and mould caused by the tenant's failure to ventilate the property.",
    },
    {
      q: "How soon must a landlord return the security deposit after move-out?",
      a: "Kenyan law does not prescribe an exact deadline, but the widely accepted reasonable standard is 14 to 30 days from the end of the tenancy. If deductions are made, the landlord must provide a written itemised statement of deductions with supporting evidence (quotes or receipts) within the same period. Unjustified delays can be challenged at the relevant tribunal.",
    },
    {
      q: "Can a landlord charge a tenant for professional cleaning?",
      a: "A landlord can charge for professional cleaning only if the property was returned in a materially dirtier or more damaged state than when it was received (as evidenced by the move-in checklist). If the tenant returns the property in the same level of cleanliness as it was at move-in, a cleaning charge is not justified. A clause in the lease requiring professional cleaning regardless of condition is increasingly seen as unfair.",
    },
  ],

  "property-handover-form": [
    {
      q: "What is the difference between a property handover form and an inventory checklist?",
      a: "The handover form is a brief summary document confirming the transfer of keys and responsibility on a specific date — it records who received what, when, and in what overall condition. The inventory checklist is a detailed room-by-room and item-by-item record of everything in the property. The two documents complement each other: the handover form provides the official transfer record, while the inventory provides the supporting detail.",
    },
    {
      q: "When should a property handover form be completed?",
      a: "A handover form should be completed twice: once at move-in (when the tenant takes possession) and once at move-out (when the keys are returned). It should be signed by both parties on the actual day of handover — not before or after. This ensures the date, meter readings, and keys listed are accurate.",
    },
    {
      q: "What meter readings should be recorded on the handover form?",
      a: "Record the electricity meter reading (and the meter number) and the water meter reading at the exact time of handover. Both parties should photograph the meters. These readings establish each party's liability for utility bills up to the point of handover and prevent disputes about who is responsible for consumption during the changeover period.",
    },
    {
      q: "Does the property handover form need a witness?",
      a: "While not legally required, having a neutral witness sign the handover form adds a useful layer of protection in the event of a dispute. The witness confirms that the handover took place as described and that both parties signed freely. For high-value properties or complex handovers, using an independent witness — such as a property manager or estate agent — is best practice.",
    },
  ],

  "inventory-checklist": [
    {
      q: "What items should be included in a rental property inventory?",
      a: "A complete inventory should list every item provided by the landlord: furniture (sofa, beds, wardrobes, tables, chairs), kitchen appliances (fridge, cooker, microwave, kettle), white goods (washing machine), fixtures (curtain rails, towel rails, mirrors), soft furnishings (curtains, rugs), and smaller items (cutlery, crockery, pots and pans if provided). Built-in items and the condition of walls, floors, and ceilings are also recorded.",
    },
    {
      q: "What happens if an inventory item is missing or damaged at move-out?",
      a: "Any item that is missing or returned in worse condition than recorded at move-in (beyond fair wear and tear) can be deducted from the security deposit. The landlord must provide a replacement cost or repair quote to justify the deduction. For valuable items, keeping purchase receipts makes calculating a fair depreciated value easier if the matter reaches a tribunal.",
    },
    {
      q: "Who is responsible for maintaining appliances during a tenancy?",
      a: "In Kenya, the landlord is generally responsible for ensuring that appliances provided with the property are in working order at the start of the tenancy and for repairing mechanical failures caused by fair use. The tenant is responsible for day-to-day care, reporting faults promptly, and not misusing appliances. Damage caused by the tenant's negligence or misuse is the tenant's liability.",
    },
    {
      q: "Should the inventory be updated during the tenancy?",
      a: "The inventory should be updated in writing whenever items are added, removed, or replaced by the landlord — for example, if a broken appliance is replaced with a newer model, or if the landlord adds garden furniture. Any changes should be documented, signed by both parties, and attached to the original inventory. Mid-tenancy updates prevent disputes about what was present at the start.",
    },
  ],

  "preparation": [
    {
      q: "How long does it typically take to prepare a property for renting in Kenya?",
      a: "A thorough preparation — deep clean, minor repairs, touch-up painting, and safety checks — typically takes three to seven days for a standard apartment. For properties that have been vacant for longer or need more substantial work, allow two to three weeks. Starting the preparation process before the previous tenant moves out (where possible) reduces vacancy periods.",
    },
    {
      q: "Which repairs must a Kenyan landlord complete before a new tenancy?",
      a: "All repairs that affect habitability or safety must be completed before a tenant moves in: functioning water supply and plumbing, working electrical system, secure window and door locks, a sound roof and no active water ingress, and working sanitation. Cosmetic issues (minor paint chips, small scratches) can be noted in the inventory but do not need to be repaired before occupation.",
    },
    {
      q: "Does a furnished property need to meet any safety standards in Kenya?",
      a: "Under Kenyan law and good practice, all electrical appliances must be in safe working order, gas installations (if any) must be properly maintained, and furniture should be structurally sound. Smoke alarms are strongly advisable and increasingly required under local authority requirements. Properties in formal developments must also comply with any estate management regulations.",
    },
    {
      q: "Does a well-prepared property command a higher rent in Kenya?",
      a: "Yes, significantly. A clean, freshly painted, well-maintained property will typically achieve 10 to 20% more in monthly rent than a comparable but poorly presented property in the same location. It also attracts more reliable tenants, rents faster, and reduces the risk of disputes. The cost of preparation is almost always recovered within the first one to two months of tenancy.",
    },
  ],

  "photo-instructions": [
    {
      q: "Do I need a professional photographer to list my property in Kenya?",
      a: "No — a modern smartphone (iPhone or mid-range Android from 2020 onwards) produces photos that are excellent for property listings. What matters most is preparation and technique: a clean, decluttered property shot on a bright day in landscape mode will outperform an empty, dark property shot by a professional photographer.",
    },
    {
      q: "How many photos should I include in my Rentnet listing?",
      a: "Aim for at least 10 to 15 photographs for a standard apartment, and 15 to 25 for a house. Include the exterior, all main rooms (at least two angles for larger rooms), kitchen, bathroom(s), any outdoor spaces, and the parking area or compound. Listings with 15 or more high-quality photos typically receive two to three times more enquiries than those with fewer than five.",
    },
    {
      q: "What is the best time of day to photograph a property in Kenya?",
      a: "Shoot between 9 a.m. and 11 a.m. or between 3 p.m. and 5 p.m. when natural light is bright but not directly overhead or creating long shadows. East-facing rooms photograph best in the morning; west-facing rooms in the afternoon. Avoid midday on bright days as harsh light creates heavy shadows, and avoid overcast days for exterior shots if possible.",
    },
    {
      q: "Should I use virtual tours or video for my Rentnet listing?",
      a: "A short walkthrough video (60 to 90 seconds filmed on a smartphone) substantially increases enquiry rates and reduces wasted viewings, as tenants can screen properties remotely before requesting an in-person visit. This is particularly valuable in Nairobi's competitive market and for landlords managing properties in locations far from their own residence.",
    },
  ],
};
