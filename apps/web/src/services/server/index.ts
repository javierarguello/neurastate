/**
 * Server-side services
 * These should ONLY be called from:
 * - API routes (app/api/*)
 * - Server components (components with no 'use client')
 * - Server actions
 */

export * from './properties.service';
export * from './market.service';
export * from './contact.service';
