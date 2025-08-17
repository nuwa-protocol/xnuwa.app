# Nuwa Client

A local-first AI chat client that enables users to create, share, and interact with Caps. 

## ✨ Features

### 🔐 Decentralized Identity & Payment
- **Self-Sovereign Identity**: Your data belongs to you with DID-based authentication
- **Crypto Payment**: Use cryptos to pay for your day-to-day ai
- **Data Portability**: Export and migrate your data anywhere

### 🎨 Modern User Experience
- **Beautiful UI**: Clean, responsive design with dark/light theme support
- **Accessibility**: Built on Radix UI primitives for full accessibility
- **Performance**: Optimized with React 19 and Vite for fast loading

## 🚀 Beta Release

We're excited to announce the **Nuwa Client Beta**! This release includes:

- ✅ Core CAP creation and sharing functionality
- ✅ Multi-model AI chat with streaming
- ✅ Web3 wallet integration
- ✅ Decentralized identity system
- ✅ MCP server integration
- ✅ Payment system for premium features

### What's Coming Next
- Enhanced CAP marketplace with ratings and reviews
- Advanced MCP tool ecosystem
- Mobile applications (iOS/Android)
- Advanced collaboration features
- Enterprise integrations

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand with persistence
- **Database**: Dexie (IndexedDB) for local storage
- **Identity**: DID from @nuwa-ai/identity-kit
- **Payment**: Payment Channel from @nuwa-ai/payment-kit
- **Cap Integration**: Cap integration from @nuwa-ai/cap-kit
- **Code Quality**: Biome for linting and formatting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/nuwa-protocol/nuwa-client.git
cd nuwa-client

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:5173` to start using Nuwa Client.

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## 🆘 Support

- **Documentation**: [docs.nuwa.ai](https://docs.nuwa.dev)
- **Issues**: [GitHub Issues](https://github.com/nuwa-protocol/nuwa-client/issues)
- **Community**: [Discord](https://discord.gg/nuwaai)
- **Email**: haichao@nuwa.dev

## 🎯 Roadmap

- [ ] Cap UI Support with inline card and side artifacts
- [ ] Desktop App with Tauri

---

**Built with ❤️ by the Nuwa team**

Ready to experience the future of AI chat? [Try Nuwa Client Beta](https://test-app.nuwa.dev) today!