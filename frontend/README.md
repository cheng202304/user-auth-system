# User Auth Frontend

Frontend application for the user authentication system built with React and TypeScript.

## Tech Stack

- **React 18.2.0** - UI library
- **TypeScript 5.3.3** - Type-safe JavaScript
- **Vite 5.0.8** - Build tool and dev server
- **React Router DOM 6.20.0** - Routing
- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

### Run tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm run test:coverage
```

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── __mocks__/    # Test mocks
│   ├── __tests__/    # Test files
│   ├── App.tsx       # Main application component
│   ├── App.test.tsx  # App component tests
│   ├── main.tsx      # Entry point
│   ├── index.css     # Global styles
│   ├── setupTests.ts # Jest configuration
│   └── vite-env.d.ts # Vite type declarations
├── index.html        # HTML template
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── tsconfig.node.json # TypeScript config for Node.js
├── vite.config.ts    # Vite configuration
└── jest.config.json  # Jest configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint

## API Integration

The frontend is configured to proxy API requests to the backend:

```
Frontend: http://localhost:3000
Backend API: http://localhost:5000
```

API requests to `/api/*` will be automatically proxied to the backend server.

## License

MIT
