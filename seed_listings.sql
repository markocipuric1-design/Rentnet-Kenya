-- ================================================================
-- SEED: 15 fictional users + 30 property listings
-- Run in Supabase SQL Editor with the postgres role.
--
-- Requires pgcrypto (enabled by default on Supabase).
-- If you see a duplicate-key error on auth.users, a trigger may
-- already exist that auto-creates profiles — comment out the
-- profiles INSERT and adjust as needed.
-- ================================================================

DO $$
DECLARE
  -- Shared password hash for all seed accounts (dev only)
  v_pw  text := crypt('Seed@2024!', gen_salt('bf'));

  -- Individual user IDs
  u1  uuid := gen_random_uuid();  -- Brian Otieno / Nairobi
  u2  uuid := gen_random_uuid();  -- Mercy Wanjiku / Nakuru
  u3  uuid := gen_random_uuid();  -- Kevin Kiptoo / Eldoret
  u4  uuid := gen_random_uuid();  -- Aisha Abdalla / Mombasa
  u5  uuid := gen_random_uuid();  -- Samuel Mwangi / Thika
  u6  uuid := gen_random_uuid();  -- Linet Chebet / Kericho
  u7  uuid := gen_random_uuid();  -- George Oduor / Kisumu
  u8  uuid := gen_random_uuid();  -- Diana Njeri / Ruaka

  -- Agency user IDs
  a1  uuid := gen_random_uuid();  -- PrimeNest Realtors / Nairobi
  a2  uuid := gen_random_uuid();  -- Coastal Haven Properties / Mombasa
  a3  uuid := gen_random_uuid();  -- Rift Valley Real Estate / Nakuru
  a4  uuid := gen_random_uuid();  -- UrbanKeys Property Management / Nairobi
  a5  uuid := gen_random_uuid();  -- Lakeview Homes Agency / Kisumu
  a6  uuid := gen_random_uuid();  -- Mount Kenya Realty / Nyeri
  a7  uuid := gen_random_uuid();  -- Metroline Estates / Nairobi

  -- Listing IDs
  l01 uuid := gen_random_uuid(); l02 uuid := gen_random_uuid();
  l03 uuid := gen_random_uuid(); l04 uuid := gen_random_uuid();
  l05 uuid := gen_random_uuid(); l06 uuid := gen_random_uuid();
  l07 uuid := gen_random_uuid(); l08 uuid := gen_random_uuid();
  l09 uuid := gen_random_uuid(); l10 uuid := gen_random_uuid();
  l11 uuid := gen_random_uuid(); l12 uuid := gen_random_uuid();
  l13 uuid := gen_random_uuid(); l14 uuid := gen_random_uuid();
  l15 uuid := gen_random_uuid(); l16 uuid := gen_random_uuid();
  l17 uuid := gen_random_uuid(); l18 uuid := gen_random_uuid();
  l19 uuid := gen_random_uuid(); l20 uuid := gen_random_uuid();
  l21 uuid := gen_random_uuid(); l22 uuid := gen_random_uuid();
  l23 uuid := gen_random_uuid(); l24 uuid := gen_random_uuid();
  l25 uuid := gen_random_uuid(); l26 uuid := gen_random_uuid();
  l27 uuid := gen_random_uuid(); l28 uuid := gen_random_uuid();
  l29 uuid := gen_random_uuid(); l30 uuid := gen_random_uuid();

