'use strict';

(function () {
  var REPO = 'https://github.com/MamounHisham1/vstack';

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

  // Keep the " --skill <id> -y" tail on one line so a wrapped command never
  // leaves a lone "-y" on its own line.
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
          : 'Copy failed. Select the command and copy it manually.';
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

  function initSearch() {
    var input = document.getElementById('search');
    var grid = document.getElementById('skills-grid');
    var count = document.getElementById('skill-count');
    var empty = document.getElementById('catalog-empty');
    var clear = document.getElementById('clear-search');

    if (!input || !grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-skill-id]'));
    var total = cards.length;

    function apply() {
      var query = input.value.trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var match = !query || text.indexOf(query) !== -1;
        card.hidden = !match;
        if (match) shown += 1;
      });

      if (count) count.textContent = shown + ' of ' + total + ' cards';
      if (empty) empty.hidden = shown !== 0;
    }

    input.addEventListener('input', apply);

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && input.value) {
        input.value = '';
        apply();
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        apply();
        input.focus();
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      var target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      var dialog = document.getElementById('skill-dialog');
      if (dialog && dialog.open) return;
      event.preventDefault();
      input.focus();
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

  function initDialog() {
    var dialog = document.getElementById('skill-dialog');
    if (!dialog) return;
    var lastFocused = null;

    function close() {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
        document.documentElement.style.overflow = '';
      }
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    dialog.addEventListener('close', function () {
      document.documentElement.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    });

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) close();
    });

    document.addEventListener('click', function (event) {
      var copyButton = event.target.closest('[data-copy]');
      if (copyButton) {
        copyText(copyButton.getAttribute('data-copy') || '', copyButton);
        return;
      }

      var openButton = event.target.closest('[data-open-card]');
      if (openButton) {
        var card = openButton.closest('[data-skill-id]');
        if (card) {
          var data = card.dataset;
          var no = document.getElementById('dialog-no');
          var id = document.getElementById('dialog-id');
          var title = document.getElementById('dialog-title');
          var desc = document.getElementById('dialog-desc');
          var trigger = document.getElementById('dialog-trigger');
          var path = document.getElementById('dialog-path');
          var command = document.getElementById('dialog-command');
          var source = document.getElementById('dialog-source');
          var dialogCopy = dialog.querySelector('[data-dialog-copy]');

          if (no) no.textContent = data.no || '01';
          if (id) id.textContent = data.skillId || '';
          if (title) title.textContent = data.title || '';
          if (desc) desc.textContent = data.description || '';
          if (trigger) trigger.textContent = data.trigger || '';
          if (path) path.textContent = data.path || '';
          if (command) command.innerHTML = commandMarkup(data.command || '');
          if (source) source.href = REPO + '/blob/main/' + (data.path || '');
          if (dialogCopy) {
            resetCopyButton(dialogCopy);
            dialogCopy.setAttribute('data-copy', data.command || '');
            if (!dialogCopy.dataset.label) dialogCopy.dataset.label = 'Copy';
            if (dialogCopy.dataset.ariaLabel === undefined) {
              dialogCopy.dataset.ariaLabel = dialogCopy.getAttribute('aria-label') || '';
            }
          }

          lastFocused = document.activeElement;
          document.documentElement.style.overflow = 'hidden';
          if (typeof dialog.showModal === 'function') {
            if (!dialog.open) dialog.showModal();
          } else {
            dialog.setAttribute('open', '');
          }
        }
        return;
      }

      if (event.target.closest('[data-close-dialog]')) close();
    });
  }

  function init() {
    initSearch();
    initPicker();
    initDialog();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
