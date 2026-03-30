import MarkdownIt from 'markdown-it';
import { describe, it, expect, vi } from 'vitest';

import { crosslinksMarkdownPlugin } from './markdown-plugin';

function createMd(projects: Record<string, string>): MarkdownIt {
  const md = new MarkdownIt();
  md.use(crosslinksMarkdownPlugin, projects);
  return md;
}

describe('crosslinksMarkdownPlugin', () => {
  describe('link resolution', () => {
    it('replaces a crosslink href with the resolved URL', () => {
      const md = createMd({ 'my-docs': 'https://example.com' });
      expect(md.render('[link](:my-docs:/some/path)')).toContain('href="https://example.com/some/path"');
    });

    it('strips trailing slash from base URL before joining', () => {
      const md = createMd({ 'my-docs': 'https://example.com/' });
      expect(md.render('[link](:my-docs:/page)')).toContain('href="https://example.com/page"');
    });

    it('resolves to bare base URL when path is omitted', () => {
      const md = createMd({ docs: 'https://example.com' });
      expect(md.render('[link](:docs:)')).toContain('href="https://example.com"');
    });

    it('resolves to base URL + "/" for root path', () => {
      const md = createMd({ docs: 'https://example.com' });
      expect(md.render('[link](:docs:/)')).toContain('href="https://example.com/"');
    });

    it('resolves nested paths', () => {
      const md = createMd({ api: 'https://api.example.com' });
      expect(md.render('[link](:api:/v2/users/list)')).toContain('href="https://api.example.com/v2/users/list"');
    });

    it('supports project names with underscores', () => {
      const md = createMd({ my_docs: 'https://example.com' });
      expect(md.render('[link](:my_docs:/page)')).toContain('href="https://example.com/page"');
    });

    it('supports project names with hyphens', () => {
      const md = createMd({ 'my-docs': 'https://example.com' });
      expect(md.render('[link](:my-docs:/page)')).toContain('href="https://example.com/page"');
    });
  });

  describe('image resolution', () => {
    it('resolves crosslink in image src', () => {
      const md = createMd({ assets: 'https://cdn.example.com' });
      expect(md.render('![](:assets:/images/logo.png)')).toContain('src="https://cdn.example.com/images/logo.png"');
    });
  });

  describe('non-matching links', () => {
    it('leaves regular absolute URLs unchanged', () => {
      const md = createMd({ 'my-docs': 'https://example.com' });
      expect(md.render('[link](https://other.com/page)')).toContain('href="https://other.com/page"');
    });

    it('leaves relative links unchanged', () => {
      const md = createMd({ 'my-docs': 'https://example.com' });
      expect(md.render('[link](./some/page)')).toContain('href="./some/page"');
    });

    it('leaves anchor links unchanged', () => {
      const md = createMd({ docs: 'https://example.com' });
      expect(md.render('[link](#section)')).toContain('href="#section"');
    });
  });

  describe('unknown project', () => {
    it('leaves the href unchanged when the project is not in the map', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const md = createMd({});
      expect(md.render('[link](:unknown:/path)')).toContain('href=":unknown:/path"');
      consoleSpy.mockRestore();
    });

    it('prints a warning with the unknown project name', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const md = createMd({ known: 'https://example.com' });
      md.render('[link](:unknown:/path)');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"unknown"'));
      consoleSpy.mockRestore();
    });

    it('lists available projects in the warning', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const md = createMd({ alpha: 'https://a.com', beta: 'https://b.com' });
      md.render('[link](:missing:/path)');
      const warning = consoleSpy.mock.calls[0][0] as string;
      expect(warning).toContain('alpha');
      expect(warning).toContain('beta');
      consoleSpy.mockRestore();
    });
  });
});
