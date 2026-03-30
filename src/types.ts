export interface CrosslinksConfig {
  /**
   * Explicit project name → base URL mapping.
   * Provides fallback URLs that can be overridden by environment variables.
   *
   * @example
   * { 'my-docs': 'http://localhost:3001', 'api-ref': 'http://localhost:3002' }
   */
  projects?: Record<string, string>;

  /**
   * Prefix used to discover project base URLs from environment variables.
   * Defaults to 'CROSSLINKS_BASE_'.
   *
   * The project name is derived by lowercasing the suffix after the prefix.
   * @example CROSSLINKS_BASE_MY_DOCS=https://docs.example.com → project 'my_docs'
   */
  envPrefix?: string;
}
