-- Seed: 20 Kenyan Furniture & Interior partners
-- Paste into Supabase SQL Editor and run.
-- Real companies should log in and update their own listing.

INSERT INTO partners (category, subcategory, company_name, contact_name, email, phone, website, city, description, verified, user_id, logo_url, promo_banner_url, metadata)
VALUES

('furniture', 'Furniture Retailer', 'Furniture Palace Kenya', 'Sales Team', 'info@furniturepalace.co.ke', '+254 20 444 4444', 'https://furniturepalace.co.ke', 'Nairobi',
 'One of Kenya''s largest furniture retailers with showrooms across Nairobi, Mombasa and Kisumu. Offering a wide range of living room, bedroom and dining furniture at competitive prices.',
 true, null, null, null,
 '{"business_type":"Furniture Retailer","product_categories":["Living Room","Bedroom","Kitchen & Dining","Home Office"],"services":["Delivery","Installation"],"price_range":"Mid-Range","regions":["Nairobi","Mombasa","Kisumu","Nakuru"],"tagline":"Kenya''s home for quality furniture","lead_time_weeks":"1–2 weeks","social_instagram":"https://instagram.com/furniturepalacekenya","catalog_url":null}'::jsonb),

('furniture', 'Interior Designer', 'Casa Interior Design', 'Amina Odhiambo', 'hello@casainteriors.co.ke', '+254 722 100 200', 'https://casainteriors.co.ke', 'Nairobi',
 'Award-winning interior design studio specialising in residential and commercial spaces. Known for blending contemporary aesthetics with African design elements.',
 true, null, null, null,
 '{"business_type":"Interior Designer","product_categories":["Living Room","Bedroom","Kitchen & Dining","Home Office","Lighting"],"services":["Free Consultation","3D Visualisation","Space Planning","Installation"],"price_range":"Premium","regions":["Nairobi","Mombasa"],"tagline":"Spaces that tell your story","lead_time_weeks":"4–8 weeks","social_instagram":"https://instagram.com/casainteriorske","catalog_url":null}'::jsonb),

('furniture', 'Furniture Manufacturer', 'Oakwood Furniture Kenya', 'James Mwangi', 'sales@oakwoodkenya.co.ke', '+254 733 200 300', 'https://oakwoodkenya.co.ke', 'Nairobi',
 'Nairobi-based furniture manufacturer producing solid hardwood and engineered wood furniture for homes and offices. All pieces are locally crafted using sustainably sourced timber.',
 true, null, null, null,
 '{"business_type":"Furniture Manufacturer","product_categories":["Living Room","Bedroom","Kitchen & Dining","Home Office","Outdoor"],"services":["Custom Orders","Delivery","Installation"],"price_range":"Mid-Range","regions":["Nairobi","Thika","Nakuru","Eldoret"],"tagline":"Handcrafted in Kenya, built to last","lead_time_weeks":"3–5 weeks","social_instagram":"https://instagram.com/oakwoodkenyafurniture","catalog_url":null}'::jsonb),

('furniture', 'Custom / Bespoke', 'Afrofurnish', 'Wanjiku Kamau', 'info@afrofurnish.co.ke', '+254 711 300 400', 'https://afrofurnish.co.ke', 'Nairobi',
 'Bespoke furniture studio creating custom pieces inspired by African art and culture. Specialises in statement living room and dining furniture for modern Kenyan homes.',
 true, null, null, null,
 '{"business_type":"Custom / Bespoke","product_categories":["Living Room","Kitchen & Dining","Outdoor"],"services":["Free Consultation","3D Visualisation","Custom Orders","Delivery"],"price_range":"Premium","regions":["Nairobi","Mombasa"],"tagline":"African craft, modern living","lead_time_weeks":"6–10 weeks","social_instagram":"https://instagram.com/afrofurnish","catalog_url":null}'::jsonb),

('furniture', 'Interior Decorator', 'Kijani Interiors', 'Grace Njeri', 'grace@kijaniinteriors.co.ke', '+254 722 400 500', null, 'Nairobi',
 'Boutique interior decorating practice focused on sustainable, biophilic design. Uses natural materials, plants and earthy tones to create calming, wellness-focused home environments.',
 true, null, null, null,
 '{"business_type":"Interior Decorator","product_categories":["Living Room","Bedroom","Curtains & Blinds","Lighting"],"services":["Free Consultation","3D Visualisation","Space Planning"],"price_range":"Premium","regions":["Nairobi"],"tagline":"Bringing nature indoors","lead_time_weeks":"3–6 weeks","social_instagram":"https://instagram.com/kijaniinteriors","catalog_url":null}'::jsonb),

