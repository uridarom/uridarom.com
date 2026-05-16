A personal website for featuring my photography and personal coding projects.
View the website at [https://uridarom.com](https://uridarom.com)

For more details on how I built this website, read [the project page](https://uridarom.com/projects/website/).

## Adding Photos

Drop an image under `src/assets/photos/photography/` or `src/assets/photos/astrophotography/` and the next build automatically produces a gallery entry and individual photo page. No other action is required.

- **Title** defaults to the filename stem (e.g. `Balcony.jpg` → "Balcony").
- **Date** is read from EXIF `DateTimeOriginal`. If absent, the file's creation time (birthtime) is used. Use `change_file_birthtime.py` to manually set a birthtime for images that lack EXIF dates.
- **Acquisition** metadata (camera, lens, settings) is derived from EXIF automatically for photography images. Astrophotography images never show an acquisition section.

### Optional sidecar files

To override the title or date, or to add a written description, create `src/content/photos/<image-stem>.md`:

```markdown
---
# All frontmatter fields are optional.
title: "Optional title override"
date: 2024-09-12
---

## OVERVIEW

Free-form markdown writeup rendered below the Acquisition section on the
individual photo page, at the same width and font size as the acquisition text.
```

Rules:
- The filename must match the image stem exactly (e.g. `Balcony.md` for `Balcony.jpg`).
- `title` and `date` are the only frontmatter fields that take effect; `category`, `image`, and `acquisition` are always derived from the image and are ignored if present.
- If the body is empty, no writeup section is rendered.
- A sidecar with no matching image is ignored (a warning is printed during build).
