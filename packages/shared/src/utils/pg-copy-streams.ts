import { from as _rawCopyFrom } from 'pg-copy-streams';
import type { Submittable } from 'pg';

export interface IPgCopyFrom {
  (sql: string): NodeJS.ReadWriteStream & Submittable;
}

/**
 * Strongly-typed wrapper around `pg-copy-streams`'s `from` helper.
 *
 * This function can be imported from `@neurastate/shared` instead of
 * depending directly on the untyped external module.
 */
export const copyFrom: IPgCopyFrom = _rawCopyFrom as unknown as IPgCopyFrom;
