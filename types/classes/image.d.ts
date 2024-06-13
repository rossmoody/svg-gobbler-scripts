import { Svg } from './svg';
export declare class Image extends Svg {
    /**
     * The absolute URL of the image source. If this is present, the SVG
     * is an image element with an external source. It will require a fetch
     * to get the SVG source. If it fails, the image is retained with the cors
     * src url.
     */
    absoluteImageUrl?: string;
    /**
     * The document.location.origin of the SVG element in the DOM. Can be blank.
     */
    origin: string;
    constructor(originalString: string, id: string, origin: string, lastModified: string);
    processImage(): void;
    /**
     * Creates an absolute URL from the image src of an image element.
     */
    private getAbsoluteImageSrc;
    /**
     * * Decodes a base64-encoded Unicode string.
     *
     * This function first decodes the base64 string using the built-in `atob` function.
     * It then splits the resulting string into an array of characters and encodes each character
     * into its hexadecimal representation. The encoded characters are then assembled into a string
     * and decoded using `decodeURIComponent` to handle any special Unicode characters.
     */
    private base64DecodeUnicode;
    /**
     * Parses a given HTML string and returns the first element in its body.
     *
     * This function constructs a complete HTML document by embedding the original HTML string (`this.originalString`)
     * inside the body tags. This ensures that the string is parsed in the context of a full HTML document, which can be
     * important for correctly interpreting the HTML structure and any associated resources.
     */
    private parseAndSetElement;
    /**
     *
     */
    fetchSvgContent(): Promise<this>;
}
