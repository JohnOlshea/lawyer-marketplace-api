import type { Context } from 'hono';

import { ApiResponse } from '../../dto/client/common/api-response.dto';
import { ClientResponseDto } from '../../dto/client/client-response.dto';
import type { GetAllClientsUseCase } from '@/application/client/use-cases/get-all-clients/get-all-clients.use-case';
import type { GetClientUseCase } from '@/application/client/use-cases/get-client/get-client.use-case';

/**
 * Client Controller
 * 
 * Handles HTTP requests for client-related operations.
 * 
 * @remarks
 * - Presentation layer: converts HTTP requests to use case inputs
 * - Maps domain entities to DTOs for API responses
 * - Handles error responses (TODO: Add proper error handling middleware)
 * - Currently uses constructor injection for dependencies
 * 
 * TODO: Integrate with DI container (src/di/container.ts) for automatic dependency resolution
 * TODO: Add request validation
 * TODO: Add error handling for different exception types
 * TODO: Add pagination support for getAll
 */
export class ClientController {
  constructor(
    private readonly getAllClientsUseCase: GetAllClientsUseCase,
    private readonly getClientUseCase: GetClientUseCase
  ) {}

  /**
   * GET /api/v1/clients/:id
   * Retrieves a single client by ID
   * 
   * @param c - Hono context
   * @returns JSON response with client data
   * 
   * TODO: Add error handling for ClientNotFoundException
   * TODO: Add input validation middleware
   */
  async getById(c: Context) {
    const id = c.req.param('id');
    
    const client = await this.getClientUseCase.execute({ id });

    const response = ApiResponse.success(
      ClientResponseDto.fromDomain(client),
      'Client retrieved successfully'
    );

    return c.json(response, 200);
  }

  /**
   * GET /api/v1/clients
   * Retrieves all clients
   * 
   * @param c - Hono context
   * @returns JSON response with array of clients
   * 
   * TODO: Add pagination (query params: page, limit)
   * TODO: Add filtering capabilities
   * TODO: Add sorting options
   */
  async getAll(c: Context) {
    const clients = await this.getAllClientsUseCase.execute();

    const response = ApiResponse.success(
      clients.map(ClientResponseDto.fromDomain),
      'All clients retrieved successfully'
    );

    return c.json(response, 200);
  }
}