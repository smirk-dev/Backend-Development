# Experiment 07 & 08 — ES6, DOM Manipulation, and Event Handling

Manual: `Lectures/Backend Development/Lab/Exp 07_08 ES6, DOM Manipulation, and Event Handling.md`

Every section of the manual, as a live demo with an output panel.

| Manual | Where |
|--------|-------|
| Part A, 3.1-3.10 (ES6) | `index.html#part-a` · `js/es6.js`, `js/math.js` |
| Part B, 4.1-4.8 (DOM) | `index.html#part-b` · `js/dom.js` |
| Part C, 5.1-5.9 (events) | `index.html#part-c` · `js/events.js` |
| 6 Practical exercise (To-Do) | `todo/index.html` + `todo/app.js` — the manual's code, unchanged |
| 7-8 Summary, common errors | `index.html#summary` |

## Run

Must be served over HTTP — the scripts are ES modules (manual 3.8), which browsers refuse on `file://`.

```bash
py -3 -m http.server 8000     # then open http://localhost:8000
```

No install, no CDN, works offline.

## Checks run

Driven in headless Chrome over CDP: every output panel read back, every button clicked,
zero console errors, no horizontal overflow. Notable results: `const` reassignment throws
`TypeError`; arrow function keeps outer `this` while a plain callback does not; clicking the
inner button logs `Inner clicked` then `Outer clicked`, and `stopPropagation()` suppresses the
second; delegation handles a task added after the listener was attached; the To-Do app adds
(button and Enter), toggles and deletes.

The XSS demo uses an inert `<img>` (no `onerror` script), so it shows `innerHTML` parsing a
string into an element without executing anything.
