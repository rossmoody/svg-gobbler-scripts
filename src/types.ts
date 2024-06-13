import type { GElement } from './classes/g-element'
import type { Image } from './classes/image'
import type { Inline } from './classes/inline'
import type { SvgSymbol } from './classes/symbol'

/**
 * The shape of the svg data stored in chrome storage as part of page data. This data
 * gets processed in and out of SVGTypes.
 */
export type StorageSvg = {
  /**
   * Unique ID
   */
  id: string
  /**
   * The last edited date
   */
  lastEdited: string
  /**
   * The svg string of the item.
   */
  svg: string
}

/**
 * The shape of the data that is gathered from the document.
 */
export type DocumentData = {
  /**
   * An array of SVG string elements from the active tab.
   */
  data: StorageSvg[]
  /**
   * The host URL of the document.
   */
  host: string
  /**
   * The origin of the document. This is used to rebuild the SVGs in the
   * content script. Especially related to image sources and cors restrictions.
   */
  origin: string
}

/**
 * A union of all the svg types that are returned from the svgFactory
 */
export type SvgType = Inline | Image | SvgSymbol | GElement
