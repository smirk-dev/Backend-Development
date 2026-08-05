# Experiment 1 — Create a web page with all possible elements of HTML5

Backend Development (CSFS3008P) · B.Tech Full Stack, Semester 5 · Suryansh

## What it is

A single hand-written page that uses **110 distinct HTML elements** — every non-deprecated
element in the lab manual's list — with real content attached to each one instead of a
demo grid of tags. The page is styled as a set of lab notes: one column, one accent colour,
no framework and no build step.

## Running it

The page needs to be served over HTTP, not opened as `file://`, or the browser will
refuse to load the caption track and the framed documents.

```
# VS Code: right-click index.html → "Open with Live Server"

# or, from this folder:
py -3 -m http.server 8000
npx serve .
```

Then open <http://localhost:8000>.

## Files

| Path | What is in it |
|------|---------------|
| `index.html` | The page. All the markup. |
| `css/style.css` | Layout and type. One accent variable drives the colour. |
| `js/main.js` | Only what the interactive elements need: canvas drawing, dialog, `<template>` cloning, range → `<output>`, form preview. |
| `assets/*.svg` | Diagrams, drawn by hand in SVG so nothing depends on a CDN. |
| `assets/demo.mp4`, `demo.webm` | Video for `<video>`, two formats. |
| `assets/tone.mp3`, `tone.ogg` | Audio for `<audio>`, two formats. |
| `assets/captions.vtt` | Caption file loaded by `<track>`. |
| `assets/status-codes.html` | Small page loaded by `<iframe>` and `<object>`. |

Every asset is local. The page renders identically with the network switched off.

## Element coverage

Section 08 of the page lists all 110 elements grouped by category, and gives the console
one-liner that counts them. Input types covered: `text`, `email`, `password`, `tel`,
`url`, `search`, `number`, `range`, `date`, `month`, `week`, `time`, `datetime-local`,
`color`, `file`, `checkbox`, `radio`, `hidden` — 18 in total.

**Deliberately left out:** `font`, `center`, `big`, `strike`, `tt`, `acronym`, `dir`,
`applet`, `frame`, `frameset`, `noframes`, `basefont`, `menuitem` and `param`. They appear
in the manual's alphabetical table but are deprecated or removed in HTML5, so using them
would fail validation. They are documented on the page instead.

## Notes for the viva

- Semantic elements are chosen by meaning, not appearance: `<article>` for self-contained
  pieces, `<section>` for thematic groups, `<aside>` for the margin notes.
- The form is the part that matters for a backend course. Submitting it prints the exact
  JSON body a server would receive, built from `FormData` — the `name` attribute is what
  becomes the key, which is the whole client-to-server contract.
- `<canvas>` paints pixels and leaves nothing in the DOM; inline `<svg>` is markup, so CSS
  and JS can reach into it. Both are on the page next to each other for comparison.
- `<dialog>` gives focus trapping, `Esc`-to-close and a `::backdrop` with no library.
- `<template>` is the browser's version of what a server template engine does: markup that
  is parsed but not rendered until something stamps it out per record.
- The page still works with JavaScript disabled — the `<noscript>` block says which four
  things stop working, and nothing else does.

## Checks run

- 110 HTML element types present, verified in the console.
- No console errors or warnings.
- No duplicate `id`s; every `<label for>` resolves to a control.
- No horizontal overflow at 1280 px or at 390 px.
- Video, audio and the caption track all reach `readyState 4`; 3 cues parsed from the VTT.
