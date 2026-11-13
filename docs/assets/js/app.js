'use strict';

(function () {
  var CANDIDATE_URLS = ['data/skills.json', './data/skills.json'];
  var GITHUB_REPO = 'https://github.com/MamounHisham1/vstack';
  var SKILLS_SH = 'https://skills.sh/MamounHisham1/vstack';

  var state = { all: [], filtered: [] };

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      switch (ch) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return ch;
      }
    });
  }

  function $(id) {
    return document.getElementById(id);
  }

  function skillText(skill) {
    return [skill.id, skill.title, skill.description].filter(Boolean).join(' ').toLowerCase();
  }

  function installCmdFor(skill) {
    if (skill.install_cmd) return skill.install_cmd;
    if (skill.id) return 'npx skills add MamounHisham1/vstack --skill ' + skill.id + ' -y';
    return 'npx skills add MamounHisham1/vstack --skill \'*\' -y';
  }

  function skillPathFor(skill) {
    if (skill.path) return skill.path;
    if (skill.id) return 'skills/' + skill.id + '/SKILL.md';
    return '';
  }

  function copyText(text, btn) {
    function done(ok) {
      if (!btn) return;
      var original = btn.getAttribute('data-label') || 'Copy';
      btn.textContent = ok ? 'Copied!' : 'Copy failed';
      window.setTimeout(function () { btn.textContent = original; }, 1400);
    }
    if (text == null) text = '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        done(!!ok);
      } catch (e) {
        done(false);
      }
    }
  }

  function updateCount(countEl, shown, total) {
    if (!countEl) return;
    countEl.textContent = shown + ' of ' + total + ' skills';
  }

  function renderCards(grid, modal, countEl, skills) {
    if (!grid) return;
    grid.innerHTML = '';
    if (!skills.length) {
      var empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'No skills match your search.';
      grid.appendChild(empty);
      return;
    }
    skills.forEach(function (skill) {
      var id = skill.id || 'unknown';
      var title = skill.title || id;
      var desc = skill.description || '';
      var trigger = skill.trigger || ('/' + id);
      var cmd = installCmdFor(skill);

      var card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('data-skill-id', id);
      card.setAttribute('aria-label', title + ' — open details');

      var h3 = document.createElement('h3');
      h3.textContent = title;
      card.appendChild(h3);

      var idLine = document.createElement('p');
      idLine.className = 'card-id';
      var idCode = document.createElement('code');
      idCode.textContent = id;
      idLine.appendChild(idCode);
      card.appendChild(idLine);

      var p = document.createElement('p');
      p.className = 'card-desc';
      p.textContent = desc;
      card.appendChild(p);

      var meta = document.createElement('div');
      meta.className = 'meta';

      var pill = document.createElement('code');
      pill.className = 'pill';
      pill.textContent = trigger;
      meta.appendChild(pill);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn card-install';
      btn.setAttribute('data-label', 'Install');
      btn.textContent = 'Install';
      btn.setAttribute('aria-label', 'Copy install command for ' + id);
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        copyText(cmd, btn);
      });
      meta.appendChild(btn);
      card.appendChild(meta);

      card.addEventListener('click', function () { openModal(modal, skill); });
      card.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          openModal(modal, skill);
        }
      });

      grid.appendChild(card);
    });
  }

  function openModal(modal, skill) {
    if (!modal) return;
    var id = skill.id || 'unknown';
    var title = skill.title || id;
    var desc = skill.description || '';
    var trigger = skill.trigger || ('/' + id);
    var cmd = installCmdFor(skill);
    var path = skillPathFor(skill);
    var githubUrl = path ? GITHUB_REPO + '/blob/main/' + path : GITHUB_REPO;

    modal.innerHTML =
      '<div class="modal-overlay" data-close="true">' +
        '<div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
          '<button type="button" class="modal-close" data-close="true" aria-label="Close dialog">&times;</button>' +
          '<h2 id="modal-title">' + escapeHtml(title) + '</h2>' +
          '<p class="modal-id"><code>' + escapeHtml(id) + '</code></p>' +
          '<p class="modal-desc">' + escapeHtml(desc) + '</p>' +
          '<p class="modal-trigger">Trigger <code>' + escapeHtml(trigger) + '</code></p>' +
          '<pre class="modal-pre"><code>' + escapeHtml(cmd) + '</code></pre>' +
          '<div class="modal-actions">' +
            '<button type="button" class="copy-btn modal-copy">Copy install command</button>' +
            '<a class="modal-link" href="' + escapeHtml(githubUrl) + '" target="_blank" rel="noopener">View SKILL.md on GitHub</a>' +
            '<a class="modal-link" href="' + escapeHtml(SKILLS_SH) + '" target="_blank" rel="noopener">View on skills.sh</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    modal.hidden = false;

    var copyBtn = modal.querySelector('.modal-copy');
    if (copyBtn) {
      copyBtn.setAttribute('data-label', copyBtn.textContent);
      copyBtn.addEventListener('click', function () { copyText(cmd, copyBtn); });
    }

    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        if (el.classList.contains('modal-overlay') && ev.target !== el) return;
        closeModal(modal);
      });
    });

    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.innerHTML = '';
    modal.hidden = true;
  }

  function isModalOpen(modal) {
    return !!modal && modal.hidden === false && !!modal.innerHTML;
  }

  function applyFilter(grid, modal, countEl, searchEl) {
    var q = searchEl && searchEl.value ? searchEl.value.trim().toLowerCase() : '';
    var filtered = !q
      ? state.all.slice()
      : state.all.filter(function (s) { return skillText(s).indexOf(q) !== -1; });
    state.filtered = filtered;
    renderCards(grid, modal, countEl, filtered);
    updateCount(countEl, filtered.length, state.all.length);
    return filtered;
  }

  function showFetchError(grid, countEl) {
    if (countEl) countEl.textContent = '';
    if (!grid) return;
    grid.innerHTML =
      '<p class="error">Could not load the skill catalog. ' +
      'See the source on <a href="' + GITHUB_REPO + '">GitHub</a>.</p>';
  }

  function fetchSkills() {
    function tryNext(index) {
      if (index >= CANDIDATE_URLS.length) {
        return Promise.reject(new Error('all candidates failed'));
      }
      return fetch(CANDIDATE_URLS[index], { headers: { Accept: 'application/json' } }).then(function (res) {
        if (!res.ok) return tryNext(index + 1);
        return res.json().then(function (data) {
          if (!Array.isArray(data)) return tryNext(index + 1);
          return data;
        }, function () { return tryNext(index + 1); });
      }, function () { return tryNext(index + 1); });
    }
    return tryNext(0);
  }

  function init() {
    var grid = $('skills-grid');
    var searchEl = $('search');
    var countEl = $('skill-count');
    var modal = $('skill-modal');

    if (modal && modal.hidden !== false) modal.hidden = true;

    if (searchEl) {
      searchEl.addEventListener('input', function () {
        applyFilter(grid, modal, countEl, searchEl);
      });
    }

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && modal && isModalOpen(modal)) closeModal(modal);
    });

    if (!grid) return;

    fetchSkills().then(function (data) {
      state.all = data;
      state.filtered = data.slice();
      renderCards(grid, modal, countEl, state.filtered);
      updateCount(countEl, state.filtered.length, state.all.length);
    }, function () {
      showFetchError(grid, countEl);
    });
  }

  window.__vstack = {
    state: state,
    escapeHtml: escapeHtml,
    applyFilter: applyFilter,
    renderCards: renderCards,
    openModal: openModal,
    closeModal: closeModal,
    fetchSkills: fetchSkills,
    installCmdFor: installCmdFor
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
