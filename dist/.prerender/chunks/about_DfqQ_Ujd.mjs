import { c as createComponent } from './BaseLayout_BCE-YsCO.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_CIZgCjy4.mjs';
import { $ as $$PageLayout } from './PageLayout_2cu5f7po.mjs';

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": "About", "activePage": "about" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center text-center px-6" style="min-height: calc(100vh - 4rem);"> <h1 class="text-white font-bold mb-10" style="font-family: var(--font-serif); font-size: clamp(1.8rem, 3vw, 2.4rem);">
About
</h1> <p class="text-white text-sm leading-8 mb-10" style="font-family: var(--font-sans); max-width: 480px; opacity: 0.88;">
Brief biography text goes here. A couple of sentences about who you are,
      where you're based, and what you do.
</p> <div style="font-family: var(--font-sans);"> <p class="text-white text-sm mb-1 opacity-70">Want to get in touch:</p> <a href="mailto:you@example.com" class="text-white text-sm hover:opacity-60 transition-opacity duration-200">
you@example.com
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
