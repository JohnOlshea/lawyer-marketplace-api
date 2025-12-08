# Lawyer Marketplace API

> A production-grade legal services marketplace built with Domain-Driven Design (DDD), Clean Architecture, and TypeScript.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Project Overview

A scalable API platform connecting clients with legal professionals. Built with enterprise-grade patterns and practices used by top-tier tech companies.

**Key Features:**
- Domain-Driven Design (DDD) with strategic patterns
- Clean Architecture (Hexagonal Architecture)
- Type-safe with TypeScript
- High-performance with Bun runtime
- PostgreSQL with Drizzle ORM
- Authentication with Better-Auth

## Architecture

This project implements **Domain-Driven Design** principles, separating concerns into four distinct layers:
```
┌─────────────────────────────────────────┐
│         Presentation Layer              │  ← HTTP Controllers, DTOs, Routes
├─────────────────────────────────────────┤
│         Application Layer               │  ← Use Cases, Application Services
├─────────────────────────────────────────┤
│         Domain Layer                    │  ← Entities, Value Objects, Domain Logic
├─────────────────────────────────────────┤
│         Infrastructure Layer            │  ← Database, External Services
└─────────────────────────────────────────┘
```

### Why This Architecture?

- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features without touching existing code
- **Business Logic Isolation**: Domain layer has zero external dependencies

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | [Bun](https://bun.sh) - Fast JavaScript runtime |
| **Framework** | [Hono](https://hono.dev) - Lightweight web framework |
| **Database** | PostgreSQL with [Drizzle ORM](https://orm.drizzle.team) |
| **Authentication** | [Better-Auth](https://better-auth.com) |
| **Language** | TypeScript 5.0+ |
| **Architecture** | DDD + Clean Architecture |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- PostgreSQL >= 14
- Node.js >= 20 (for tooling compatibility)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/lawyer-marketplace-api.git
cd lawyer-marketplace-api

# Install dependencies
bun install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/lawyer_marketplace
PORT=3000
NODE_ENV=development
```

## Testing
```bash
# Run unit tests
bun test

# Run integration tests
bun test:integration

# Test coverage
bun test:coverage
```

## API Documentation

See [API.md](./docs/API.md) for complete endpoint documentation.

### Quick Example
```bash
# Health check
curl http://localhost:3000/

# Get all clients
curl http://localhost:3000/api/v1/clients

# Get specific client
curl http://localhost:3000/api/v1/clients/{id}
```

## Development Principles

### Domain-Driven Design Patterns

- **Entities**: Objects with identity (Client, Lawyer, Case)
- **Value Objects**: Immutable objects defined by values (Email, Location)
- **Aggregates**: Consistency boundaries with aggregate roots
- **Repositories**: Abstraction over data access
- **Domain Events**: Communicate state changes across aggregates

### SOLID Principles

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### Design Patterns Used

- Repository Pattern
- Factory Pattern
- Strategy Pattern (Use Cases)
- Dependency Injection
- CQRS (Command Query Responsibility Segregation)

## 🗺️ Roadmap

- [x] Core domain modeling (Client aggregate)
- [x] Repository infrastructure with Drizzle
- [x] RESTful API endpoints
- [ ] Lawyer aggregate and matching system
- [ ] Case management domain
- [ ] Event sourcing for audit trail
- [ ] CQRS with read models
- [ ] Real-time notifications
- [ ] Payment processing integration
- [ ] Advanced search with Elasticsearch

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Inspired by [Eric Evans' Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- Architecture patterns from [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- TypeScript best practices from [Matt Pocock](https://www.totaltypescript.com/)

---

⭐ **Star this repo if you find it helpful!** ⭐