'use strict';
/* ===== EDIT ME ===== */
const CONFIG = {
  eventStart: '2026-12-27T15:00:00+05:30',   // 3:00 PM IST
  eventDurationMinutes: null,                // null = no end time; e.g. 120 to add one
  eventTitle: 'Wedding of Sabu Varghese & Aneeshma Varghese',
  eventPlace: 'Marth Mariyam Valiyapalli, Thrissur, Kerala',
  videoYouTube: '',                          // YouTube video ID, e.g. 'dQw4w9WgXcQ'
  whatsapp: '',                              // e.g. '919XXXXXXXXX' (country code, no +) enables Send Wish / RSVP
  liveUrl: '', cardUrl: '',                  // optional live-stream / invitation-card links
  contact: { name: 'Mrs. Reji Varghese', phone: '919539829682', display: '+91 95398 29682' },  // e.g. { name:'Name', phone:'919XXXXXXXXX', display:'+91 9XXXX XXXXX' } shows the contact card
  compliments: ['With best compliments from', 'Shaji Varghese', 'Sali Joe', 'Joe Jose', 'Ashik Aamy Maria', 'Vinu Varghese'],                           // e.g. ['With best compliments from ...']
  hashtag: '',                               // e.g. '#SabuAneeshma'
  videoSrc: ''                               // e.g. 'assets/our-story.mp4'; empty = section hidden
};
const PHOTOS = [
  ['couple-01.jpg','Sabu and Aneeshma holding hands on a leafy path'],
  ['couple-02.jpg','Sabu and Aneeshma sharing a tender close-up'],
  ['couple-03.jpg','The couple walking hand in hand down garden steps'],
  ['couple-04.jpg','Aneeshma resting her head on Sabu\'s shoulder'],
  ['couple-05.jpg','The couple smiling at each other on garden steps'],
  ['couple-06.jpg','The couple seated together before a floral arch'],
  ['couple-07.jpg','The couple standing together before flowers']
];
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = n => String(n).padStart(2, '0');

/* Countdown */
const target = new Date(CONFIG.eventStart).getTime();
function tick() {
  const diff = Math.max(0, target - Date.now());
  const v = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
  $$('[data-u]').forEach(el => el.textContent = pad(v[el.dataset.u]));
  if (diff === 0) { $('#cd').hidden = true; $('#done').hidden = false; $('.rings').hidden = true; }
}
tick(); setInterval(tick, 1000);

/* Gallery */
const grid = $('#grid');
PHOTOS.forEach(([f, alt], i) => {
  const b = document.createElement('button');
  b.className = 'rv'; b.style.setProperty('--d', (i % 3) * .12 + 's'); b.setAttribute('aria-label', 'Open photo ' + (i + 1));
  b.innerHTML = `<img loading="lazy" src="assets/${f}" alt="${alt}">`;
  b.addEventListener('click', () => openLb(i)); grid.appendChild(b);
});

/* Lightbox */
const lb = $('#lb'), lbi = $('#lbi'); let cur = 0, opener = null;
function show(i) {
  cur = (i + PHOTOS.length) % PHOTOS.length; lbi.style.opacity = 0;
  lbi.onload = () => { lbi.style.opacity = 1; };
  lbi.src = 'assets/' + PHOTOS[cur][0]; lbi.alt = PHOTOS[cur][1];
  [cur - 1, cur + 1].forEach(n => { new Image().src = 'assets/' + PHOTOS[(n + PHOTOS.length) % PHOTOS.length][0]; });
}
function openLb(i) { opener = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbx').focus(); }
function closeLb() { lb.hidden = true; document.body.style.overflow = ''; opener && opener.focus(); }
$('#lbx').onclick = closeLb; $('#lbp').onclick = () => show(cur - 1); $('#lbn').onclick = () => show(cur + 1);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
});
let sx = 0;
lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 45) show(cur + (dx < 0 ? 1 : -1)); });

/* Optional video */
if (CONFIG.videoSrc || CONFIG.videoYouTube) {
  const s = document.createElement('section'); s.className = 'video center'; s.id = 'video';
  s.innerHTML = '<div class="wrap"><p class="eyebrow gold">Our Videos</p><h2 class="h2 ivory">A Story of Us</h2></div>';
  if (CONFIG.videoYouTube) { const f = document.createElement('iframe'); f.src = 'https://www.youtube-nocookie.com/embed/' + CONFIG.videoYouTube; f.title = 'Our video'; f.allowFullscreen = true; f.loading = 'lazy'; $('.wrap', s).appendChild(f); }
  else { const v = document.createElement('video'); v.controls = true; v.playsInline = true; v.preload = 'metadata'; v.src = CONFIG.videoSrc; v.addEventListener('error', () => s.remove()); $('.wrap', s).appendChild(v); }
  $('#videoMount').appendChild(s);
}

/* Reveal on scroll */
const rvs = $$('.rv');
if ('IntersectionObserver' in window && !reduce) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  rvs.forEach((el, i) => { if (!el.style.getPropertyValue('--d') && el.parentElement.querySelectorAll(':scope > .rv').length > 1) el.style.setProperty('--d', (i % 4) * .12 + 's'); io.observe(el); });
} else rvs.forEach(el => el.classList.add('in'));

