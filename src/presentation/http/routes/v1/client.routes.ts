import { Hono } from 'hono';
import type { Context } from 'hono';

import { ClientController } from '../../controllers/client/client.controller';
import { GetClientUseCase } from '@/application/client/use-cases/get-client/get-client.use-case';
import { GetAllClientsUseCase } from '@/application/client/use-cases/get-all-clients/get-all-clients.use-case';
import { DrizzleClientRepository } from '@/infrastructure/database/repositories/client/drizzle-client.repository';

/**
 * Client Routes Factory
 * 
 * Follows the Dependency Injection pattern with manual wiring.
 * TODO: Migrate to centralized DI Container (src/di/container.ts) once configured
 * 
 * @remarks
 * This is a temporary composition root for early development.
 * Will be replaced with container.resolve() pattern for better dependency management.
 * 
 * @returns Hono app instance with client routes mounted
 */
export function createClientRoutes(): Hono {
  const app = new Hono();

  // Composition Root: Wire dependencies from outer layers to inner layers
  // Infrastructure -> Application -> Presentation
  const clientRepository = new DrizzleClientRepository();
  const getAllClientsUseCase = new GetAllClientsUseCase(clientRepository);
  const getClientUseCase = new GetClientUseCase(clientRepository);
  const clientController = new ClientController(
    getAllClientsUseCase, 
    getClientUseCase
  );

  /**
   * GET /api/v1/clients
   * Retrieves all clients with optional pagination and filtering
   * 
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 10)
   * @returns ClientResponse[]
   */
  app.get('/', async (c: Context) => clientController.getAll(c));

  /**
   * GET /api/v1/clients/:id
   * Retrieves a single client by ID
   * 
   * @param id - Client UUID
   * @returns ClientResponse
   * @throws 404 - Client not found
   */
  app.get('/:id', async (c: Context) => clientController.getById(c));

  return app;
}