/**
 * Typed representation of the `from` helper exported by `pg-copy-streams`.
 *
 * This allows consumers to type-cast the untyped `from` export and still
 * keep strong typing in their code without depending on ambient module
 * declarations.
 */
declare module 'pg-copy-streams' {
  /**
   * Minimal type for the `from` helper used in COPY FROM STDIN.
   */
  export function from(sql: string): NodeJS.ReadWriteStream;
}
