import { DocumentData, SvgType } from './types';
/**
 * The primary SVG factory that processes document data and returns an array of SVG classes.
 */
declare class SvgFactory {
    /**
     * Process the page data and return an array of SVG classes.
     */
    process(message: DocumentData | null): Promise<SvgType[]>;
    /**
     * Process a single SVG element and return an SVG class.
     */
    private createSvgElement;
    /**
     * Filter out any invalid SVGs and expand any images into their constituent parts.
     */
    private processAsyncData;
    /**
     * This is a helper function to extract the symbol and g elements from an image
     * after it has been fetched. This is necessary because the image element is
     * not in the DOM and therefore cannot be queried.
     */
    private expandImageToElements;
    private extractAndPushElements;
}
export declare const svgFactory: SvgFactory;
export {};