BEGIN

  -- ════════════════════════════════════════════════════════════
  -- 1. auth.users  (minimal records — satisfies FK on profiles)
  -- ════════════════════════════════════════════════════════════
  INSERT INTO auth.users (
    id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user, is_anonymous
  ) VALUES
    -- Individuals
    (u1,'authenticated','authenticated','brian.otieno@seed.local',   v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (u2,'authenticated','authenticated','mercy.wanjiku@seed.local',  v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (u3,'authenticated','authenticated','kevin.kiptoo@seed.local',   v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (u4,'authenticated','authenticated','aisha.abdalla@seed.local',  v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (u5,'authenticated','authenticated','samuel.mwangi@seed.local',  v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (u6,'authenticated','authenticated','linet.chebet@seed.local',   v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (u7,'authenticated','authenticated','george.oduor@seed.local',   v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (u8,'authenticated','authenticated','diana.njeri@seed.local',    v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    -- Agencies
    (a1,'authenticated','authenticated','info@primenest.seed.local',        v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (a2,'authenticated','authenticated','info@coastalhaven.seed.local',     v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (a3,'authenticated','authenticated','info@riftvalleyrealty.seed.local', v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (a4,'authenticated','authenticated','info@urbankeys.seed.local',        v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (a5,'authenticated','authenticated','info@lakeviewhomes.seed.local',    v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (a6,'authenticated','authenticated','info@mountkenyarealty.seed.local', v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false),
    (a7,'authenticated','authenticated','info@metrolineestates.seed.local', v_pw,now(),now(),now(),'{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,false,false,false)
  ;

  -- ════════════════════════════════════════════════════════════
  -- 2. public.profiles
  -- ════════════════════════════════════════════════════════════
  INSERT INTO public.profiles (id, full_name, email, phone, account_type, profile_status, slug, created_at)
  VALUES
    -- Individuals (fizicna_oseba)
    (u1,'Brian Otieno',  'brian.otieno@seed.local',  '+254711001001','fizicna_oseba','active','brian-otieno', now()),
    (u2,'Mercy Wanjiku', 'mercy.wanjiku@seed.local', '+254722002002','fizicna_oseba','active','mercy-wanjiku',now()),
    (u3,'Kevin Kiptoo',  'kevin.kiptoo@seed.local',  '+254733003003','fizicna_oseba','active','kevin-kiptoo', now()),
    (u4,'Aisha Abdalla', 'aisha.abdalla@seed.local', '+254744004004','fizicna_oseba','active','aisha-abdalla',now()),
    (u5,'Samuel Mwangi', 'samuel.mwangi@seed.local', '+254755005005','fizicna_oseba','active','samuel-mwangi',now()),
    (u6,'Linet Chebet',  'linet.chebet@seed.local',  '+254766006006','fizicna_oseba','active','linet-chebet', now()),
    (u7,'George Oduor',  'george.oduor@seed.local',  '+254777007007','fizicna_oseba','active','george-oduor', now()),
    (u8,'Diana Njeri',   'diana.njeri@seed.local',   '+254788008008','fizicna_oseba','active','diana-njeri',  now()),
    -- Agencies (agencija)
    (a1,'PrimeNest Realtors',            'info@primenest.seed.local',        '+254700101101','agencija','active','primenest-realtors',           now()),
    (a2,'Coastal Haven Properties',      'info@coastalhaven.seed.local',     '+254700202202','agencija','active','coastal-haven-properties',      now()),
    (a3,'Rift Valley Real Estate',       'info@riftvalleyrealty.seed.local', '+254700303303','agencija','active','rift-valley-real-estate',       now()),
    (a4,'UrbanKeys Property Management', 'info@urbankeys.seed.local',        '+254700404404','agencija','active','urbankeys-property-management', now()),
    (a5,'Lakeview Homes Agency',         'info@lakeviewhomes.seed.local',    '+254700505505','agencija','active','lakeview-homes-agency',         now()),
    (a6,'Mount Kenya Realty',            'info@mountkenyarealty.seed.local', '+254700606606','agencija','active','mount-kenya-realty',            now()),
    (a7,'Metroline Estates',             'info@metrolineestates.seed.local', '+254700707707','agencija','active','metroline-estates',             now())
  ;

  -- ════════════════════════════════════════════════════════════
  -- 3. public.listings  (30 listings — 2 per user)
  -- ════════════════════════════════════════════════════════════
  INSERT INTO public.listings (
    id, user_id,
    title, description, type, category, subcategory,
    price, bedrooms, bathrooms, area, rooms,
    city, municipality, region, country,
    condition, year_built, floor_number,
    amenities, utilities,
    status, slug, created_at, updated_at
  )
  VALUES

    -- ── Brian Otieno / Nairobi ─────────────────────────────────────────────
    (l01, u1,
     '3-Bedroom Apartment for Rent in Westlands',
     'Spacious 3-bedroom apartment on the 4th floor of a well-secured building in Westlands. '
     'Features a modern kitchen, en-suite master bedroom, and a private balcony overlooking the '
     'city skyline. 24-hour security with CCTV and controlled access. Close to Sarit Centre and '
     'major supermarkets.',
     'For Rent','Apartments','3-bedroom apartment',
     75000,3,2,110,3,
     'Nairobi','Westlands','Nairobi','Kenya',
     'Excellent condition',2019,'4th floor',
     ARRAY['Balcony / Terrace / Patio','Parking bay','Security alarm','Fibre internet','Elevator / Lift','CCTV cameras'],
     ARRAY['KPLC Electricity','County water supply','Fibre internet','Backup generator'],
     'active','3-bedroom-apartment-westlands-nairobi-for-rent',
     now()-interval'3 days',now()-interval'3 days'),

    (l02, u1,
     'Cosy Bedsitter in Kilimani — All-Inclusive',
     'Modern bedsitter on the 2nd floor of a gated apartment complex in Kilimani. Fully tiled, '
     'fitted wardrobes, and a DSQ bathroom. Water and electricity included in rent. Walking '
     'distance from Yaya Centre and major bus routes. Ideal for a working professional.',
     'For Rent','Apartments','Bedsitter / Studio',
     18000,0,1,28,0.5,
     'Nairobi','Kilimani','Nairobi','Kenya',
     'Good condition',2016,'2nd floor',
     ARRAY['Security alarm','CCTV cameras','Gated community'],
     ARRAY['KPLC Electricity','County water supply'],
     'active','bedsitter-kilimani-nairobi-all-inclusive',
     now()-interval'5 days',now()-interval'5 days'),

    -- ── Mercy Wanjiku / Nakuru ─────────────────────────────────────────────
    (l03, u2,
     '4-Bedroom Bungalow for Sale in Nakuru Town',
     'Well-maintained 4-bedroom bungalow on a 0.2-acre plot in a quiet residential estate in '
     'Nakuru. The property features an open-plan living area, fitted kitchen, back garden with '
     'mature trees, and a double garage. Title deed ready. Close to Nakuru CBD and Nakuru '
     'National Park.',
     'For Sale','Houses','Bungalow',
     8500000,4,3,190,5,
     'Nakuru','Nakuru Town','Nakuru','Kenya',
     'Good condition',2011,'Ground floor',
     ARRAY['Garden / Courtyard','Garage','Security alarm','CCTV cameras','Gated community','Water tank (1,000 L+)'],
     ARRAY['KPLC Electricity','County water supply','Borehole water','LPG gas'],
     'active','4-bedroom-bungalow-nakuru-town-for-sale',
     now()-interval'7 days',now()-interval'7 days'),

    (l04, u2,
     'Residential Plot for Sale — Lanet, Nakuru',
     '50 x 100 ft residential plot in the Lanet area of Nakuru County. Ready title deed. '
     'Suitable for a single-family home or rental units. All-weather access road, close to '
     'Lanet Barracks and Nakuru town. Power and water available on the road. Priced to sell.',
     'For Sale','Land','Residential plot',
     2200000,NULL,NULL,465,NULL,
     'Nakuru','Lanet','Nakuru','Kenya',
     NULL,NULL,NULL,
     ARRAY[]::text[],ARRAY['KPLC Electricity','County water supply'],
     'active','residential-plot-lanet-nakuru-for-sale',
     now()-interval'9 days',now()-interval'9 days'),

    -- ── Kevin Kiptoo / Eldoret ─────────────────────────────────────────────
    (l05, u3,
     '2-Bedroom Apartment for Rent — Eldoret Town Centre',
     'Clean and affordable 2-bedroom apartment on the 3rd floor in Eldoret Town Centre. Tiled '
     'throughout, modern bathroom, and fitted kitchen. Secure building with gate and watchman. '
     'Easy access to Eldoret CBD, hospitals, and Moi University main campus. Parking available.',
     'For Rent','Apartments','2-bedroom apartment',
     25000,2,1,75,2,
     'Eldoret','Eldoret Town','Uasin Gishu','Kenya',
     'Good condition',2014,'3rd floor',
     ARRAY['Parking bay','Security alarm','CCTV cameras'],
     ARRAY['KPLC Electricity','County water supply'],
     'active','2-bedroom-apartment-eldoret-town-for-rent',
     now()-interval'4 days',now()-interval'4 days'),

    (l06, u3,
     'Prime Commercial Space — CBD Eldoret',
     'Ground-floor commercial unit in a busy street-facing position in Eldoret CBD. Open-plan '
     'space suitable for a retail shop, pharmacy, or fast-food outlet. High foot traffic, glass '
     'front facade, and rear storage room included. Service charge included in rent.',
     'For Rent','Commercial','Shop / Retail unit',
     45000,NULL,NULL,55,NULL,
     'Eldoret','Eldoret Town','Uasin Gishu','Kenya',
     'Excellent condition',2018,'Ground floor',
     ARRAY['Security alarm','CCTV cameras'],
     ARRAY['KPLC Electricity','County water supply'],
     'active','commercial-shop-cbd-eldoret-for-rent',
     now()-interval'6 days',now()-interval'6 days'),

    -- ── Aisha Abdalla / Mombasa ────────────────────────────────────────────
    (l07, u4,
     'Holiday Home for Sale — Nyali Beach, Mombasa',
     'Charming 3-bedroom holiday cottage just 200 metres from Nyali Beach. Private garden with '
     'BBQ area, ocean-breeze ventilation, and an outdoor shower. Sold furnished. Ideal for '
     'short-let investment or permanent coastal living. Close to Nyali Golf Course and Mamba '
     'Village.',
     'For Sale','Holiday Homes','Beach house / Villa',
     15000000,3,2,145,4,
     'Mombasa','Nyali','Mombasa','Kenya',
     'Good condition',2009,'Ground floor',
     ARRAY['Garden / Courtyard','CCTV cameras','Furnished / Semi-furnished','Swimming pool','Security guard / Askari'],
     ARRAY['KPLC Electricity','County water supply','LPG gas'],
     'active','holiday-home-nyali-beach-mombasa-for-sale',
     now()-interval'2 days',now()-interval'2 days'),

    (l08, u4,
     '3-Bedroom Maisonette for Rent — Bamburi, Mombasa',
     'Spacious double-storey maisonette in a serene Bamburi estate. Master en-suite bedroom on '
     'the upper floor, plus two additional rooms. Large kitchen with service area, private '
     'compound with parking, and borehole water supply. Walking distance from Bamburi Beach '
     'and Haller Park.',
     'For Rent','Houses','Maisonette',
     55000,3,2,155,4,
     'Mombasa','Bamburi','Mombasa','Kenya',
     'Excellent condition',2017,'Ground floor',
     ARRAY['Parking bay','Garden / Courtyard','Borehole','Water tank (1,000 L+)','Electric fence','Security guard / Askari'],
     ARRAY['KPLC Electricity','Borehole water','LPG gas'],
     'active','3-bedroom-maisonette-bamburi-mombasa-for-rent',
     now()-interval'8 days',now()-interval'8 days'),

    -- ── Samuel Mwangi / Thika ──────────────────────────────────────────────
    (l09, u5,
     'Residential Plot — Blue Post Area, Thika',
     '40 x 80 ft plot in a fast-developing residential zone near Blue Post Hotel in Thika. '
     'All-weather murram road access, neighbours have already built, and electricity poles are '
     'on the plot boundary. Title deed available. Ideal for owner-occupier or rental income '
     'development.',
     'For Sale','Land','Residential plot',
     1800000,NULL,NULL,298,NULL,
     'Thika','Thika Town','Kiambu','Kenya',
     NULL,NULL,NULL,
     ARRAY[]::text[],ARRAY['KPLC Electricity'],
     'active','residential-plot-blue-post-thika-for-sale',
     now()-interval'11 days',now()-interval'11 days'),

    (l10, u5,
     '2-Bedroom Bungalow for Sale — Thika Town',
     'Neat 2-bedroom bungalow in a quiet estate in Thika Town. Fully cemented, tiled floors, '
     'iron-sheet roof in excellent condition. Borehole on the plot with elevated 2,000-litre '
     'tank. Fenced compound with fruit trees. Title deed available. 15 minutes from Thika '
     'Superhighway.',
     'For Sale','Houses','Bungalow',
     5500000,2,1,85,3,
     'Thika','Thika Town','Kiambu','Kenya',
     'Good condition',2008,'Ground floor',
     ARRAY['Garden / Courtyard','Water tank (1,000 L+)','Borehole'],
     ARRAY['KPLC Electricity','Borehole water'],
     'active','2-bedroom-bungalow-thika-town-for-sale',
     now()-interval'13 days',now()-interval'13 days'),

    -- ── Linet Chebet / Kericho ─────────────────────────────────────────────
    (l11, u6,
     '5-Acre Tea Farm for Sale — Kericho',
     'Productive 5-acre tea farm in the lush highlands of Kericho County. Fully planted with '
     'mature tea bushes and registered with a KTDA buying centre 3 km away. A 3-roomed '
     'farmhouse on the property is available for the farm manager. Title deed available. '
     'Serious buyers only.',
     'For Sale','Farms & Agriculture','Tea farm',
     12000000,NULL,NULL,20234,NULL,
     'Kericho','Kericho Town','Kericho','Kenya',
     'Good condition',NULL,NULL,
     ARRAY[]::text[],ARRAY['KPLC Electricity','Borehole water'],
     'active','5-acre-tea-farm-kericho-for-sale',
     now()-interval'15 days',now()-interval'15 days'),

    (l12, u6,
     '3-Bedroom House for Rent — Kericho Town',
     'Comfortable 3-bedroom iron-roofed house in a quiet neighbourhood in Kericho Town. '
     'Spacious sitting room, fitted kitchen, and a large back garden. Borehole water, 24-hour '
     'security, and easy access to Kericho CBD. Suitable for a family or couple. One month '
     'deposit required.',
     'For Rent','Houses','Detached house',
     30000,3,2,120,4,
     'Kericho','Kericho Town','Kericho','Kenya',
     'Good condition',2013,'Ground floor',
     ARRAY['Garden / Courtyard','Borehole','Water tank (1,000 L+)','Security guard / Askari'],
     ARRAY['KPLC Electricity','Borehole water'],
     'active','3-bedroom-house-kericho-town-for-rent',
     now()-interval'10 days',now()-interval'10 days'),

    -- ── George Oduor / Kisumu ──────────────────────────────────────────────
    (l13, u7,
     'Lakefront Plot for Sale — Kisumu',
     '0.2-acre plot with direct frontage to Lake Victoria in Kisumu. Stunning unobstructed '
     'views across the lake. Perfect for a boutique lodge, holiday retreat, or lakefront '
     'residence. Allotment letter available for transfer to title deed. A rare and unique '
     'investment opportunity.',
     'For Sale','Land','Residential plot',
     3500000,NULL,NULL,809,NULL,
     'Kisumu','Kisumu City','Kisumu','Kenya',
     NULL,NULL,NULL,
     ARRAY[]::text[],ARRAY['KPLC Electricity','County water supply'],
     'active','lakefront-plot-kisumu-for-sale',
     now()-interval'6 days',now()-interval'6 days'),

    (l14, u7,
     '2-Bedroom Apartment for Rent — Milimani, Kisumu',
     'Well-finished apartment in the prestigious Milimani area of Kisumu. Tiled floors '
     'throughout, modern kitchen, and a balcony with partial lake views. Secure building with '
     'CCTV and security guard. Short walk to Kisumu City Centre, banks, and restaurants.',
     'For Rent','Apartments','2-bedroom apartment',
     35000,2,2,90,3,
     'Kisumu','Milimani','Kisumu','Kenya',
     'Excellent condition',2020,'2nd floor',
     ARRAY['Balcony / Terrace / Patio','Security alarm','CCTV cameras','Parking bay'],
     ARRAY['KPLC Electricity','County water supply','Fibre internet'],
     'active','2-bedroom-apartment-milimani-kisumu-for-rent',
     now()-interval'4 days',now()-interval'4 days'),

    -- ── Diana Njeri / Ruaka ────────────────────────────────────────────────
    (l15, u8,
     '1-Bedroom Apartment for Rent — Ruaka Town',
     'Modern 1-bedroom apartment on the 1st floor in a brand-new gated complex in Ruaka. '
     'Open-plan kitchen and living area, large built-in wardrobe, and fibre-ready connection. '
     'Borehole and backup water tank on site. 10 minutes from Westlands and 15 minutes from '
     'Two Rivers Mall.',
     'For Rent','Apartments','1-bedroom apartment',
     22000,1,1,48,1,
     'Ruaka','Ruaka Town','Kiambu','Kenya',
     'New build',2023,'1st floor',
     ARRAY['Gated community','CCTV cameras','Fibre internet','Water tank (1,000 L+)','Borehole'],
     ARRAY['KPLC Electricity','Borehole water','Fibre internet'],
     'active','1-bedroom-apartment-ruaka-town-for-rent',
     now()-interval'1 days',now()-interval'1 days'),

    (l16, u8,
     '3-Bedroom Townhouse for Sale — Ruaka',
     'Elegant 3-bedroom townhouse in a well-managed gated community in Ruaka. Offers a master '
     'en-suite, guest toilet, open-plan kitchen, and private terrace. Community amenities '
     'include a gym, swimming pool, and children''s play area. Close to Two Rivers Mall and '
     'Northern Bypass.',
     'For Sale','Houses','Townhouse',
     11000000,3,3,160,4,
     'Ruaka','Ruaka Town','Kiambu','Kenya',
     'New build',2022,'Ground floor',
     ARRAY['Balcony / Terrace / Patio','Swimming pool','Gated community','CCTV cameras','Parking bay','Security guard / Askari','Fibre internet'],
     ARRAY['KPLC Electricity','Borehole water','Fibre internet'],
     'active','3-bedroom-townhouse-ruaka-for-sale',
     now()-interval'2 days',now()-interval'2 days'),

    -- ── PrimeNest Realtors / Nairobi ──────────────────────────────────────
    (l17, a1,
     'Luxury Penthouse for Sale — Upperhill, Nairobi',
     'Spectacular 4-bedroom penthouse on the 22nd floor of a Grade A building in Upperhill. '
     'Private elevator access, 360-degree views of the Nairobi skyline, chef''s kitchen, and a '
     'wraparound terrace. Two private parking bays, concierge service, rooftop gym, and a '
     'residents-only pool. A trophy property in the heart of Nairobi''s business district.',
     'For Sale','Apartments','Penthouse',
     45000000,4,4,350,5,
     'Nairobi','Upperhill','Nairobi','Kenya',
     'New build',2021,'5th floor and above',
     ARRAY['Balcony / Terrace / Patio','Elevator / Lift','Swimming pool','Parking bay','Fibre internet','Security alarm','CCTV cameras','Furnished / Semi-furnished','Air conditioning'],
     ARRAY['KPLC Electricity','County water supply','Fibre internet','Backup generator'],
     'active','luxury-penthouse-upperhill-nairobi-for-sale',
     now()-interval'2 days',now()-interval'2 days'),

    (l18, a1,
     'Grade A Office Space to Let — Westlands, Nairobi',
     'Premium open-plan office on the 7th floor of a modern block in Westlands. 450 m² '
     'column-free floor plate, fully air-conditioned, raised floors with data cabling, and '
     'eight parking bays included. Building has 24-hour security, backup generator, and CCTV. '
     'Ideal for a corporate HQ or regional office.',
     'For Rent','Commercial','Office space',
     120000,NULL,NULL,450,NULL,
     'Nairobi','Westlands','Nairobi','Kenya',
     'Excellent condition',2020,'5th floor and above',
     ARRAY['Elevator / Lift','Air conditioning','Parking bay','CCTV cameras','Security alarm','Backup generator','Fibre internet'],
     ARRAY['KPLC Electricity','County water supply','Fibre internet','Backup generator'],
     'active','grade-a-office-westlands-nairobi-to-let',
     now()-interval'5 days',now()-interval'5 days'),

    -- ── Coastal Haven Properties / Mombasa ────────────────────────────────
    (l19, a2,
     'Beachfront Villa for Sale — Diani Beach',
     'Stunning 5-bedroom beachfront villa on the white sands of Diani Beach. Infinity swimming '
     'pool, private beach access, four en-suite bedrooms, a guest cottage, and a fully equipped '
     'outdoor kitchen. Currently operating as a successful holiday villa with strong bookings '
     'through international platforms. Excellent rental yield.',
     'For Sale','Holiday Homes','Beach house / Villa',
     35000000,5,5,480,6,
     'Ukunda','Diani Beach','Kwale','Kenya',
     'Excellent condition',2016,'Ground floor',
     ARRAY['Swimming pool','Garden / Courtyard','Security guard / Askari','CCTV cameras','Parking bay','Furnished / Semi-furnished','Backup generator','Borehole'],
     ARRAY['KPLC Electricity','Borehole water','LPG gas','Backup generator'],
     'active','beachfront-villa-diani-beach-for-sale',
     now()-interval'3 days',now()-interval'3 days'),

    (l20, a2,
     '2-Bedroom Furnished Apartment for Rent — Nyali, Mombasa',
     'Tastefully furnished 2-bedroom apartment in a gated complex in Nyali. Both bedrooms '
     'en-suite, fully equipped kitchen, and a private balcony. Swimming pool, gym, and backup '
     'generator on site. Close to Nyali Beach, Nakumatt Nyali, and City Mall. Available on '
     'monthly or short-let terms.',
     'For Rent','Apartments','2-bedroom apartment',
     45000,2,2,95,3,
     'Mombasa','Nyali','Mombasa','Kenya',
     'Excellent condition',2018,'3rd floor',
     ARRAY['Balcony / Terrace / Patio','Swimming pool','Parking bay','Furnished / Semi-furnished','Security alarm','CCTV cameras','Backup generator'],
     ARRAY['KPLC Electricity','County water supply','Backup generator'],
     'active','2-bedroom-apartment-nyali-mombasa-for-rent',
     now()-interval'7 days',now()-interval'7 days'),

    -- ── Rift Valley Real Estate / Nakuru ──────────────────────────────────
    (l21, a3,
     '5-Acre Agricultural Land for Sale — Naivasha',
     'Fertile 5-acre piece of land on the outskirts of Naivasha town, ideal for horticulture, '
     'floriculture, or a small dairy farm. Proximity to Lake Naivasha and geothermal power '
     'makes irrigation affordable. Title deed available. Tarmac road frontage. Strong water '
     'table confirmed by neighbouring farms.',
     'For Sale','Farms & Agriculture','Arable farmland',
     18000000,NULL,NULL,20234,NULL,
     'Naivasha','Naivasha Town','Nakuru','Kenya',
     NULL,NULL,NULL,
     ARRAY[]::text[],ARRAY['KPLC Electricity','Borehole water'],
     'active','5-acre-agricultural-land-naivasha-for-sale',
     now()-interval'12 days',now()-interval'12 days'),

    (l22, a3,
     'Industrial Warehouse to Let — Nakuru Industrial Area',
     'Large 1,200 m² warehouse on a 0.5-acre fenced yard in Nakuru''s Industrial Area. '
     '7-metre clear height, two loading bays with dock levellers, three-phase power (150 kVA), '
     'and an office block of 120 m². Yard suitable for container offloading. 5 minutes from '
     'the A104 Nakuru–Nairobi highway.',
     'For Rent','Commercial','Warehouse / Godown',
     200000,NULL,NULL,1200,NULL,
     'Nakuru','Industrial Area','Nakuru','Kenya',
     'Good condition',2010,'Ground floor',
     ARRAY['Parking bay','Security guard / Askari','CCTV cameras','Backup generator'],
     ARRAY['KPLC Electricity','Borehole water','Backup generator'],
     'active','industrial-warehouse-nakuru-to-let',
     now()-interval'14 days',now()-interval'14 days'),

    -- ── UrbanKeys Property Management / Nairobi ───────────────────────────
    (l23, a4,
     'Studio Apartment to Let — Kilimani, Nairobi',
     'Compact and modern studio apartment in a well-finished development in Kilimani. Open-plan '
     'sleeping and living zone, kitchenette with fitted cabinets, and a shower room. Wi-Fi '
     'included in rent. Perfect for a student, young professional, or couple. Flexible lease '
     'terms available.',
     'For Rent','Apartments','Bedsitter / Studio',
     28000,0,1,35,0.5,
     'Nairobi','Kilimani','Nairobi','Kenya',
     'New build',2023,'2nd floor',
     ARRAY['Fibre internet','CCTV cameras','Gated community','Elevator / Lift'],
     ARRAY['KPLC Electricity','County water supply','Fibre internet'],
     'active','studio-apartment-kilimani-nairobi-to-let',
     now()-interval'1 days',now()-interval'1 days'),

    (l24, a4,
     'Off-Plan 2-Bedroom Apartment — Parklands, Nairobi',
     'Invest early in this contemporary 2-bedroom apartment in the upcoming Parklands Heights '
     'development. Completion expected Q4 2025. Floor-to-ceiling windows, German-engineered '
     'kitchen fittings, and a private parking bay. Project by a reputable developer with '
     'ISO-certified construction standards. Flexible payment plan available.',
     'For Sale','New Developments','Off-plan apartment',
     9500000,2,2,85,3,
     'Nairobi','Parklands','Nairobi','Kenya',
     'New build',2025,'3rd floor',
     ARRAY['Balcony / Terrace / Patio','Elevator / Lift','Parking bay','Swimming pool','Fibre internet','CCTV cameras','Security guard / Askari'],
     ARRAY['KPLC Electricity','County water supply','Fibre internet','Backup generator'],
     'active','off-plan-2-bedroom-apartment-parklands-nairobi',
     now()-interval'3 days',now()-interval'3 days'),

    -- ── Lakeview Homes Agency / Kisumu ────────────────────────────────────
    (l25, a5,
     'Lakeside Villa for Sale — Kisumu',
     'Magnificent 4-bedroom lakeside villa sitting on 0.75 acres with a private jetty and '
     'uninterrupted views over Lake Victoria. Features an infinity pool, double garage, solar '
     'water heating, and manicured gardens. Owner has title deed and consent to sell. Ideal '
     'for luxury living or high-end short-let.',
     'For Sale','Houses','Villa',
     22000000,4,4,310,5,
     'Kisumu','Kisumu City','Kisumu','Kenya',
     'Excellent condition',2019,'Ground floor',
     ARRAY['Swimming pool','Garden / Courtyard','Garage','Solar panels','Borehole','Water tank (1,000 L+)','CCTV cameras','Security guard / Askari','Parking bay'],
     ARRAY['KPLC Electricity','Borehole water','Solar water heater','Backup generator'],
     'active','lakeside-villa-kisumu-for-sale',
     now()-interval'4 days',now()-interval'4 days'),

    (l26, a5,
     'Commercial Shop to Let — Kisumu CBD',
     'Ground-floor retail unit in a prime commercial building on Oginga Odinga Street in '
     'Kisumu CBD. 65 m² of open-plan retail space with large glass frontage, high foot '
     'traffic, and rear storage area. Building has lift access and 24-hour security. Suitable '
     'for fashion, pharmacy, electronics, or mobile money outlet.',
     'For Rent','Commercial','Shop / Retail unit',
     35000,NULL,NULL,65,NULL,
     'Kisumu','Kisumu City','Kisumu','Kenya',
     'Good condition',2015,'Ground floor',
     ARRAY['Elevator / Lift','Security alarm','CCTV cameras'],
     ARRAY['KPLC Electricity','County water supply'],
     'active','commercial-shop-kisumu-cbd-to-let',
     now()-interval'9 days',now()-interval'9 days'),

    -- ── Mount Kenya Realty / Nyeri ────────────────────────────────────────
    (l27, a6,
     '7-Acre Coffee Farm for Sale — Othaya, Nyeri',
     'A thriving 7-acre coffee farm in the premium coffee belt of Othaya, Nyeri County. Fully '
     'planted with mature Ruiru 11 and Batian coffee varieties, registered with a nearby KTDA '
     'wet mill. A 4-roomed stone house and farm store on the property. Title deed available. '
     'Strong yield records available upon request.',
     'For Sale','Farms & Agriculture','Coffee farm',
     9500000,NULL,NULL,28327,NULL,
     'Nyeri','Othaya','Nyeri','Kenya',
     'Good condition',NULL,NULL,
     ARRAY[]::text[],ARRAY['KPLC Electricity','Borehole water'],
     'active','7-acre-coffee-farm-othaya-nyeri-for-sale',
     now()-interval'16 days',now()-interval'16 days'),

    (l28, a6,
     '4-Bedroom Family Home for Sale — Nyeri Town',
     'Beautiful 4-bedroom stone house in a quiet estate in Nyeri Town. Master bedroom with '
     'en-suite, large living and dining rooms, separate study, and a landscaped garden with '
     'kitchen garden. Solar water heater, borehole, and double garage. Close to hospitals '
     'and schools. Title deed available.',
     'For Sale','Houses','Detached house',
     7200000,4,3,210,5,
     'Nyeri','Nyeri Town','Nyeri','Kenya',
     'Good condition',2015,'Ground floor',
     ARRAY['Garden / Courtyard','Garage','Borehole','Water tank (1,000 L+)','Solar panels','Security alarm'],
     ARRAY['KPLC Electricity','Borehole water','Solar water heater'],
     'active','4-bedroom-family-home-nyeri-town-for-sale',
     now()-interval'18 days',now()-interval'18 days'),

    -- ── Metroline Estates / Nairobi ───────────────────────────────────────
    (l29, a7,
     '3-Bedroom Apartment for Sale — Syokimau, Nairobi',
     'Affordable 3-bedroom apartment in a popular estate in Syokimau. Modern fittings '
     'throughout, master en-suite, fitted kitchen, and a balcony. The estate has 24-hour '
     'security, borehole water, and a children''s play area. Close to SGR Syokimau Station '
     'and JKIA. A great starter home or buy-to-let investment.',
     'For Sale','Apartments','3-bedroom apartment',
     8800000,3,2,120,4,
     'Nairobi','Syokimau','Nairobi','Kenya',
     'New build',2022,'2nd floor',
     ARRAY['Balcony / Terrace / Patio','CCTV cameras','Parking bay','Water tank (1,000 L+)','Borehole','Gated community'],
     ARRAY['KPLC Electricity','Borehole water','Fibre internet'],
     'active','3-bedroom-apartment-syokimau-nairobi-for-sale',
     now()-interval'5 days',now()-interval'5 days'),

    (l30, a7,
     'Serviced Bedsitter to Let — Embakasi, Nairobi',
     'Neatly finished serviced bedsitter in a well-managed 5-storey block in Embakasi. '
     'Features tiled floors, modern bathroom, and kitchenette with a gas cooker. Water and '
     'rubbish collection included in rent. Solar-supplemented electricity. Close to Super '
     'Metro bus stops, Airgate Mall, and several schools.',
     'For Rent','Apartments','Bedsitter / Studio',
     15000,0,1,25,0.5,
     'Nairobi','Embakasi','Nairobi','Kenya',
     'Good condition',2017,'3rd floor',
     ARRAY['CCTV cameras','Security alarm'],
     ARRAY['KPLC Electricity','County water supply','LPG gas'],
     'active','serviced-bedsitter-embakasi-nairobi-to-let',
     now()-interval'6 days',now()-interval'6 days')
  ;

  -- ════════════════════════════════════════════════════════════
  -- 4. listing_photos  (2 stock photos per listing via Unsplash)
  -- ════════════════════════════════════════════════════════════
  INSERT INTO public.listing_photos (listing_id, url, position)
  VALUES
    -- l01  3-bed apartment / Westlands
    (l01,'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format',0),
    (l01,'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format',1),
    -- l02  bedsitter / Kilimani
    (l02,'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format',0),
    (l02,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format',1),
    -- l03  bungalow / Nakuru
    (l03,'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format',0),
    (l03,'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&auto=format',1),
    -- l04  plot / Lanet
    (l04,'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&auto=format',0),
    (l04,'https://images.unsplash.com/photo-1449844908441-8d4cfc9cd3a4?w=1200&auto=format',1),
    -- l05  2-bed apartment / Eldoret
    (l05,'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format',0),
    (l05,'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format',1),
    -- l06  commercial shop / Eldoret
    (l06,'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format',0),
    (l06,'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1200&auto=format',1),
    -- l07  holiday home / Nyali
    (l07,'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&auto=format',0),
    (l07,'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&auto=format',1),
    -- l08  maisonette / Bamburi
    (l08,'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format',0),
    (l08,'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format',1),
    -- l09  plot / Thika
    (l09,'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format',0),
    (l09,'https://images.unsplash.com/photo-1459667788632-b5f5f2b58b85?w=1200&auto=format',1),
    -- l10  bungalow / Thika
    (l10,'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format',0),
    (l10,'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1200&auto=format',1),
    -- l11  tea farm / Kericho
    (l11,'https://images.unsplash.com/photo-1597816590966-ebff1a82ba94?w=1200&auto=format',0),
    (l11,'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1200&auto=format',1),
    -- l12  house / Kericho
    (l12,'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&auto=format',0),
    (l12,'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&auto=format',1),
    -- l13  lakefront plot / Kisumu
    (l13,'https://images.unsplash.com/photo-1468070454955-c5b6932bd08d?w=1200&auto=format',0),
    (l13,'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=1200&auto=format',1),
    -- l14  apartment / Milimani Kisumu
    (l14,'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format',0),
    (l14,'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&auto=format',1),
    -- l15  1-bed apartment / Ruaka
    (l15,'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&auto=format',0),
    (l15,'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1200&auto=format',1),
    -- l16  townhouse / Ruaka
    (l16,'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format',0),
    (l16,'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&auto=format',1),
    -- l17  penthouse / Upperhill
    (l17,'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=1200&auto=format',0),
    (l17,'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format',1),
    -- l18  office / Westlands
    (l18,'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format',0),
    (l18,'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&auto=format',1),
    -- l19  beachfront villa / Diani
    (l19,'https://images.unsplash.com/photo-1602343168117-bb8ced3f3a24?w=1200&auto=format',0),
    (l19,'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format',1),
    -- l20  apartment / Nyali
    (l20,'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format',0),
    (l20,'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&auto=format',1),
    -- l21  agricultural land / Naivasha
    (l21,'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&auto=format',0),
    (l21,'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1200&auto=format',1),
    -- l22  warehouse / Nakuru
    (l22,'https://images.unsplash.com/photo-1586528116493-da5807982f23?w=1200&auto=format',0),
    (l22,'https://images.unsplash.com/photo-1553653924-39b70295f8da?w=1200&auto=format',1),
    -- l23  studio / Kilimani
    (l23,'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&auto=format',0),
    (l23,'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&auto=format',1),
    -- l24  off-plan apartment / Parklands
    (l24,'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format',0),
    (l24,'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200&auto=format',1),
    -- l25  lakeside villa / Kisumu
    (l25,'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format',0),
    (l25,'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format',1),
    -- l26  commercial shop / Kisumu CBD
    (l26,'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format',0),
    (l26,'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format',1),
    -- l27  coffee farm / Othaya
    (l27,'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=1200&auto=format',0),
    (l27,'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format',1),
    -- l28  family home / Nyeri
    (l28,'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format',0),
    (l28,'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&auto=format',1),
    -- l29  apartment / Syokimau
    (l29,'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&auto=format',0),
    (l29,'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&auto=format',1),
    -- l30  bedsitter / Embakasi
    (l30,'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format',0),
    (l30,'https://images.unsplash.com/photo-1522444195799-478538b28823?w=1200&auto=format',1)
  ;

END $$;
