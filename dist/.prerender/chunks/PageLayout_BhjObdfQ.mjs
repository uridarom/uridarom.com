import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_l75tgjd0.mjs';
import 'piccolore';
import { m as maybeRenderHead, r as renderComponent, l as Fragment, a as renderTemplate, b as addAttribute, n as renderSlot } from './prerender_BGNN_zFD.mjs';

const $$Nav = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Nav;
  const { activePage } = Astro2.props;
  const navItems = [
    { label: "Photos", href: "/photos", key: "photos" },
    { label: "Projects", href: "/projects", key: "projects" },
    { label: "About", href: "/about", key: "about" }
  ];
  return renderTemplate`${maybeRenderHead()}<header class="fixed top-0 left-0 right-0 z-50 bg-black h-16 flex items-center px-8"> <nav class="flex items-center h-full gap-2 text-sm"> <a href="/" class="text-white mr-2 leading-none" style="font-size: 2.2rem;">
Uri Darom
</a> <div class="translate-y-2"> ${navItems.map((item, i) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${i > 0 && renderTemplate`<span class="text-white select-none self-center mx-1">•</span>`}<a${addAttribute(item.href, "href")}${addAttribute([
    "text-white hover:opacity-70 transition-opacity duration-100",
    "self-center",
    activePage === item.key ? "font-bold" : "font-normal"
  ], "class:list")} style="font-size: 1rem"> ${item.label} </a> ` })}`)} </div> </nav> </header>`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/components/Nav.astro", void 0);

const $$PageLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PageLayout;
  const { title, description, activePage } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", $$Nav, { "activePage": activePage })} ${maybeRenderHead()}<main class="pt-16"> ${renderSlot($$result2, $$slots["default"])} </main> ` })}`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/layouts/PageLayout.astro", void 0);

export { $$PageLayout as $ };
