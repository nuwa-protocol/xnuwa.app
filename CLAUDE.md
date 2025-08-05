# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Management & Scripts

This project uses **pnpm** for package management. Common commands:

```bash
# Development
pnpm dev                # Start development server
pnpm build              # Build for production
pnpm preview            # Preview production build

# Code Quality
pnpm lint               # Lint with Biome
pnpm lint:fix           # Fix linting issues
pnpm format             # Check formatting
pnpm format:fix         # Fix formatting
pnpm check              # Run all checks
pnpm check:fix          # Fix all issues
```

**Important**: Always use `pnpm` commands. The project uses Biome (not ESLint/Prettier) for linting and formatting.

## Application Architecture

**Nuwa Client** is a React 19 + TypeScript + Vite application for AI chat with CAP (Conversational AI Programs) creation capabilities, Web3 wallet integration, and decentralized identity.

### Core Technology Stack

- **Frontend**: React 19, TypeScript, Vite, React Router v7
- **Styling**: Tailwind CSS + Radix UI components
- **State**: Zustand with persistence middleware
- **Storage**: Dexie (IndexedDB) for structured data
- **AI**: AI SDK (@ai-sdk/react), OpenRouter, LiteLLM providers
- **Web3**: Reown AppKit, Wagmi, Viem
- **Identity**: @nuwa-ai/identity-kit (decentralized identity)
- **Code Quality**: Biome for linting/formatting

### Feature-Based Architecture

The codebase uses a feature-based structure under `src/features/`:

- **`auth/`** - Authentication and authorization
- **`chat/`** - Core chat functionality with AI models
- **`cap-studio/`** - CAP creation/editing interface (like an IDE)
- **`cap-store/`** - CAP marketplace and discovery
- **`settings/`** - User preferences and configuration
- **`sidebar/`** - Navigation and chat history
- **`wallet/`** - Web3 wallet integration and payments

Each feature follows this structure:
```
feature/
├── components/     # React components
├── hooks/         # Custom React hooks
├── stores.ts      # Zustand state stores
├── services.ts    # Business logic
├── types.ts       # TypeScript definitions
└── utils.ts       # Utility functions
```

### Key Architectural Concepts

**CAPs (Conversational AI Programs)**: User-configurable AI assistants with custom prompts, models, and MCP (Model Context Protocol) tool integrations. Users can create, edit, and share CAPs.

**MCP Integration**: The app connects to MCP servers to provide tools and capabilities to AI models. Managed by `GlobalMCPManager` singleton.

**Decentralized Identity**: All user data is scoped to their DID (Decentralized Identifier) for privacy and portability.

**Multi-Layer Storage**:
- Zustand stores (in-memory state)
- localStorage (user preferences)
- IndexedDB via Dexie (structured data: chats, CAPs, settings)

### Core Services

**Global Services** (in `src/shared/services/`):
- **`global-mcp-manager.ts`** - Manages MCP server connections and tool registration
- **`identity-kit.ts`** - Decentralized identity management
- **`mcp-client.ts`** - Model Context Protocol client
- **`authorized-fetch.ts`** - Authenticated HTTP requests

**Key Data Entities**:
- **ChatSession** - Chat conversations with message history
- **Cap** - AI assistant configuration (prompt, model, MCP servers)
- **Settings** - User preferences and app configuration

### UI Components

**Shared Components** (in `src/shared/components/ui/`):
- Based on Radix UI primitives with Tailwind styling
- Do not modify files in `ui/` folder - they are generated components
- For custom components, create in feature-specific `components/` folders

### Development Patterns

**State Management**:
- Use Zustand stores with persistence middleware
- Store files typically export both store and selectors
- User data automatically scoped by DID

**Data Fetching**:
- Use SWR for server state management
- Custom hooks in feature `hooks/` folders
- Services handle business logic and API calls

**Routing**:
- React Router v7 with nested layouts
- Route components in `src/pages/`
- Layout components in `src/layout/`

**Styling**:
- Tailwind CSS with custom design system
- Radix UI for accessible primitives
- Theme support via next-themes

### Important Files

- **`src/main.tsx`** - Application entry point
- **`src/router.tsx`** - Route configuration
- **`src/layout/main-layout.tsx`** - Main application layout
- **`biome.json`** - Biome configuration for linting/formatting
- **`tailwind.config.ts`** - Tailwind CSS configuration

### Development Notes

- The app supports both light and dark themes
- All user interfaces are internationalized (i18n support)
- Web3 functionality uses Reown AppKit for wallet connections
- AI model switching is supported via the model selector
- MCP servers can be dynamically added/removed per CAP