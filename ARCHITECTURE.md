# Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architectural Principles](#architectural-principles)
3. [Layer Descriptions](#layer-descriptions)
4. [Design Patterns](#design-patterns)
5. [Data Flow](#data-flow)
6. [Key Design Decisions](#key-design-decisions)

## Overview

This application follows **Domain-Driven Design (DDD)** and **Clean Architecture** principles. The architecture ensures business logic is completely isolated from technical concerns, making the system highly maintainable and testable.

### Core Principle: Dependency Rule
```
Presentation → Application → Domain
     ↓              ↓
Infrastructure ←────┘

Dependencies point INWARD. Inner layers have no knowledge of outer layers.
```

## Architectural Principles

### 1. **Separation of Concerns**
Each layer has a distinct responsibility and can evolve independently.

### 2. **Dependency Inversion**
High-level modules (domain) don't depend on low-level modules (infrastructure). Both depend on abstractions (interfaces).

### 3. **Screaming Architecture**
The folder structure immediately reveals what the system does (legal marketplace), not what frameworks it uses.

### 4. **Testability**
Business logic can be tested without databases, HTTP, or external services.

## Layer Descriptions

### 🎯 Domain Layer (`src/domain/`)

**Purpose**: Contains pure business logic with zero external dependencies.

**Components**:
- **Entities**: Objects with identity and lifecycle
```typescript
  // Client has an ID and mutable state
  class Client extends AggregateRoot {
    private _firstName: string;
    // ...
  }
```

- **Value Objects**: Immutable objects defined by their values
```typescript
  // Email is immutable and self-validating
  class Email extends ValueObject<string> {
    static create(email: string): Email { /* validation */ }
  }
```

- **Repository Interfaces**: Define data access contracts (implemented by infrastructure)
```typescript
  interface IClientRepository {
    findById(id: string): Promise<Client | null>;
    save(client: Client): Promise<void>;
  }
```

- **Domain Services**: Coordinate between multiple aggregates
- **Domain Events**: Communicate state changes

**Rules**:
- ❌ No imports from other layers
- ❌ No framework dependencies
- ❌ No database/HTTP knowledge
- ✅ Pure TypeScript/JavaScript
- ✅ Business rules enforcement

### 🔧 Application Layer (`src/application/`)

**Purpose**: Orchestrates domain objects to fulfill use cases.

**Components**:
- **Use Cases**: Single-purpose application operations
```typescript
  class CreateClientUseCase {
    async execute(input: CreateClientInput): Promise<Client> {
      // 1. Validate uniqueness
      // 2. Create domain entity
      // 3. Persist via repository
      // 4. Publish events
    }
  }
```

- **DTOs**: Data Transfer Objects for input/output
- **Mappers**: Convert between domain and DTOs
- **Application Services**: Coordinate multiple use cases

**Rules**:
- ✅ Depends on domain layer interfaces
- ✅ Orchestrates workflows
- ❌ No HTTP/database details
- ❌ No business logic (delegates to domain)

### 🗄️ Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Implements technical concerns and external integrations.

**Components**:
- **Repository Implementations**: Concrete data access
```typescript
  class DrizzleClientRepository implements IClientRepository {
    async findById(id: string): Promise<Client | null> {
      const row = await db.query.clients.findFirst(/*...*/);
      return row ? ClientMapper.toDomain(row) : null;
    }
  }
```

- **Database Schema**: Drizzle ORM table definitions
- **Migrations**: Database version control
- **External Service Adapters**: Third-party integrations
- **Mappers**: Convert between database models and domain entities

**Rules**:
- ✅ Implements domain interfaces
- ✅ Contains all framework code
- ❌ No business logic

### 🌐 Presentation Layer (`src/presentation/`)

**Purpose**: Handles HTTP communication and user interface concerns.

**Components**:
- **Controllers**: Handle HTTP requests
```typescript
  class ClientController {
    async getById(c: Context) {
      const id = c.req.param('id');
      const client = await this.getClientUseCase.execute(id);
      return c.json(ClientResponseDto.fromDomain(client));
    }
  }
```

- **Routes**: Define URL structure
- **DTOs**: API request/response formats
- **Validators**: Input validation
- **Middleware**: Cross-cutting concerns (auth, logging)

**Rules**:
- ✅ Depends on application layer
- ✅ HTTP-specific logic only
- ❌ No direct domain access

## Design Patterns

### 1. Repository Pattern
Abstracts data access behind an interface.
```typescript
// Domain defines the contract
interface IClientRepository {
  findById(id: string): Promise<Client | null>;
}

// Infrastructure provides implementation
class DrizzleClientRepository implements IClientRepository {
  // Uses Drizzle ORM internally
}
```

**Benefits**: Easy to swap databases, mock for testing.

### 2. Factory Pattern
Entities use static factory methods for creation.
```typescript
// ❌ Direct instantiation bypasses validation
const client = new Client(id, props);

// ✅ Factory method enforces rules
const client = Client.create(id, props);
```

**Benefits**: Centralized validation, emits domain events.

### 3. Value Object Pattern
Encapsulates validation and immutability.
```typescript
const email = Email.create('invalid'); // throws error
const email = Email.create('valid@example.com'); // succeeds
```

**Benefits**: Invalid states cannot exist, reusable validation.

### 4. Use Case Pattern (Command/Query)
Each use case has a single responsibility.
```typescript
// Command: Modifies state
class CreateClientUseCase implements IUseCase<Input, Output> {
  async execute(input: Input): Promise<Output> { /* ... */ }
}

// Query: Reads data
class GetClientUseCase implements IUseCase<Input, Output> {
  async execute(input: Input): Promise<Output> { /* ... */ }
}
```

**Benefits**: Easy to test, clear dependencies, follows SRP.

### 5. Dependency Injection
Dependencies are injected, not created internally.
```typescript
// ❌ Hard to test, tightly coupled
class UseCase {
  private repo = new DrizzleClientRepository();
}

// ✅ Testable, flexible
class UseCase {
  constructor(private repo: IClientRepository) {}
}
```

## Data Flow

### Example: Create Client Request
```
1. HTTP Request
   POST /api/v1/clients
   Body: { firstName, lastName, email }
   
   ↓

2. Presentation Layer
   ClientController.create(c: Context)
   - Extracts data from request
   - Calls use case
   
   ↓

3. Application Layer
   CreateClientUseCase.execute(input)
   - Validates input
   - Checks email uniqueness
   - Creates domain entity
   - Persists via repository
   
   ↓

4. Domain Layer
   Client.create(id, props)
   - Validates business rules
   - Creates entity
   - Emits ClientCreatedEvent
   
   ↓

5. Infrastructure Layer
   DrizzleClientRepository.save(client)
   - Maps domain entity to DB model
   - Executes INSERT query
   - Returns saved entity
   
   ↓

6. Response
   HTTP 201 Created
   Body: ClientResponseDto
```

## Key Design Decisions

### ADR 001: Domain-Driven Design

**Context**: Need maintainable, scalable architecture for complex business domain.

**Decision**: Use DDD with Clean Architecture.

**Consequences**:
- ✅ Business logic isolated and testable
- ✅ Easy to understand system behavior
- ✅ New developers can navigate codebase quickly
- ⚠️ More boilerplate than simple CRUD
- ⚠️ Steeper learning curve for junior developers

### ADR 002: TypeScript with Strict Mode

**Context**: Need type safety for large codebase.

**Decision**: Use TypeScript with `strict: true`.

**Consequences**:
- ✅ Catch errors at compile time
- ✅ Better IDE support
- ✅ Self-documenting code
- ⚠️ Slightly slower development initially

### ADR 003: Bun Runtime

**Context**: Need fast development experience.

**Decision**: Use Bun for runtime and package management.

**Consequences**:
- ✅ 3x faster than Node.js
- ✅ Built-in TypeScript support
- ✅ Compatible with Node.js ecosystem
- ⚠️ Newer ecosystem (less mature)

### ADR 004: Drizzle ORM

**Context**: Need type-safe database access without heavy ORM.

**Decision**: Use Drizzle ORM over Prisma/TypeORM.

**Consequences**:
- ✅ Lightweight and fast
- ✅ Full TypeScript support
- ✅ SQL-like syntax
- ✅ Better control over queries
- ⚠️ Smaller community than Prisma

## Testing Strategy

### Unit Tests
Test domain entities and value objects in isolation.
```typescript
describe('Client Entity', () => {
  it('should not allow empty first name', () => {
    expect(() => Client.create(id, { firstName: '' }))
      .toThrow('First name must be at least 2 characters');
  });
});
```

### Integration Tests
Test use cases with real repositories (test database).
```typescript
describe('CreateClientUseCase', () => {
  it('should create client and persist to database', async () => {
    const client = await useCase.execute(input);
    const found = await repository.findById(client.id);
    expect(found).toBeDefined();
  });
});
```

### E2E Tests
Test full HTTP request/response cycle.
```typescript
describe('POST /api/v1/clients', () => {
  it('should return 201 with client data', async () => {
    const response = await request(app)
      .post('/api/v1/clients')
      .send({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' });
    
    expect(response.status).toBe(201);
  });
});
```

## Future Enhancements

1. **Event Sourcing**: Store all state changes as events
2. **CQRS**: Separate read and write models
3. **Saga Pattern**: Manage distributed transactions
4. **API Gateway**: Centralized entry point for microservices
5. **GraphQL Layer**: Alternative to REST for flexible queries

---

**References**:
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Implementing Domain-Driven Design by Vaughn Vernon](https://vaughnvernon.com/)