import { c as createComponent } from './BaseLayout_l75tgjd0.mjs';
import 'piccolore';
import { m as maybeRenderHead, b as addAttribute, a as renderTemplate, r as renderComponent } from './prerender_BGNN_zFD.mjs';
import { g as getCollection } from './_astro_content_BaXwUNik.mjs';
import { $ as $$PageLayout } from './PageLayout_BhjObdfQ.mjs';
import 'clsx';

const $$ProjectCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ProjectCard;
  const { project } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(`/projects/${project.slug}`, "href")} class="block max-w-2xl mx-auto mb-4 rounded-sm bg-[#121212] hover:bg-[#1c1c1c] transition-colors duration-200 p-7"> <p class="font-bold text-white text-base">${project.data.title}</p> <p class="text-white text-sm mt-2 opacity-80 leading-relaxed">${project.data.description}</p> </a>`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/components/ProjectCard.astro", void 0);

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allProjects = await getCollection("projects");
  const projects = allProjects.sort((a, b) => a.data.order - b.data.order);
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": "Projects", "activePage": "projects" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="px-6 pb-24"> <h1 class="text-white text-center font-bold mt-14 mb-12" style="font-size: clamp(1.8rem, 3vw, 2.4rem);">
Projects
</h1> <div> ${projects.map((project) => renderTemplate`${renderComponent($$result2, "ProjectCard", $$ProjectCard, { "project": project })}`)} </div> </div> ` })}`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/projects/index.astro", void 0);

const $$file = "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/projects/index.astro";
const $$url = "/projects";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
