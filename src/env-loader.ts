import type { CrosslinksConfig } from './types';

/**
 * Resolves the full map of project name → base URL by merging:
 * 1. Explicit `config.projects` (dev/fallback defaults)
 * 2. Environment variables matching the prefix (overrides for prod)
 *
 * Environment variables take precedence, enabling local/dev vs production
 * URL switching without touching the config file.
 */
export function resolveProjects(config: CrosslinksConfig): Record<string, string> {
  const prefix = config.envPrefix ?? 'CROSSLINKS_BASE_';
  const resolved: Record<string, string> = {};

  // Explicit config provides the baseline (dev defaults / fallbacks)
  if (config.projects) {
    Object.assign(resolved, config.projects);
  }

  // Env vars override config, enabling per-environment URL switching
  for (const [key, value] of Object.entries(process.env)) {
    if (!value || !key.startsWith(prefix)) continue;
    const projectName = key.slice(prefix.length).toLowerCase();
    resolved[projectName] = value;
  }

  return resolved;
}
