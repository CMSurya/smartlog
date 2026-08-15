    # SmartLog Frontend

    React 18 + Vite + TypeScript frontend for SmartLog.

    ## Setup

    ```bash
    cd frontend
    cp .env.example .env
    npm install
    npm run dev
    ```

    Open [http://localhost:5173](http://localhost:5173). Ensure the FastAPI backend runs on `http://localhost:8000`.

    ## Scripts

    | Command | Description |
    |---------|-------------|
    | `npm run dev` | Development server |
    | `npm run build` | Production build |
    | `npm run preview` | Preview production build |
    | `npm run lint` | ESLint |

    ## Environment

    - `VITE_API_URL` — API base URL (default: `http://localhost:8000`)

    ## Pages

    - `/` — Landing
    - `/login`, `/signup` — Authentication
    - `/dashboard` — Overview
    - `/entries` — Journal CRUD
    - `/ask` — AI assistant
    - `/analytics` — Stats & charts
    - `/settings` — Profile & preferences
