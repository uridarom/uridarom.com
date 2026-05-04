import { c as createComponent } from './BaseLayout_BCE-YsCO.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_CIZgCjy4.mjs';
import { g as getCollection } from './_astro_content_D7VcUCQp.mjs';
import { $ as $$Image } from './_astro_assets_Dq4L9m5o.mjs';
import { $ as $$PageLayout } from './PageLayout_2cu5f7po.mjs';

async function getStaticPaths() {
  const photos = await getCollection("photos");
  return photos.map((photo) => ({
    params: { slug: photo.slug },
    props: { photo }
  }));
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { photo } = Astro2.props;
  const { title, image, acquisition, creative } = photo.data;
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": title, "activePage": "photos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center px-6 pb-24"> <!-- Title --> <h1 class="text-white text-center mt-12 mb-8" style="font-family: var(--font-serif); font-size: clamp(1.6rem, 3vw, 2.2rem);"> ${title} </h1> <!-- Primary Image --> <div style="width: clamp(60%, 70vw, 900px);"> ${renderComponent($$result2, "Image", $$Image, { "src": image, "alt": title, "widths": [800, 1200, 1800], "sizes": "(max-width: 768px) 90vw, 70vw", "class": "w-full block", "loading": "eager" })} </div> <!-- Text Content --> <div class="mt-12 text-white" style="width: clamp(60%, 70vw, 900px); font-family: var(--font-sans);"> ${acquisition && renderTemplate`<section class="mb-10"> <h2 class="font-bold text-white mb-4" style="font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase;">
Acquisition
</h2> <p class="text-sm leading-7 opacity-90">${acquisition}</p> </section>`} ${creative && renderTemplate`<section class="mb-10"> <h2 class="font-bold text-white mb-4" style="font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase;">
Creative Choices
</h2> <p class="text-sm leading-7 opacity-90">${creative}</p> </section>`} </div> </div> ` })}`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/photos/[slug].astro", void 0);

const $$file = "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/photos/[slug].astro";
const $$url = "/photos/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
