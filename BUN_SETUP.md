# Bun Package Manager Setup

This project uses **Bun** as the default package manager for faster, more reliable dependency management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Bun 1.0.0+

### Installation

1. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Setup the project**:
   ```bash
   # Run the setup script
   ./scripts/setup-bun.sh
   
   # Or manually
   bun install
   ```

3. **Start development**:
   ```bash
   bun run dev
   ```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server (port 3000) |
| `bun run build` | Build for production |
| `bun run build:dev` | Build for development |
| `bun run lint` | Run ESLint |
| `bun run preview` | Preview production build |
| `bun run start` | Start the application |

## 🔧 Package Management

| Command | Description |
|---------|-------------|
| `bun add <package>` | Add a dependency |
| `bun add -D <package>` | Add a dev dependency |
| `bun remove <package>` | Remove a dependency |
| `bun update` | Update all dependencies |
| `bun install` | Install dependencies |

## ⚡ Why Bun?

- **Faster**: Up to 30x faster than npm
- **Reliable**: Deterministic installs with lockfile
- **Compatible**: Works with existing npm packages
- **Modern**: Built-in TypeScript support
- **Efficient**: Better caching and dependency resolution

## 🔒 Lockfile

This project uses `bun.lockb` (Bun's binary lockfile) for deterministic installs. **Do not delete this file** - it ensures all team members get the same dependency versions.

## 🛠️ Configuration Files

- **`.bunfig.toml`**: Bun configuration
- **`.npmrc`**: Package manager settings
- **`package.json`**: Project configuration with `packageManager` field
- **`vite.config.ts`**: Vite configuration (port 3000)

## 🚨 Troubleshooting

### If you see npm/yarn commands
Make sure you're using Bun commands instead:
- ❌ `npm install` → ✅ `bun install`
- ❌ `npm run dev` → ✅ `bun run dev`
- ❌ `yarn add package` → ✅ `bun add package`

### If Bun is not recognized
1. Restart your terminal
2. Check if Bun is in your PATH: `which bun`
3. Reinstall Bun if needed

### If dependencies are missing
```bash
bun install --force
```

### Port conflicts
The development server runs on port 3000 by default. If you need a different port:
```bash
bun run dev --port 3001
```

## 🔄 Migration from npm/yarn

If you're migrating from npm or yarn:

1. Delete `node_modules` and lockfiles:
   ```bash
   rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml
   ```

2. Install with Bun:
   ```bash
   bun install
   ```

3. Update your scripts to use `bun run` instead of `npm run` or `yarn`

## 📚 More Information

- [Bun Documentation](https://bun.sh/docs)
- [Bun GitHub](https://github.com/oven-sh/bun)
- [Migration Guide](https://bun.sh/docs/install#migrating-from-npm) 