# vitepress-plugin-crosslinks

[![CI](https://github.com/velis74/vitepress-plugin-crosslinks/actions/workflows/ci.yml/badge.svg)](https://github.com/velis74/vitepress-plugin-crosslinks/actions/workflows/ci.yml)

A VitePress plugin that resolves cross-project documentation links at build time.

Write `:project-name:/some/path` as a link href in markdown and the plugin replaces it with the absolute URL for
that project — no manual URL management across docs.

## Installation

```bash
npm install vitepress-plugin-crosslinks
```

## Usage

### Basic setup

```typescript
// .vitepress/config.ts
import { defineConfig } from 'vitepress';
import { markdownConfig } from 'vitepress-plugin-crosslinks';

export default defineConfig({
  markdown: {
    config: markdownConfig({
      projects: {
        'my-docs': 'https://my-docs.example.com',
        'api-ref': 'https://api.example.com',
      },
    }),
  },
});
```

### Link syntax

In any markdown file, use `:project-name:/path` as the link href:

```markdown
[Getting started](:my-docs:/guide/getting-started)
[REST endpoints](:api-ref:/rest/users)
![Logo](:my-docs:/images/logo.png)
```

At build time these become:

```markdown
[Getting started](https://my-docs.example.com/guide/getting-started)
[REST endpoints](https://api.example.com/rest/users)
![Logo](https://my-docs.example.com/images/logo.png)
```

## Environment variables

Base URLs can be provided or overridden via environment variables. This allows switching between local and
production URLs without touching the config file.

The format is:

```
CROSSLINKS_BASE_<SUFFIX>=<base-url>
```

The project name is the suffix **lowercased**:

| Env var                        | Project name |
| ------------------------------ | ------------ |
| `CROSSLINKS_BASE_MYDOCS`       | `mydocs`     |
| `CROSSLINKS_BASE_MY_DOCS`      | `my_docs`    |
| `CROSSLINKS_BASE_API_REF`      | `api_ref`    |

Environment variables **override** the explicit `projects` config, so you can provide fallback URLs in
the config and override them per-environment:

```typescript
// .vitepress/config.ts
markdownConfig({
  projects: {
    'my_docs': 'http://localhost:3001',  // dev default
    'api_ref': 'http://localhost:3002',  // dev default
  },
})
```

```bash
# .env.production
CROSSLINKS_BASE_MY_DOCS=https://my-docs.example.com
CROSSLINKS_BASE_API_REF=https://api.example.com
```

Projects discovered from env vars that are not listed in `projects` config are also resolved automatically.

### Custom prefix

```typescript
markdownConfig({
  envPrefix: 'DOCS_URL_',  // looks for DOCS_URL_* instead of CROSSLINKS_BASE_*
  projects: { /* ... */ },
})
```

## API

### `markdownConfig(config?)`

Returns a `(md: MarkdownIt) => void` function suitable for VitePress `markdown.config`.

```typescript
import { markdownConfig } from 'vitepress-plugin-crosslinks';
```

### `resolveProjects(config)`

Resolves the merged project map from explicit config and environment variables.
Useful if you need the resolved map for other purposes.

```typescript
import { resolveProjects } from 'vitepress-plugin-crosslinks';
const projects = resolveProjects({ projects: { docs: 'https://example.com' } });
```

### `crosslinksMarkdownPlugin(md, projects)`

The raw markdown-it plugin. Use this if you need to compose with other markdown-it plugins manually.

```typescript
import { crosslinksMarkdownPlugin, resolveProjects } from 'vitepress-plugin-crosslinks';

md.use(crosslinksMarkdownPlugin, resolveProjects(config));
```

## License

MIT
