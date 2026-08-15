# 📓 SmartLog — AI-Powered Dev Learning Journal

> Write what you learn. Ask your notes anything. Never forget a concept again.

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-HuggingFace-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![Tests](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/smartlog/test.yml?label=tests&style=flat)](https://github.com/YOUR_USERNAME/smartlog/actions)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

---

## 🌐 Live Demo

**API Docs (Swagger UI):** `https://your-app.railway.app/docs`
**Frontend:** `https://your-app.railway.app`

> _Screenshots below — replace with your own after deployment_

---

## 📸 Screenshots

| Dashboard | AI Q&A | Stats |
|-----------|--------|-------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Ask AI](docs/screenshots/ask.png) | ![Stats](docs/screenshots/stats.png) |

---

## 🧠 What Is SmartLog?

SmartLog is a full-stack web app where developers log what they learn every day.
An AI assistant (powered by RAG — Retrieval-Augmented Generation) reads your notes
and answers questions like:

- *"What did I learn about PostgreSQL indexes last week?"*
- *"Explain the binary search problem I solved on Day 12."*
- *"What topics have I spent the most time on?"*

Every entry is embedded into a vector database. When you ask a question, the app
retrieves the most semantically similar entries and passes them as context to an LLM —
so the AI answers **from your own notes**, not from the internet.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Client                      │
│              HTML + JS frontend  ·  Swagger /docs            │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP (JWT auth)
┌───────────────────────────▼─────────────────────────────────┐
│                    FastAPI Backend (Python)                   │
│                                                              │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │ Auth routes  │  │  Entry routes   │  │  /ask  route  │  │
│  │ signup/login │  │  CRUD + search  │  │  RAG engine   │  │
│  └──────────────┘  └─────────────────┘  └───────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Embedding pipeline (background)            │   │
│  │   HuggingFace sentence-transformer · all-MiniLM-L6  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────┬────────────────────────────┬────────────────────-┘
           │                            │
┌──────────▼──────────┐    ┌───────────▼──────────────────────┐
│  PostgreSQL + pgvec │    │   LLM API  ·  AWS S3 (files)     │
│  log_entries table  │    │   OpenAI gpt-3.5-turbo           │
│  vector embeddings  │    │   (swap for any LLM)             │
└─────────────────────┘    └──────────────────────────────────┘
```

**Request flow for `/ask`:**
1. User submits a question
2. Question is embedded → `vector[384]`
3. pgvector finds top-5 most similar log entries (cosine similarity)
4. Entries injected into LLM prompt as context
5. LLM streams answer back to the user

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Language** | Python 3.11 | Clean async support, rich ecosystem |
| **API** | FastAPI | Auto-docs, Pydantic validation, async-native |
| **Database** | PostgreSQL 15 + pgvector | Relational + vector search in one DB |
| **ORM** | SQLAlchemy (async) + Alembic | Type-safe queries, migrations |
| **Auth** | JWT (python-jose) + bcrypt | Stateless, industry-standard |
| **AI / Embeddings** | HuggingFace sentence-transformers | Open-source, no API cost |
| **LLM** | OpenAI API (gpt-3.5-turbo) | Swappable — works with any LLM |
| **Containers** | Docker + Docker Compose | One-command local setup |
| **Cloud** | AWS EC2 + S3 | Real deployment experience |
| **CI/CD** | GitHub Actions | Auto-test on every push |
| **Frontend** | React + Tailwind + shadcn/ui | Generated with v0.dev |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Docker + Docker Compose
- Git
- An OpenAI API key (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/smartlog.git
cd smartlog
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env and fill in your values
```

Required values in `.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/smartlog
JWT_SECRET=your-super-secret-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
OPENAI_API_KEY=sk-...
ENVIRONMENT=development
```

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

This starts:
- **FastAPI app** on `http://localhost:8000`
- **PostgreSQL + pgvector** on port `5432`
- **API docs** at `http://localhost:8000/docs`

### 4. Run database migrations

```bash
docker-compose exec app alembic upgrade head
```

### 5. (Optional) Run without Docker

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 📡 API Reference

Full interactive docs at `/docs` (Swagger UI) and `/redoc`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Login, get JWT token |

### Log Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/entries` | Create a new log entry |
| `GET` | `/entries` | List entries (supports `?search=` and `?tag=`) |
| `GET` | `/entries/{id}` | Get a single entry |
| `PUT` | `/entries/{id}` | Update an entry |
| `DELETE` | `/entries/{id}` | Delete an entry |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ask` | Ask a question — answered from your notes (RAG) |

### Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stats` | Streak, hours by topic, calendar heatmap data |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check — DB status + uptime |

---

## 🗄️ Database Schema

