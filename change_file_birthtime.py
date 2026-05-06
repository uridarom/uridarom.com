import subprocess
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
PHOTOS_DIR = BASE_DIR / "src" / "assets" / "photos" / "photography"
ASTRO_PHOTOS_DIR = BASE_DIR / "src" / "assets" / "photos" / "astrophotography"

def change_creation_time(file_path, new_time):
    """
    Changes the creation time of a file on macOS.
    new_time format: "MM/DD/YYYY HH:MM:SS"
    """
    # SetFile is part of Xcode Command Line Tools
    command = ['SetFile', '-d', new_time, file_path]
    subprocess.call(command)

# Example Usage
file_path = ASTRO_PHOTOS_DIR / 'Veil Nebula.jpg'
# Set new creation date to: Jan 1 2024, 12:00:00
change_creation_time(file_path, "08/20/2023 12:00:00")