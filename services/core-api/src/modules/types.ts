import type { AppConfig } from '../config/env.js';
import type { PrismaClient } from '../lib/prisma.js';
import type { TokenService } from '../lib/tokens.js';

// What every feature module is built from. Passed in (not imported) so tests can substitute pieces.
export interface ModuleDeps {
  prisma: PrismaClient;
  tokens: TokenService;
  config: AppConfig;
}
