/**
 * The root SVG class. This is the base class for all SVG types. It doesn't actually
 * produce a "valid" SVG element, but it is used to store the original string and
 * origin of the SVG element in the DOM.
 */
export declare class Svg {
    /**
     * Last edited date. Defaults to creation date.
     */
    lastEdited: string;
    /**
     * A unique identifier. This must be supplied as a matching identifier
     * from the SVG element in storage.
     */
    id: string;
    /**
     * The original string of the SVG element in the DOM.
     * It is processed into an <svg> string through the svg factory.
     *
     * If it fails to do so, it is invalid or cors restricted.
     */
    originalString: string;
    /**
     * The original string is parsed and assigned to this property as an element.
     * If it is undefined, the SVG factory was unable to parse or
     * manually create the SVG element from parts.
     */
    asElement?: Element;
    /**
     * Defaults to false and only flips true if the element is an
     * image and the fetch fails.
     */
    corsRestricted: boolean;
    constructor(originalString: string, id: string, lastEdited: string);
    /**
     * Rebuild the SVG element from the original string
     */
    parseFromString(): HTMLElement | undefined;
    /**
     * Create and return a new empty SVG Element with the correct namespace
     */
    createSvgElement(): SVGSVGElement;
    /**
     * Creates a new empty use element with the correct namespace
     * and href attribute set to the id passed in for the relevant g or symbol
     */
    createUseElement(id: string): SVGUseElement;
    /**
     * Creates a new empty symbol element with the correct namespace and
     * id attribute set to the id passed in for the relevant g or use
     */
    createSymbolElement(id: string): SVGSymbolElement;
    /**
     * We try everything under the sun to get an SVG element from the original string.
     * If we can't, the asElement property will be undefined and we can't do anything
     * with it.
     */
    get isValid(): boolean;
    /**
     * Return the original SVG stripped of competing styles related to class, explicit height,
     * or explicit width attributes to allow the SVG to scale responsively. Attempts to add
     * a viewBox attribute if one is not present based on width or height.
     *
     * This is used to display the SVG in the DOM and export PNG for scaling.
     */
    get presentationSvg(): string;
}
