# Wippy Application Template

A minimal Wippy application with user management, an admin panel, and an "Ask Wippy" AI assistant.

## Prerequisites

- [Wippy CLI](https://wippy.ai) installed
- Node.js 18+

## Quick Start

```bash
# Copy environment config
cp .env.example .env

# Install dependencies and build frontend
make build

# Start the server
wippy run -c
```

The application starts on `http://localhost:8080`.

Default admin credentials:
- Email: `admin@wippy.local`
- Password: `admin123`

## Development

```bash
# Watch mode for frontend changes
make dev

# Run server separately
wippy run -c
```

## Structure

```
src/app/          Backend modules (Wippy Lua)
  api/            HTTP endpoints (hello, login, agents list, websocket)
  agents/         AI agent definitions (Wippy assistant)
  users/          User CRUD endpoints
  security/       Access control policies
  models/         LLM model definitions
  views/          Frontend page registration
  deps/           Wippy module dependencies
  env/            Environment variable management

frontend/         Vue 3 admin panel
  src/pages/      Home, Users
  src/app/        App shell with sidebar navigation
  src/router/     Client-side routing

static/           Static assets (login page)
```

## Features

- User management (create, edit, delete, security groups)
- AI assistant ("Ask Wippy") with page navigation
- SQLite database (auto-created)
- Token-based authentication
- Dark/light theme support

## Documentation

Wippy documentation is available at [wippy.ai](https://wippy.ai).

For LLM-friendly docs (use with AI coding assistants): [wippy.ai/llms.txt](https://wippy.ai/llms.txt)
