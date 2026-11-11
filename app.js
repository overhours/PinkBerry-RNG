/* Pinkberry RNG download site. Plain JS, no build step. Pixel art comes from data.js (window.PB). */
(function () {
  'use strict';

  var PB = window.PB || { icons: {}, lola: {}, sprites: [] };
  var REPO = 'overhours/PinkBerry-RNG';
  var DOWNLOAD = 'https://github.com/' + REPO + '/releases/latest/download/Pinkberry-RNG-Setup.exe';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === 'class') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    (kids || []).forEach(function (c) {
      if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) {
      return null;
    }
  }
  function fmtDate(iso) {
    var d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function mb(bytes) {
    return Math.round(bytes / 1048576) + ' MB';
  }
  function copyText(text, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function () {
        btn.textContent = old;
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
  }

  /* ───────── Theme ───────── */
  var themeBtn = $('#theme');
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function paintTheme() {
    themeBtn.firstElementChild.textContent = isDark() ? '☀' : '☾';
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute('content', isDark() ? '#2a1f4a' : '#ffe0ec');
  }
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    store('pb-theme', next);
    paintTheme();
  });
  paintTheme();

  /* ───────── Pixel icons + Lola ───────── */
  $$('img[data-icon]').forEach(function (img) {
    var src = PB.icons[img.getAttribute('data-icon')];
    if (src) {
      img.src = src;
      img.classList.add('px');
    } else img.remove();
  });
  var lolaImgs = [$('#lola'), $('#lola-end'), $('#started-lola')];
  lolaImgs.forEach(function (img) {
    if (img && PB.lola.idle) img.src = PB.lola.idle;
  });
  function blink(img) {
    if (!img || !PB.lola.blink) return;
    setTimeout(function () {
      img.src = PB.lola.blink;
      setTimeout(function () {
        img.src = PB.lola.idle;
        blink(img);
      }, 140);
    }, 2200 + Math.random() * 2800);
  }
  lolaImgs.forEach(blink);
  var lola = $('#lola');
  if (lola) {
    lola.addEventListener('click', function () {
      if (reduced) return;
      lola.classList.remove('hop');
      void lola.offsetWidth;
      lola.classList.add('hop');
    });
  }

  /* ───────── Floating hearts in the header ───────── */
  (function () {
    var box = $('#floaters');
    if (!box) return;
    var kinds = ['heart', 'sparkle', 'star', 'heart', 'clover'];
    var n = window.innerWidth < 700 ? 7 : 12;
    for (var i = 0; i < n; i++) {
      var animal = i % 4 === 3 && PB.sprites.length;
      var src = animal ? PB.sprites[(i * 7) % PB.sprites.length] : PB.icons[kinds[i % kinds.length]];
      if (!src) continue;
      var size = Math.round(animal ? 34 + Math.random() * 12 : 14 + Math.random() * 12);
      var img = el('img', { src: src, width: size, height: size, alt: '' });
      img.style.left = ((i * 41.3 + Math.random() * 10) % 100) + '%';
      img.style.opacity = animal ? '0.7' : '0.55';
      img.style.animationDuration = 18 + Math.random() * 14 + 's';
      img.style.animationDelay = -Math.random() * 30 + 's';
      box.appendChild(img);
    }
  })();

  /* ───────── Not on Windows? ───────── */
  (function () {
    var ua = navigator.userAgent || '';
    var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    var mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    var mac = /Mac/i.test(platform) && !mobile && navigator.maxTouchPoints < 2;
    var linux = /Linux/i.test(platform) && !/Android/i.test(ua);
    var win = /Win/i.test(platform) || /Windows/i.test(ua);
    if (win && !mobile) return;
    var note = $('#os-note');
    var what = mobile ? 'a phone or tablet' : mac ? 'a Mac' : linux ? 'Linux' : 'a computer that isn’t Windows';
    $('#os-text').textContent = 'Looks like you’re on ' + what + '. Pinkberry RNG only runs on Windows PCs, so send this link to your PC and download it there.';
    note.classList.add('show');
    $('#copy-link').addEventListener('click', function (e) {
      copyText(location.href.split('#')[0], e.currentTarget);
    });
  })();

  /* ───────── Download buttons + "download started" banner ───────── */
  var banner = $('#started');
  var bannerTimer = 0;
  function hideBanner() {
    banner.classList.remove('show');
  }
  $$('[data-download]').forEach(function (a) {
    a.href = DOWNLOAD;
    if (a.hasAttribute('data-no-banner')) return;
    a.addEventListener('click', function () {
      setTimeout(function () {
        banner.classList.add('show');
      }, 400);
      clearTimeout(bannerTimer);
      bannerTimer = setTimeout(hideBanner, 20000);
    });
  });
  $('#started-x').addEventListener('click', hideBanner);
  $('#show-steps').addEventListener('click', hideBanner);

  /* ───────── Latest version info (latest.json is updated by every release) ───────── */
  fetch('latest.json', { cache: 'no-store' })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (info) {
      if (!info) return;
      var size = mb(info.size);
      $('#dl-sub').textContent = 'Version ' + info.version + ' · ' + size;
      var meta = $('#dl-meta');
      meta.innerHTML = '';
      meta.appendChild(el('span', { class: 'chip' }, [el('i', { class: 'dot' }), 'Version ', el('b', { text: info.version })]));
      meta.appendChild(el('span', { class: 'chip', text: 'Updated ' + fmtDate(info.date) }));
      meta.appendChild(el('span', { class: 'chip', text: size }));
      meta.appendChild(el('span', { class: 'chip', text: 'Windows 10 & 11 · 64-bit' }));
      meta.appendChild(el('span', { class: 'chip', text: 'Free · no account' }));
      $$('.dl-size').forEach(function (n) {
        n.textContent = size + ' · Done';
      });
      $$('.size-txt').forEach(function (n) {
        n.textContent = 'about ' + size;
      });
      $('#sha').textContent = info.sha256.toUpperCase();
      $('#hash-ver').textContent = 'version ' + info.version;
      var copy = $('#copy-sha');
      copy.hidden = false;
      copy.addEventListener('click', function () {
        copyText(info.sha256.toUpperCase(), copy);
      });
    })
    .catch(function () {
      $('#sha').textContent = 'Listed on the latest release page on GitHub.';
    });

  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      copyText(b.getAttribute('data-copy'), b);
    });
  });

  /* ───────── Releases from GitHub ───────── */
  (function () {
    var latestBox = $('#rel-latest');
    var list = $('#vlist');
    function parse(body) {
      var lines = (body || '').split(/\r?\n/);
      var title = '';
      var notes = [];
      for (var i = 0; i < lines.length; i++) {
        var ln = lines[i].trim();
        if (/^###\s/.test(ln)) break;
        if (/^##\s/.test(ln)) title = ln.replace(/^##\s+/, '');
        else if (/^[-*]\s/.test(ln)) notes.push(ln.replace(/^[-*]\s+/, '').replace(/\*\*/g, ''));
      }
      return { title: title, notes: notes };
    }
    function fail() {
      latestBox.classList.remove('skeleton');
      latestBox.innerHTML = '';
      latestBox.appendChild(el('h3', { text: 'Couldn’t load the update notes' }));
      latestBox.appendChild(el('p', {}, ['They’re all on ', el('a', { href: 'https://github.com/' + REPO + '/releases', text: 'GitHub' }), '.']));
      list.hidden = true;
    }
    fetch('https://api.github.com/repos/' + REPO + '/releases?per_page=8', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (rels) {
        if (!rels || !rels.length) return fail();
        rels = rels.filter(function (r) {
          return !r.draft && !r.prerelease;
        });
        var first = rels[0];
        var p = parse(first.body);
        latestBox.classList.remove('skeleton');
        latestBox.innerHTML = '';
        latestBox.appendChild(el('div', { class: 'v' }, [el('span', { text: first.tag_name.replace(/^v/, 'VERSION ') }), el('span', { class: 'pill', text: 'LATEST' }), el('span', { style: 'color:var(--muted)', text: fmtDate(first.published_at) })]));
        latestBox.appendChild(el('h3', { text: p.title || first.name }));
        var ul = el('ul');
        p.notes.forEach(function (n) {
          ul.appendChild(el('li', { text: n }));
        });
        latestBox.appendChild(ul);
        var dl = el('a', { class: 'btn small', href: DOWNLOAD, text: 'Download ' + first.tag_name });
        latestBox.appendChild(dl);

        list.innerHTML = '';
        list.appendChild(el('h3', { text: 'Older versions' }));
        rels.slice(1, 7).forEach(function (r) {
          var asset = (r.assets || []).filter(function (a) {
            return /\.exe$/i.test(a.name);
          })[0];
          var info = parse(r.body);
          var row = el('div', { class: 'vrow' }, [
            el('div', {}, [el('b', { text: r.tag_name.replace(/^v/, 'Version ') + (info.title ? ' · ' + info.title : '') }), el('span', { text: fmtDate(r.published_at) + (asset ? ' · ' + mb(asset.size) : '') })]),
            el('a', { class: 'notes-l', href: r.html_url, text: 'Notes' }),
            asset ? el('a', { href: asset.browser_download_url, text: 'Download' }) : el('span', { text: '' }),
          ]);
          list.appendChild(row);
        });
        list.appendChild(el('div', { class: 'vrow' }, [el('span', { text: 'You almost always want the latest. Older versions update themselves once installed.' }), el('a', { href: 'https://github.com/' + REPO + '/releases', text: 'All' }), el('span')]));
      })
      .catch(fail);
  })();

  /* ───────── Scroll reveal ───────── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    $$('.reveal').forEach(function (n) {
      io.observe(n);
    });

    // Nav highlight
    var links = $$('.nav-links a');
    var navIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ['guide', 'requirements', 'verify', 'updates', 'releases', 'help'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) navIo.observe(s);
    });

    // Install-step progress dots
    var dots = $$('.guide-progress a');
    var stepIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var n = parseInt(e.target.id.replace('step-', ''), 10);
          dots.forEach(function (d) {
            var k = parseInt(d.getAttribute('data-step'), 10);
            d.classList.toggle('on', k === n);
            d.classList.toggle('done', k < n);
          });
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    $$('.step').forEach(function (s) {
      stepIo.observe(s);
    });
  } else {
    $$('.reveal').forEach(function (n) {
      n.classList.add('in');
    });
  }
})();
