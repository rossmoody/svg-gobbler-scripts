import { Svg } from './svg';
export declare class SvgSymbol extends Svg {
    constructor(originalString: string, id: string, lastModified: string);
    /**
     * Processes the given symbol string into a sprite element.
     * If the symbol string is invalid, the element will be undefined.
     */
    private processSymbol;
}
