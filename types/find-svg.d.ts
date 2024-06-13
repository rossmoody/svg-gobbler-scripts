import type { DocumentData } from './types';
/**
 * Gathers all relevant SVG data from a given document. Must be isolated self containing
 * function to make Chrome Manifest V3 security happy.
 */
export declare function findSvg(documentParam?: Document): DocumentData;
