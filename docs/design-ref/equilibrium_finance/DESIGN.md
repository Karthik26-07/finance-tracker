# Design System Strategy: High-End Financial Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Precision Architect."** 

In the world of high-finance, trust isn't built with heavy borders or loud colors; it is built through impeccable organization and airy sophistication. This system moves beyond the "standard dashboard" by treating financial data as an editorial experience. We reject the "boxy" look of traditional SaaS in favor of **Tonal Layering** and **Intentional Asymmetry**. 

By utilizing a high-contrast typography scale (Manrope for headers, Inter for data) and replacing structural lines with background shifts, we create a UI that feels like a premium, custom-tailored financial report rather than a generic software tool.

---

## 2. Colors & Surface Philosophy
The palette is anchored in deep professional blues (`primary`), balanced by high-utility emerald (`secondary`) and sophisticated coral (`tertiary`).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined solely through background color shifts.
*   **Method:** Place a `surface_container_lowest` card on a `surface_container_low` background. The subtle 2-3% difference in luminance is sufficient for the human eye to perceive a boundary without adding visual noise.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, semi-translucent sheets. 
*   **Base:** `background` (#f7f9fb)
*   **Sectioning:** `surface_container` (#eceef0)
*   **Interactive Cards:** `surface_container_lowest` (#ffffff)
*   **Active/Elevated States:** `surface_bright` (#f7f9fb)

### The "Glass & Gradient" Rule
To inject "soul" into the data, use Glassmorphism for floating overlays (e.g., dropdowns, modals). Use a `backdrop-filter: blur(12px)` with a semi-transparent `surface_container_lowest`. For primary CTAs, apply a subtle linear gradient from `primary` (#003178) to `primary_container` (#0d47a1) at a 135-degree angle to provide depth.

---

## 3. Typography: Editorial Authority
We use a dual-font system to separate "Storytelling" (Headers) from "Data" (Numbers).

*   **Display & Headlines (Manrope):** Use these for high-level summaries. The wider tracking and geometric builds of Manrope convey modern authority.
    *   *Example:* `display-md` for the Total Portfolio Balance.
*   **Titles & Body (Inter):** Inter’s tall x-height makes it the gold standard for legibility in dense data. 
    *   *Example:* `body-md` for transaction descriptions; `label-sm` for timestamps.
*   **Numerical Data:** Always use Inter with `font-variant-numeric: tabular-nums` to ensure that columns of currency align perfectly, maintaining the professional "Precision Architect" aesthetic.

---

## 4. Elevation & Depth
Hierarchy is achieved through light and shadow, mimicking physical layers of fine paper.

*   **The Layering Principle:** Avoid shadows on static cards. Instead, use a "Bottom-Up" stacking logic. A `surface_container_highest` element should only exist inside a `surface_container_low` parent.
*   **Ambient Shadows:** For floating elements (Modals, Hovered Cards), use an extra-diffused shadow:
    *   `box-shadow: 0 12px 32px -4px rgba(25, 28, 30, 0.06);` (Using the `on_surface` color at 6% opacity).
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` (#c3c6d4) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Cards & Data Containers
*   **Rule:** Forbid divider lines. 
*   **Implementation:** Use the Spacing Scale `4` (0.9rem) or `5` (1.1rem) to create clear groupings. To separate list items within a card, use a subtle background hover state (`surface_container_high`) rather than a horizontal rule.
*   **Rounding:** Apply `xl` (0.75rem) to main dashboard cards and `md` (0.375rem) to inner elements (buttons, inputs).

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), white text, `md` rounding.
*   **Secondary:** Ghost style. No background, `primary` text, with a `surface_container_low` background appearing only on hover.

### Financial Chips (The "Fin-Pill")
*   **Income:** `secondary_container` background with `on_secondary_container` text.
*   **Expense:** `tertiary_fixed` background with `on_tertiary_fixed_variant` text.
*   **Shape:** Always use `full` rounding (9999px) for chips to contrast against the more structured `xl` cards.

### Input Fields
*   **Style:** Minimalist. No bottom line or heavy border. Use `surface_container_low` as a subtle flood fill. On focus, transition the background to `surface_container_lowest` and add a 2px `primary` ghost-border at 20% opacity.

### Additional Component: The "Trend Micro-Graph"
*   Incorporate sparklines directly into list items using `secondary` (emerald) for growth and `tertiary` (coral) for decline. These should have no axes—just the raw vector path to maintain a clean, high-density look.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use whitespace as a separator. If in doubt, increase the margin.
*   **DO** use `tabular-nums` for all currency displays to ensure vertical alignment.
*   **DO** use `surface_tint` at 5% opacity for large background areas to give the "clean white" a more sophisticated, branded feel.

### Don't
*   **DON’T** use pure black (#000) for text. Always use `on_surface` (#191c1e) to maintain a premium, ink-on-paper feel.
*   **DON’T** use 1px grey dividers. They clutter the UI and break the "Architect" aesthetic.
*   **DON’T** use standard "drop shadows." If a component doesn't feel elevated enough, increase the background contrast between the layers instead of darkening the shadow.