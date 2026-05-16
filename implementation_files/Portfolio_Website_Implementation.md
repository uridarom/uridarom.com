# Astro Portfolio Website — AI Agent Implementation Guide

## Project Philosophy

This is a high-contrast, editorial-style personal portfolio with a photography gallery. The aesthetic is **refined minimalism**: pure black backgrounds, white serif/sans-serif typography, and images that speak for themselves. Every design decision should serve the photography — nothing should compete with the images.

The implementation prioritizes:
- **Zero friction for content expansion**: Adding a photo or project should require only adding a file, not touching any layout code.
- **Lightweight output**: Pure static HTML/CSS with minimal JavaScript.
- **Image optimization**: Astro's built-in `<Image>` component handles compression and responsive sizing automatically.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **Astro** (latest) | Static site generator, routing, templating |
| **Tailwind CSS v4** | Utility-first styling (via `@astrojs/tailwind`) |
| **Astro Content Collections** | Type-safe content management for photos and projects |
| **`@fontsource/playfair-display`** | Self-hosted serif font (no Google Fonts latency) |
| **`@fontsource/dm-sans`** | Self-hosted clean sans-serif font |
| **Astro `<Image />`** | Built-in image optimization |

**Do NOT use:** React, Vue, or any JS framework. All interactivity (mobile menu, gallery toggle) should be achieved with **vanilla JS `<script>` tags** inside `.astro` components or lightweight CSS-only techniques.

---

## Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── content/
│   │   ├── config.ts           ← Content collection schemas
│   │   ├── photos/
│   │   │   ├── photo-1.md
│   │   │   ├── photo-2.md
│   │   │   └── ...
│   │   └── projects/
│   │       ├── project-1.md
│   │       └── ...
│   ├── layouts/
│   │   ├── BaseLayout.astro     ← Global HTML shell, fonts, meta
│   │   └── PageLayout.astro    ← BaseLayout + sticky nav header
│   ├── components/
│   │   ├── Nav.astro            ← Sticky top navigation bar
│   │   ├── MasonryGrid.astro   ← 3-column masonry photo grid
│   │   ├── ProjectCard.astro   ← Individual project card
│   │   └── SectionToggle.astro ← "Photography • Astrophotography" switcher
│   └── pages/
│       ├── index.astro          ← Home / splash page
│       ├── photos/
│       │   ├── index.astro      ← Gallery page
│       │   └── [slug].astro    ← Individual photo detail page
│       ├── projects/
│       │   ├── index.astro      ← Projects list page
│       │   └── [slug].astro    ← Project detail page
│       └── about.astro          ← About page
```

---

## Step 1: Astro Configuration (`astro.config.mjs`)

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  image: {
    // Allow external image domains if needed in future
    domains: [],
  },
});
```

---

## Step 2: Content Collections (`src/content/config.ts`)

This is the most important structural decision. Content Collections let you define a schema for photos and projects. Every new photo or project is just a new `.md` file — no code changes required.

```ts
import { defineCollection, z } from 'astro:content';

const photos = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    category: z.enum(['photography', 'astrophotography']),
    image: image(),                    // Astro validates & optimizes this path
    thumbAspect: z.enum(['landscape', 'portrait', 'square']).default('landscape'),
    acquisition: z.string().optional(),   // Camera, lens, software info
    creative: z.string().optional(),      // Creative choices description
    date: z.date().optional(),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),           // Short description for the card
    date: z.date(),
    order: z.number().default(99),     // Manual sort order
  }),
});

export const collections = { photos, projects };
```

### Example Photo Entry (`src/content/photos/orion-nebula.md`)

```md
---
title: "Orion Nebula"
category: astrophotography
image: ../../assets/photos/orion-nebula.jpg
thumbAspect: portrait
acquisition: "Captured with a Nikon Z6 and Nikkor Z 24-120mm f/4. Processed in PixInsight and Photoshop."
creative: "Desaturated greens and boosted magentas to emphasize the nebula's emission regions. Minimal noise reduction to preserve star texture."
date: 2024-11-12
---
```

### Example Project Entry (`src/content/projects/astrophotography-guide.md`)

