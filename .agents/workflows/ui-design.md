---
description: Conceptualize and generate UI designs and matching React components using best aesthetic practices
---

# UI Design Workflow (/ui-design)

As an Antigravity agent tasked with UI design and implementation, follow these steps:

1. **Memory Sync (MANDATORY)**: Read `.agents/MEMORY.md` and `docs/modules/00-module-overview.md` to orient yourself within the project. Determine which module this UI belongs to.
2. **Review Design Assets**: Read `docs/04-ui-design-plan.md` to ingest the core aesthetic of FinTrack (the "Equilibrium Finance" aesthetic).
3. **Conceptualize**:
   - Primary: `#003178`, Secondary: `#006b5f`, Tertiary: `#71000c`.
   - Use Glassmorphism and rich gradients. Avoid generic flat designs.
   - Use `generate_image` or design system tools if you need to visualize the component or want to wow the user.
4. **Implement Component**: Build the React component using Tailwind CSS with `tabular-nums` for finances, `bg-transparent` shifts instead of 1px borders, and Google Fonts (Manrope & Inter).
5. **Auto-Review**: Upon completion, automatically trigger the UI validation rules outlined in `/ui-review`.
