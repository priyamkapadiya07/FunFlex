# FunFlex - Brain Games PWA

FunFlex is a beautiful, minimalist, and lightweight Progressive Web App (PWA) dedicated to relaxing brain games. It currently features an infinite, dynamically-generated Word Search game with five difficulty levels.

## Features

- **Progressive Web App (PWA)**: Installable on Android, iOS, Windows, and macOS.
- **Offline Capable**: Once loaded for the first time, all assets and dictionaries are cached locally. You can play without an internet connection indefinitely.
- **Beautiful & Fast UI**: Built with Vite and React for instant load times, featuring a "soft pink" elegant aesthetic and buttery smooth interactions.
- **Generative Gameplay**: Puzzles are generated dynamically from built-in JSON dictionaries. No two games are exactly alike.
- **Premium Sounds**: Satisfying synthesized pops and chimes powered natively by the Web Audio API (no heavy audio files).
- **No Backend**: All user preferences (theme, difficulty, sound toggle) are saved locally using `localStorage`.

## Local Development

To run the project locally on your machine:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```
   *This command will bundle the app and generate the PWA service worker inside the `dist` folder.*

4. **Preview the production build:**
   ```bash
   npm run preview
   ```

## How to Deploy to Vercel

Deploying FunFlex to Vercel is incredibly simple because Vercel automatically detects Vite projects.

1. **Push your code to a Git Repository**:
   Upload this entire project folder to a repository on GitHub, GitLab, or Bitbucket.

2. **Import into Vercel**:
   - Log into your [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New... -> Project**.
   - Select your Git repository from the list.

3. **Configure Deployment**:
   Vercel will automatically detect that this is a **Vite** project. 
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   *You shouldn't need to change anything.*

4. **Deploy**:
   Click **Deploy**. Vercel will build the app, generate the `dist` folder, and serve your PWA globally on their edge network in just a few seconds.

## Updating the App Icon

The primary icon for the app is `public/icon.svg`. If you edit this file, you can regenerate the perfectly-sized PNG manifests for iOS and Android by running:
```bash
node generate-icons.js
```
*(Requires `sharp` to be installed via `npm install sharp`)*
