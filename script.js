(function () {
  var CFG = window.PORTFOLIO_CONFIG || {};

  function inferGithubUsernameFromPagesHost() {
    try {
      var h = (window.location && window.location.hostname || '').toLowerCase();
      var m = /^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\.github\.io$/.exec(h);
      if (!m) return '';
      var sub = m[1];
      if (sub === 'www' || sub === 'pages') return '';
      return sub;
    } catch (e) {
      return '';
    }
  }

  function resolveGithubUsername(cfg) {
    var raw = cfg.githubUsername;
    var u = raw == null || raw === '' ? '' : String(raw).trim();
    if (u && u !== 'YOUR_GITHUB_USERNAME') return u;
    return inferGithubUsernameFromPagesHost();
  }

  var GITHUB_USER = resolveGithubUsername(CFG);
  if (!GITHUB_USER) {
    console.warn(
      '[dynamic-folio] Could not infer GitHub user (need *.github.io or set githubUsername in config.js).'
    );
  }

  var API_USER = 'https://api.github.com/users/' + encodeURIComponent(GITHUB_USER);
  var API_REPOS =
    'https://api.github.com/users/' +
    encodeURIComponent(GITHUB_USER) +
    '/repos?per_page=100&sort=updated&type=all';
  var API_SEARCH_PR =
    'https://api.github.com/search/issues?q=author%3A' +
    encodeURIComponent(GITHUB_USER) +
    '+is%3Apr+is%3Amerged&per_page=100&sort=created&order=desc';

  function el(id) {
    return document.getElementById(id);
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function renderProjectCard(repo) {
    var desc = repo.description || 'No description';
    var lang = repo.language || 'Other';
    var stars = repo.stargazers_count || 0;
    var forks = repo.forks_count || 0;
    var url = repo.html_url;
    var name = repo.name;

    return (
      '<article class="project-card">' +
      '<a href="' +
      url +
      '" target="_blank" rel="noopener">' +
      '<h3 class="project-name">' +
      escapeHtml(name) +
      '</h3>' +
      '<p class="project-desc">' +
      escapeHtml(desc) +
      '</p>' +
      '<div class="project-meta">' +
      '<span class="project-lang">' +
      escapeHtml(lang) +
      '</span>' +
      '<span class="project-stats">★ ' +
      stars +
      ' · ⎇ ' +
      forks +
      '</span>' +
      '</div>' +
      '</a>' +
      '</article>'
    );
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function applyDocumentMeta() {
    if (CFG.siteTitle) document.title = CFG.siteTitle;
    var meta = document.querySelector('meta[name="description"]');
    if (meta && CFG.metaDescription) meta.setAttribute('content', CFG.metaDescription);
    var brand = document.querySelector('.nav-logo');
    if (brand && CFG.navBrand) brand.textContent = CFG.navBrand;
    var tagline = document.querySelector('.hero-tagline');
    if (tagline && CFG.heroTagline) tagline.textContent = CFG.heroTagline;
    var footerName = el('footer-display-name');
    if (footerName && CFG.footerDisplayName) {
      footerName.textContent = CFG.footerDisplayName;
    }
    var footerBrand = el('footer-brand');
    if (footerBrand && CFG.navBrand) footerBrand.textContent = CFG.navBrand;
  }

  function setupHolopin() {
    var user = CFG.holopinUsername;
    var nav = document.querySelector('[data-nav="holopin"]');
    var section = document.querySelector('[data-section="holopin"]');
    if (!user) {
      if (nav) nav.remove();
      if (section) section.remove();
      return;
    }
    var wrap = document.querySelector('.holopin-wrap');
    var img = document.querySelector('.holopin-board');
    if (wrap) wrap.href = 'https://holopin.io/@' + encodeURIComponent(user);
    if (img) {
      img.src = 'https://holopin.io/api/user/board?user=' + encodeURIComponent(user);
      img.alt = 'Holopin badge board for ' + user;
    }
  }

  function setHero(profile) {
    var name = profile.name || profile.login;
    var bio = profile.bio || CFG.fallbackBio || 'Developer';
    var location = profile.location ? ' · ' + profile.location : '';
    var company = profile.company ? ' · ' + profile.company : '';

    if (el('hero-name')) el('hero-name').textContent = name;
    if (el('hero-bio')) el('hero-bio').textContent = bio;
    if (el('hero-meta')) el('hero-meta').textContent = [company, location].filter(Boolean).join('');
    if (el('avatar') && profile.avatar_url) el('avatar').src = profile.avatar_url;
  }

  function setRepoCount(count) {
    var node = el('repo-count');
    if (node) node.textContent = count;
  }

  function getRepoFromRepositoryUrl(url) {
    if (!url) return '';
    var match = url.match(/repos\/([^/]+\/[^/]+)/);
    return match ? match[1] : '';
  }

  function renderPRCard(pr) {
    var title = pr.title || '#' + pr.number;
    var date = formatDate(pr.created_at);
    var url = pr.html_url;
    var num = pr.number;
    return (
      '<article class="pr-card">' +
      '<a href="' +
      url +
      '" target="_blank" rel="noopener">' +
      '<h3 class="pr-title">' +
      escapeHtml(title) +
      '</h3>' +
      '<div class="pr-meta">' +
      '<span class="pr-state pr-state--merged">Merged</span>' +
      '<span class="pr-date">' +
      escapeHtml(date) +
      '</span>' +
      (num ? '<span class="pr-num">#' + num + '</span>' : '') +
      '</div>' +
      '</a>' +
      '</article>'
    );
  }

  function groupPRsByRepo(items) {
    var byRepo = {};
    items.forEach(function (pr) {
      var repo = getRepoFromRepositoryUrl(pr.repository_url);
      if (!repo) return;
      if (!byRepo[repo]) byRepo[repo] = [];
      byRepo[repo].push(pr);
    });
    return byRepo;
  }

  function renderPRGroup(repo, prs) {
    var repoUrl = 'https://github.com/' + repo;
    var cards = prs
      .sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .map(renderPRCard)
      .join('');
    return (
      '<details class="pr-repo-group">' +
      '<summary class="pr-repo-heading">' +
      '<a href="' +
      repoUrl +
      '" target="_blank" rel="noopener" class="pr-repo-link" onclick="event.stopPropagation()">' +
      escapeHtml(repo) +
      '</a>' +
      '<span class="pr-repo-count">' +
      prs.length +
      ' merged</span>' +
      '</summary>' +
      '<div class="pr-grid">' +
      cards +
      '</div>' +
      '</details>'
    );
  }

  function setPRCount(count) {
    var node = el('pr-count');
    if (node) node.textContent = count;
  }

  function setPRRepoCount(count) {
    var node = el('pr-repo-count');
    if (node) node.textContent = count;
  }

  var summaryData = { prCount: null, prRepoCount: null, projectCount: null };
  function updateSummary() {
    if (summaryData.prCount != null) {
      var n = el('summary-pr-count');
      if (n) n.textContent = summaryData.prCount;
    }
    if (summaryData.prRepoCount != null) {
      var n = el('summary-pr-repos');
      if (n) n.textContent = summaryData.prRepoCount;
    }
    if (summaryData.projectCount != null) {
      var n = el('summary-project-count');
      if (n) n.textContent = summaryData.projectCount;
    }
  }

  function updatePRSearchLink() {
    var a = document.querySelector('[data-pr-search-link]');
    if (!a || !GITHUB_USER) return;
    var author = CFG.githubSearchAuthor || GITHUB_USER;
    a.href =
      'https://github.com/search?q=' +
      encodeURIComponent('is:pr is:merged author:' + author) +
      '&type=pullrequests';
  }

  async function loadPRs() {
    var grid = el('pr-grid');
    if (!grid) return;
    if (!GITHUB_USER) {
      grid.innerHTML =
        '<p class="projects-note">Host on <code>*.github.io</code> or set <code>githubUsername</code> in config.js to load merged PRs.</p>';
      return;
    }

    try {
      var res = await fetch(API_SEARCH_PR);
      if (!res.ok) throw new Error('PR search failed');
      var data = await res.json();
      var items = data.items || [];

      if (!items.length) {
        grid.innerHTML = '<p class="projects-note">No merged pull requests found.</p>';
        setPRCount(0);
        setPRRepoCount(0);
        summaryData.prCount = 0;
        summaryData.prRepoCount = 0;
        updateSummary();
        return;
      }

      var byRepo = groupPRsByRepo(items);
      var repoKeys = Object.keys(byRepo).sort(function (a, b) {
        return byRepo[b].length - byRepo[a].length;
      });

      var html = repoKeys
        .map(function (repo) {
          return renderPRGroup(repo, byRepo[repo]);
        })
        .join('');

      grid.innerHTML = html;
      setPRCount(items.length);
      setPRRepoCount(repoKeys.length);
      summaryData.prCount = items.length;
      summaryData.prRepoCount = repoKeys.length;
      updateSummary();
    } catch (e) {
      grid.innerHTML =
        '<p class="projects-note">Could not load PRs (API or rate limit).</p>';
    }
  }

  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
      });
      document.querySelectorAll('.nav-links a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
        });
      });
    }
  }

  function setYear() {
    var y = el('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function setGithubLinks() {
    var base = 'https://github.com/';
    if (!GITHUB_USER) return;
    document.querySelectorAll('[data-github-profile]').forEach(function (a) {
      a.href = base + encodeURIComponent(GITHUB_USER);
    });
  }

  function applyBrandingFromProfile(profile) {
    if (!profile || CFG.autoBrandingFromGithub === false) return;
    var name = profile.name || profile.login;
    var login = profile.login;
    document.title = name + ' | Folio';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      var desc = (profile.bio || '').replace(/\s+/g, ' ').trim();
      if (desc.length > 160) desc = desc.slice(0, 157) + '...';
      if (desc) meta.setAttribute('content', desc);
    }
    var brand = document.querySelector('.nav-logo');
    if (brand) brand.textContent = login;
    var tagline = document.querySelector('.hero-tagline');
    if (tagline) {
      tagline.textContent = profile.company ? profile.company : '@' + login;
    }
    var footerName = el('footer-display-name');
    if (footerName) footerName.textContent = name;
    var footerBrand = el('footer-brand');
    if (footerBrand) footerBrand.textContent = login;
  }

  async function loadUser() {
    if (!GITHUB_USER) {
      if (el('hero-name')) el('hero-name').textContent = 'Your name';
      if (el('hero-bio'))
        el('hero-bio').textContent =
          CFG.fallbackBio ||
          'Host on username.github.io or set githubUsername in config.js to load your GitHub profile.';
      if (el('hero-meta')) el('hero-meta').textContent = '';
      return null;
    }
    try {
      var res = await fetch(API_USER);
      if (!res.ok) throw new Error('User fetch failed');
      var profile = await res.json();
      setHero(profile);
      applyBrandingFromProfile(profile);
      return profile;
    } catch (e) {
      if (el('hero-bio'))
        el('hero-bio').textContent =
          CFG.fallbackBio || 'Developer · Open source';
      if (el('hero-meta')) el('hero-meta').textContent = '';
      return null;
    }
  }

  function isOwnRepo(repo) {
    return !repo.fork;
  }

  function isOwnPublicProject(repo) {
    if (!isOwnRepo(repo)) return false;
    if (!repo.owner || repo.owner.login !== GITHUB_USER) return false;
    return repo.private === false;
  }

  function sortByPopularity(repos) {
    return repos.slice().sort(function (a, b) {
      var sa = a.stargazers_count || 0;
      var fa = a.forks_count || 0;
      var sb = b.stargazers_count || 0;
      var fb = b.forks_count || 0;
      if (sb !== sa) return sb - sa;
      return fb - fa;
    });
  }

  async function loadRepos() {
    var grid = el('projects-grid');
    if (!grid) return;
    if (!GITHUB_USER) {
      grid.innerHTML =
        '<p class="projects-note">Host on <code>*.github.io</code> or set <code>githubUsername</code> in config.js to load repositories.</p>';
      return;
    }

    try {
      var res = await fetch(API_REPOS);
      if (!res.ok) throw new Error('Repos fetch failed');
      var allRepos = await res.json();
      var repos = allRepos.filter(isOwnPublicProject);
      repos = sortByPopularity(repos);

      setRepoCount(repos.length);
      summaryData.projectCount = repos.length;
      updateSummary();
      grid.innerHTML = repos.length
        ? repos.map(renderProjectCard).join('')
        : '<p class="projects-note">No public repositories yet.</p>';
    } catch (e) {
      grid.innerHTML =
        '<p class="projects-note">Could not load projects. Check GitHub username and rate limits.</p>';
    }
  }

  function init() {
    applyDocumentMeta();
    setupHolopin();
    updatePRSearchLink();
    setGithubLinks();
    setYear();
    initNav();
    loadUser();
    loadRepos();
    loadPRs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
