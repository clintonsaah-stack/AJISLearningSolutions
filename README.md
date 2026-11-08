# AJIS Learning Solutions

Responsive multi-page website for AJIS Learning Solutions, an educational consultancy supporting learners, families, educators, schools, and communities.

## Pages

- `index.html` — homepage and learning gallery
- `about.html` — organisation, mission, and values
- `services.html` — educational support services
- `founder.html` — founder profile
- `tuition-registration.html` — tuition enquiry form
- `contact.html` — contact enquiry form
- `privacy.html` — current website privacy information
- `terms.html` — current website-use information

## Local preview

Serve the repository directory with any static web server. For example:

```sh
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

The enquiry forms currently have no submission endpoint. They validate entries in the browser and clearly report that details are not sent or stored; there is no success-shaped fallback. To enable submissions, configure a secure HTTPS endpoint using the `data-endpoint` attribute on the form. Never put service-role keys or other secrets in frontend files.

## Cloudflare Pages

This repository is a static HTML/CSS/JavaScript site and has no `package.json`, Vite app, or build step. For a direct Cloudflare Pages deployment, connect the repository and use the `main` branch, leave the build command empty, and set the output directory to `.` (the repository root). A Cloudflare account with permission to create or connect Pages projects is required; this workspace does not have deployment authorization configured.

Before publishing, provide verified AJIS contact details, replace any stock imagery with approved brand imagery as appropriate, connect and test the form endpoint, and have the draft privacy and terms pages reviewed and finalized.
