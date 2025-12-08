/**
 * Base Use Case Interface
 * 
 * Enforces consistent structure across all application use cases.
 * 
 * @remarks
 * - Represents application-specific business operations
 * - Each use case has a single, well-defined purpose
 * - Use cases orchestrate domain logic but don't contain it
 * 
 * @template TInput - Input data type (DTO)
 * @template TOutput - Output data type (usually domain entity)
 * 
 * @example
 * ```typescript
 * class CreateOrderUseCase implements IUseCase<CreateOrderInput, Order> {
 *   async execute(input: CreateOrderInput): Promise<Order> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface IUseCase<TInput, TOutput> {
  /**
   * Executes the use case with the provided input
   * 
   * @param input - Use case input data
   * @returns Promise resolving to use case output
   * @throws {Error} If operation fails
   */
  execute(input: TInput): Promise<TOutput>;
}

/**
 * Use Case without input parameters
 * 
 * @remarks
 * Used for queries that don't require input (e.g., GetAllClients)
 * 
 * @template TOutput - Output data type
 * 
 * @example
 * ```typescript
 * class GetAllClientsUseCase implements IUseCaseWithoutInput<Client[]> {
 *   async execute(): Promise<Client[]> {
 *     return await this.repository.findAll();
 *   }
 * }
 * ```
 */
export interface IUseCaseWithoutInput<TOutput> {
  execute(): Promise<TOutput>;
}

/**
 * Use Case without return value
 * 
 * @remarks
 * Used for commands that don't return data (e.g., DeleteClient, SendEmail)
 * 
 * @template TInput - Input data type
 * 
 * @example
 * ```typescript
 * class DeleteClientUseCase implements IUseCaseWithoutOutput<DeleteClientInput> {
 *   async execute(input: DeleteClientInput): Promise<void> {
 *     await this.repository.delete(input.id);
 *   }
 * }
 * ```
 */
export interface IUseCaseWithoutOutput<TInput> {
  execute(input: TInput): Promise<void>;
}

/**
 * Use Case with neither input nor output
 * 
 * @remarks
 * Rare but useful for simple operations (e.g., ClearCache, HealthCheck)
 * 
 * @example
 * ```typescript
 * class ClearCacheUseCase implements IUseCaseWithoutInputOrOutput {
 *   async execute(): Promise<void> {
 *     await this.cache.clear();
 *   }
 * }
 * ```
 */
export interface IUseCaseWithoutInputOrOutput {
  execute(): Promise<void>;
}