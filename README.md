![Nuwa AI Readme Background](./src/assets/readme-bg.png)

# x402AI - Your Entrace to the x402 AI service ecosystem

[Check out the app!](https://x402ai.app)

We are building to offer you the best AI client app for accessing **x402 AI services**, forked from the [original Nuwa Client](https://github.com/nuwa-protocol/nuwa-client). This local-first and user-friendly chat experience lets you create, share, and interact with x402 based AI Cap ecosystem.

> **Caps** (i.e. capability) are mini-apps in Nuwa AI, the minimium functional AI unit. Cap is designed to be an abstraction of AI models and agents. Currently it is the composation of Prompt, Model, MCP Servers and UI. Learn more about Cap on our [official docs](https://docs.nuwa.dev/introduction/core-concepts/capabilities).

## ✨ Features

### 🔐 Decentralized Identity & Crypto Payment
- **Anonymous Identity**: You control your data with your EVM address, fully anonymous
- **Crypto Payment**: Use cryptos to pay for your day-to-day AI
- **Data Portability**: Export and migrate your data anywhere

### 🎨 Modern User Experience
- **Shadcn UI**: Clean, responsive design with dark/light theme and multi-lin support
- **No MCP Configuration**: MCPs use DID authentication directly, eliminates the need for user to config


## 🚀 Alpha Release

We're excited to announce the **x402AI Alpha Release**! This release includes:

- ✅ x402 Client-Side integration - x402 MCP client follows the [official spec](https://github.com/coinbase/x402/blob/2daa42f6a0e5a36c1bb19677fda2a74a6b466b06/specs/transports/mcp.md?plain=1)
- ✅ native wallet integration - encrypted, non-exportable privatekey stored in IndexedDB; sign transaction with PIN code or Passkey
- ✅ A built-in demo for testing MCP
- ✅ Payment Record Management


## 🛠️ Technology Stack

- **Framerwork**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand with persistence
- **Database**: Dexie (IndexedDB) for local storage
- **Identity**: Viem as account manager; Encrypted Zustand store for privatekey management
- **Payment**: x402 protocol for MCP and LLM fetch
- **Cap Integration**: Cap integration from @nuwa-ai/cap-kit
- **Code Quality**: Biome for linting and formatting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/nuwa-protocol/xnuwa.app.git
cd xnuwa.app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:5173` to start using x402AI.

## 🧩 Cap Registry

Community-built Caps live in the `cap-registry/` directory. Use this folder to:

- Browse existing community Caps and examples (`cap-registry/`)
- Follow the Cap Standard defined in the [Nuwa AI docs](https://docs.nuwa.dev/build-caps/quickstart)
- Github Action is enabled to check the schema of your Cap

We are working on an easier-to-use registry system.

## 📖 Development

### Project Structure

```
src/
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── chat/          # Chat functionality
│   ├── cap-studio/    # CAP creation interface
│   ├── cap-store/     # CAP marketplace
│   ├── settings/      # User preferences
│   ├── sidebar/       # Navigation
│   └── wallet/        # Web3 integration
├── shared/            # Shared utilities and components
├── pages/             # Route components
└── layout/            # Layout components
```

Each feature follows a consistent structure:
- `components` - React components
- `hooks` - Custom React hooks  
- `stores` - Zustand state management
- `services` - Backend logics
- `types` - TypeScript definitions


## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## 🆘 Support

- **Documentation**: [docs.nuwa.dev/xnuwa](https://docs.nuwa.dev/xnuwa/)
- **Issues**: [GitHub Issues](https://github.com/nuwa-protocol/xnuwa.app/issues)
- **Community**: [Discord](https://discord.gg/nuwaai)
- **Email**: haichao@nuwa.dev

## 🎯 Roadmap

- [ ] Cap Registry 
- [ ] x402 v2 spec integration
- [ ] Desktop App with Tauri

---

**Built with ❤️ by the Nuwa team**
