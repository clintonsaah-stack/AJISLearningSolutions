# AJIS Learning Solutions

Responsive multi-page website for AJIS Learning Solutions, an educational consultancy supporting learners, families, educators, schools, and communities.

## Pages

- `index.html` — homepage and learning gallery
- `about.html` — organisation, mission, vision, and values
- `services.html` — full educational support service listing
- `learning-solutions.html` — consultancy, curriculum, inclusive learning, and learner support
- `training-development.html` — professional, staff, parent, and community learning
- `founder.html` — founder profile
- `tuition-registration.html` — tuition enquiry form
- `contact.html` — contact enquiry form
- `privacy.html` — draft website privacy information
- `terms.html` — draft website-use information

## Homepage video

The homepage video scenes and posters are bundled locally in `assets/videos/homepage/` and `assets/images/homepage/`, so playback does not depend on a remote video host. The original Coverr "Students talking near school" footage and the additional [Coverr "Friends doing work at a cafe"](https://coverr.co/videos/friends-doing-work-at-a-cafe-yxufhqo4bq) footage are offered for personal and commercial use; [Coverr's licence](https://coverr.co/license) applies. The Mixkit ["Girl doing homework in a library"](https://mixkit.co/free-stock-video/girl-doing-homework-in-a-library-4531/) and ["Students resting in a university garden"](https://mixkit.co/free-stock-video/students-resting-in-a-university-garden-4520/) clips are offered under the [Mixkit Free License](https://mixkit.co/license/). The video is muted, loops, crossfades between scenes, and is pausable. It uses local poster fallbacks and is not fetched on narrow screens or for reduced-motion preferences unless a visitor explicitly starts it.

## Brand & image assets

Upload AJIS branding and photographs to `assets/images/`. This is a static HTML site, so this is the image folder used by the pages. The separate `public/assets/images/` folder is not used. Image paths are centrally managed in [`assets/js/image-config.js`](assets/js/image-config.js); update the relevant path there to replace an image, including shared images used in multiple places. HTML `src` values provide local fallbacks when JavaScript or the image config is unavailable. Keep the supplied `assets/` video and poster files in place.

| Asset path | Website placement |
| --- | --- |
| `assets/images/branding/ajis-logo.jpg` | Uploaded AJIS logo for the navigation, footer, and browser tab |
| `assets/images/founder/itoro-akie.jpg` | Founder portrait on About, Home, and Founder |
| `assets/images/homepage/hero-poster.jpg` | Homepage video poster and image fallback; a working version is included |
| `assets/images/homepage/students-laptops-poster.jpg`, `students-headphones-poster.jpg`, and `students-socialising-poster.jpg` | Local poster fallbacks for the additional homepage video scenes |
| `assets/images/website-updates/WhatsApp Image 2026-11-07 at 11.13.24 PM.jpeg` | Planning materials on Home, Services, Training & Development, and the gallery |
| `assets/images/website-updates/WhatsApp Image 2026-11-07 at 11.31.12 PM.jpeg` | Learner wearing headphones on Home, Services, and the gallery |
| `assets/images/website-updates/WhatsApp Image 2026-11-07 at 11.31.39 PM.jpeg` | Learner writing on About and Learning Solutions |
| `assets/images/website-updates/WhatsApp Image 2026-11-07 at 11.32.26 PM.jpeg` | Learner using a laptop on Tuition and Privacy |
| `assets/images/website-updates/WhatsApp Image 2026-11-07 at 11.32.54 PM.jpeg` | Drawing activity on Home, Learning Solutions, and the gallery |
| `assets/images/website-updates/education-workshop-unsplash.jpg`, `classroom-learning-unsplash.jpg`, and `collaborative-learning-unsplash.jpg` | Complementary workshop, classroom, and group-learning photos sourced from Unsplash under its license |
| `assets/images/homepage/hero-poster.jpg` and additional scene posters | Existing homepage video posters; keep these files in place |
| `assets/videos/homepage/hero-background.mp4` | Homepage background video; a working licensed version is included |
| `assets/videos/homepage/students-laptops.mp4`, `students-headphones.mp4`, and `students-socialising.mp4` | Additional locally hosted student-learning video scenes |
| `assets/videos/backgrounds/` | Reserved for additional approved background videos |

Keep the listed filenames so the website can match photos to the intended sections. To change an image across all sections that use it, edit its entry in `assets/js/image-config.js` and keep the replacement inside `assets/images/`. The AJIS logo, founder portrait, homepage posters, and video files are protected; do not modify them. See [`assets/images/uploads/README.md`](assets/images/uploads/README.md) for image-management notes.

## Local preview

Serve the repository directory with any static web server. For example:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open `http://localhost:8000`. In Codespaces, make port `8000` public in the Ports panel to share the forwarded HTTPS preview link.

The enquiry forms currently have no submission endpoint. They validate entries in the browser and clearly report that details are not sent or stored; there is no success-shaped fallback. To enable submissions, configure a secure HTTPS endpoint using the `data-endpoint` attribute on the form. Never put service-role keys or other secrets in frontend files.

## Cloudflare Pages

This repository is a static HTML/CSS/JavaScript site and has no `package.json`, Vite app, or build step. For a direct Cloudflare Pages deployment, connect the repository and use the `main` branch, leave the build command empty, and set the output directory to `.` (the repository root). A Cloudflare account with permission to create or connect Pages projects is required; this workspace does not have deployment authorization configured.

Before publishing, provide verified AJIS contact details, replace any stock imagery with approved brand imagery as appropriate, connect and test the form endpoint, and have the draft privacy and terms pages reviewed and finalized.
