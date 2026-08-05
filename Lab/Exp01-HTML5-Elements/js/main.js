/* ------------------------------------------------------------------
   Exp 01 — the small amount of JavaScript the page needs.
   Nothing here is required for the content to make sense; it only
   drives the elements that are interactive by definition.
   ------------------------------------------------------------------ */

/* 1. Range slider -> <output> ------------------------------------- */

const hours = document.getElementById('hours');
const hoursOut = document.getElementById('hoursOut');

if (hours && hoursOut) {
  const sync = () => { hoursOut.value = hours.value; };
  hours.addEventListener('input', sync);
  sync();
}

/* 2. Colour picker repaints the accent ---------------------------- */

const accent = document.getElementById('accent');

if (accent) {
  accent.addEventListener('input', () => {
    document.documentElement.style.setProperty('--accent', accent.value);
    drawLatency();
  });
}

/* 3. <menu> buttons write to the status line ---------------------- */

const consoleOut = document.querySelector('.console-out');

document.querySelectorAll('menu button[data-log]').forEach((button) => {
  button.addEventListener('click', () => {
    const stamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    consoleOut.textContent = `[${stamp}] ${button.dataset.log}`;
  });
});

/* 4. Canvas: response times for the last seven days ---------------- */

const canvas = document.getElementById('latency');
const samples = [
  { day: 'Mon', ms: 180 },
  { day: 'Tue', ms: 142 },
  { day: 'Wed', ms: 210 },
  { day: 'Thu', ms: 96 },
  { day: 'Fri', ms: 130 },
  { day: 'Sat', ms: 88 },
  { day: 'Sun', ms: 104 }
];

function drawLatency() {
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const styles = getComputedStyle(document.documentElement);
  const ink = styles.getPropertyValue('--ink').trim();
  const muted = styles.getPropertyValue('--muted').trim();
  const bar = styles.getPropertyValue('--accent').trim();

  // Redraw from scratch so the colour picker can re-run this.
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const padLeft = 38;
  const padBottom = 26;
  const padTop = 12;
  const plotW = width - padLeft - 12;
  const plotH = height - padTop - padBottom;
  const peak = 240;
  const slot = plotW / samples.length;

  ctx.font = '11px Consolas, monospace';
  ctx.textBaseline = 'middle';

  // Horizontal guides at 0, 120 and 240 ms.
  [0, 120, 240].forEach((value) => {
    const y = padTop + plotH - (value / peak) * plotH;
    ctx.strokeStyle = '#e6e0d4';
    ctx.beginPath();
    ctx.moveTo(padLeft, y + 0.5);
    ctx.lineTo(padLeft + plotW, y + 0.5);
    ctx.stroke();

    ctx.fillStyle = muted;
    ctx.textAlign = 'right';
    ctx.fillText(String(value), padLeft - 8, y);
  });

  // Bars.
  samples.forEach((sample, i) => {
    const barW = slot * 0.46;
    const x = padLeft + i * slot + (slot - barW) / 2;
    const h = (sample.ms / peak) * plotH;
    const y = padTop + plotH - h;

    ctx.fillStyle = sample.ms > 200 ? bar : ink;
    ctx.fillRect(x, y, barW, h);

    ctx.fillStyle = muted;
    ctx.textAlign = 'center';
    ctx.fillText(sample.day, x + barW / 2, height - 12);
  });
}

drawLatency();

/* 5. Native dialog ------------------------------------------------- */

const dialog = document.getElementById('dialog');
const openDialog = document.getElementById('openDialog');

if (dialog && openDialog) {
  openDialog.addEventListener('click', () => dialog.showModal());

  // Clicking the backdrop (i.e. outside the box) should close it too.
  dialog.addEventListener('click', (event) => {
    const box = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= box.left && event.clientX <= box.right &&
      event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) dialog.close();
  });
}

/* 6. <template> stamped once per record ---------------------------- */

const template = document.getElementById('row-template');
const records = document.getElementById('records');
const log = [
  { method: 'GET', path: '/api/students', ms: 42 },
  { method: 'POST', path: '/api/register', ms: 118 },
  { method: 'GET', path: '/api/students/34', ms: 27 },
  { method: 'DELETE', path: '/api/session', ms: 61 }
];

if (template && records) {
  log.forEach((entry) => {
    const row = template.content.cloneNode(true);
    row.querySelector('.record-method').textContent = entry.method;
    row.querySelector('.record-path').textContent = entry.path;
    row.querySelector('.record-ms').textContent = `${entry.ms} ms`;
    records.append(row);
  });
}

/* 7. Form submit — show what the server would have received -------- */

const form = document.getElementById('signup');
const payload = document.getElementById('payload');

if (form && payload) {
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // there is no server behind this page

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const body = {};
    for (const [key, value] of new FormData(form)) {
      // Checkboxes share a name, so those keys collect into an array.
      if (key in body) {
        body[key] = [].concat(body[key], value instanceof File ? value.name : value);
      } else {
        body[key] = value instanceof File ? value.name : value;
      }
    }

    payload.hidden = false;
    payload.textContent =
      'POST /api/register HTTP/1.1\n' +
      'content-type: application/json\n\n' +
      JSON.stringify(body, null, 2);
    payload.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  form.addEventListener('reset', () => {
    payload.hidden = true;
    payload.textContent = '';
  });
}
