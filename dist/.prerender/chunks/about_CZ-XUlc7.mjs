import { c as createComponent } from './BaseLayout_l75tgjd0.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_BGNN_zFD.mjs';
import { $ as $$PageLayout } from './PageLayout_BhjObdfQ.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": "About", "activePage": "about" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center text-center px-1  -translate-y-24" style="min-height: calc(100vh - 4rem);"> <h1 class="text-white font-bold mb-10" style="font-size: clamp(1.8rem, 3vw, 2.4rem);">
About
</h1> <p class="text-white text-sm leading-7 mb-10" style="max-width: 700; opacity: 0.88; font-size: 1.5rem">
My name is Uri Darom.
<br>
I am a first-year college student studying computer science.
<br>
I enjoy photography, astrophotography, and also other things.
</p> <div style="opacity: 0.88"> <p class="text-white text-sm mb-2" style="font-size: 1.5rem">Want to get in touch:</p> <a href="mailto:uridarom@gmail.com" class="text-white text-sm  hover:opacity-60 transition-opacity duration-200" style="font-size: 1.5rem">
uridarom@gmail.com
</a> </div> </div> ` })}`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/about.astro", void 0);

const $$file = "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