```md
---
title: "Astrophotography Processing Guide"
description: "A step-by-step guide to stacking and processing deep-sky images using PixInsight."
date: 2024-09-01
order: 1
---

## INTRODUCTION

Body text goes here...

## INSTALLATION

1. Step one
2. Step two
```

---

## Step 3: Global CSS (`src/styles/global.css`)

Import self-hosted fonts and define CSS custom properties. Tailwind handles most utility styling, but these base variables ensure typographic consistency throughout.

```css
@import '@fontsource/playfair-display/400.css';
@import '@fontsource/playfair-display/700.css';
@import '@fontsource/dm-sans/300.css';
@import '@fontsource/dm-sans/400.css';
@import '@fontsource/dm-sans/700.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --color-bg: #000000;
  --color-text: #ffffff;
  --color-muted: rgba(255, 255, 255, 0.45);
  --color-card: #121212;
  --gutter: 6px;
}

html, body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
}

/* Utility classes for font families */
.font-serif { font-family: var(--font-serif); }
.font-sans  { font-family: var(--font-sans); }
```

---

## Step 4: Layouts

### `src/layouts/BaseLayout.astro`

The outermost HTML shell. Used by every page.

```astro
---
interface Props {
  title: string;
  description?: string;
}
const { title, description = 'Portfolio' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} — My Name</title>
    {description && <meta name="description" content={description} />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="bg-black text-white min-h-screen">
    <slot />
  </body>
</html>
```

### `src/layouts/PageLayout.astro`

Wraps `BaseLayout` and adds the persistent sticky `<Nav>`. Used by every page **except** the home splash.

```astro
---
import BaseLayout from './BaseLayout.astro';
import Nav from '../components/Nav.astro';

interface Props {
  title: string;
  description?: string;
  activePage?: 'photos' | 'projects' | 'about';
}
const { title, description, activePage } = Astro.props;
---
<BaseLayout title={title} description={description}>
  <Nav activePage={activePage} />
  <main class="pt-16">  <!-- pt-16 offsets the fixed nav height -->
    <slot />
  </main>
</BaseLayout>
```

---

## Step 5: Components

### `src/components/Nav.astro`

The fixed top navigation bar. Present on all pages except the home splash.

**Visual spec:**
- Fixed to top of viewport, full width.
- Background: `#000000` (solid black, no blur).
- Height: ~64px (`h-16`).
- Left side: "My Name" in Playfair Display serif, white, ~18px.
- Immediately after the name: `Photos • Projects • About` in DM Sans, white, ~14px.
- All items are on the same horizontal line on the left.
- The `activePage` prop causes the matching nav word to render `font-bold`, while inactive items render in normal weight.
- No border or shadow — the nav blends into the black page.

```astro
---
interface Props {
  activePage?: 'photos' | 'projects' | 'about';
}
const { activePage } = Astro.props;

const navItems = [
  { label: 'Photos', href: '/photos', key: 'photos' },
  { label: 'Projects', href: '/projects', key: 'projects' },
  { label: 'About', href: '/about', key: 'about' },
] as const;
---
<header class="fixed top-0 left-0 right-0 z-50 bg-black h-16 flex items-center px-8">
  <nav class="flex items-center gap-3 text-sm" style="font-family: var(--font-sans)">
    <a href="/" class="text-white mr-2" style="font-family: var(--font-serif); font-size: 1.1rem;">
      My Name
    </a>
    {navItems.map((item, i) => (
      <>
        {i > 0 && <span class="text-white opacity-50 select-none">•</span>}
        <a
          href={item.href}
          class:list={[
            'text-white hover:opacity-70 transition-opacity duration-200',
            activePage === item.key ? 'font-bold' : 'font-normal',
          ]}
        >
          {item.label}
        </a>
      </>
    ))}
  </nav>
</header>
```

### `src/components/SectionToggle.astro`

The `Photography • Astrophotography` sub-navigation on the gallery page.

**Visual spec:**
- Centered horizontally.
- Bold DM Sans, ~15px.
- Active section: `font-bold`, white `opacity-100`.
- Inactive section: `font-normal`, white `opacity-40`.
- Clicking an inactive item filters the grid **without a page reload** (JS-driven, see gallery page).

