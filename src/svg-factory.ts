import { GElement } from '@/svg-classes/g-element'
import { Image } from '@/svg-classes/image'
import { Inline } from '@/svg-classes/inline'
import { SvgSymbol } from '@/svg-classes/symbol'
import { nanoid } from 'nanoid'
import { PageData, SvgType } from './types'

/**
 * The SVG factory will process the page data and return an array of SVG objects.
 */
class SvgFactory {
  /**
   * Process the page data and return an array of SVG objects.
   */
  async process(message: PageData | null) {
    if (!message) {
      return []
    }

    let processedData = message.data.map(({ svg, id }) => {
      switch (true) {
        case svg.includes('<svg '): {
          return new Inline(svg, id)
        }

        case svg.includes('<symbol '): {
          return new SvgSymbol(svg, id)
        }

        case svg.includes('<g '): {
          return new GElement(svg, id)
        }

        case svg.includes('<img '): {
          return new Image(svg, id, message.origin)
        }
      }
    })

    const svgs: SvgType[] = []
    const promises: Promise<Image>[] = []

    processedData.forEach((item) => {
      if (item instanceof Image) {
        promises.push(item.fetchSvgContent())
      }
      svgs.push(item as SvgType)
    })

    const resolvedPromises = await Promise.all(promises)
    let finalData = [...svgs, ...resolvedPromises]

    // Must do one final pass after async requests to break apart remote
    // SVG sprites into their individual SVGs, symbols, or g elements
    finalData = finalData
      .filter((item) => item && item?.isValid)
      .flatMap((item) => {
        if (item instanceof Image) {
          const results = [item] as SvgType[]

          const symbols = item.asElement?.querySelectorAll('symbol')
          symbols?.forEach((symbol) => {
            results.push(new SvgSymbol(symbol.outerHTML, nanoid()))
          })

          const gElements = item.asElement?.querySelectorAll('g')
          gElements?.forEach((gElement) => {
            results.push(new GElement(gElement.outerHTML, nanoid()))
          })

          return results
        }

        return item
      })

    return finalData as SvgType[]
  }
}

export const svgFactory = new SvgFactory()
