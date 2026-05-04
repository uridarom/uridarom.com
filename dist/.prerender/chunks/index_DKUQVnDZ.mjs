import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_l75tgjd0.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead, l as Fragment, b as addAttribute } from './prerender_BGNN_zFD.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const navItems = [
    { label: "Photos", href: "/photos" },
    { label: "Projects", href: "/projects" },
    { label: "Who?", href: "/about" }
  ];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Home" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen flex flex-col items-center justify-center bg-black -translate-y-24"> <h1 class="text-white font-bold tracking-tight" style="font-size: clamp(2.8rem, 6vw, 5rem);">
Uri Darom
</h1> <nav class="flex items-center gap-3 mt-2 text-sm text-white" style="font-size: clamp(1.0rem, 1vw, 3rem);"> ${navItems.map((item, i) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate`${i > 0 && renderTemplate`<span class="select-none">•</span>`}<a${addAttribute(item.href, "href")} class="hover:opacity-60 transition-opacity duration-200"> ${item.label} </a> ` })}`)} </nav> </div> ` })}`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/index.astro", void 0);

const $$file = "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