```sql
-- Users
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Log entries (with vector embedding)
CREATE TABLE log_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    study_hours DECIMAL(4,2),
    difficulty  VARCHAR(10) CHECK (difficulty IN ('easy','medium','hard')),
    embedding   vector(384),           -- pgvector column
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tags (many-to-many)
CREATE TABLE tags (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE entry_tags (
    entry_id UUID REFERENCES log_entries(id) ON DELETE CASCADE,
    tag_id   UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, tag_id)
);
```

---

## 🧪 Running Tests

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=term-missing

# Run a specific test file
pytest tests/test_entries.py -v
```

Tests cover: auth flow, CRUD endpoints, search, stats, AI ask endpoint (mocked LLM).

---

## 📁 Project Structure

```
smartlog/
├── app/
│   ├── main.py              # FastAPI app, middleware, router registration
│   ├── db/
│   │   ├── base.py          # SQLAlchemy async engine + session
│   │   └── models.py        # ORM models (User, LogEntry, Tag, EntryTag)
│   ├── routes/
│   │   ├── auth.py          # signup, login
│   │   ├── entries.py       # CRUD for log entries
│   │   ├── ask.py           # RAG ask endpoint
│   │   └── stats.py         # streak, hours, heatmap
│   ├── services/
│   │   ├── auth.py          # JWT generation, password hashing
│   │   ├── embeddings.py    # HuggingFace embedding pipeline
│   │   ├── rag.py           # vector search + LLM call
│   │   └── auto_tag.py      # LLM-based auto-classification
│   └── schemas/
│       ├── auth.py          # Pydantic schemas for auth
│       ├── entry.py         # Pydantic schemas for entries
│       └── stats.py         # Pydantic schemas for stats
├── tests/
│   ├── conftest.py          # pytest fixtures, test DB setup
│   ├── test_auth.py
│   ├── test_entries.py
│   ├── test_ask.py
│   └── test_stats.py
├── alembic/                 # DB migrations
│   └── versions/
├── docs/
│   └── screenshots/         # App screenshots for README
├── .github/
│   └── workflows/
│       └── test.yml         # GitHub Actions CI
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── requirements.txt
└── README.md
```

---

## 🔧 Key Technical Decisions

**Why pgvector instead of a separate vector DB (Pinecone, Weaviate)?**
Keeping vectors in PostgreSQL avoids operational complexity — one database to manage,
one connection pool, transactions across relational and vector data. For a personal
journal with <100k entries, pgvector's performance is more than sufficient.

**Why sentence-transformers over OpenAI embeddings?**
`all-MiniLM-L6-v2` runs locally with no API cost. Embedding is called on every entry
save and every question — using OpenAI embeddings would add latency and cost. The
384-dimension model is fast enough to run in a Docker container on a free EC2 instance.

**Why async SQLAlchemy?**
FastAPI is async-native. Using synchronous SQLAlchemy would block the event loop on
every DB call, destroying concurrency. AsyncSession with `asyncpg` driver gives true
non-blocking database I/O.

**Why background tasks for embedding?**
Generating an embedding takes ~50–200ms. Running it synchronously in the POST /entries
handler would make every entry creation feel slow. FastAPI's BackgroundTasks runs it
after the response is sent, so the user gets instant feedback.

---

## 🚢 Deployment

### Railway (quick — recommended first)

1. Push code to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Add PostgreSQL plugin in Railway dashboard
4. Set env vars in Railway → Variables
5. Deploy triggers automatically on every `git push main`

### AWS EC2 (for real cloud experience)

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone and run
git clone https://github.com/YOUR_USERNAME/smartlog.git
cd smartlog
cp .env.example .env  # fill in values
docker-compose up -d

# Check logs
docker-compose logs -f app
```

---

## 📈 What I'd Improve Next

- [ ] Add Redis for caching frequent stats queries
- [ ] Replace `gpt-3.5-turbo` with a self-hosted Llama model to eliminate API costs
- [ ] Add Kubernetes manifests for horizontal autoscaling
- [ ] Implement WebSocket streaming for the /ask endpoint (currently HTTP streaming)
- [ ] Add rate limiting with sliding window counter (currently no rate limiting)
- [ ] Mobile PWA support — offline entry creation that syncs on reconnect
- [ ] LangChain integration for more sophisticated RAG with re-ranking

---

## 🤝 Contributing

This is a personal learning project, but PRs are welcome.

```bash
# Fork the repo, then:
git checkout -b feat/your-feature
# Make changes
git commit -m "feat: add your feature"
git push origin feat/your-feature
# Open a PR to main
```

Please write tests for new features and run `pytest` before submitting.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- LinkedIn: [linkedin.com/in/YOUR_PROFILE](https://linkedin.com/in/YOUR_PROFILE)
- Email: your@email.com

---

_Built to learn. Every feature in this project maps to a real skill used in backend and AI engineering internships._
