import { Hono } from 'hono';

import { createClientRoutes } from './client.routes';

/**
 * API v1 Routes Factory
 * 
 * Aggregates all v1 API routes.
 * 
 * @remarks
 * - Central place to mount all v1 route modules
 * - Makes versioning and deprecation easier
 * 
 * @returns Hono app instance with all v1 routes
 */
export function createV1Routes() {
  const v1 = new Hono();

  // Mount route modules
  v1.route('/clients', createClientRoutes());
  
  // TODO: Add more route modules as they're implemented
  // v1.route('/lawyers', createLawyerRoutes());
  // v1.route('/cases', createCaseRoutes());

  return v1;
}