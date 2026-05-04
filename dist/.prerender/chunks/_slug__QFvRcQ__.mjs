import { c as createComponent } from './BaseLayout_l75tgjd0.mjs';
import 'piccolore';
import { r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './prerender_BGNN_zFD.mjs';
import { g as getCollection } from './_astro_content_BaXwUNik.mjs';
import { $ as $$PageLayout } from './PageLayout_BhjObdfQ.mjs';

async function getStaticPaths() {
  const projects = await getCollection("projects");
  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project }
  }));
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { project } = Astro2.props;
  const { Content } = await project.render();
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": project.data.title, "activePage": "projects", "data-astro-cid-ovxcmftc": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center px-6 pb-24" data-astro-cid-ovxcmftc> <!-- Title --> <h1 class="text-white text-center font-bold mt-12 mb-10" style="font-size: clamp(1.6rem, 3vw, 2.2rem);" data-astro-cid-ovxcmftc> ${project.data.title} </h1> <!-- Content --> <div class="project-content text-white w-full" style="max-width: 640px;" data-astro-cid-ovxcmftc> ${renderComponent($$result2, "Content", Content, { "data-astro-cid-ovxcmftc": true })} </div> </div> ` })}`;
}, "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/projects/[slug].astro", void 0);

const $$file = "/Users/uridarom/Documents/Hobbies/PortfolioWebsite/src/pages/projects/[slug].astro";
const $$url = "/projects/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