```astro
---
// This is a pure HTML component. The active state is toggled by JS on the gallery page.
---
<div class="flex items-center justify-center gap-4 py-10 text-sm font-bold" style="font-family: var(--font-sans)">
  <button
    id="toggle-photography"
    data-category="photography"
    class="text-white transition-opacity duration-200"
  >
    Photography
  </button>
  <span class="text-white opacity-30 select-none">•</span>
  <button
    id="toggle-astro"
    data-category="astrophotography"
    class="text-white opacity-40 font-normal transition-opacity duration-200"
  >
    Astrophotography
  </button>
</div>
```

### `src/components/MasonryGrid.astro`

The 3-column masonry photo grid.

**Visual spec:**
- 3 columns of equal width.
- `gap` between images: `6px` (thin black gutter).
- Images fill their column width; height is determined by native aspect ratio (no forced square cropping).
- No borders, shadows, or rounded corners on images.
- Each image links to its individual photo detail page.
- The grid items have a `data-category` attribute so the JS toggle can show/hide them.

**Implementation approach:** Use **CSS `columns`** (the native CSS multi-column layout). This is the cleanest, zero-JS masonry solution. Images flow into columns naturally.

```astro
---
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';

interface Props {
  photos: CollectionEntry<'photos'>[];
}
const { photos } = Astro.props;
---
<div
  id="masonry-grid"
  style="columns: 3; column-gap: var(--gutter);"
  class="w-full"
>
  {photos.map((photo) => (
    <a
      href={`/photos/${photo.slug}`}
      data-category={photo.data.category}
      style="display: block; break-inside: avoid; margin-bottom: var(--gutter);"
      class="group"
    >
      <Image
        src={photo.data.image}
        alt={photo.data.title}
        widths={[400, 800]}
        sizes="33vw"
        class="w-full block group-hover:opacity-85 transition-opacity duration-300"
        loading="lazy"
      />
    </a>
  ))}
</div>
```

### `src/components/ProjectCard.astro`

A single project card in the projects list.

**Visual spec:**
- Background: `#121212` (very dark grey).
- Rounded corners: `4px` (`rounded-sm`).
- Internal padding: `28px` (`p-7`).
- Width: centered, ~60% of viewport width (`max-w-2xl mx-auto`).
- Vertical margin between cards: `16px` (`mb-4`).
- Project title: bold, white DM Sans, ~16px.
- Description: normal weight, white DM Sans, ~14px, small top margin.
- Hover: subtle background lightens to `#1c1c1c` (`hover:bg-[#1c1c1c]`).
- The entire card is wrapped in an `<a>` tag — clicking anywhere navigates to the project detail page.

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  project: CollectionEntry<'projects'>;
}
const { project } = Astro.props;
---
<a
  href={`/projects/${project.slug}`}
  class="block max-w-2xl mx-auto mb-4 rounded-sm bg-[#121212] hover:bg-[#1c1c1c] transition-colors duration-200 p-7"
  style="font-family: var(--font-sans);"
>
  <p class="font-bold text-white text-base">{project.data.title}</p>
  <p class="text-white text-sm mt-2 opacity-80 leading-relaxed">{project.data.description}</p>
</a>
```

---

## Step 6: Pages

### `src/pages/index.astro` — Home / Splash Page

**Visual spec:**
- Full-viewport black screen. No nav bar.
- Centered both horizontally and vertically (flexbox, `items-center justify-center`, `min-h-screen`).
- "My Name" in Playfair Display, ~60px, bold, white.
- Below it with ~24px gap: `Photos • Projects • About` in DM Sans, 14px, white, separated by ` • `.
- Each nav item is a clickable link.
- No hover effects needed, but a subtle `opacity: 0.7` on hover is acceptable.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const navItems = [
  { label: 'Photos', href: '/photos' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
];
---
<BaseLayout title="Home">
  <div class="min-h-screen flex flex-col items-center justify-center bg-black">
    <h1
      class="text-white font-bold tracking-tight"
      style="font-family: var(--font-serif); font-size: clamp(2.8rem, 6vw, 5rem);"
    >
      My Name
    </h1>
    <nav
      class="flex items-center gap-3 mt-6 text-sm text-white"
      style="font-family: var(--font-sans);"
    >
      {navItems.map((item, i) => (
        <>
          {i > 0 && <span class="opacity-40 select-none">•</span>}
          <a href={item.href} class="hover:opacity-60 transition-opacity duration-200">
            {item.label}
          </a>
        </>
      ))}
    </nav>
  </div>
</BaseLayout>
```

