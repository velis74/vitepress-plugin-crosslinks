import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { resolveProjects } from './env-loader';

const PREFIX = 'CROSSLINKS_BASE_';

function setEnv(key: string, value: string) {
  process.env[PREFIX + key] = value;
}

describe('resolveProjects', () => {
  const savedEnv: [string, string | undefined][] = [];

  beforeEach(() => {
    // Save and clear all CROSSLINKS_BASE_ vars
    for (const key of Object.keys(process.env)) {
      if (key.startsWith(PREFIX)) {
        savedEnv.push([key, process.env[key]]);
        delete process.env[key];
      }
    }
  });

  afterEach(() => {
    // Clear any vars set during the test
    for (const key of Object.keys(process.env)) {
      if (key.startsWith(PREFIX)) delete process.env[key];
    }
    // Restore saved vars
    for (const [key, value] of savedEnv.splice(0)) {
      if (value !== undefined) process.env[key] = value;
    }
  });

  it('returns empty object when no config and no env vars', () => {
    expect(resolveProjects({})).toEqual({});
  });

  it('uses explicit projects config', () => {
    const result = resolveProjects({ projects: { 'my-docs': 'https://example.com' } });
    expect(result).toEqual({ 'my-docs': 'https://example.com' });
  });

  it('auto-discovers projects from env vars', () => {
    setEnv('MYPROJECT', 'https://env.example.com');
    expect(resolveProjects({})).toEqual({ myproject: 'https://env.example.com' });
  });

  it('env var suffix is lowercased to form the project name', () => {
    setEnv('MY_DOCS', 'https://docs.example.com');
    expect(resolveProjects({})).toEqual({ my_docs: 'https://docs.example.com' });
  });

  it('env vars override explicit config for matching project names', () => {
    setEnv('MYPROJECT', 'https://prod.example.com');
    const result = resolveProjects({ projects: { myproject: 'http://localhost:3001' } });
    expect(result.myproject).toBe('https://prod.example.com');
  });

  it('explicit config keys not matched by env are kept', () => {
    setEnv('OTHER', 'https://other.example.com');
    const result = resolveProjects({ projects: { 'my-docs': 'https://my.example.com' } });
    expect(result['my-docs']).toBe('https://my.example.com');
    expect(result.other).toBe('https://other.example.com');
  });

  it('respects custom envPrefix', () => {
    process.env.MY_PREFIX_DOCS = 'https://docs.example.com';
    const result = resolveProjects({ envPrefix: 'MY_PREFIX_' });
    expect(result.docs).toBe('https://docs.example.com');
    delete process.env.MY_PREFIX_DOCS;
  });

  it('ignores env vars with empty string value', () => {
    process.env[`${PREFIX}EMPTY`] = '';
    const result = resolveProjects({});
    expect(result.empty).toBeUndefined();
    delete process.env[`${PREFIX}EMPTY`];
  });
});
