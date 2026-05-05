import { defineConfig } from 'astro/config';
import { visit } from 'unist-util-visit';
import tailwind from '@astrojs/tailwind';

function rehypeImageWidth() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;

      var style = ""
      const alt = (node.properties?.alt ?? '').split("|");
      node.properties.alt = alt[0].trim();
      style += `max-width: ${alt[1]};`;
      
      if (alt.includes("embed")) {
        style += `float: right; padding-left: 1rem; padding-bottom: 1rem`
      } else {
        style += `display: block; margin: 0 auto;`
      }

      node.properties.style = style

    });
  };
}

export default defineConfig({
  integrations: [tailwind()],
  image: {
    domains: [],
  },
  markdown: {
    rehypePlugins: [rehypeImageWidth],
  },
});
