# Wippy Application Template

A starter Wippy application with user management, AI assistant, and admin frontend.

## Prerequisites

- [Wippy CLI](https://wippy.ai)
- Node.js 18+

## Quick Start

```bash
cp .env.example .env
make build
wippy run -c
```

Open `http://localhost:8080`. Default admin: `admin@wippy.local` / `admin123`.

## Development

```bash
# Build all frontend packages
cd frontend/applications/main && npm install && npm run build -- --outDir ../../../static/app/main --emptyOutDir
cd frontend/web-components/example && npm install && npm run build -- --outDir ../../../static/wc/example --emptyOutDir

# Frontend watch mode (main app)
cd frontend/applications/main && npm run dev

# Server (separate terminal)
wippy run -c
```

## Configuration

All runtime configuration is driven by environment variables and the facade dependency parameters in `src/app/deps/_index.yaml`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_API_URL` | Public-facing API URL | `http://localhost:8080` |
| `ENCRYPTION_KEY` | Data encryption key (hex) | Auto-generated on first boot |
| `ANTHROPIC_API_KEY` | Claude API key for AI assistant | - |

### Facade Parameters

The `wippy/facade` dependency controls the frontend shell:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `app_title` | Sidebar title | `Wippy` |
| `app_name` | Full app name | `Wippy AI` |
| `app_icon` | Iconify icon reference | `wippy:logo` |
| `show_admin` | Show admin controls | `true` |
| `hide_nav_bar` | Hide left sidebar | `false` |
| `start_nav_open` | Nav open on load | `false` |
| `allow_select_model` | User model selection | `false` |
| `disable_right_panel` | Disable right sidebar | `false` |
| `session_type` | `non-persistent` or `cookie` | `non-persistent` |
| `history_mode` | `hash` or `history` | `hash` |
| `login_path` | Unauthenticated redirect | `/login.html` |
| `custom_css` | CSS injected into frontend | Poppins font import |
| `css_variables` | JSON object of CSS custom properties | `{}` |
| `icons` | JSON object of custom Iconify icons | `{}` |

CSS variables use PrimeVue naming: `p-primary`, `p-primary-500`, `p-surface-0`, `p-text-color`, etc.

## Structure

```
src/app/                          Backend (Wippy Lua)
  api/                            HTTP endpoints
  agents/                         AI agent definitions
  users/                          User management
  security/                       Access control
  models/                         LLM model config
  views/                          Frontend page registration
  deps/                           Module dependencies
  env/                            Environment storage

frontend/
  applications/main/              Vue 3 admin panel
  web-components/example/         Example web component

static/                           Static assets (login page)
  app/main/                       Built main app (generated)
  wc/example/                     Built web component (generated)
```

## Testing

```bash
wippy run test users
```

## Documentation

- [wippy.ai](https://wippy.ai) - Full documentation
- [wippy.ai/llms.txt](https://wippy.ai/llms.txt) - LLM-friendly docs
