# Dikshanta Chapagain — Portfolio

A modern, dark-mode-first personal portfolio showcasing AI/ML projects, experiments, and professional info built with a React + Vite + Tailwind toolchain.

## Features
- Fast, accessible, and responsive single-page portfolio
- Forced dark-mode with FOUC prevention
- Project gallery with external links and media previews
- SEO-friendly meta and Open Graph tags
- Easy deployment (Vercel / static hosting)

## Tech Stack
- Framework: React (Vite)
- Styling: Tailwind CSS
- Languages: TypeScript / JavaScript, HTML, CSS
- Deployment: Vercel (recommended)

## Local development
Prerequisites:
- Node.js 16+ (Node 18+ recommended)
- npm or yarn/pnpm

Steps:
1. Clone the repo
   git clone <repo-url>
2. Install dependencies
   npm install
3. Start dev server
   npm run dev
4. Build for production
   npm run build
5. Preview production build
   npm run preview

(Adjust scripts to match package.json commands: dev, build, preview)

## Project structure (high level)
- /src — React entry, components, pages
- /public — static assets (images, favicon)
- /src/index.css — Tailwind entry
- index.html — app shell and critical dark-mode injection

## Deployment
- Vercel: connect the repository and use the default Vite static build settings.
- Ensure the build command is `npm run build` and the output directory is `dist`.

## Contributing
- Open an issue for bugs or feature requests.
- Create a concise PR with a single change per branch.
- Follow existing code style and Tailwind conventions.

## License
MIT — see LICENSE file.

## Contact
Dikshanta Chapagain — https://da-dikshanta.vercel.app/ — dikshanta@example.com
