export * from './domain';
export * from './store';
export * from './service';
export * as coreServices from './services/core';

import * as core from './services/core';
import type { AnyService } from './service';

/** Every service, keyed by name. New modules add theirs here. */
export const services: Record<string, AnyService> = Object.fromEntries(
  Object.values(core).map((s) => [s.name, s as AnyService]),
);
