import fs from 'node:fs';
import path from 'node:path';
import exifr from 'exifr';
import matter from 'gray-matter';

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.tiff']);
const ROOTS = [
  { dir: 'src/assets/photos/photography',     category: 'photography' },
  { dir: 'src/assets/photos/astrophotography', category: 'astrophotography' },
];
const SIDECAR_DIR = 'src/content/photos';

const NAMES: Record<string, string> = {
  '105.0 mm f/2.8': 'AF Micro NIKKOR 105mm f/2.8',
  '135.0 mm f/2.0': 'Rokinon 135mm f/2',
  'NIKON Z 6': 'Nikon Z6',
  'iPhone 17 Pro back triple camera 16.891mm f/2.8': '4x lens',
};

function formatExposure(n: number): string {
  if (n < 1) return `1/${Math.round(1 / n)}s`;
  return `${n}s`;
}

function buildAcquisition(exif: Record<string, unknown> | null | undefined): string | undefined {
  if (!exif) return undefined;
  const { FNumber, ExposureTime, FocalLength, Model, LensModel, ISO } = exif as {
    FNumber?: number;
    ExposureTime?: number;
    FocalLength?: number;
    Model?: string;
    LensModel?: string;
    ISO?: number;
  };
  if (FNumber == null || ExposureTime == null || FocalLength == null) return undefined;

  const model = NAMES[Model ?? ''] ?? Model ?? '';
  const lens  = NAMES[LensModel ?? ''] ?? LensModel ?? '';
  const isIPhone = model.includes('iPhone');

  const line1 = `Taken with ${model} ${isIPhone ? 'using the' : 'and'} ${lens}.`;
  const focalSuffix = isIPhone ? '.' : ` @${String(FocalLength)}mm.`;
  const line2 = `Shot at f/${String(FNumber)} aperture, ${formatExposure(ExposureTime)} exposure, and ISO ${ISO}${focalSuffix}`;

  return `${line1}\n${line2}`;
}

function relativeImagePath(absImagePath: string): string {
  const contentBase = path.resolve(SIDECAR_DIR);
  return path.relative(contentBase, absImagePath).split(path.sep).join('/');
}

async function safeParseExif(filePath: string): Promise<Record<string, unknown> | null> {
  try {
    const result = await exifr.parse(filePath, { tiff: true, exif: true, ifd0: true });
    return result ?? null;
  } catch {
    return null;
  }
}

export function photosLoader() {
  return {
    name: 'photos-from-assets',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async load(context: any) {
      const { store, parseData, generateDigest, watcher } = context;
      store.clear();

      const sidecarDir = path.resolve(SIDECAR_DIR);

      // Warn about orphan sidecars
      if (fs.existsSync(sidecarDir)) {
        const allStems = new Set<string>();
        for (const { dir } of ROOTS) {
          const absDir = path.resolve(dir);
          if (!fs.existsSync(absDir)) continue;
          for (const file of fs.readdirSync(absDir)) {
            const ext = path.extname(file).toLowerCase();
            if (IMG_EXT.has(ext)) allStems.add(path.basename(file, path.extname(file)));
          }
        }
        for (const f of fs.readdirSync(sidecarDir)) {
          if (!f.endsWith('.md')) continue;
          const stem = path.basename(f, '.md');
          if (!allStems.has(stem)) {
            console.warn(`[photos-loader] Orphan sidecar with no matching image: ${f}`);
          }
        }
      }

      for (const { dir, category } of ROOTS) {
        const absDir = path.resolve(dir);
        if (!fs.existsSync(absDir)) continue;

        for (const file of fs.readdirSync(absDir).sort()) {
          const ext = path.extname(file).toLowerCase();
          if (!IMG_EXT.has(ext)) continue;

          const absPath = path.join(absDir, file);
          const stem = path.basename(file, path.extname(file));

          const exif = await safeParseExif(absPath);

          let date: Date;
          if (exif?.DateTimeOriginal instanceof Date) {
            date = exif.DateTimeOriginal as Date;
          } else {
            const stat = fs.statSync(absPath);
            date = stat.birthtime.getTime() > 0 ? stat.birthtime : stat.mtime;
          }

          const acquisition = category === 'photography' ? buildAcquisition(exif) : undefined;

          const sidecarPath = path.join(sidecarDir, `${stem}.md`);
          let titleOverride: string | undefined;
          let dateOverride: Date | undefined;
          let body: string | undefined;

          if (fs.existsSync(sidecarPath)) {
            const raw = fs.readFileSync(sidecarPath, 'utf8');
            const fm = matter(raw);
            if (typeof fm.data.title === 'string') titleOverride = fm.data.title;
            if (fm.data.date) dateOverride = new Date(fm.data.date);
            if (fm.content && fm.content.trim().length > 0) body = fm.content.trim();
          }

          const data = await parseData({
            id: stem,
            data: {
              title: titleOverride ?? stem,
              category,
              image: relativeImagePath(absPath),
              date: dateOverride ?? date,
              acquisition,
              body,
            },
          });

          store.set({
            id: stem,
            data,
            digest: generateDigest(data),
            // filePath anchors the relative image path resolution to src/content/photos/
            filePath: path.relative(process.cwd(), path.join(sidecarDir, `${stem}.md`)),
          });
        }
      }

      watcher?.add(path.resolve('src/assets/photos'));
      watcher?.add(path.resolve(SIDECAR_DIR));
    },
  };
}
