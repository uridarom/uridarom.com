import { c as createComponent, $ as $$BaseLayout } from './BaseLayout_BCE-YsCO.mjs';
import 'piccolore';
import { m as maybeRenderHead, r as renderComponent, f as Fragment, a as renderTemplate, b as addAttribute, h as renderSlot } from './prerender_CIZgCjy4.mjs';

const $$Nav = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Nav;
  const { activePage } = Astro2.props;
  const navItems = [
    { label: "Photos", href: "/photos", key: "photos" },
    { label: "Projects", href: "/projects", key: "projects" },
    { label: "About", href: "/about", key: "about" }
  ];
  return renderTemplate`${maybeRenderHead()}<header class="fixed top-0 left-0 right-0 z-50 bg-black h-16 flex items-center px-8"> <nav class="flex items-center gap-3 text-sm" style="font-family: var(--font-sans)"> <a href="/" class="text-white mr-2" style="font-family: var(--font-serif); font-size: 1.1rem;">
My Name
</a> ${navItems.map((item, i) => renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${i > 0 && renderTemplate`<span class="text-white opacity-50 select-none">•</span>`}<a${addAttribute(item.href, "href")}${addAttribute([
    "text-white hover:opacity-70 transition-opacity duration-200",
    activePage === item.key ? "font-bold" : "font-normal"
  ], "class:list")}> ${item.label} </a> ` })}`)} </nav> </header>`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/components/Nav.astro", void 0);

const $$PageLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PageLayout;
  const { title, description, activePage } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", $$Nav, { "activePage": activePage })} ${maybeRenderHead()}<main class="pt-16"> ${renderSlot($$result2, $$slots["default"])} </main> ` })}`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/layouts/PageLayout.astro", void 0);

export { $$PageLayout as $ };
