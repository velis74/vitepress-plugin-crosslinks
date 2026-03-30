import type MarkdownIt from 'markdown-it';

const CROSSLINK_RE = /^:([a-zA-Z0-9_-]+):(\/.*)?$/;

interface AttrToken {
  type: string;
  attrIndex(name: string): number;
  attrs: [string, string][] | null;
}

function resolveTokenAttr(token: AttrToken, attrName: string, projects: Record<string, string>): void {
  const idx = token.attrIndex(attrName);
  if (idx < 0) return;

  const value = token.attrs![idx][1];
  const match = CROSSLINK_RE.exec(value);
  if (!match) return;

  const [, projectName, path = ''] = match;
  const baseUrl = projects[projectName];

  if (baseUrl) {
    token.attrs![idx][1] = baseUrl.replace(/\/$/, '') + path;
  } else {
    console.warn(
      `[vitepress-plugin-crosslinks] Unknown project: "${projectName}". ` +
        `Available: ${Object.keys(projects).join(', ') || '(none)'}`,
    );
  }
}

export function crosslinksMarkdownPlugin(md: MarkdownIt, projects: Record<string, string>): void {
  md.core.ruler.push('crosslinks', (state) => {
    for (const blockToken of state.tokens) {
      if (blockToken.type !== 'inline' || !blockToken.children) continue;

      for (const token of blockToken.children) {
        if (token.type === 'link_open') {
          resolveTokenAttr(token as unknown as AttrToken, 'href', projects);
        } else if (token.type === 'image') {
          resolveTokenAttr(token as unknown as AttrToken, 'src', projects);
        }
      }
    }
  });
}
