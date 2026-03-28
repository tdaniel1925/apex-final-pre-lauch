/**
 * FTC Compliance Module
 *
 * Implements FTC compliance requirements for MLM compensation plans:
 * 1. Anti-frontloading: Max 1 self-purchase per product counts toward BV
 * 2. 70% Retail Customer: 70% of BV must come from retail customers
 *
 * These rules ensure the compensation plan is driven by actual retail sales,
 * not recruitment and distributor inventory loading.
 *
 * @module lib/compliance
 */

export * from './anti-frontloading';
export * from './retail-validation';

export { default as AntiFrontloading } from './anti-frontloading';
export { default as RetailValidation } from './retail-validation';
