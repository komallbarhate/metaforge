// ============================================================
//  MetaForge – App Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ─── Tab Switching ───────────────────────────────────────
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`content-${target}`)?.classList.add('active');
    });
  });

  // ─── Live Character Counters ─────────────────────────────
  function updateCounter(inputId, countId, progressId, min, max) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(countId);
    const progress = document.getElementById(progressId);
    if (!input || !counter) return;

    function update() {
      const len = input.value.length;
      counter.textContent = `${len} / ${max}`;
      const pct = Math.min((len / max) * 100, 100);
      if (progress) {
        progress.style.width = pct + '%';
        if (len < min) {
          progress.style.background = '#ef4444';
          counter.className = 'char-badge bad';
        } else if (len <= max) {
          progress.style.background = '#22c55e';
          counter.className = 'char-badge good';
        } else {
          progress.style.background = '#eab308';
          counter.className = 'char-badge warn';
        }
      }
    }
    input.addEventListener('input', update);
  }

  updateCounter('page-title', 'title-count', 'title-progress', 50, 60);
  updateCounter('page-desc', 'desc-count', 'desc-progress', 150, 160);

  // ─── Live SERP Preview ───────────────────────────────────
  function updateSERPPreview() {
    const title = document.getElementById('page-title').value || 'Your Page Title Here';
    const desc = document.getElementById('page-desc').value || 'Your meta description will appear here. Make it compelling to increase click-through rates from search results.';
    const url = document.getElementById('page-url').value || 'https://yourwebsite.com';

    document.getElementById('prev-title').textContent = title;
    document.getElementById('prev-desc').textContent = desc;

    try {
      const u = new URL(url);
      document.getElementById('prev-url').textContent = u.hostname + u.pathname;
    } catch {
      document.getElementById('prev-url').textContent = url;
    }
  }

  ['page-title', 'page-desc', 'page-url'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateSERPPreview);
  });

  // ─── Live Social Preview ─────────────────────────────────
  function updateSocialPreview() {
    const ogTitle = document.getElementById('og-title').value ||
                    document.getElementById('page-title').value ||
                    'Your Open Graph Title';
    const ogDesc = document.getElementById('og-desc').value ||
                   document.getElementById('page-desc').value ||
                   'Your Open Graph description for social sharing.';
    const ogImage = document.getElementById('og-image').value;
    const ogSiteName = document.getElementById('og-site-name').value;
    const pageUrl = document.getElementById('page-url').value;

    document.getElementById('prev-og-title').textContent = ogTitle;
    document.getElementById('prev-og-desc').textContent = ogDesc;

    let siteDisplay = ogSiteName || '';
    if (!siteDisplay && pageUrl) {
      try { siteDisplay = new URL(pageUrl).hostname; } catch { siteDisplay = pageUrl; }
    }
    document.getElementById('prev-og-site').textContent = siteDisplay || 'yourwebsite.com';

    const imgContainer = document.getElementById('prev-og-image');
    if (ogImage) {
      imgContainer.innerHTML = `<img src="${ogImage}" alt="OG Image" onerror="this.parentElement.innerHTML='<div class=social-img-placeholder><span>⚠️</span><small>Image failed to load</small></div>'" />`;
    } else {
      imgContainer.innerHTML = `<div class="social-img-placeholder"><span>🖼️</span><small>Add OG Image URL to see preview</small></div>`;
    }
  }

  ['og-title', 'og-desc', 'og-image', 'og-site-name', 'page-title', 'page-desc', 'page-url'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateSocialPreview);
  });

  // ─── Color picker sync ───────────────────────────────────
  const colorPicker = document.getElementById('theme-color-picker');
  const colorInput = document.getElementById('theme-color');
  colorPicker?.addEventListener('input', () => { colorInput.value = colorPicker.value; });
  colorInput?.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(colorInput.value)) {
      colorPicker.value = colorInput.value;
    }
  });

  // ─── OG Type toggle (show article section) ───────────────
  document.getElementById('og-type')?.addEventListener('change', function () {
    const articleSec = document.getElementById('article-section');
    if (articleSec) {
      articleSec.style.display = this.value === 'article' ? 'block' : 'none';
    }
  });
  if (document.getElementById('article-section')) {
    document.getElementById('article-section').style.display = 'none';
  }

  // ─── Generate Meta Tags ──────────────────────────────────
  function getRobotsContent() {
    const parts = [];
    if (document.getElementById('robot-index').checked) parts.push('index');
    else parts.push('noindex');
    if (document.getElementById('robot-follow').checked) parts.push('follow');
    else parts.push('nofollow');
    if (document.getElementById('robot-nosnippet').checked) parts.push('nosnippet');
    if (document.getElementById('robot-noimageindex').checked) parts.push('noimageindex');
    return parts.join(', ');
  }

  function val(id) { return document.getElementById(id)?.value?.trim() || ''; }
  function checked(id) { return document.getElementById(id)?.checked || false; }

  function formatISO(dtLocal) {
    if (!dtLocal) return '';
    return new Date(dtLocal).toISOString();
  }

  function htmlEscape(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function generateMetaTags() {
    const lines = [];

    const addTag = (tag) => lines.push(tag);
    const meta = (attrs) => {
      const attrStr = Object.entries(attrs)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}="${htmlEscape(v)}"`)
        .join(' ');
      return `<meta ${attrStr} />`;
    };
    const link = (attrs) => {
      const attrStr = Object.entries(attrs)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}="${htmlEscape(v)}"`)
        .join(' ');
      return `<link ${attrStr} />`;
    };

    // ── Charset & Viewport ──
    addTag(`<!-- ===== Basic Meta Tags ===== -->`);
    addTag(`<meta charset="UTF-8" />`);
    if (val('page-viewport')) addTag(meta({ name: 'viewport', content: val('page-viewport') }));

    // ── Title ──
    if (val('page-title')) addTag(`<title>${htmlEscape(val('page-title'))}</title>`);

    // ── Description ──
    if (val('page-desc')) addTag(meta({ name: 'description', content: val('page-desc') }));

    // ── Keywords ──
    if (val('page-keywords')) addTag(meta({ name: 'keywords', content: val('page-keywords') }));

    // ── Author ──
    if (val('page-author')) addTag(meta({ name: 'author', content: val('page-author') }));

    // ── Robots ──
    const robots = getRobotsContent();
    addTag(meta({ name: 'robots', content: robots }));

    // ── Language ──
    if (val('page-lang')) addTag(meta({ name: 'language', content: val('page-lang') }));

    // ── Canonical ──
    if (val('page-url')) addTag(link({ rel: 'canonical', href: val('page-url') }));

    // ── Refresh ──
    const refresh = val('refresh-sec');
    if (refresh && parseInt(refresh) > 0) {
      addTag(meta({ 'http-equiv': 'refresh', content: refresh }));
    }

    // ── Cache Control ──
    if (val('cache-control')) {
      addTag(meta({ 'http-equiv': 'Cache-Control', content: val('cache-control') }));
    }

    // ── Open Graph ──
    addTag('');
    addTag(`<!-- ===== Open Graph Tags ===== -->`);
    const ogTitle = val('og-title') || val('page-title');
    const ogDesc = val('og-desc') || val('page-desc');
    if (ogTitle) addTag(meta({ property: 'og:title', content: ogTitle }));
    if (ogDesc) addTag(meta({ property: 'og:description', content: ogDesc }));
    addTag(meta({ property: 'og:type', content: val('og-type') || 'website' }));
    if (val('page-url')) addTag(meta({ property: 'og:url', content: val('page-url') }));
    if (val('og-image')) addTag(meta({ property: 'og:image', content: val('og-image') }));
    if (val('og-site-name')) addTag(meta({ property: 'og:site_name', content: val('og-site-name') }));
    if (val('og-locale')) addTag(meta({ property: 'og:locale', content: val('og-locale') }));

    // Article specific
    if (val('og-type') === 'article') {
      if (val('og-published')) addTag(meta({ property: 'article:published_time', content: formatISO(val('og-published')) }));
      if (val('og-modified')) addTag(meta({ property: 'article:modified_time', content: formatISO(val('og-modified')) }));
      if (val('og-section')) addTag(meta({ property: 'article:section', content: val('og-section') }));
    }

    // ── Twitter Card ──
    addTag('');
    addTag(`<!-- ===== Twitter / X Card ===== -->`);
    addTag(meta({ name: 'twitter:card', content: val('tw-card') || 'summary' }));
    const twTitle = val('tw-title') || val('page-title');
    const twDesc = val('tw-desc') || val('page-desc');
    const twImage = val('tw-image') || val('og-image');
    if (twTitle) addTag(meta({ name: 'twitter:title', content: twTitle }));
    if (twDesc) addTag(meta({ name: 'twitter:description', content: twDesc }));
    if (twImage) addTag(meta({ name: 'twitter:image', content: twImage }));
    if (val('tw-site')) {
      const h = val('tw-site').startsWith('@') ? val('tw-site') : '@' + val('tw-site');
      addTag(meta({ name: 'twitter:site', content: h }));
    }
    if (val('tw-creator')) {
      const h = val('tw-creator').startsWith('@') ? val('tw-creator') : '@' + val('tw-creator');
      addTag(meta({ name: 'twitter:creator', content: h }));
    }

    // ── Advanced ──
    let hasAdvanced = false;
    const advLines = [];
    if (val('geo-region')) { advLines.push(meta({ name: 'geo.region', content: val('geo-region') })); hasAdvanced = true; }
    if (val('geo-placename')) { advLines.push(meta({ name: 'geo.placename', content: val('geo-placename') })); hasAdvanced = true; }
    if (val('verify-google')) { advLines.push(meta({ name: 'google-site-verification', content: val('verify-google') })); hasAdvanced = true; }
    if (val('verify-bing')) { advLines.push(meta({ name: 'msvalidate.01', content: val('verify-bing') })); hasAdvanced = true; }
    if (val('theme-color')) { advLines.push(meta({ name: 'theme-color', content: val('theme-color') })); hasAdvanced = true; }
    if (val('apple-title')) { advLines.push(meta({ name: 'apple-mobile-web-app-title', content: val('apple-title') })); hasAdvanced = true; }

    if (hasAdvanced) {
      addTag('');
      addTag(`<!-- ===== Advanced Tags ===== -->`);
      advLines.forEach(l => addTag(l));
    }

    return lines;
  }

  // ─── SEO Score ───────────────────────────────────────────
  function calcSEOScore() {
    const checks = [
      {
        label: 'Page title present',
        pass: !!val('page-title'),
        critical: true,
      },
      {
        label: `Title length optimal (50–60 chars) — currently ${val('page-title').length}`,
        pass: val('page-title').length >= 50 && val('page-title').length <= 60,
        warn: val('page-title').length > 0 && (val('page-title').length < 40 || val('page-title').length > 65),
        critical: false,
      },
      {
        label: 'Meta description present',
        pass: !!val('page-desc'),
        critical: true,
      },
      {
        label: `Description length optimal (150–160 chars) — currently ${val('page-desc').length}`,
        pass: val('page-desc').length >= 150 && val('page-desc').length <= 160,
        warn: val('page-desc').length > 0 && (val('page-desc').length < 120 || val('page-desc').length > 165),
        critical: false,
      },
      {
        label: 'Canonical URL set',
        pass: !!val('page-url'),
        critical: false,
      },
      {
        label: 'Open Graph title present',
        pass: !!(val('og-title') || val('page-title')),
        critical: false,
      },
      {
        label: 'Open Graph image URL set',
        pass: !!val('og-image'),
        critical: false,
      },
      {
        label: 'Twitter Card configured',
        pass: !!val('tw-card'),
        critical: false,
      },
      {
        label: 'Author specified',
        pass: !!val('page-author'),
        critical: false,
      },
      {
        label: 'Indexing enabled',
        pass: checked('robot-index') && checked('robot-follow'),
        critical: false,
      },
    ];

    let score = 0;
    const results = [];

    checks.forEach(c => {
      let status;
      if (c.pass) {
        status = 'pass';
        score += 10;
      } else if (c.warn) {
        status = 'warn';
        score += 5;
      } else {
        status = 'fail';
      }
      results.push({ label: c.label, status });
    });

    return { score: Math.min(score, 100), results };
  }

  function updateSEOScore() {
    const { score, results } = calcSEOScore();
    const scoreNum = document.getElementById('score-num');
    const scoreRing = document.getElementById('score-ring');
    const scoreItems = document.getElementById('score-items');

    scoreNum.textContent = score;
    const circumference = 2 * Math.PI * 15.9;
    const filled = (score / 100) * circumference;
    scoreRing.setAttribute('stroke-dasharray', `${filled.toFixed(1)} ${(circumference - filled).toFixed(1)}`);

    if (score >= 80) scoreRing.style.stroke = '#22c55e';
    else if (score >= 50) scoreRing.style.stroke = '#eab308';
    else scoreRing.style.stroke = '#ef4444';

    scoreItems.innerHTML = results.map(r => {
      const icon = r.status === 'pass' ? '✓' : r.status === 'warn' ? '⚠' : '✗';
      return `<div class="score-item ${r.status}">
        <span class="score-item-icon">${icon}</span>
        <span>${r.label}</span>
      </div>`;
    }).join('');
  }

  // ─── Main Generate Handler ───────────────────────────────
  document.getElementById('generate-btn').addEventListener('click', () => {
    const lines = generateMetaTags();
    const output = lines.join('\n');
    document.getElementById('output-code').textContent = output;

    const tagCount = lines.filter(l => l.trim().startsWith('<meta') || l.trim().startsWith('<title') || l.trim().startsWith('<link')).length;
    document.getElementById('tag-count-badge').textContent = `${tagCount} tags`;

    updateSEOScore();
    updateSERPPreview();
    updateSocialPreview();

    // Scroll to output
    document.getElementById('preview').scrollIntoView({ behavior: 'smooth', block: 'start' });

    showToast('✅ Meta tags generated!');
  });

  // ─── Copy to Clipboard ───────────────────────────────────
  document.getElementById('copy-btn').addEventListener('click', async () => {
    const code = document.getElementById('output-code').textContent;
    if (!code || code.includes('Your generated meta tags')) {
      showToast('⚠️ Generate tags first!', true);
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      showToast('📋 Copied to clipboard!');
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('📋 Copied to clipboard!');
    }
  });

  // ─── Download ────────────────────────────────────────────
  document.getElementById('download-btn').addEventListener('click', () => {
    const code = document.getElementById('output-code').textContent;
    if (!code || code.includes('Your generated meta tags')) {
      showToast('⚠️ Generate tags first!', true);
      return;
    }
    const fullHTML = `<!DOCTYPE html>\n<html lang="en">\n<head>\n${code}\n</head>\n<body>\n  <!-- Your page content here -->\n</body>\n</html>`;
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meta-tags.html';
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 Downloaded!');
  });

  // ─── Clear ───────────────────────────────────────────────
  document.getElementById('clear-btn').addEventListener('click', () => {
    // Clear all inputs
    document.querySelectorAll('.form-input, .form-textarea').forEach(el => el.value = '');
    document.querySelectorAll('.form-select').forEach(el => el.selectedIndex = 0);
    document.getElementById('robot-index').checked = true;
    document.getElementById('robot-follow').checked = true;
    document.getElementById('robot-nosnippet').checked = false;
    document.getElementById('robot-noimageindex').checked = false;
    document.getElementById('page-viewport').value = 'width=device-width, initial-scale=1.0';
    document.getElementById('og-locale').value = 'en_US';
    document.getElementById('theme-color').value = '#6366f1';
    document.getElementById('theme-color-picker').value = '#6366f1';

    document.getElementById('output-code').textContent = '<!-- Your generated meta tags will appear here after clicking "Generate Meta Tags" -->';
    document.getElementById('tag-count-badge').textContent = '0 tags';

    // Reset counters
    ['title-count', 'desc-count'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = el.id === 'title-count' ? '0 / 60' : '0 / 160';
      el.className = 'char-badge';
    });
    ['title-progress', 'desc-progress'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.width = '0';
    });

    // Reset previews
    document.getElementById('prev-title').textContent = 'Your Page Title Here';
    document.getElementById('prev-desc').textContent = 'Your meta description will appear here. Make it compelling to increase click-through rates from search results.';
    document.getElementById('prev-url').textContent = 'https://yourwebsite.com';
    document.getElementById('prev-og-title').textContent = 'Your Open Graph Title';
    document.getElementById('prev-og-desc').textContent = 'Your Open Graph description for social sharing.';
    document.getElementById('prev-og-site').textContent = 'yourwebsite.com';
    document.getElementById('prev-og-image').innerHTML = '<div class="social-img-placeholder"><span>🖼️</span><small>Add OG Image URL to see preview</small></div>';

    // Reset score
    document.getElementById('score-num').textContent = '0';
    document.getElementById('score-ring').setAttribute('stroke-dasharray', '0 100');
    document.getElementById('score-items').innerHTML = '<div class="score-item pending"><span class="score-item-icon">○</span><span>Fill in the form and generate tags to see your score</span></div>';

    showToast('🗑️ All fields cleared!');
  });

  // ─── Toast ───────────────────────────────────────────────
  function showToast(msg, isWarn = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.style.borderColor = isWarn ? 'rgba(234,179,8,0.4)' : 'rgba(34,197,94,0.3)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ─── Projects Logic ──────────────────────────────────────
  function getProjectsKey() {
    const email = sessionStorage.getItem('mf_session');
    return email ? `mf_projects_${email}` : null;
  }

  function getProjects() {
    const key = getProjectsKey();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  function saveProjects(projects) {
    const key = getProjectsKey();
    if (key) localStorage.setItem(key, JSON.stringify(projects));
  }

  function renderProjects() {
    const list = document.getElementById('projects-list');
    if (!list) return;
    const projects = getProjects();
    
    if (projects.length === 0) {
      list.innerHTML = `<div class="empty-projects">No projects saved yet.</div>`;
      return;
    }

    list.innerHTML = projects.map(p => `
      <div class="project-item">
        <div class="project-info">
          <div class="project-name">${htmlEscape(p.name)}</div>
          <div class="project-date">Saved on ${p.date}</div>
        </div>
        <div class="project-actions">
          <button class="btn-action load-btn" data-id="${p.id}">Load</button>
          <button class="btn-action btn-danger delete-btn" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.load-btn').forEach(btn => {
      btn.addEventListener('click', () => loadProject(parseInt(btn.dataset.id)));
    });
    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteProject(parseInt(btn.dataset.id)));
    });
  }

  function loadProject(id) {
    const project = getProjects().find(p => p.id === id);
    if (!project) return;
    
    const data = project.data;
    for (const [key, value] of Object.entries(data)) {
      const el = document.getElementById(key);
      if (el) {
        if (el.type === 'checkbox') {
          el.checked = value;
        } else {
          el.value = value;
        }
      }
    }
    
    // Trigger updates
    ['page-title', 'page-desc', 'page-url', 'og-title', 'og-desc', 'og-image', 'og-site-name', 'theme-color'].forEach(id => {
      document.getElementById(id)?.dispatchEvent(new Event('input'));
    });
    document.getElementById('og-type')?.dispatchEvent(new Event('change'));
    
    document.getElementById('projects-modal').hidden = true;
    showToast(`📂 Loaded "${project.name}"`);
  }

  function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const projects = getProjects().filter(p => p.id !== id);
    saveProjects(projects);
    renderProjects();
    showToast('🗑️ Project deleted');
  }

  document.getElementById('save-project-btn')?.addEventListener('click', () => {
    const key = getProjectsKey();
    if (!key) {
      showToast('⚠️ Please sign in to save projects.', true);
      return;
    }

    let defaultName = document.getElementById('page-title').value.trim();
    if (!defaultName) defaultName = 'Untitled Project';

    const name = prompt('Enter a name for this project:', defaultName);
    if (!name) return; // cancelled

    const data = {};
    document.querySelectorAll('.form-input, .form-textarea, .form-select, input[type="checkbox"]').forEach(el => {
      if (el.id) {
        data[el.id] = el.type === 'checkbox' ? el.checked : el.value;
      }
    });

    const projects = getProjects();
    projects.push({
      id: Date.now(),
      name: name,
      date: new Date().toLocaleDateString(),
      data: data
    });
    saveProjects(projects);
    showToast(`💾 Saved "${name}"`);
  });

  document.getElementById('open-projects-btn')?.addEventListener('click', () => {
    renderProjects();
    document.getElementById('projects-modal').hidden = false;
  });

  document.getElementById('projects-close-btn')?.addEventListener('click', () => {
    document.getElementById('projects-modal').hidden = true;
  });

  document.getElementById('projects-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('projects-modal').hidden = true;
  });

  // ─── Export Backup ───────────────────────────────────────
  document.getElementById('export-projects-btn')?.addEventListener('click', () => {
    const projects = getProjects();
    if (projects.length === 0) {
      showToast('⚠️ No projects to export', true);
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    const date = new Date().toISOString().split('T')[0];
    a.download = `metaforge-projects-${date}.json`;
    a.click();
    showToast('📥 Backup exported successfully!');
  });

  // ─── Initial state ───────────────────────────────────────
  updateSERPPreview();
  updateSocialPreview();
});
