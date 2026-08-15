# Contributing to SmartLog

Thanks for your interest! This is a personal learning project —
contributions, bug reports, and suggestions are all welcome.

---

## How to contribute

### 1. Report a bug

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Your OS + Python version

### 2. Suggest a feature

Open an issue with the **enhancement** label. Describe:
- What problem it solves
- How you imagine it working

### 3. Submit a PR

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/smartlog.git
cd smartlog

# Create a feature branch
git checkout -b feat/your-feature-name

# Make your changes
# ...

# Run tests — all must pass
pytest tests/ -v

# Run linter
ruff check app/ tests/
ruff format app/ tests/

# Commit with a clear message
git commit -m "feat: add weekly email summary endpoint"

# Push and open a PR
git push origin feat/your-feature-name
```

---

## Commit message format

Use conventional commits:

```
feat: add auto-tagging with LLM classification
fix: handle empty embedding when entry has no content
docs: update API reference for /ask endpoint
test: add tests for RAG pipeline with mocked LLM
refactor: extract embedding logic into service layer
chore: upgrade sentence-transformers to 2.7.0
```

---

## Code style

- **Formatter:** `ruff format` (Black-compatible)
- **Linter:** `ruff check`
- **Type hints:** required on all function signatures
- **Docstrings:** for public functions and classes
- **Tests:** write tests for every new endpoint or service

---

## Branch naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feat/description` | `feat/pdf-upload` |
| Bug fix | `fix/description` | `fix/embedding-null-crash` |
| Docs | `docs/description` | `docs/api-reference` |
| Refactor | `refactor/description` | `refactor/async-db-session` |

---

## Questions?

Open an issue or reach out on LinkedIn.
