/**
 * Optional overrides. For the usual setup (repo YOUR_USERNAME.github.io on Pages),
 * leave githubUsername null — it is inferred from the site hostname.
 */
window.PORTFOLIO_CONFIG = {
  /**
   * GitHub login for API + links. Use null (or '') to infer from *.github.io
   * (subdomain = user or org). Set explicitly for localhost, previews, or a custom domain.
   */
  githubUsername: null,

  /** After profile loads, set title / nav / tagline / footer / meta from GitHub (default). */
  autoBrandingFromGithub: true,

  /** Browser tab title */
  siteTitle: 'Dynamic Folio',

  /** Meta description for search / sharing */
  metaDescription:
    'Dynamic developer portfolio — live GitHub profile, repos, and merged PRs on GitHub Pages.',

  /** Logo text in the top nav */
  navBrand: 'folio',

  /** Shown under your name in the hero (GitHub bio overrides when API works) */
  heroTagline: 'Your short tagline',

  /**
   * Holopin board username, or null to hide the Holopin section and nav link.
   * Example: 'octocat'
   */
  holopinUsername: null,

  /** Footer line: shown before · navBrand */
  footerDisplayName: 'Your Name',

  /** If the GitHub API fails (rate limit / offline), hero bio shows this */
  fallbackBio: 'Dynamic folio · GitHub Pages. Set githubUsername in config.js if not on *.github.io.',

  /** "View all on GitHub" merged-PR search uses this author */
  get githubSearchAuthor() {
    return this.githubUsername;
  },
};
