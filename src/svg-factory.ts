import { GElement } from '@/classes/g-element'
import { Image } from '@/classes/image'
import { Inline } from '@/classes/inline'
import { SvgSymbol } from '@/classes/symbol'
import { nanoid } from 'nanoid'
import { DocumentData, SvgType } from './types'

/**
 * The primary SVG factory that processes document data and returns an array of SVG classes.
 */
class SvgFactory {
  /**
   * Process the page data and return an array of SVG classes.
   */
  async process(message: DocumentData | null): Promise<SvgType[]> {
    if (!message) {
      return []
    }

    const initialData: SvgType[] = message.data
      .map(({ svg, id }) => this.createSvgElement(svg, id, message.origin))
      .filter((item): item is SvgType => item !== undefined)

    const promises = initialData.map((item) =>
      item instanceof Image ? item.fetchSvgContent() : Promise.resolve(item),
    )

    return this.processAsyncData(await Promise.all(promises))
  }

  private createSvgElement(svg: string, id: string, origin?: string): SvgType | undefined {
    if (svg.includes('<svg ')) {
      return new Inline(svg, id)
    }
    if (svg.includes('<symbol ')) {
      return new SvgSymbol(svg, id)
    }
    if (svg.includes('<g ')) {
      return new GElement(svg, id)
    }
    if (svg.includes('<img ')) {
      return new Image(svg, id, origin ?? '')
    }
  }

  /**
   * Filter out any invalid SVGs and expand any images into their constituent parts.
   */
  private processAsyncData(data: SvgType[]): SvgType[] {
    return data
      .filter((item) => item && item.isValid)
      .flatMap((item) => this.expandImageToElements(item))
  }

  /**
   * This is a helper function to extract the symbol and g elements from an image
   * after it has been fetched. This is necessary because the image element is
   * not in the DOM and therefore cannot be queried.
   */
  private expandImageToElements(item: SvgType): SvgType[] {
    if (item instanceof Image) {
      const results: SvgType[] = [item]
      this.extractAndPushElements(item, 'symbol', results)
      this.extractAndPushElements(item, 'g', results)
      return results
    }
    return [item]
  }

  private extractAndPushElements(image: Image, selector: 'symbol' | 'g', results: SvgType[]): void {
    const elements = image.asElement?.querySelectorAll(selector)
    elements?.forEach((element) => {
      const constructor = selector === 'symbol' ? SvgSymbol : GElement
      results.push(new constructor(element.outerHTML, nanoid()))
    })
  }
}

export const svgFactory = new SvgFactory()
