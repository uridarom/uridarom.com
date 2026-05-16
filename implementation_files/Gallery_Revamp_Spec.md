# Photo Gallery Revamp — Implementation Spec Sheet

## Goal

Remove the dependency on `generate_photo_md.py`. Instead, the Astro build should enumerate the image files under `src/assets/photos/photography` and `src/assets/photos/astrophotography` directly, derive title/date/acquisition metadata from EXIF + filesystem birthtime at build time, and produce individual photo pages that are **visually identical** to the pages currently produced from the auto-generated `.md` files in `src/content/photos`.

After this change, files in `src/content/photos/` become **optional**. When one exists for a given image, it (a) may override `title` and/or `date`, and (b) may contain a markdown writeup body that is rendered on the individual photo page underneath the acquisition section, styled to match the acquisition text.

The site builder should be able to add or delete an image file under the two asset folders and have a correct photo gallery and individual photo page show up on the next build without any other action.

---

## 1. High-Level Architecture

There are two reasonable implementation paths. **Use Path A** unless something blocks it.

### Path A (preferred): Custom content collection loader

Replace the `glob({...})` loader for the `photos` collection in `src/content.config.ts` with a custom loader (an object with a `name` and a `load(context)` method, per Astro's Content Loader API). The loader:

1. Scans both image asset directories.
2. For each image, parses EXIF + birthtime to build the same fields the Python script produced (`title`, `category`, `image`, `date`, `acquisition`).
3. Checks for a sidecar `.md` file in `src/content/photos/<image-stem>.md`. If present, parses its frontmatter and body; frontmatter `title`/`date` override the derived values, and the body is stored as a string field (`body`) on the entry data.
4. Stores entries into the collection store via `context.store.set(...)`.

This keeps the `getCollection('photos')` API used by `src/pages/photos/index.astro` and `src/pages/photos/[slug].astro` unchanged — only the source of entries changes.

### Path B (fallback): Build-time `.md` regeneration

If Path A turns out to be impractical (e.g. the EXIF library does not work in the loader environment), translate the Python script into a Node script and invoke it from an Astro integration `astro:build:start` hook (or as a `prebuild` npm script). Auto-generated `.md` files are written only if they do not already exist for a given image; existing sidecar `.md` files are left alone and may contain overrides + a writeup body. This requires changing the schema so that all fields except `title`/`image` are optional and adding a `body` field, plus a small merging step.

**Prefer Path A.** The rest of this spec assumes Path A.

---

## 2. Dependencies

Add an EXIF parser that works in Node. Recommended: `exifr` (fast, zero-deps, supports the tags we need). Install:

```
npm install exifr
```

No other new runtime dependencies are required. Astro already supports image imports via `astro:assets`.

---

## 3. EXIF / Metadata Extraction — Mirror The Python Script Exactly

The output of the new loader must produce the same field values that `generate_photo_md.py` currently writes into `.md` frontmatter, so that downstream rendering is unchanged. The Python reference is `generate_photo_md.py`; mirror its behavior precisely.

### 3.1 Per-image fields to derive

For every image file in either asset directory with extension `.jpg`, `.jpeg`, `.png`, or `.tiff` (case-insensitive), derive:

| Field         | Source                                                                                      |
|---------------|---------------------------------------------------------------------------------------------|
| `title`       | The file stem (filename without extension), e.g. `A Mineral Moon`.                          |
| `category`    | `"photography"` if file is under `.../photography/`, `"astrophotography"` if under `.../astrophotography/`. |
| `image`       | Astro `ImageMetadata` reference to the file (see §4).                                       |
| `date`        | EXIF `DateTimeOriginal` if present, else the file's birthtime (creation time). Formatted to a JS `Date`. |
| `acquisition` | Two-line string built from EXIF, format defined below. Omit entirely for astrophotography (matches current behavior — the current script does not emit `acquisition` for astro photos). |

### 3.2 EXIF tags to read

Using `exifr.parse(filePath, { tiff: true, exif: true, ifd0: true })` (or equivalent options that include both IFD0 and EXIF IFDs), read:

- `Model` (IFD0) → camera model
- `ExposureTime` (EXIF) — may be returned by `exifr` as a number (e.g. `0.0015625`). The Python script kept the raw `"1/640"` form. **For display, format as `1/<denominator>s` when the value is `< 1`, otherwise `<value>s`.** Round the inverted denominator to the nearest integer to match how the EXIF value was originally written.
- `FNumber` (EXIF) → aperture as a number (e.g. `2.8`)
- `FocalLength` (EXIF) → focal length in mm as a number
- `DateTimeOriginal` (EXIF) → date
- `LensModel` (EXIF) → lens string
- `ISO` (EXIF) → ISO integer

If `FNumber`, `ExposureTime`, or `FocalLength` is missing, set `acquisition` to `undefined` (the photo's page will then simply not show an Acquisition section, matching today's behavior — `generate_photo_md.py` returns `None` from `build_acquisition` when those fields are missing).

### 3.3 Date formatting

- If `DateTimeOriginal` is present, parse it (`exifr` returns a `Date` directly).
- Else, use `fs.statSync(filePath).birthtime` (or `birthtimeMs`). On platforms where `birthtime` is unavailable, fall back to `mtime`. The Python script uses `st_birthtime`.
- Store on the entry as a JS `Date` (the existing schema declares `date: z.date().optional()` and downstream code calls `photo.data.date?.getTime()` and `.toISOString()`).

### 3.4 Acquisition string

Reproduce `build_acquisition()` from the Python script exactly. The output is a two-line string (newline-separated, **not** `<br>`) of the form:

```
Taken with {modelDisplayName} {connector} {lensDisplayName}.
Shot at f/{aperture} aperture, {exposure}s exposure, and ISO {iso}{focalSuffix}.
```

Where:

- **Name remapping table** (must match the Python `NAMES` dict character-for-character):

  ```
  "105.0 mm f/2.8"                              -> "AF Micro NIKKOR 105mm f/2.8"
  "135.0 mm f/2.0"                              -> "Rokinon 135mm f/2"
  "NIKON Z 6"                                   -> "Nikon Z6"
  "iPhone 17 Pro back triple camera 16.891mm f/2.8" -> "4x lens"
  ```

  Apply the lookup to both `model` and `lens`. If a value is not in the table, use the raw EXIF string.

- **Connector:** `"and"` normally, but `"using the"` if the (remapped) model string contains `"iPhone"`. Note this check is on the *remapped* model — match the Python script, which checks the post-remap `model`.

- **Aperture display:** numeric, integer if a whole number, otherwise the float as-is (e.g. `f/2.8`, `f/4`). `exifr` returns `FNumber` already as a JS number, so this is `Number.isInteger(n) ? String(n) : String(n)` — i.e. no special padding. Confirm against an existing `.md` file to verify trailing-zero behavior matches.

- **Exposure display:** see §3.2 — `1/640s` style for sub-second, `<n>s` for whole seconds.

- **Focal length suffix:** if the (remapped) model contains `"iPhone"`, suffix is just `"."`. Otherwise it is ` @<focal>mm.` where `<focal>` is integer if whole, else the float. Example: ` @135mm.`, ` @16.891mm.`.

After implementation, regenerate the acquisition string for a handful of existing photos and diff against the strings currently stored in the corresponding `src/content/photos/*.md` files. They must match byte-for-byte (modulo trailing newline).

### 3.5 No acquisition for astrophotography

The Python script intentionally does not call `build_acquisition` for files under `astrophotography/`. Preserve that behavior: even if EXIF data is present, do not attach an `acquisition` field to astro entries. The individual page already conditionally renders the section, so the absence is enough.

---

## 4. Image References

Individual photo pages and the masonry grid both pass `photo.data.image` to Astro's `<Image>` component, which requires an `ImageMetadata` object (the result of an `import` from `astro:assets`), not a raw string path.

Inside a custom loader, the recommended approach is:

1. Set `image` in the **schema** to `z.string()` (a relative path string from the content base, like `../../assets/photos/photography/Balcony.jpg`).
2. Use `({ image }) => z.object({ image: image() ... })` in the schema — the `image()` helper, when the schema is defined via the function form of `defineCollection`, transforms the string into `ImageMetadata` automatically at validation time, given the path is relative to the content base.

This is the same mechanism already used in `src/content.config.ts`. Keep the schema definition function-style:

```ts
schema: ({ image }) => z.object({
  title: z.string(),
  category: z.string().optional(),
  image: image(),                  // now required, since every entry is image-backed
  date: z.date().optional(),
  acquisition: z.string().optional(),
  creative: z.string().optional(), // keep — referenced by [slug].astro
  body: z.string().optional(),     // markdown source from optional sidecar .md
}),
```

In the loader, set `image` to a path **relative to the content base** that mirrors what today's `.md` files store, e.g. `../../assets/photos/photography/Balcony.jpg`. The existing files use this form (see `src/content/photos/A Mineral Moon.md`), so re-using the same string keeps the `image()` resolution behavior identical.

If `image()` resolution from inside a loader proves not to work (Astro versions differ here), the safe fallback is to do dynamic `import()` of the file inside the page (`src/pages/photos/[slug].astro`) using a path stored on the entry. Try the schema-coercion path first.

---

## 5. Custom Loader Implementation

Create `src/loaders/photos.ts`. Sketch:

```ts
import fs from 'node:fs';
import path from 'node:path';
import exifr from 'exifr';
import matter from 'gray-matter'; // see note below

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.tiff']);
const ROOTS = [
  { dir: 'src/assets/photos/photography',     category: 'photography' },
  { dir: 'src/assets/photos/astrophotography', category: 'astrophotography' },
];
const SIDECAR_DIR = 'src/content/photos';

export function photosLoader() {
  return {
    name: 'photos-from-assets',
    async load({ store, parseData, generateDigest, watcher }) {
      store.clear();

      for (const { dir, category } of ROOTS) {
        const absDir = path.resolve(dir);
        if (!fs.existsSync(absDir)) continue;

        for (const file of fs.readdirSync(absDir).sort()) {
          const ext = path.extname(file).toLowerCase();
          if (!IMG_EXT.has(ext)) continue;

          const absPath = path.join(absDir, file);
          const stem    = path.basename(file, ext);
          const exif    = await safeParseExif(absPath);
          const date    = exif?.DateTimeOriginal ?? fs.statSync(absPath).birthtime;
          const acquisition = category === 'photography'
            ? buildAcquisition(exif)
            : undefined;

          // Sidecar overrides
          const sidecarPath = path.resolve(SIDECAR_DIR, `${stem}.md`);
          let titleOverride: string | undefined;
          let dateOverride: Date | undefined;
          let body: string | undefined;
          if (fs.existsSync(sidecarPath)) {
            const raw  = fs.readFileSync(sidecarPath, 'utf8');
            const fm   = matter(raw);
            if (typeof fm.data.title === 'string') titleOverride = fm.data.title;
            if (fm.data.date) dateOverride = new Date(fm.data.date);
            if (fm.content && fm.content.trim().length > 0) body = fm.content;
          }

          const data = await parseData({
            id: stem,
            data: {
              title: titleOverride ?? stem,
              category,
              image: relativeImagePath(absPath), // see §4
              date:  dateOverride ?? date,
              acquisition,
              body,
            },
          });

          store.set({
            id: stem,
            data,
            digest: generateDigest(data),
            // No `body` rendering needed if we render body manually in [slug].astro
            // (see §6). If we instead want astro:content `render()` to work:
            //   rendered: { html: await markdownToHtml(body) } — but the simpler
            //   approach below (raw string + remark-via-render) is fine.
          });
        }
      }

      // Dev-mode HMR
      watcher?.add(path.resolve('src/assets/photos'));
      watcher?.add(path.resolve(SIDECAR_DIR));
    },
  };
}
```

Notes:

- `gray-matter` is the easiest way to split frontmatter from body. Astro already depends on it transitively; install it directly (`npm install gray-matter`) to make the dependency explicit.
- `relativeImagePath` must return the path as a string **relative to the content base** (e.g. `../../assets/photos/photography/Balcony.jpg`) so the schema's `image()` coercion resolves it correctly. Compute it once; do not hardcode.
- In `src/content.config.ts`, wire the loader:

  ```ts
  import { photosLoader } from './loaders/photos';
  const photos = defineCollection({
    schema: /* as in §4 */,
    loader: photosLoader(),
  });
  ```

- Remove the existing `glob({ base: './src/content/photos', pattern: '**/*.md' })` for `photos`.

---

## 6. Rendering Optional Markdown Bodies

The individual photo page (`src/pages/photos/[slug].astro`) currently does not render a markdown body. Add support so that, when `photo.data.body` is non-empty, its markdown is rendered **below the acquisition section** with the same text styling.

There are two reasonable implementations:

### 6.1 Render at runtime in the page (simpler — use this)

1. Add `marked` (or `remark` / `markdown-it`) as a dependency: `npm install marked`.
2. In the frontmatter of `src/pages/photos/[slug].astro`, after the existing destructure:

   ```ts
   import { marked } from 'marked';
   const bodyHtml = photo.data.body ? marked.parse(photo.data.body) : null;
   ```

3. In the JSX, immediately after the existing `{acquisition && ( ... )}` block and before `{creative && ( ... )}`, add:

   ```astro
   {bodyHtml && (
     <section class="mb-10 photo-writeup" set:html={bodyHtml} />
   )}
   ```

4. Add CSS so the writeup matches the acquisition paragraph: same color, same `font-size: 1rem`, same `leading-5`, `opacity-90`, `white-space: pre-line`. Inside the `<style>` block in `[slug].astro`:

   ```css
   :global(.photo-writeup p) {
     font-size: 1rem;
     line-height: 1.25rem; /* matches leading-5 */
     opacity: 0.9;
     margin-bottom: 1rem;
     white-space: pre-line;
   }
   :global(.photo-writeup h2) {
     font-weight: 700;
     font-size: clamp(1.2rem, 3vw, 1.3rem);
     text-transform: uppercase;
     margin-bottom: 1rem;
     color: white;
   }
   :global(.photo-writeup img) {
     display: block;
     margin: 1rem auto;
     max-width: 100%;
   }
   @media (max-width: 600px) {
     :global(.photo-writeup p) { font-size: 0.8rem; }
   }
   ```

   These rules reproduce the inline styles on the existing `<p>` for `acquisition` (see `src/pages/photos/[slug].astro:83`) and the `<h2>` style above it, so any `##` headings in the markdown blend in with the "ACQUISITION" heading visually.

5. The writeup must occupy the **same width** as the acquisition text. The acquisition is rendered inside `.photo-content` which has `width: clamp(60%, 70vw, 900px)`. Because the new `<section>` is a sibling inside the same `.photo-content` block, it will inherit this width automatically — no extra wrapper needed. Verify with a test image and writeup.

### 6.2 Render via Astro content `render()` (alternative)

If you want server-rendered Markdown via the standard content API (`const { Content } = await render(photo)`), the loader has to populate the `rendered` field on each entry. This requires running an MD compiler inside the loader and is more code for no visual difference. **Skip unless 6.1 produces visible issues.**

---

## 7. Sidecar `.md` File Format (for the site builder)

Document this format in `README.md` (and reflect it via the schema). A sidecar file is **entirely optional**; the build must work for every image regardless of whether one exists.

```markdown
---
# All frontmatter fields are optional. Omit any you don't want to override.
title: "Optional title override (string)"
date:  2024-09-12     # Optional ISO date override
---

## OVERVIEW

Free-form markdown writeup. Formatted the same way as the project pages
(see src/content/projects/*.md). This body is rendered on the photo's
individual page, immediately below the Acquisition section, at the same
width and base font size as the Acquisition text.
```

Hard rules:

- The filename **must** be `<image-stem>.md` (the same stem as the image filename). For example, for `src/assets/photos/photography/Balcony.jpg`, the sidecar is `src/content/photos/Balcony.md`.
- `title` and `date` are both optional. If absent, the image stem is used as the title and EXIF/birthtime is used as the date.
- The body may be empty. If empty, no writeup section is rendered.
- `category`, `image`, and `acquisition` should **not** be set in sidecar frontmatter — they are derived from the image. If present, the loader should ignore them (do not let them override).
- A `.md` file in `src/content/photos/` that does not correspond to any image **must not** produce a phantom entry. The loader is image-driven; sidecars are looked up by image stem. Optionally, the loader can warn (`console.warn`) if it finds an orphan sidecar.

---

## 8. Gallery Sort & Display

`src/pages/photos/index.astro` currently sorts by `photo.data.date` and renders the masonry grid with `photo.data.image`. No changes needed there — as long as the loader correctly populates `date` (with overrides applied) and `image`, sort order and grid display will be correct.

Verify after implementation:

- A photo with a sidecar `date:` override appears in its overridden position, not its EXIF position.
- A photo with a sidecar `title:` override displays the overridden title on both the masonry grid alt text and the individual page heading. (The grid's visible UI does not show titles; it's still worth verifying alt text.)

---

## 9. Cleanup

After Path A is in place and verified:

1. Delete every auto-generated `.md` file in `src/content/photos/` that contains no body and no overrides (i.e. that exists only to provide title/category/image/date/acquisition fields that the loader now derives). The simplest test: open the file; if it is just frontmatter with `title` equal to the image stem and no body, delete it. Keep sidecars that contain a body or non-default `title`/`date`.
2. Delete `generate_photo_md.py` and remove any documentation that references it. Also delete `change_file_birthtime.py` if it was only used to feed the Python script's birthtime logic — check first.
3. Update `README.md` to describe the new flow: "Add an image under `src/assets/photos/{photography,astrophotography}` and (optionally) drop a `<stem>.md` writeup into `src/content/photos`. The next build does the rest."

Do **not** delete `src/content/photos/` itself — it remains the home for optional sidecars and is referenced by `src/content.config.ts`.

---

## 10. Acceptance Criteria

The implementation is complete when **all** of the following hold:

1. `npm run build` succeeds with `src/content/photos/` containing **zero** `.md` files. Every image under both asset directories produces an individual page at `/photos/<image-stem>/`, and the masonry grid lists every image.
2. For an image that previously had an auto-generated `.md`, the rendered individual page is **pixel-identical** to the page rendered before this change. Verify by diffing screenshots (or HTML output) of at least:
   - One photography image with full EXIF (e.g. `Balcony.jpg`).
   - One astrophotography image (no acquisition section, e.g. `A Mineral Moon.jpeg`).
   - One image whose EXIF is missing aperture/shutter/focal length (so no acquisition section).
3. Adding a new image file to either asset folder and rebuilding produces a new page and grid entry, with date derived from EXIF or birthtime, with no other manual action.
4. Adding a sidecar `<stem>.md` with only `title:` set in the frontmatter and no body correctly overrides the displayed title on the individual page and changes the alt text on the grid.
5. Adding a sidecar with only `date:` set correctly re-positions the photo in the chronological sort and changes the date shown under the title on the individual page.
6. Adding a sidecar with a markdown body renders that body on the individual page, below the Acquisition section, at the same width as the acquisition paragraph and at the same base font size (1rem desktop / 0.8rem on screens ≤600px). Headings (`##`) in the body render in the same uppercase bold style as the "ACQUISITION" heading.
7. The site builder can combine all three — override title, override date, and add a writeup — in a single sidecar file, and all three take effect.
8. The Python script `generate_photo_md.py` is no longer required for any part of the build and has been removed.

---

## 11. Suggested Implementation Order

1. Install `exifr`, `gray-matter`, `marked`.
2. Write `src/loaders/photos.ts` with EXIF parsing and the acquisition-string builder. Unit-test the acquisition builder against 3–5 existing `.md` files to confirm byte-equal output.
3. Wire the loader into `src/content.config.ts`; update the schema to add `body`.
4. Delete the auto-generated `.md` files (keep one or two with bodies if you've already added them for testing).
5. Run `npm run build`; compare the rendered `/photos/<slug>/` pages against the pre-change versions (use `git stash` + screenshot, or build into two `dist/` directories and diff).
6. Update `src/pages/photos/[slug].astro` to render `data.body` as markdown below the acquisition section, with the CSS in §6.1.
7. Add or create a sidecar with a writeup for at least one image and verify rendering width/size matches the acquisition section.
8. Delete `generate_photo_md.py` and update `README.md`.
