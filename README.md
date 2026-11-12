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
| `assets/images/founder/itoro-akie.jpg` | Founder portrait on the dedicated Founder page |
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

### Enquiry email integration

The contact, tuition registration, and consultation forms submit by AJAX to FormSubmit at `https://formsubmit.co/ajax/ajis.tuition@gmail.com`. Emails use the subject `AJIS LEARNING SOLUTIONS — NEW ENQUIRY` and FormSubmit's table template, with the enquiry category, visitor details, programme of interest, message, submission date, and privacy acknowledgement. No Cloudflare Worker, Resend account, API key, or other private credential is required. The separate WhatsApp contact button remains optional and is never opened by form submission.

FormSubmit requires a one-time recipient activation before it forwards enquiries to the inbox:

1. Submit a non-sensitive test enquiry from the website.
2. Open the activation email sent by FormSubmit to `ajis.tuition@gmail.com` and click its activation link.
3. Submit a second test enquiry and verify the formatted message arrives in the AJIS inbox.
4. Only after that real test succeeds should the site be described as active for email delivery.

The form displays a sending state and reports success only when the AJAX response is successful and FormSubmit indicates acceptance. This confirms service acceptance, not delivery to or reading of the inbox. Failed requests display an error and do not open WhatsApp or an email application.

### Local website assistant and gallery

The floating assistant is a local FAQ based on published website content. It does not connect to an AI backend, ask visitors to sign in, or send questions to a server. The homepage gallery shows five AJIS learning photos with manual controls and pauses automatically for reduced-motion preferences.

## GitHub Pages deployment

The public repository is `clintonsaah-stack/AJISLearningSolutions`, and its default branch is `main`. The expected project-site URL is:

`https://clintonsaah-stack.github.io/AJISLearningSolutions/`

The existing [Pages workflow](.github/workflows/deploy-pages.yml) runs on pushes to `main` and uploads the repository root (`.`). To enable it:

1. Open the repository on GitHub and choose **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**. The workflow already handles deployment; no build command or custom build output directory is needed.
3. After an approved change is pushed to `main`, check the **Actions** tab for the “Deploy website to GitHub Pages” run. You can also use its **Run workflow** option and select `main`.
4. Once deployment completes, open the project-site URL above.

The ten pages use relative links and assets, so they work beneath the project-site path without hard-coded domain-root paths. The homepage is `/`; the other pages are available as `about.html`, `services.html`, `learning-solutions.html`, `training-development.html`, `founder.html`, `tuition-registration.html`, `contact.html`, `privacy.html`, and `terms.html` beneath the project-site URL. If the site is unavailable, confirm the Pages source setting and check for a successful workflow run.

## Cloudflare Pages

This repository is a static HTML/CSS/JavaScript site and has no `package.json`, Vite app, or build step. For a direct Cloudflare Pages deployment, connect the repository and use the `main` branch, leave the build command empty, and set the output directory to `.` (the repository root). A Cloudflare account with permission to create or connect Pages projects is required; this workspace does not have deployment authorization configured.

Before publishing, complete and test FormSubmit activation and have the draft privacy and terms pages reviewed and finalized.