---

### `src/pages/photos/index.astro` — Gallery Page

**Visual spec:**
- Uses `PageLayout` with `activePage="photos"`.
- Below the nav: the `SectionToggle` component, centered, with generous padding.
- Below the toggle: the `MasonryGrid` spanning the full viewport width with ~6px black gutters.
- Default active category: `photography`.

**Data fetching:** Query all photos from the content collection. Sort by date descending so new photos appear first — no manual ordering needed.

**JS toggle logic:** A small `<script>` tag at the bottom handles the toggle. When a category button is clicked:
1. Update button styles (active = bold + full opacity, inactive = normal + reduced opacity).
2. Loop over all `[data-category]` grid items. Show items whose `data-category` matches; hide others using `display: none`.

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import SectionToggle from '../../components/SectionToggle.astro';
import MasonryGrid from '../../components/MasonryGrid.astro';
import { getCollection } from 'astro:content';

const allPhotos = await getCollection('photos');
// Sort newest first
const photos = allPhotos.sort((a, b) => {
  return (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0);
});
---
<PageLayout title="Photos" activePage="photos">
  <SectionToggle />
  <MasonryGrid photos={photos} />
</PageLayout>

<script>
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-category]');
  const items = document.querySelectorAll<HTMLElement>('#masonry-grid [data-category]');

  let activeCategory = 'photography';

  function setCategory(category: string) {
    activeCategory = category;

    buttons.forEach((btn) => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('font-bold', isActive);
      btn.classList.toggle('font-normal', !isActive);
      btn.style.opacity = isActive ? '1' : '0.4';
    });

    items.forEach((item) => {
      item.style.display = item.dataset.category === category ? 'block' : 'none';
    });
  }

  // Initialize
  setCategory(activeCategory);

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.category) setCategory(btn.dataset.category);
    });
  });
</script>
```

---

### `src/pages/photos/[slug].astro` — Individual Photo Detail Page

**Visual spec:**
- Uses `PageLayout` with `activePage="photos"`.
- **Title:** Centered, Playfair Display serif, ~28px, white. Placed below nav with generous top padding (~48px).
- **Primary image:** Centered, `width: clamp(60%, 70%, 80vw)`, large. Portrait images are tall and encourage scrolling.
- **Below the image:** Text content in a centered column matching the image width.
  - Section heading `ACQUISITION`: All-caps, bold DM Sans, ~13px, white, `letter-spacing: 0.12em`.
  - Body text: normal DM Sans, ~15px, white, `line-height: 1.7`.
  - Section heading `CREATIVE CHOICES`: Same style as ACQUISITION.
  - Generous spacing (~40px) between sections.
- **No sidebar.** Everything is stacked vertically and centered.

**Data fetching:** Use `getStaticPaths()` to generate a page for every photo in the collection.

```astro
---
import { getCollection } from 'astro:content';
import { Image } from 'astro:assets';
import PageLayout from '../../layouts/PageLayout.astro';

export async function getStaticPaths() {
  const photos = await getCollection('photos');
  return photos.map((photo) => ({
    params: { slug: photo.slug },
    props: { photo },
  }));
}

