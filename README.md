# 2024 Nissan GT-R NISMO

An independent concept website for the 2024 Nissan GT-R NISMO. It uses Vite, a React and TypeScript carousel, GSAP scroll interactions, and local image and video assets. This project is not affiliated with Nissan.

## Run locally

Install a Node.js version supported by Vite 7 and pnpm, then run:

    pnpm install --frozen-lockfile
    pnpm dev

The development server prints its local URL. All website media is served from `public/images` and `public/videos`.

## Production build

    pnpm run build
    pnpm preview

The build output is written to `dist/`. The same build script can also be run with `npm run build` when npm is installed and dependencies are present. This repository uses `pnpm-lock.yaml` for reproducible installs.

## GitHub Desktop

Add this folder as a local repository in GitHub Desktop, review the files, and create the initial commit. Publishing to GitHub is a separate action you control in GitHub Desktop. Local dependencies, build output, environment files, and credentials are excluded by `.gitignore`.
