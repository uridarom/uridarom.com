import { c as createComponent } from './BaseLayout_l75tgjd0.mjs';
import 'piccolore';
import { c as createRenderInstruction, m as maybeRenderHead, a as renderTemplate, b as addAttribute, r as renderComponent } from './prerender_BGNN_zFD.mjs';
import { $ as $$PageLayout } from './PageLayout_BhjObdfQ.mjs';
import 'clsx';
import { $ as $$Image } from './_astro_assets_DPWpUUgA.mjs';
import { g as getCollection } from './_astro_content_BaXwUNik.mjs';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$SectionToggle = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$SectionToggle;
  return renderTemplate`${maybeRenderHead()}<div class="flex items-center justify-center gap-4 py-10 text-sm font-bold"> <button id="toggle-photography" data-category="photography" class="text-white transition-opacity duration-200">
Photography
</button> <span class="text-white opacity-30 select-none">•</span> <button id="toggle-astro" data-category="astrophotography" class="text-white opacity-40 font-normal transition-opacity duration-200">
Astrophotography
</button> </div>`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/components/SectionToggle.astro", void 0);

const $$MasonryGrid = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$MasonryGrid;
  const { photos } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div id="masonry-grid" style="columns: 3; column-gap: 6px;" class="w-full"> ${photos.map((photo) => renderTemplate`<a${addAttribute(`/photos/${photo.slug}`, "href")}${addAttribute(photo.data.category, "data-category")} style="display: block; break-inside: avoid; margin-bottom: 6px;" class="group"> ${renderComponent($$result, "Image", $$Image, { "src": photo.data.image, "alt": photo.data.title, "widths": [400, 800], "sizes": "33vw", "class": "w-full block group-hover:opacity-85 transition-opacity duration-300", "loading": "lazy" })} </a>`)} </div>`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/components/MasonryGrid.astro", void 0);

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allPhotos = await getCollection("photos");
  const photos = allPhotos.sort((a, b) => {
    return (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0);
  });
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": "Photos", "activePage": "photos" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "SectionToggle", $$SectionToggle, {})} ${renderComponent($$result2, "MasonryGrid", $$MasonryGrid, { "photos": photos })} ` })} ${renderScript($$result, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/photos/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/photos/index.astro", void 0);

const $$file = "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/photos/index.astro";
const $$url = "/photos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
