---
name: P5Canvas Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777e'
  outline-variant: '#c6c6ce'
  surface-tint: '#525e7f'
  primary: '#182442'
  on-primary: '#ffffff'
  primary-container: '#2e3a59'
  on-primary-container: '#98a4c9'
  inverse-primary: '#bac6ec'
  secondary: '#b90042'
  on-secondary: '#ffffff'
  secondary-container: '#e31757'
  on-secondary-container: '#fffbff'
  tertiary: '#312300'
  on-tertiary: '#ffffff'
  tertiary-container: '#4a380c'
  on-tertiary-container: '#bca26c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#bac6ec'
  on-primary-fixed: '#0d1a38'
  on-primary-fixed-variant: '#3a4666'
  secondary-fixed: '#ffd9dc'
  secondary-fixed-dim: '#ffb2bb'
  on-secondary-fixed: '#400011'
  on-secondary-fixed-variant: '#910032'
  tertiary-fixed: '#fddfa4'
  tertiary-fixed-dim: '#dfc38b'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#574417'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-technical:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  code-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.6'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  toolbar-width: 56px
  inspector-width: 280px
  gutter: 16px
  panel-padding: 12px
  canvas-margin: 40px
---

## Brand & Style

The design system is engineered for a "pro-sumer" creative environment—a bridge between the structured logic of an Integrated Development Environment (IDE) and the fluid expression of a graphic design suite. The personality is authoritative and precise, yet punctuated by bursts of creative energy.

The aesthetic follows a **Modern Corporate** approach with a **Technical Minimalist** twist. It prioritizes high-density information display and workspace efficiency, reminiscent of industry-standard editors like Figma or PowerPoint. The interface stays out of the way to let the user's canvas remain the focal point, utilizing subtle borders and systematic spacing to define functional zones rather than heavy shadows or decorative flourishes.

**Key Visual Principles:**
- **Precision:** Mathematical alignment and a strict 4px grid.
- **Utility First:** Tools are grouped by frequency of use, with a visual hierarchy that favors the workspace.
- **Developer Heritage:** Subtle monospaced elements and high-contrast accents celebrate the p5.js coding roots.

## Colors

The palette is anchored by **Deep Indigo**, providing a stable, professional foundation for toolbars and structural navigation. The **P5 Pink** is used surgically as an accent color to highlight active states, primary actions, and critical feedback, mirroring the iconic p5.js branding.

**Functional Tones:**
- **Primary (Deep Indigo):** Used for global navigation, headers, and active selection frames.
- **Accent (P5 Pink):** Reserved for "Call to Action" buttons, notifications, and interactive canvas handles.
- **Neutrals (Slate/White):** A multi-step scale of grays handles the "chrome" of the application—sidebars, property inspectors, and canvas backdrops.
- **Success/Error:** Traditional green and red tones are desaturated to match the professional tone, used only for validation.

## Typography

This design system utilizes a dual-font strategy to balance approachability with technical rigor. 

**Inter** is the primary workhorse, used for all interface labels, modal text, and high-level headings. It provides exceptional legibility at the small sizes required for dense property inspectors.

**Geist** is introduced as a secondary "technical" font. It is used for coordinate values (X, Y, W, H), code snippets, and terminal outputs. Its monospaced-like character widths ensure that numerical values don't "jump" when edited, reinforcing the developer-friendly twist of the application.

- **Scale:** Maintain a tight scale. Most UI labels should stick to 12px or 14px to maximize screen real estate.
- **Contrast:** Use Medium (500) weight for labels to ensure they stand out against the Slate backgrounds.

## Layout & Spacing

The layout follows a **Fixed-Panel Fluid-Canvas** model. The interface is divided into functional zones:
1.  **Top Bar:** Global actions and project settings (height: 48px).
2.  **Left Toolbar:** High-frequency creation tools (width: 56px).
3.  **Right Inspector:** Contextual property editing (width: 280px).
4.  **Main Viewport:** A fluid area containing the canvas, centered with generous margins to provide breathing room.

**Grid Philosophy:**
A strict 4px baseline grid governs all internal component spacing. Elements within panels should use 8px or 12px padding. The interface is designed to be "heavy," meaning information density is prioritized over whitespace, allowing power users to see more parameters at once.

## Elevation & Depth

This design system avoids heavy shadows to maintain a modern, flat "workbench" feel. Depth is communicated through **Tonal Layering** and **Low-Contrast Outlines**.

- **Level 0 (Background):** Slate-50 (#F8FAFC) - The primary backdrop for the application.
- **Level 1 (Panels):** White (#FFFFFF) - Sidebars and toolbars, defined by a 1px Slate-200 border.
- **Level 2 (Popovers/Modals):** White with a soft, 15% opacity Indigo shadow (0px 4px 12px). Used for dropdown menus and floating dialogs.
- **Canvas Depth:** The drawing area should have a subtle inner shadow or a darker neutral background (Slate-100) to distinguish the "work" from the "tools."

## Shapes

The shape language is disciplined and geometric. A "Soft" roundedness (4px) is applied to most UI components like buttons, input fields, and panels. This keeps the interface feeling professional and "engineered" rather than "bubbly."

- **Buttons/Inputs:** 4px radius.
- **Modals/Cards:** 8px radius for a slightly softer container feel.
- **Selection Handles:** Square or fully circular (pill) to distinguish them from the UI chrome.

## Components

### Buttons
- **Primary:** Deep Indigo background, white text. Sharp 4px corners.
- **Action (Ghost):** No background, Slate-600 text, Indigo icon. Gains a light gray background on hover.
- **Accent:** P5 Pink background. Used exclusively for "Run" or "Export" actions.

### Input Fields
- **Property Inputs:** Used in the right inspector. Minimalist design: a bottom border or very light 1px outline. Use Geist for numerical values.
- **Label Alignment:** Horizontal alignment (Label on left, Input on right) is preferred in narrow sidebars to save vertical space.

### Tool Icons
- Use 20px icons within 32px hit areas.
- Active tools use the P5 Pink color or a Deep Indigo "pressed" state background.

### Cards & Layers
- **Layer Items:** Flat rows with 1px separators. Use a P5 Pink vertical bar on the far left to indicate the currently selected layer.
- **Collapsible Sections:** Use "chevron" icons to toggle property groups (e.g., "Transform," "Fill," "Stroke").

### The Canvas
- The "P5Canvas" itself should be surrounded by a "Ruler" system (top and left) using the technical font Geist for coordinate markings.