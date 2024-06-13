import { Svg } from './svg';
/**
 * Inline SVGs are SVGs that are directly in the DOM.
 */
export declare class Inline extends Svg {
    constructor(originalString: string, id: string, lastModified: string);
    /**
     * An earnest effort to set a viewBox so we can handle resizing and displaying the SVGs.
     * Returns a clone of the SVG.
     */
    setViewBox(): void;
}