('furniture', 'Kitchen Specialist', 'Safari Kitchen Studio', 'Peter Otieno', 'info@safarikitchen.co.ke', '+254 733 500 600', 'https://safarikitchen.co.ke', 'Nairobi',
 'Kenya''s leading kitchen design and installation specialists. From fitted kitchen cabinets to full refits, Safari Kitchen Studio handles residential and developer projects across Nairobi.',
 true, null, null, null,
 '{"business_type":"Kitchen Specialist","product_categories":["Kitchen & Dining"],"services":["Free Consultation","3D Visualisation","Custom Orders","Installation","Delivery"],"price_range":"Mid-Range","regions":["Nairobi","Thika","Nakuru"],"tagline":"Dream kitchens, fitted perfectly","lead_time_weeks":"4–6 weeks","social_instagram":"https://instagram.com/safarikitchenstudio","catalog_url":null}'::jsonb),

('furniture', 'Interior Designer', 'Loft Design Studio', 'Naomi Achieng', 'hello@loftdesignstudio.co.ke', '+254 722 600 700', 'https://loftdesignstudio.co.ke', 'Nairobi',
 'High-end interior design firm serving luxury residential developments, penthouses and high-end rental properties. Full turnkey design and project management service.',
 true, null, null, null,
 '{"business_type":"Interior Designer","product_categories":["Living Room","Bedroom","Kitchen & Dining","Home Office","Lighting"],"services":["Free Consultation","3D Visualisation","Space Planning","Custom Orders","Installation"],"price_range":"Luxury","regions":["Nairobi","Mombasa"],"tagline":"Luxury interiors, seamlessly delivered","lead_time_weeks":"8–12 weeks","social_instagram":"https://instagram.com/loftdesignstudioke","catalog_url":null}'::jsonb),

('furniture', 'Furniture Retailer', 'Modern Living Kenya', 'Tom Kariuki', 'info@modernlivingke.co.ke', '+254 711 700 800', 'https://modernlivingke.co.ke', 'Nairobi',
 'Contemporary furniture showroom stocking Scandinavian-inspired and minimalist furniture brands. Ideal for new apartments, serviced residences and modern family homes.',
 true, null, null, null,
 '{"business_type":"Furniture Retailer","product_categories":["Living Room","Bedroom","Home Office","Lighting"],"services":["Delivery","Free Consultation"],"price_range":"Mid-Range","regions":["Nairobi"],"tagline":"Modern furniture for modern Kenya","lead_time_weeks":"1–3 weeks","social_instagram":"https://instagram.com/modernlivingkenya","catalog_url":null}'::jsonb),

('furniture', 'Custom / Bespoke', 'Bespoke Furniture Co.', 'David Kimani', 'david@bespokefurnco.co.ke', '+254 733 800 900', 'https://bespokefurnco.co.ke', 'Nairobi',
 'Luxury custom furniture workshop producing hand-finished pieces to client specification. Works with interior designers, architects and private clients on one-of-a-kind commissions.',
 true, null, null, null,
 '{"business_type":"Custom / Bespoke","product_categories":["Living Room","Bedroom","Kitchen & Dining","Home Office"],"services":["Free Consultation","3D Visualisation","Custom Orders","Delivery","Installation"],"price_range":"Luxury","regions":["Nairobi","Mombasa"],"tagline":"Every piece, made for you","lead_time_weeks":"8–14 weeks","social_instagram":"https://instagram.com/bespokefurnco","catalog_url":null}'::jsonb),

('furniture', 'Office Furniture', 'Elite Office Furniture', 'Susan Mwenda', 'info@eliteofficeke.co.ke', '+254 722 900 100', 'https://eliteofficeke.co.ke', 'Nairobi',
 'Specialist office furniture supplier serving corporate offices, co-working spaces and home offices across Nairobi. Ergonomic chairs, sit-stand desks and full office fit-outs.',
 true, null, null, null,
 '{"business_type":"Office Furniture","product_categories":["Home Office"],"services":["Free Consultation","Delivery","Installation","Space Planning"],"price_range":"Mid-Range","regions":["Nairobi","Thika"],"tagline":"Productive spaces start here","lead_time_weeks":"2–4 weeks","social_instagram":"https://instagram.com/eliteofficeke","catalog_url":null}'::jsonb),

