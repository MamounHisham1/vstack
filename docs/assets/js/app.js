'use strict';

(function () {
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

  function commandMarkup(command) {
    return escapeHtml(command).replace(/ (--skill .*)$/, ' <span class="cmd-tail">$1</span>');
  }

  function resetCopyButton(button) {
    if (!button) return;
    if (button._copyTimer) {
      window.clearTimeout(button._copyTimer);
      button._copyTimer = null;
    }
    if (button.dataset.label) button.textContent = button.dataset.label;
    button.classList.remove('is-copied');
    if (button.dataset.ariaLabel) button.setAttribute('aria-label', button.dataset.ariaLabel);
    else if (button.dataset.ariaLabel === '') button.removeAttribute('aria-label');
  }

  function copyText(text, button) {
    if (!button.dataset.label) button.dataset.label = button.textContent;
    if (button.dataset.ariaLabel === undefined) {
      button.dataset.ariaLabel = button.getAttribute('aria-label') || '';
    }
    if (button._copyTimer) {
      window.clearTimeout(button._copyTimer);
      button._copyTimer = null;
    }

    var original = button.dataset.label;

    function announce(ok) {
      var status = document.getElementById('copy-status');
      if (!status) return;
      status.textContent = '';
      window.setTimeout(function () {
        status.textContent = ok
          ? 'Copied to clipboard.'
          : 'Copy failed. Select the text and copy it manually.';
      }, 40);
    }

    function done(ok) {
      button.textContent = ok ? 'Copied' : 'Copy failed';
      button.classList.toggle('is-copied', ok);
      button.setAttribute('aria-label', ok ? 'Copied to clipboard' : 'Copy failed');
      announce(ok);
      button._copyTimer = window.setTimeout(function () {
        button.textContent = original;
        button.classList.remove('is-copied');
        if (button.dataset.ariaLabel) button.setAttribute('aria-label', button.dataset.ariaLabel);
        else button.removeAttribute('aria-label');
        button._copyTimer = null;
      }, 1500);
    }

    function fallback() {
      try {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(area);
        done(!!ok);
      } catch (error) {
        done(false);
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        done(true);
      }, fallback);
    } else {
      fallback();
    }
  }

  function initFilter() {
    var input = document.getElementById('search');
    var list = document.getElementById('skill-list');
    if (!input || !list) return;

    var items = Array.prototype.slice.call(list.querySelectorAll('[data-skill]'));
    var count = document.getElementById('skill-count');
    var empty = document.getElementById('no-results');

    function apply() {
      var query = input.value.trim().toLowerCase();
      var shown = 0;

      items.forEach(function (item) {
        var text = item.getAttribute('data-search') || '';
        var match = !query || text.indexOf(query) !== -1;
        item.hidden = !match;
        if (match) shown += 1;
      });

      if (count) count.textContent = shown + ' of ' + items.length + ' skills';
      if (empty) empty.hidden = shown !== 0;
    }

    input.addEventListener('input', apply);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && input.value) {
        input.value = '';
        apply();
      }
    });
    apply();
  }

  function initPicker() {
    var picker = document.getElementById('skill-picker');
    var command = document.getElementById('picker-command');
    var copy = document.getElementById('picker-copy');
    if (!picker || !command || !copy) return;

    function update() {
      var option = picker.options[picker.selectedIndex];
      if (!option) return;
      var cmd = option.getAttribute('data-command') ||
        'npx skills add MamounHisham1/vstack --skill ' + option.value + ' -y';
      resetCopyButton(copy);
      command.innerHTML = commandMarkup(cmd);
      copy.setAttribute('data-copy', cmd);
      copy.setAttribute('aria-label', 'Copy the install command for ' + option.value);
      copy.dataset.ariaLabel = 'Copy the install command for ' + option.value;
    }

    picker.addEventListener('change', update);
    update();
  }

  function initInstallLinks() {
    var production = 'https://mamounhisham1.github.io/vstack/install.md';
    var href = window.location.href.split('#')[0].split('?')[0].replace(/\/[^/]*$/, '/') + 'install.md';

    document.querySelectorAll('[data-copy]').forEach(function (element) {
      if (element.getAttribute('data-copy') === production) {
        element.setAttribute('data-copy', href);
      }
    });

    document.querySelectorAll('.link-field code').forEach(function (element) {
      element.textContent = href;
    });
  }

  function initShortcut() {
    document.addEventListener('keydown', function (event) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      var input = document.getElementById('search');
      if (!input) return;
      var target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      event.preventDefault();
      input.focus();
    });
  }

  function init() {
    initInstallLinks();
    initFilter();
    initPicker();
    initShortcut();

    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-copy]');
      if (button) copyText(button.getAttribute('data-copy') || '', button);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
