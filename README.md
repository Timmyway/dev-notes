# DevNotes

A simple developer note-taking app with a React frontend and a PHP/SQLite backend.

## Project structure

- `backend/`
  - `api.php` — REST API endpoints for notes
  - `.htaccess` — Apache config for backend routing and security
  - `devnotes.db` — SQLite database (created automatically)
- `frontend/`
  - `index.html` — SPA entry page
  - `package.json` — frontend dependencies and scripts
  - `vite.config.js` — Vite configuration
  - `tailwind.config.js` — TailwindCSS config
  - `postcss.config.js` — PostCSS configuration
  - `src/` — React application source files
    - `App.jsx` — main app component
    - `main.jsx` — React app bootstrap
    - `index.css` — global styles
    - `components/` — UI components
    - `hooks/` — custom React hooks
    - `services/` — API and storage helpers

## Features

- Create, edit, and delete notes
- Multiple note tabs
- Markdown preview support
- Local storage persistence
- Backend storage through PHP + SQLite

## Getting started

### Frontend setup

1. Open a terminal and go to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the URL shown in the terminal, usually `http://localhost:5173`.

### Backend setup

The backend is a PHP API that stores notes in SQLite.

1. Deploy `backend/` to a PHP-enabled web server.
2. Ensure the directory is writable by the web server user so SQLite can create and update `devnotes.db`.
3. Make sure PHP has SQLite support enabled.

## Configuration

### API URL

The frontend communicates with the backend API. If you need to change the backend endpoint, update the API URL in `frontend/src/services/api.js` or `frontend/src/App.jsx` depending on the current implementation.

### Vite base path

If deploying under a subpath, set `base` in `frontend/vite.config.js`.

## Build for production

From `frontend/`:

```bash
npm run build
```

Copy the `frontend/dist/` output to your production web server.

## Deployment notes

- Keep the backend directory and `devnotes.db` protected from direct public access.
- The provided `.htaccess` is designed for Apache; adjust if you use another web server.

## License

This repository does not include a license file. Add one if you plan to share or publish the project.
