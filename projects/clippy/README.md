# 📎 Clippy

Highlight a line of a song's lyrics → get an mp3 of **exactly** that bit.

A little side-toy in the [Bollywoodle](https://bollywoodle.app) theme.

## How it works

- The **UI** is a static page (also hosted at `notprsn.github.io/projects/clippy/`).
- The **helper** (`clippy.py`) runs on *your* laptop only. It:
  - looks up **synced lyrics** (via [lrclib](https://lrclib.net)) so highlighting a line maps to a real time range,
  - finds the song on **YouTube** (picking the version whose length matches the lyrics),
  - cuts the exact slice with **ffmpeg** and hands you the mp3.

Nothing is public — the download + cutting happen locally, on your machine.

## Run it

```bash
cd projects/clippy
python3 clippy.py
```

Then open **http://localhost:8765**.

1. **Find the song** — search by name, pick a result (only ones with synced lyrics show up).
2. **Highlight the bit** — click the first line, then the last line of the part you want.
3. **Cut it** — hit ✂️. First clip of a song downloads it (a few seconds); later cuts of the same song are instant (cached in `.clippy_cache/`).

> Wrong recording auto-picked? Expand *"wrong recording? paste a YouTube link"* and drop in the exact video URL.

## The hosted page

`notprsn.github.io/projects/clippy/` is the same UI. It only *works* when your local helper
is running on the same laptop (it calls `http://127.0.0.1:8765`). If the helper is
off you'll see a "helper offline" pill and instructions. Chrome/Edge/Firefox allow
an https page to call `localhost`; on Safari, just use `http://localhost:8765`
directly instead.

## Requirements

`yt-dlp` and `ffmpeg` (both already installed on this machine). Nothing to `pip install`.