/* Parallax (eased) */
const pars = $$('[data-par]'), heroImg = $('.hero-img');
let raf = false, loop = 0;
function step() {
  let moving = false;
  pars.forEach(el => { el._c += (el._t - el._c) * .1; if (Math.abs(el._t - el._c) > .05) moving = true; el.style.transform = `translate3d(0,${el._c.toFixed(2)}px,0)`; });
  loop = moving ? requestAnimationFrame(step) : 0;
}
function onScroll() {
  raf = false; const y = scrollY, vh = innerHeight;
  if (reduce) return;
  if (y < vh) heroImg.style.transform = `translateY(${y * .15}px)`;
  pars.forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) { el._t = -((r.top + r.height / 2 - vh / 2) / vh) * 40 - 4; if (el._c === undefined) el._c = el._t; }
  });
  if (!loop) loop = requestAnimationFrame(step);
}
addEventListener('scroll', () => { if (!raf) { raf = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* Toast */
const toast = $('#toast'); let tt;
const say = m => { toast.textContent = m; clearTimeout(tt); tt = setTimeout(() => toast.textContent = '', 3500); };

/* Share */
$$('#share, #qshare').forEach(b => b.addEventListener('click', async () => {
  const data = { title: 'Wedding Invitation · Sabu & Aneeshma', text: 'You are invited to the wedding of Sabu & Aneeshma on 27 December 2026.', url: location.href };
  try {
    if (navigator.share) { await navigator.share(data); return; }
    await navigator.clipboard.writeText(location.href); say('Invitation link copied!');
  } catch (e) {
    if (e.name === 'AbortError') return;
    const t = document.createElement('textarea'); t.value = location.href; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); say('Invitation link copied!'); } catch { say('Please copy the address from your browser.'); }
    t.remove();
  }
}));

/* Calendar (.ics download) */
function icsStamp(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
$$('#cal, #qcal').forEach(b => b.addEventListener('click', () => {
  const s = new Date(CONFIG.eventStart), e = CONFIG.eventDurationMinutes ? new Date(s.getTime() + CONFIG.eventDurationMinutes * 6e4) : null;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding//EN', 'BEGIN:VEVENT', 'UID:sabu-aneeshma-20261227@wedding', 'DTSTAMP:' + icsStamp(new Date()), 'DTSTART:' + icsStamp(s)];
  if (e) lines.push('DTEND:' + icsStamp(e));
  lines.push('SUMMARY:' + CONFIG.eventTitle, 'LOCATION:' + CONFIG.eventPlace, 'DESCRIPTION:Holy Matrimony at 3:00 PM. Reception 6:00 PM - 9:00 PM at Puzhayoram Gardens\\, Eravimangalam\\, Nadathara\\, Thrissur.', 'END:VEVENT', 'END:VCALENDAR');
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'sabu-aneeshma-wedding.ics' });
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  say('Calendar file downloaded.');
}));

/* Splash */
const splash = $('#splash');
document.body.classList.add('noscroll');
const bgm = $('#bgm'), mute = $('#mute');
function setMusic(on) {
  if (on) { const p = bgm.play(); p && p.catch(() => setMusic(false)); } else bgm.pause();
  const playing = on && !bgm.paused || on;
  mute.classList.toggle('muted', !on); mute.setAttribute('aria-pressed', String(on)); mute.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
}
mute.addEventListener('click', () => setMusic(bgm.paused));
document.addEventListener('visibilitychange', () => { if (document.hidden && !bgm.paused) bgm.pause(), mute.classList.add('muted'); });
$('#open').addEventListener('click', () => { mute.hidden = false; setMusic(true); splash.classList.add('gone'); document.body.classList.remove('noscroll'); setTimeout(() => splash.remove(), 1000); });
$('#open').focus({ preventScroll: true });

/* Optional links, WhatsApp */
const wmsg = encodeURIComponent('You are invited to the wedding of Sabu & Aneeshma on 27 December 2026. ' + location.href);
// WhatsApp icon (disabled): $('#wa').href = 'https://wa.me/?text=' + wmsg;
const on = (id, href) => { const el = $(id); if (el && href) { el.href = href; el.hidden = false; } };
/* RSVP / Send Wish (disabled)
if (CONFIG.whatsapp) {
  const w = t => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(t)}`;
  on('#wish', w('Congratulations Sabu & Aneeshma! Wishing you a blessed married life.')); on('#qwish', $('#wish').href);
  on('#rsvp', w('RSVP: I will be attending the wedding on 27 December 2026.')); on('#qrsvp', $('#rsvp').href);
  $('#wishRow').hidden = false;
}
*/
on('#qlive', CONFIG.liveUrl); on('#qcard', CONFIG.cardUrl);

/* Gratitude: contact, compliments, hashtag (shown only when filled in CONFIG) */
if (CONFIG.contact.phone) {
  const b = $('#contactBtn'); b.href = 'https://wa.me/' + CONFIG.contact.phone.replace(/\D/g, '');
  $('span', b).textContent = CONFIG.contact.display || CONFIG.contact.phone;
  $('#cname').textContent = CONFIG.contact.name; $('#contact').hidden = false;
}
CONFIG.compliments.forEach(t => { const p = document.createElement('p'); p.textContent = t; $('#comp').appendChild(p); });
if (CONFIG.hashtag) { $('#tag').textContent = CONFIG.hashtag; $('#tag').hidden = false; }

/* Back to top */
const fabUp = $('#fabUp');
fabUp.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
addEventListener('scroll', () => { fabUp.hidden = scrollY < 700; }, { passive: true });
