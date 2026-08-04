# Backend Development — Lab Work

Course: **Backend Development (CSFS3008P)** · B.Tech Full Stack, Semester 5 · UPES
Instructor: Dr. Prateek Raj Gautam · Student: Suryansh (`smirk-dev`)

Lab experiments for the course, one folder each. Every experiment is self-contained —
open its folder, serve it, and it runs with no install step and no network.

## Experiments

| # | Experiment | Folder | Status |
|---|------------|--------|--------|
| 01 | Create a web page with all possible elements of HTML5 | [`Exp01-HTML5-Elements/`](Exp01-HTML5-Elements/) | Done |
| 02 | Create a web page with all types of Cascading Style Sheets | — | Not started |

## Running any of them

Most of these need to be served over HTTP rather than opened as `file://`, or the browser
blocks caption tracks, framed documents and `fetch`.

```bash
# VS Code: right-click index.html → "Open with Live Server"

# or, from inside an experiment folder:
py -3 -m http.server 8000
npx serve .
```

## Conventions used across experiments

- Plain HTML, CSS and JavaScript unless the experiment asks for a framework. No build step.
- **All assets are local.** No CDN links, no placeholder-image services, no remote sample
  media — those rot, and a submission that needs Wi-Fi to render is a submission that fails
  in the lab. Diagrams are hand-written SVG; sample media is generated with ffmpeg.
- Deprecated tags and properties are documented rather than demonstrated, so the pages stay
  valid against the W3C validator.
- Each experiment folder carries its own `README.md` with what it covers, how to run it,
  and the checks that were run against it.

## Lab manuals

Published at <https://upessocs.github.io> (a client-side viewer). The underlying markdown
lives in the [`upessocs/Lectures`](https://github.com/upessocs/Lectures) repository under
`Backend Development/Lab/`.
