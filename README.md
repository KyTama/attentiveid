# AttentiveId - Getting Started

## 🚀 Quick Start

### Prerequisites
- Bun 1.3.4 or later installed

### Development

1. **Start the backend API:**
   ```bash
   bun run dev:api
   ```
   API will run on: http://localhost:3000
   Swagger docs: http://localhost:3000/swagger

2. **Start the frontend (in a new terminal):**
   ```bash
   bun run dev:web
   ```
   Frontend will run on: http://localhost:5173

3. **Or run both concurrently:**
   ```bash
   bun run dev
   ```

### Project Structure

```
attentiveid/
├── apps/
│   ├── api/              # Elysia backend
│   │   ├── src/
│   │   │   └── index.ts  # Main API server
│   │   └── package.json
│   └── web/              # React frontend
│       ├── src/
│       │   ├── lib/
│       │   │   └── api.ts   # Eden client
│       │   ├── App.tsx      # Main app component
│       │   └── main.tsx
│       └── package.json
├── docs/                 # UML diagrams
├── packages/             # Shared packages (future)
├── package.json          # Root workspace config
└── tsconfig.json
```

### Key Features

- ✅ **Type Safety**: End-to-end type safety via Elysia Eden
- ✅ **Monorepo**: Bun workspaces for easy development
- ✅ **Swagger Docs**: Auto-generated API documentation
- ✅ **CORS Configured**: Frontend can communicate with backend
- ✅ **Hot Reload**: Watch mode enabled for both apps

### Next Steps

1. ✅ Backend API with Swagger
2. ✅ React frontend with Eden client
3. ✅ Test the handshake locally
4. 🔜 Add database (PostgreSQL)
5. 🔜 Implement authentication
6. 🔜 Build out use cases from UML diagrams
7. 🔜 Deploy to Render + GitHub Pages

### Environment Variables

#### Backend (`apps/api/.env`)
```bash
PORT=3000
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`apps/web/.env`)
```bash
VITE_API_URL=http://localhost:3000
```

See `.env.example` files for templates.

---

Built with ❤️ using Bun + Elysia + React + Vite