('furniture', 'Furniture Retailer', 'Acacia Home', 'Faith Waweru', 'hello@acaciahome.co.ke', '+254 711 010 200', 'https://acaciahome.co.ke', 'Nairobi',
 'Budget-friendly furniture store offering stylish yet affordable options for first-time homeowners and rental property landlords. Large in-stock warehouse with same-week delivery.',
 true, null, null, null,
 '{"business_type":"Furniture Retailer","product_categories":["Living Room","Bedroom","Kitchen & Dining","Curtains & Blinds"],"services":["Delivery","Installation"],"price_range":"Budget-Friendly","regions":["Nairobi","Nakuru","Thika"],"tagline":"Stylish homes, affordable prices","lead_time_weeks":"3–7 days","social_instagram":"https://instagram.com/acaciahomeke","catalog_url":null}'::jsonb),

('furniture', 'Interior Decorator', 'Habitat Kenya', 'Angela Omondi', 'angela@habitatkenya.co.ke', '+254 733 020 300', null, 'Nairobi',
 'Interior decorating and styling service for furnished rental properties and Airbnb units. Helps landlords and short-let operators create photogenic, guest-ready spaces that command premium rates.',
 true, null, null, null,
 '{"business_type":"Interior Decorator","product_categories":["Living Room","Bedroom","Kitchen & Dining","Curtains & Blinds","Lighting"],"services":["Free Consultation","Space Planning","Custom Orders","Delivery"],"price_range":"Mid-Range","regions":["Nairobi","Mombasa","Kisumu"],"tagline":"Rental properties guests love","lead_time_weeks":"2–4 weeks","social_instagram":"https://instagram.com/habitatkenya","catalog_url":null}'::jsonb),

('furniture', 'Furniture Manufacturer', 'Kenya Wood Industries', 'Francis Ndung''u', 'sales@kenyawood.co.ke', '+254 722 030 400', 'https://kenyawood.co.ke', 'Thika',
 'Industrial-scale furniture manufacturer based in Thika supplying hotels, developers and retailers across East Africa. Bedroom sets, dining suites and custom bulk orders accepted.',
 true, null, null, null,
 '{"business_type":"Furniture Manufacturer","product_categories":["Bedroom","Kitchen & Dining","Living Room","Outdoor"],"services":["Custom Orders","Delivery"],"price_range":"Budget-Friendly","regions":["Nairobi","Thika","Nakuru","Eldoret","Kisumu","Mombasa"],"tagline":"Bulk furniture, reliable delivery","lead_time_weeks":"4–8 weeks","social_instagram":null,"catalog_url":null}'::jsonb),

('furniture', 'Interior Designer', 'Savanna Interiors', 'Lydia Chebet', 'lydia@savannainteriors.co.ke', '+254 711 040 500', 'https://savannainteriors.co.ke', 'Nairobi',
 'Interior design consultancy with a signature warm, earthy aesthetic drawing on Kenyan landscapes. Works on new-build homes, apartment fits-out and developer show units.',
 true, null, null, null,
 '{"business_type":"Interior Designer","product_categories":["Living Room","Bedroom","Kitchen & Dining","Lighting","Flooring"],"services":["Free Consultation","3D Visualisation","Space Planning","Custom Orders"],"price_range":"Premium","regions":["Nairobi","Mombasa","Nakuru"],"tagline":"Inspired by the Kenyan landscape","lead_time_weeks":"6–10 weeks","social_instagram":"https://instagram.com/savannainteriors","catalog_url":null}'::jsonb),

('furniture', 'Curtains & Blinds', 'Westlands Curtain Studio', 'Mary Wanjiku', 'info@westlandscurtains.co.ke', '+254 733 050 600', null, 'Nairobi',
 'Specialist window treatment studio offering made-to-measure curtains, blinds, shutters and soft furnishings. Free home measurement service across Nairobi.',
 true, null, null, null,
 '{"business_type":"Interior Decorator","product_categories":["Curtains & Blinds","Living Room","Bedroom"],"services":["Free Consultation","Custom Orders","Installation"],"price_range":"Mid-Range","regions":["Nairobi"],"tagline":"Perfect window dressings, measured free","lead_time_weeks":"2–3 weeks","social_instagram":"https://instagram.com/westlandscurtains","catalog_url":null}'::jsonb),

