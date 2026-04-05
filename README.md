# ghp-dynamic-folio-template

A **dynamic, GitHub-powered** single-page developer portfolio for **GitHub Pages**. Static **HTML**, **CSS**, and **JavaScript** only—no build step. Based on ideas from [codenio.github.io](https://github.com/codenio/codenio.github.io).

## How to use this template

Follow these steps in order.

### 1. Create your own copy

On GitHub, open this repository (**ghp-dynamic-folio-template**), then click **Use this template** → **Create a new repository**.

- Prefer **Use this template** so your site is a clean copy without this repo’s fork history.
- Forking also works if you prefer to track upstream changes manually.

### 2. Name the repository for GitHub Pages

Pick one pattern:


| Goal                                                  | Repository name            | Site URL (after Pages is on)                 |
| ----------------------------------------------------- | -------------------------- | -------------------------------------------- |
| **User or org site** (recommended for “my portfolio”) | `YOUR_USERNAME.github.io`  | `https://YOUR_USERNAME.github.io/`           |
| **Project site**                                      | Any name, e.g. `portfolio` | `https://YOUR_USERNAME.github.io/portfolio/` |


Replace `YOUR_USERNAME` with your GitHub username (or org name for org pages).

### 3. Turn on GitHub Pages

In the **new** repository: **Settings → Pages**.

- **Build and deployment**: **Deploy from a branch**.
- **Branch**: `main` or `master`, folder `**/` (root)** → **Save**.

GitHub cannot enable Pages from files in the repo alone; you must do this once in the UI.

### 4. Wait for the first deploy

After a minute or two, open your site URL from step 2.

- If the repo is `**YOUR_USERNAME.github.io`** and Pages serves the **root**, the app infers your GitHub login from the hostname. You usually **do not** need to edit `config.js` for APIs to work.
- If the site lives under a **project path** (`/REPO/`), on a **custom domain**, or you open files **locally**, set `githubUsername` in `config.js` to your GitHub login (see step 6).

### 5. Personalize content

- Edit `**index.html`**: **About** and **Contact** sections (copy, links).
- Optional: adjust default strings in `**config.js`** (`siteTitle`, `navBrand`, `heroTagline`, etc.). With `autoBrandingFromGithub: true` (default), many of these are replaced after your profile loads from the API.

### 6. Optional: `config.js` reference


| Field                    | Purpose                                                                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `githubUsername`         | GitHub login for API + links. Use `null` to infer from `*.github.io` (subdomain). Set for custom domains, project URLs, or local preview.                                  |
| `autoBrandingFromGithub` | If `true` (default), after the profile loads, document title, nav logo, tagline, footer, and meta description follow GitHub. If `false`, use the string fields below only. |
| `siteTitle`              | Tab title before/without API.                                                                                                                                              |
| `metaDescription`        | Default meta description.                                                                                                                                                  |
| `navBrand`               | Default nav/footer brand text.                                                                                                                                             |
| `heroTagline`            | Default tagline under your name.                                                                                                                                           |
| `holopinUsername`        | Holopin user for the badge board, or `null` to hide that section and nav link.                                                                                             |
| `footerDisplayName`      | Default footer name.                                                                                                                                                       |
| `fallbackBio`            | Hero bio if the GitHub user request fails.                                                                                                                                 |
| `githubSearchAuthor`     | Optional; defaults to resolved username for the “View all on GitHub” PR search link.                                                                                       |


## What you get

- **Hero** — Name, bio, avatar, company, and location from the [GitHub Users API](https://docs.github.com/en/rest/users/users#get-a-user).
- **Summary** — Counts for merged PRs, repos contributed to, and your public non-fork repositories.
- **Merged pull requests** — [Search API](https://docs.github.com/en/rest/search/search#search-issues-and-pull-requests) for `author:YOU is:pr is:merged`, grouped by repository (collapsible).
- **Repositories** — Your public, non-fork repos, sorted by stars then forks.
- **Holopin** (optional) — Set `holopinUsername` in `config.js`; otherwise the section is hidden.

## API note

Requests run in the visitor’s browser with **no server and no token**. Unauthenticated [rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) apply (on the order of **60 requests/hour per IP**). If limits are hit, some sections may show errors until the window resets.

## License

This template is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0). The full legal text is in [`LICENSE`](LICENSE) in this repository. You may reuse and modify it for your own site subject to those terms.