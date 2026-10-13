# Claude Code Prompt — Noah Barbershop Redesign

> Before pasting: save the mockup image into your project as `design/mockup.png` (or drag it into the Claude Code chat). Then paste everything below.

---

Redesign this app's UI to match the mockup at `design/mockup.png` as closely as possible — pixel-level fidelity in layout, spacing, colors, typography, and content. The mockup is the source of truth. Where this spec and the image disagree, follow the image.

## Step 0 — Before writing code
1. Explore the codebase: identify the framework, styling system (Tailwind, CSS modules, styled-components, etc.), routing, and existing components.
2. Open and study `design/mockup.png` carefully.
3. Give me a short plan: which files you'll create/modify, and how you'll map the design to the existing structure. Keep all existing functionality (routes, booking logic, forms, API calls, state) working — this is a visual redesign, not a rewrite of logic.
4. Then implement section by section, and after each section compare against the mockup (take a screenshot if you can) and fix differences before moving on.

## Design tokens
Put these in one central place (Tailwind config, CSS variables, or theme file).

**Colors**
- `--bg`: #0E0E0E (page background, near-black)
- `--bg-alt`: #141414 (alternate section bands, e.g. the features strip)
- `--surface`: #1A1A1A (cards)
- `--border`: rgba(255,255,255,0.08) (card borders, dividers, vertical rules)
- `--gold`: #D4A766 (accent text: eyebrows, prices, arrows, "Master Styling.", icons)
- `--gold-btn`: #E2B77C (filled button background, slightly lighter/warmer)
- `--text`: #FFFFFF (headings)
- `--text-muted`: #B5B5B5 (body copy)
- `--text-dim`: #8A8A8A (small captions like "Call us", "Our Location")
- Stars: gold. Map pin: red (#E53935).

**Typography**
- Headings: elegant high-contrast serif — use **Playfair Display** (or Cormorant Garamond if closer), weight 500–600.
- Body/UI: clean sans-serif — **Montserrat** or **Inter**, weight 400/500.
- Eyebrow labels ("NOAH BARBERSHOP", "OUR SERVICES", etc.): sans, 11–12px, uppercase, letter-spacing ~0.2em, gold, semibold.
- Hero H1: ~56–64px desktop, line-height 1.1. Section H2: ~36–40px. Card titles: serif ~16–17px.
- Logo wordmark "NOAH": serif, wide letter-spacing; "BARBERSHOP" beneath in small uppercase sans with very wide tracking; small crown icon above.

**Shape & spacing**
- Buttons: border-radius ~4–6px, height ~44px, padding 0 20px, 13–14px text.
  - Primary: gold-btn fill, dark text (#1A1A1A), leading calendar icon.
  - Secondary: transparent, 1px gold border, white text, trailing → arrow.
- Cards: radius ~4px, 1px border, surface background, no heavy shadows.
- Max content width ~1200px, centered. Section vertical padding ~80px desktop.
- Icons: thin-line style (lucide or similar), gold.

## Sections (top to bottom)

### 1. Navbar (over hero, transparent background)
- Left: logo (crown + NOAH + BARBERSHOP).
- Center-right: links Home, Services, Gallery, About, Contact. Active link is gold with a short gold underline below.
- Far right: "Book Appointment" pill button (gold-btn fill, calendar icon, fully rounded).
- On mobile: hamburger menu opening a dark full-screen/drawer menu.

### 2. Hero
- Full-width background photo of a barber giving a fade (right side), with a dark gradient overlay from left (opaque black) to right (transparent) so text is readable.
- Left column content:
  - Eyebrow: "NOAH BARBERSHOP"
  - H1 on three lines: "Precise Fades." / "Premium Care." (white) / "Master Styling." (gold)
  - Paragraph: "Discover the peak of modern men's grooming at Addis Ababa's premier barbershop. Your style is our signature statement."
  - Buttons: primary "Book Your Chair Now" (calendar icon) + secondary "View Services →"
- Bottom right: small "Scroll Down" label with a thin vertical line/arrow pointing down.
- Height ~ 600–700px desktop.

### 3. Features strip (bg-alt band)
Three columns separated by thin vertical dividers. Each: gold line icon on left, serif title, muted 3-line description.
- Scissors — **Expert Stylists** — "Our barbers are highly skilled professionals continuously trained in global trends and classic techniques."
- Bottle — **Premium Products** — "We strictly use top-tier hair treatments, essential oils, and skin products tailored to your needs."
- Armchair — **Luxe Atmosphere** — "Unwind in a premium environment designed with your relaxation and absolute comfort in mind."

### 4. Services
Two-column layout: left ~30% intro, right ~70% card grid (3 columns × 2 rows).
- Left: eyebrow "OUR SERVICES", H2 "More Than Just a Haircut", paragraph "From classic cuts to luxury treatments, we offer a complete grooming experience for the modern man.", secondary button "View All Services →".
- Cards: image on top (~55% of card height, cropped, dark-toned), then serif title, 2-line muted description, bottom row with gold price on left and gold → arrow on right.
  1. Premium Men's Haircut — "Consultation, custom cut, precision razor line finish & hair wash." — ETB 350+
  2. Skin Fade / Taper Fade — "High-precision seamless fades crafted by our master barbers." — ETB 300+
  3. Beard Design & Line-up — "Shaping, trimming, hot towel conditioning & razor cleanup." — ETB 250+
  4. Luxury Facial Treatment — "Deep cleansing, exfoliating scrub, blackhead extraction & hydration." — ETB 600+
  5. Hot Towel Shave Experience — "Traditional straight-razor shave with premium oils & soothing towels." — ETB 500+
  6. Scalp Treatment & Conditioning — "Anti-dandruff treatment & nourishing massage for healthy hair growth." — ETB 400+
- Card hover: border turns gold, image zooms subtly (scale 1.04).

### 5. Gallery
Same left/right split.
- Left: eyebrow "OUR GALLERY", H2 "Signature Styles", text "Explore our latest haircuts and grooming styles. Find the look that fits your personality.", secondary button "View Full Gallery →".
- Right: row of 5 portrait images (aspect ~4:5), small gaps, slight radius. Horizontally scrollable on mobile.

### 6. About + Testimonials (one band, three parts)
- Far left (~30%): edge-to-edge photo of the dark luxury shop interior with the glowing NOAH sign.
- Middle: eyebrow "ABOUT US", H2 "The Barbershop That Cares" (two lines), paragraph "Noah Barbershop is more than just a place for a haircut — it's a lifestyle. We combine modern techniques with timeless grooming traditions to give you the best version of yourself.", secondary button "Learn More →".
- Thin vertical divider.
- Right: eyebrow "TESTIMONIALS", H2 "What Our Clients Say", carousel:
  - Large gold serif opening quote mark “ on the left.
  - Quote: "Noah Barbershop is hands down the best grooming spot in the city. The attention to detail on my skin fade and the overall experience is unmatched. A flawless cut every single time."
  - Circular avatar, name "Michael T.", caption "Verified Regular Client", five gold stars.
  - Circular outlined prev/next arrow buttons on both sides; 3 dot indicators below (active dot filled).
  - Make it a working carousel with 3 testimonials (write 2 more in the same tone).

### 7. Visit Us / Contact
Three parts in one row.
- Left: eyebrow "GET IN TOUCH", H2 "Visit Us", text "We're located on Ednamoll Street, Addis Ababa. Walk-ins are always welcome, but booking an appointment is recommended to avoid wait times."
  - Three info items in a row, separated by thin vertical dividers, each with a gold icon inside a thin gold circle:
    - Phone: "+251 94 668 8207" / "Call us" (tel: link)
    - Pin: "Ednamoll Street, Addis Ababa, Ethiopia" / "Our Location"
    - Clock: "8:00 AM – 9:00 PM" / "Mon – Sun (Including Public Holidays)" / "Opening Hours"
  - Primary button "Book Appointment →" + gold text link with pin icon "Get Directions" (opens Google Maps).
- Middle: dark-styled map (dark map tiles / styled embed) in a rounded box with a red pin labeled "Noah Barbershop".
- Right: edge-to-edge storefront photo bleeding to the page's right edge.

### 8. Footer (darkest band)
- Left: logo.
- Center: links Home, Services, Gallery, About, Contact.
- Right: Instagram, Facebook, TikTok icons; below them "© 2025 Noah Barbershop. All rights reserved."

## Images
Use the existing app's images where they fit. Otherwise, add placeholders in `/public/images/` (or the project's asset folder) with clear names (`hero.jpg`, `service-haircut.jpg`, `gallery-1.jpg`, `interior.jpg`, `storefront.jpg`, etc.) and list them for me at the end so I can drop in real photos. All images: `object-fit: cover`, lazy-loaded except the hero.

## Responsive behavior
- ≥1024px: as described above.
- 768–1023px: services grid 2 columns; about/testimonials stack into 2 rows; contact stacks map under text, storefront image below.
- <768px: everything single column; hero text centered-left over a darker overlay; features stack with horizontal dividers; services 1 column; gallery horizontal scroll; contact info items stack vertically; footer centered.

## Quality requirements
- Semantic HTML (header, nav, main, section, footer), alt text on all images, visible keyboard focus (gold outline), aria labels on icon-only buttons.
- Respect `prefers-reduced-motion`.
- Smooth-scroll for nav anchor links; navbar becomes solid #0E0E0E with a subtle bottom border after scrolling past the hero.
- Reuse components: `Button`, `SectionHeading` (eyebrow + H2), `ServiceCard`, `TestimonialCarousel`, `InfoItem`.
- No new heavy dependencies unless needed; ask before adding any.

## When done
1. Run the app and check for build/lint/type errors.
2. Compare each section to the mockup one more time and fix any spacing, color, or alignment differences.
3. Give me a summary of changed files and the list of images I need to replace.
