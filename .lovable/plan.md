

# Homepage Redesign Plan

This plan implements the exact design from your Figma screenshots, creating a comprehensive landing page with all sections.

---

## Overview

The new homepage will have these sections (in order):
1. **Header** - SolarCredit logo + Get Started button
2. **Hero** - Badge, headline with green underlined words, CTA
3. **Problem Section** - "Why Most Solar Energy Goes Unrewarded" with 3 illustrated cards
4. **How It Works** - 4-step process cards
5. **Video Section** - Watch Video placeholder
6. **Who Is This For** - Producer vs Consumer cards
7. **Key Features** - 5 feature cards with emoji indicators
8. **Impact Section** - AI-driven impact demo
9. **Credibility & Trust** - Trust badges
10. **Smart FAQ** - Accordion-style Q&A
11. **Final CTA** - "The Future of Energy Participation Starts Here"
12. **Footer** - Links organized in columns

---

## Design Elements

### Typography & Styling
- Green underlined text for emphasis (Solar, Power, Real, Value, etc.)
- Cards with light gray backgrounds and subtle borders
- Emoji-based feature indicators (green happy, yellow neutral, red)
- Clean white background throughout

### Color Scheme (from design)
- Primary green: `#22C55E` (for CTAs and highlights)
- Gray backgrounds: `#F5F5F5` for cards
- Black text on white
- Green underline decoration on key words

---

## File Changes

### 1. Create `src/components/home/` folder with section components

**New files to create:**
- `src/components/home/HeroSection.tsx` - Badge, headline, CTA
- `src/components/home/ProblemSection.tsx` - 3 problem cards with illustrations
- `src/components/home/HowItWorksSection.tsx` - 4 steps
- `src/components/home/VideoSection.tsx` - Video placeholder
- `src/components/home/AudienceSection.tsx` - Producer/Consumer cards
- `src/components/home/FeaturesSection.tsx` - 5 feature cards
- `src/components/home/ImpactSection.tsx` - AI impact demo
- `src/components/home/FAQSection.tsx` - Smart FAQ accordion
- `src/components/home/FinalCTASection.tsx` - Final call to action
- `src/components/home/Footer.tsx` - Full footer with links

### 2. Update `src/pages/Index.tsx`

Replace the current content with the new modular sections:

```text
<div>
  <Header />
  <HeroSection />
  <ProblemSection />
  <HowItWorksSection />
  <VideoSection />
  <AudienceSection />
  <FeaturesSection />
  <ImpactSection />
  <FAQSection />
  <FinalCTASection />
  <Footer />
</div>
```

---

## Detailed Section Breakdown

### Hero Section
- Badge: "Built for India - Policy-aware - Transparent credits"
- Headline: "Turn Your **Solar Power** into **Real Value**." (underlined green words)
- Subtext: "Track energy, earn solar credits, and use them to reduce electricity bills or trade responsibly."
- CTA: "See How It Works?" button (outline style)

### Problem Section
- Title: "Why Most **Solar Energy** Goes Unrewarded"
- 3 cards with placeholder illustrations:
  1. Rooftop solar owners export surplus without visibility
  2. Consumers don't benefit from clean energy participation
  3. Environmental impact feels invisible and unrewarding
- Bottom text: "SolarCredit fixes this gap - simply and responsibly."

### How It Works
- Title: "How **SolarCredit** Works"
- 4 step cards with left green border accent:
  1. Step 1 - Track
  2. Step 2 - Convert
  3. Step 3 - Use or Trade
  4. Step 4 - Impact
- CTA: "Start Earning Credits" green button

### Audience Section
- Title: "Who Is This For?"
- Two cards:
  - **For Solar Producers** (sun icon): 3 bullet points + "I Generate Solar" button
  - **For Consumers** (diamond icon): 3 bullet points + "I Want Clean Energy" button

### Features Section
- Title: "Key **Features**"
- Subtitle about AI
- 5 feature cards with emoji status indicators:
  - Smart Energy Dashboard (green)
  - Verified Solar Credits (green)
  - Bill Payment Integration (yellow - simulated)
  - AI-Powered Impact Insights (green)
  - Policy-Aware Design (red/orange indicator)
- CTA: "Explore the Platform" green button

### Impact Section
- Title: "We Create **Impact** from Numbers."
- Demo cards showing CO2 savings
- "by OpenAI" attribution card

### FAQ Section
- Title: "Smart FAQ"
- 5 expandable Q&A cards:
  1. Is this real money or just points?
  2. Can I earn monthly income?
  3. Do I need solar panels to use SolarCredit?
  4. Is this carbon trading?
  5. Is this legally approved?
- "Clarify through SolarGPT" link

### Final CTA
- Quote style: "The Future of Energy Participation Starts Here"
- Bullets: No installation - No commitments - Transparent by design
- "Get Started" green button

### Footer
- SolarCredit description
- Features column: Core features, Producer Dashboard, Consumer Dashboard
- Learn more column: What is SolarCredit?, How can we pay Electricity Bills?, SolarGPT

---

## Technical Notes

- All existing auth/redirect logic in Index.tsx will be preserved
- Components will use existing UI primitives (Button, Card, etc.)
- Accordion component will be used for FAQ
- Responsive design: Mobile-first matching the screenshots
- Green underlines will use CSS `border-bottom` or `text-decoration` styling

