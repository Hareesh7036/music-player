import { IUser } from '../models/User';

declare module 'elysia' {
  // Extend the base Elysia context
  interface Context {
    user?: IUser;
  }
  
  // Extend the request object to include the user property
  interface Request {
    user?: IUser;
  }
  
  // This ensures the user property is available in route handlers
  interface RouteSchema {
    body?: unknown;
    query?: unknown;
    params?: unknown;
    headers?: unknown;
    response?: unknown;
    user?: IUser;
  }
}
