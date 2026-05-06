#!/usr/bin/env python3
"""Generate markdown files for photos from EXIF metadata."""
import os
import datetime
import re
from pathlib import Path

import exifread

BASE_DIR = Path(__file__).parent
PHOTOS_DIR = BASE_DIR / "src" / "assets" / "photos" / "photography"
ASTRO_PHOTOS_DIR = BASE_DIR / "src" / "assets" / "photos" / "astrophotography"
CONTENT_DIR = BASE_DIR / "src" / "content" / "photos"


def parse_exif(filepath: Path) -> dict | None:
    """Read EXIF data from an image file."""
    file_date = str(datetime.datetime.fromtimestamp(os.stat(filepath).st_birthtime)).strip()
    try:
        tags = exifread.process_file(open(filepath, "rb"))
    except Exception:
        return {"date_orig":file_date}

    model = str(tags.get("Image Model", "")).strip()
    exposure = str(tags.get("EXIF ExposureTime", "")).strip()
    aperture = str(tags.get("EXIF FNumber", "")).strip()
    focal = str(tags.get("EXIF FocalLength", "")).strip()
    date_orig = str(tags.get("EXIF DateTimeOriginal", "")).strip()
    date_orig = date_orig if date_orig else file_date
    lens = str(tags.get("EXIF LensModel", "")).strip()
    iso = str(tags.get("EXIF ISOSpeedRatings", "")).strip()

    return {
        "model": model,
        "exposure": exposure,
        "aperture": aperture,
        "focal": focal,
        "date_orig": date_orig,
        "lens": lens,
        "iso": iso
    }


def format_date(date_orig: str) -> str:
    """Convert 'YYYY:MM:DD HH:MM:SS' to 'YYYY-MM-DD'."""
    print(date_orig)
    match = re.match(r"(\d+)\D+(\d+)\D+(\d+)", date_orig)
    if not match:
        return ""
    return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"


def format_exposure(exposure: str) -> str:
    """Format exposure time: '3' -> '3s', '1/640' -> '1/640s'."""
    if "/" in exposure:
        return f"{exposure}s"
    return f"{exposure}s"


def build_acquisition(exif: dict) -> str | None:
    """Build the two-line acquisition text from EXIF data."""
    if not exif["aperture"] or not exif["exposure"] or not exif["focal"]:
        return None
    
    NAMES = {
        "105.0 mm f/2.8":"AF Micro NIKKOR 105mm f/2.8",
        "NIKKOR Z 24-120mm f/4 S":"NIKKOR Z 24-120mm f/4 S",
        "135.0 mm f/2.0":"Rokinon 135mm f/2",
        "NIKON Z 6":"Nikon Z6"
    }

    # First line: device check
    line1 = f"Taken with {NAMES[exif['model']]} and {NAMES[exif['lens']]}."
    aperture_components = [int(num) for num in (exif['aperture']).split("/")]
    aperture = aperture_components[0] if len(aperture_components) == 1 else aperture_components[0]/aperture_components[1]
    line2 = f"Shot at f/{aperture} aperture, {format_exposure(exif['exposure'])} exposure, and ISO {exif['iso']} @ {exif['focal']}mm."

    return f"{line1}\n{line2}"


def main():
    for photo_file in sorted(PHOTOS_DIR.iterdir()):
        if photo_file.suffix.lower() not in (".jpg", ".jpeg", ".png", ".tiff"):
            continue

        stem = photo_file.stem  # e.g. "2026.5.2_Sunset-1" or "milkyway"
        md_filename = stem + ".md"
        md_path = CONTENT_DIR / md_filename
        image_relpath = f"../../assets/photos/photography/{photo_file.name}"

        exif = parse_exif(photo_file)

        date = format_date(exif["date_orig"])
        acquisition = build_acquisition(exif) if exif else None

        md_content = f"---\ntitle: \"{stem}\"\ncategory: photography\nimage: {image_relpath}\n"
        if date:
            md_content += f"date: {date}\n"
        if acquisition:
            md_content += "acquisition: |\n" + "\n".join(f"  {line}" for line in acquisition.split("\n")) + "\n"
        md_content += "---\n"

        if md_path.exists():
            continue

        md_path.write_text(md_content)
        print(f"Written: {md_path}")


    for photo_file in sorted(ASTRO_PHOTOS_DIR.iterdir()):
        if photo_file.suffix.lower() not in (".jpg", ".jpeg", ".png", ".tiff"):
            continue

        stem = photo_file.stem  # e.g. "2026.5.2_Sunset-1" or "milkyway"
        md_filename = stem + ".md"
        md_path = CONTENT_DIR / md_filename
        image_relpath = f"../../assets/photos/astrophotography/{photo_file.name}"

        if md_path.exists():
            continue
        
        exif = parse_exif(photo_file)
        print(exif, stem)

        md_content = f"---\ntitle: \"{stem}\"\ncategory: astrophotography\nimage: {image_relpath}\n"
        date = format_date(exif["date_orig"])
        md_content += f"date: {date}\n"
        md_content += "---\n"


        md_path.write_text(md_content)
        print(f"Written: {md_path}") 


if __name__ == "__main__":
    main()