const { photo } = Astro.props;
const { title, image, acquisition, creative } = photo.data;
---
<PageLayout title={title} activePage="photos">
  <div class="flex flex-col items-center px-6 pb-24">
    <!-- Title -->
    <h1
      class="text-white text-center mt-12 mb-8"
      style="font-family: var(--font-serif); font-size: clamp(1.6rem, 3vw, 2.2rem);"
    >
      {title}
    </h1>

    <!-- Primary Image -->
    <div style="width: clamp(60%, 70vw, 900px);">
      <Image
        src={image}
        alt={title}
        widths={[800, 1200, 1800]}
        sizes="(max-width: 768px) 90vw, 70vw"
        class="w-full block"
        loading="eager"
      />
    </div>

    <!-- Text Content -->
    <div
      class="mt-12 text-white"
      style="width: clamp(60%, 70vw, 900px); font-family: var(--font-sans);"
    >
      {acquisition && (
        <section class="mb-10">
          <h2
            class="font-bold text-white mb-4"
            style="font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase;"
          >
            Acquisition
          </h2>
          <p class="text-sm leading-7 opacity-90">{acquisition}</p>
        </section>
      )}

      {creative && (
        <section class="mb-10">
          <h2
            class="font-bold text-white mb-4"
            style="font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase;"
          >
            Creative Choices
          </h2>
          <p class="text-sm leading-7 opacity-90">{creative}</p>
        </section>
      )}
    </div>
  </div>
</PageLayout>
```

---

### `src/pages/projects/index.astro` — Projects List Page

**Visual spec:**
- Uses `PageLayout` with `activePage="projects"`.
- **Page title** "Projects": Centered, Playfair Display serif, ~32px, with generous top padding (~60px) and bottom padding (~40px) before the cards.
- **Project cards**: Stacked vertically, centered, `max-width: 672px` (~60% of typical 1080px viewport). Each card is a `ProjectCard` component (see above). Cards are sorted by the `order` frontmatter field.

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '../../layouts/PageLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';

const allProjects = await getCollection('projects');
const projects = allProjects.sort((a, b) => a.data.order - b.data.order);
---
<PageLayout title="Projects" activePage="projects">
  <div class="px-6 pb-24">
    <h1
      class="text-white text-center font-bold mt-14 mb-12"
      style="font-family: var(--font-serif); font-size: clamp(1.8rem, 3vw, 2.4rem);"
    >
      Projects
    </h1>

    <div>
      {projects.map((project) => (
        <ProjectCard project={project} />
      ))}
    </div>
  </div>
</PageLayout>
```

---

### `src/pages/projects/[slug].astro` — Project Detail Page

**Visual spec:**
- Uses `PageLayout` with `activePage="projects"`.
- **Project title**: Centered, Playfair Display serif, ~30px, generous top padding.
- **Content column**: Centered, `max-width: 640px` (~55% of viewport). Left-aligned body text.
- **Section headings** (e.g., `INTRODUCTION`, `INSTALLATION`): All-caps, bold DM Sans, ~12px, `letter-spacing: 0.12em`, generous top margin (~48px) above each to create clear visual section breaks.
- **Body text**: DM Sans 15px, `line-height: 1.8`, opacity 90%.
- **Inline images**: Right-aligned within the content column (`float: right`, `margin-left: 2rem`, `margin-bottom: 1rem`, `max-width: 40%`). A small white caption below each.
- **Numbered lists**: Standard `<ol>` with slight left indent.
- **The page body content** (markdown) is rendered via Astro's `<Content />` component.

The project `.md` files use standard markdown for all body content. Section headings in the file (`## INTRODUCTION`) will be styled globally via CSS targeting the content area.

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '../../layouts/PageLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await project.render();
---
<PageLayout title={project.data.title} activePage="projects">
  <div class="flex flex-col items-center px-6 pb-24">
    <!-- Title -->
    <h1
      class="text-white text-center font-bold mt-12 mb-10"
      style="font-family: var(--font-serif); font-size: clamp(1.6rem, 3vw, 2.2rem);"
    >
      {project.data.title}
    </h1>

    <!-- Content -->
    <div
      class="project-content text-white w-full"
      style="max-width: 640px; font-family: var(--font-sans);"
    >
      <Content />
    </div>
  </div>
</PageLayout>

<style>
  /* Style the rendered markdown content */
  .project-content h2 {
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-top: 3.5rem;
    margin-bottom: 1rem;
    opacity: 1;
  }
  .project-content p {
    font-size: 0.9rem;
    line-height: 1.8;
    margin-bottom: 1.2rem;
    opacity: 0.88;
    text-align: left;
  }
  .project-content ol {
    list-style: decimal;
    padding-left: 1.5rem;
    font-size: 0.9rem;
    line-height: 1.8;
    opacity: 0.88;
  }
  .project-content img {
    float: right;
    max-width: 40%;
    margin-left: 2rem;
    margin-bottom: 1rem;
  }
  .project-content img + em {
    /* caption: image immediately followed by italic text */
    display: block;
    text-align: right;
    font-size: 0.72rem;
    opacity: 0.5;
    margin-top: 0.25rem;
    font-style: normal;
  }