('furniture', 'Furniture Retailer', 'Nakuru Furniture House', 'John Koech', 'info@nakurufurniture.co.ke', '+254 722 060 700', null, 'Nakuru',
 'The Rift Valley''s leading furniture store serving Nakuru, Eldoret and surrounding towns. Strong selection of bedroom, living room and outdoor furniture with flexible payment plans.',
 true, null, null, null,
 '{"business_type":"Furniture Retailer","product_categories":["Living Room","Bedroom","Outdoor","Kitchen & Dining"],"services":["Delivery","Installation"],"price_range":"Budget-Friendly","regions":["Nakuru","Eldoret","Kitale","Kericho"],"tagline":"Rift Valley''s home furniture destination","lead_time_weeks":"1–2 weeks","social_instagram":null,"catalog_url":null}'::jsonb),

('furniture', 'Interior Designer', 'Urban Space Kenya', 'Kevin Njoroge', 'kevin@urbanspaceke.co.ke', '+254 711 070 800', 'https://urbanspaceke.co.ke', 'Nairobi',
 'Contemporary urban interior design practice specialising in compact apartments, studio units and co-living spaces. Experts in maximising space in Nairobi''s high-density residential market.',
 true, null, null, null,
 '{"business_type":"Interior Designer","product_categories":["Living Room","Bedroom","Home Office","Lighting","Flooring"],"services":["Free Consultation","3D Visualisation","Space Planning","Custom Orders","Installation"],"price_range":"Mid-Range","regions":["Nairobi"],"tagline":"Small spaces, big impact","lead_time_weeks":"4–6 weeks","social_instagram":"https://instagram.com/urbanspacekenya","catalog_url":null}'::jsonb),

('furniture', 'Custom / Bespoke', 'Craft Workshop Kenya', 'Samuel Ochieng', 'samuel@craftworkshopke.co.ke', '+254 733 080 900', null, 'Nairobi',
 'Small-batch furniture workshop producing handmade pieces using reclaimed wood and sustainable materials. Each piece is unique. Popular with eco-conscious homeowners and boutique hotels.',
 true, null, null, null,
 '{"business_type":"Custom / Bespoke","product_categories":["Living Room","Bedroom","Outdoor","Kitchen & Dining"],"services":["Custom Orders","Delivery","Free Consultation"],"price_range":"Premium","regions":["Nairobi","Mombasa"],"tagline":"Reclaimed wood, reimagined","lead_time_weeks":"6–12 weeks","social_instagram":"https://instagram.com/craftworkshopke","catalog_url":null}'::jsonb),

('furniture', 'Interior Decorator', 'Mombasa Home Decor', 'Rehema Ali', 'info@mombasahomedecor.co.ke', '+254 722 090 010', null, 'Mombasa',
 'Coast-based interior decorating service with a signature Swahili-inspired aesthetic. Specialises in holiday villas, boutique hotels and coastal holiday homes on the Kenya coast.',
 true, null, null, null,
 '{"business_type":"Interior Decorator","product_categories":["Living Room","Bedroom","Outdoor","Curtains & Blinds","Lighting"],"services":["Free Consultation","Space Planning","Custom Orders","Delivery"],"price_range":"Premium","regions":["Mombasa","Malindi","Lamu"],"tagline":"Coastal living, beautifully styled","lead_time_weeks":"3–5 weeks","social_instagram":"https://instagram.com/mombasahomedecor","catalog_url":null}'::jsonb),

('furniture', 'Kitchen Specialist', 'Prestige Kitchen & Bath', 'Caroline Mutua', 'info@prestigekitchen.co.ke', '+254 711 090 020', 'https://prestigekitchen.co.ke', 'Nairobi',
 'Premium kitchen and bathroom design studio. Handles complete kitchen fit-outs for new developments, luxury apartments and bespoke family homes. Authorised installer for European kitchen brands.',
 true, null, null, null,
 '{"business_type":"Kitchen Specialist","product_categories":["Kitchen & Dining"],"services":["Free Consultation","3D Visualisation","Custom Orders","Installation","Delivery"],"price_range":"Luxury","regions":["Nairobi","Mombasa"],"tagline":"Kitchens worth gathering in","lead_time_weeks":"6–10 weeks","social_instagram":"https://instagram.com/prestigekitchenke","catalog_url":null}'::jsonb);

-- Verify
SELECT company_name, city, (metadata->>'business_type') AS business_type, (metadata->>'price_range') AS price_range
FROM partners
WHERE category = 'furniture'
ORDER BY created_at DESC
LIMIT 20;
