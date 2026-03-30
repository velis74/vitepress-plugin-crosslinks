import type MarkdownIt from 'markdown-it';

import { resolveProjects } from './env-loader';
import { crosslinksMarkdownPlugin } from './markdown-plugin';
import type { CrosslinksConfig } from './types';

/**
 * Returns a VitePress `markdown.config` function that installs the crosslinks
 * markdown-it plugin with the resolved project URL map.
 *
 * @example
 * // .vitepress/config.ts
 * import { markdownConfig } from 'vitepress-plugin-crosslinks';
 *
 * export default defineConfig({
 *   markdown: {
 *     config: markdownConfig({
 *       projects: { 'my-docs': 'http://localhost:3001' },
 *     }),
 *   },
 * });
 */
export function markdownConfig(config: CrosslinksConfig = {}): (md: MarkdownIt) => void {
  const projects = resolveProjects(config);
  return (md: MarkdownIt) => md.use(crosslinksMarkdownPlugin, projects);
}

export { crosslinksMarkdownPlugin } from './markdown-plugin';
export { resolveProjects } from './env-loader';
export type { CrosslinksConfig } from './types';