</style>
```

---

### `src/pages/about.astro` — About Page

**Visual spec:**
- Uses `PageLayout` with `activePage="about"`.
- Content is **centered both horizontally and vertically** in the remaining viewport height (use flexbox with `min-h-[calc(100vh-4rem)]` to account for the nav height).
- **Page title** "About": Centered, Playfair Display serif, ~32px. Positioned in the upper-middle area.
- **Bio block**: 2–3 lines of DM Sans, normal weight, white, centered, `line-height: 1.8`, `max-width: 480px`.
- **Contact section**: Positioned ~40px below the bio. A line of text "Want to get in touch:" followed on the next line by a `mailto:` link displaying the email address. Both centered, DM Sans, normal weight, white.
- **No images, no icons, no social links.**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
---
<PageLayout title="About" activePage="about">
  <div
    class="flex flex-col items-center justify-center text-center px-6"
    style="min-height: calc(100vh - 4rem);"
  >
    <h1
      class="text-white font-bold mb-10"
      style="font-family: var(--font-serif); font-size: clamp(1.8rem, 3vw, 2.4rem);"
    >
      About
    </h1>

    <p
      class="text-white text-sm leading-8 mb-10"
      style="font-family: var(--font-sans); max-width: 480px; opacity: 0.88;"
    >
      Brief biography text goes here. A couple of sentences about who you are,
      where you're based, and what you do.
    </p>

    <div style="font-family: var(--font-sans);">
      <p class="text-white text-sm mb-1 opacity-70">Want to get in touch:</p>
      <a
        href="mailto:you@example.com"
        class="text-white text-sm hover:opacity-60 transition-opacity duration-200"
      >
        you@example.com
      </a>
    </div>
  </div>
</PageLayout>
```

---

## Step 7: Image Asset Organization

Place all photo source images in `src/assets/photos/`. Astro's `<Image>` component will automatically:
- Compress to WebP.
- Generate multiple sizes for `srcset`.
- Prevent layout shift (adds `width` and `height` attributes).
- Lazy-load by default.

Recommended naming convention: `kebab-case-descriptive-title.jpg`  
Example: `orion-nebula-rgb.jpg`, `paris-street-rain.jpg`

To add a new photo to the gallery:
1. Drop the image file into `src/assets/photos/`.
2. Create a new `.md` file in `src/content/photos/` with the matching frontmatter.
3. Done. The photo will appear in the gallery automatically, sorted by date.

---

## Step 8: Responsive Behavior (Mobile)

The masonry grid needs to collapse on small screens. Add this to `global.css`:

```css
@media (max-width: 768px) {
  #masonry-grid {
    columns: 1 !important;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  #masonry-grid {
    columns: 2 !important;
  }
}
```

The nav on mobile should still function — since all items fit on one line in a small font, no hamburger menu is needed. If it becomes crowded, use `font-size: 12px` at mobile breakpoints.

---

## Step 9: Deployment

This site generates 100% static HTML. Deploy to **any** of:
- **Netlify** (drag-and-drop `dist/` folder, or connect GitHub for auto-deploy on push)
- **Vercel** (zero-config Astro support)
- **GitHub Pages** (add `base` path in `astro.config.mjs` if deploying to a sub-path)

Build command: `astro build`  
Output directory: `dist/`

---

## Expansion Checklist

| To do this... | You only need to... |
|---|---|
| Add a new photo | Drop image in `src/assets/photos/`, create `.md` in `src/content/photos/` |
| Add a new project | Create `.md` in `src/content/projects/` |
| Add a new gallery category | Add the new value to the `category` enum in `config.ts`, add a button to `SectionToggle.astro`, and update the JS toggle logic |
| Change your name | Find/replace `My Name` in `Nav.astro` and `index.astro` |
| Change the email | Update `about.astro` |
| Reorder projects | Change the `order` frontmatter field in the relevant `.md` files |
