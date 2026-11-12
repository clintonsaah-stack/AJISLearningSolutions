# Website image assets

The static website uses `assets/js/image-config.js` to map image keys to local files. Update a key's path there to replace that image everywhere the key is used. Each HTML image's `src` remains a fallback for when JavaScript or the image config is unavailable; keep it aligned when making a permanent path change.

## Uploaded photographs

The five user-provided photographs are stored in `assets/images/website-updates/`:

- `WhatsApp Image 2026-11-07 at 11.13.24 PM.jpeg` — collaborative planning materials
- `WhatsApp Image 2026-11-07 at 11.31.12 PM.jpeg` — learner writing while wearing headphones
- `WhatsApp Image 2026-11-07 at 11.31.39 PM.jpeg` — learner writing in a notebook
- `WhatsApp Image 2026-11-07 at 11.32.26 PM.jpeg` — learner using a laptop and notebook
- `WhatsApp Image 2026-11-07 at 11.32.54 PM.jpeg` — child drawing with learning materials

The three complementary stock photographs in the same folder were sourced from Unsplash and are used under the Unsplash License.

## Protected assets

- Keep `assets/images/branding/ajis-logo.jpg` unchanged.
- Keep `assets/images/founder/itoro-akie.jpg` unchanged.
- Keep all homepage video files and poster images unchanged.

The project is static HTML. Run the preview from the repository root with:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
