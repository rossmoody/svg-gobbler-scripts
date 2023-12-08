import type { DocumentData } from './types'

/**
 * Gathers all relevant SVG data from a given document. Must be isolated self containing
 * function to make Chrome Manifest V3 security happy.
 */
export function findSvg(documentParam?: Document): DocumentData {
  /**
   * The document to search for SVGs. Defaults to window.document.
   */
  const document = documentParam ?? window.document

  /**
   * Helper function to quickly create a new image, set the src, and return the outerHTML
   * created by it. We must do this because security is quite strict on what we can access
   * from the client page so this strips out all the sensitive data.
   *
   */
  const createImage = (src: string) => {
    const image = new Image()
    image.src = src
    return image.outerHTML
  }

  /**
   * Find all the elements with src or background images that contain svg
   */
  const parseSrcAndBgImages = () => {
    const results: string[] = []
    const elements = document.querySelectorAll('*')

    elements.forEach((element) => {
      if (element instanceof HTMLImageElement && element.src.includes('.svg')) {
        results.push(createImage(element.src))
      }

      const backgroundImage = window.getComputedStyle(element).backgroundImage
      if (element instanceof HTMLElement && backgroundImage.includes('.svg')) {
        const url = backgroundImage.slice(5, -2)
        results.push(createImage(url))
      }

      if (element instanceof HTMLObjectElement && element.type === 'image/svg+xml') {
        results.push(createImage(element.data))
      }

      if (element instanceof HTMLEmbedElement && element.type === 'image/svg+xml') {
        results.push(createImage(element.src))
      }

      if (element instanceof HTMLIFrameElement && element.src.includes('.svg')) {
        results.push(createImage(element.src))
      }
    })

    return results
  }

  /**
   * Find all the inline svg elements that are not sprite instances or sprite sources
   */
  const gatherInlineSvgElements = () => {
    const results: string[] = []
    const elements = document.querySelectorAll('svg:not(:has(use))') as NodeListOf<SVGSVGElement>

    /**
     * An earnest effort to set a viewBox so we can handle resizing and displaying the SVGs.
     * Returns a clone of the SVG.
     */
    const tryToSetViewBox = (svg: SVGElement) => {
      const cloneSvg = svg.cloneNode(true) as SVGSVGElement
      const viewBox = cloneSvg.getAttribute('viewBox')

      if (viewBox) {
        return cloneSvg.outerHTML // Success, early return
      }

      const height = cloneSvg.getAttribute('height')?.replace('px', '')
      const width = cloneSvg.getAttribute('width')?.replace('px', '')

      if (height && width) {
        cloneSvg.setAttribute('viewBox', `0 0 ${width} ${height}`)
        return cloneSvg.outerHTML // Meh, but we'll take it
      }

      const boundingBox = cloneSvg.getBBox()
      cloneSvg.setAttribute(
        'viewBox',
        `${boundingBox.x} ${boundingBox.y} ${boundingBox.width} ${boundingBox.height}`,
      )
      return cloneSvg.outerHTML
    }

    elements.forEach((element) => {
      results.push(tryToSetViewBox(element))
    })

    return results
  }

  const gatherGElements = () => {
    const results: string[] = []
    const elements = document.querySelectorAll('g')

    elements.forEach((element) => {
      const svg = element.closest('svg')
      const gClone = element.cloneNode(true) as SVGGElement

      /**
       * Setting a viewBox here is meaningless to the element, but
       * we parse and remove it later in the class constructor.
       */
      const viewBox = svg?.getAttribute('viewBox')
      if (viewBox) {
        gClone.setAttribute('viewBox', viewBox)
        return results.push(gClone.outerHTML)
      }

      const width = svg?.getAttribute('width')?.replace('px', '')
      const height = svg?.getAttribute('height')?.replace('px', '')
      if (width && height) {
        gClone.setAttribute('viewBox', `0 0 ${width} ${height}`)
        return results.push(gClone.outerHTML)
      }

      const boundingBox = element.getBBox()
      gClone.setAttribute(
        'viewBox',
        `${boundingBox.x} ${boundingBox.y} ${boundingBox.width} ${boundingBox.height}`,
      )

      results.push(gClone.outerHTML)
    })

    return results
  }

  const gatherSymbolElements = () => {
    const results: string[] = []
    const elements = document.querySelectorAll('symbol')

    elements.forEach((element) => {
      if (element.getAttribute('viewBox')) {
        return results.push(element.outerHTML)
      }

      const svgViewBox = element.closest('svg')?.getAttribute('viewBox')
      if (svgViewBox) {
        const cloneElement = element.cloneNode(true) as SVGElement
        cloneElement.setAttribute('viewBox', svgViewBox)
        return results.push(cloneElement.outerHTML)
      }

      const height = element.getAttribute('height')
      const width = element.getAttribute('width')
      if (height && width) {
        const cloneElement = element.cloneNode(true) as SVGElement
        cloneElement.setAttribute('viewBox', `0 0 ${width} ${height}`)
        return results.push(cloneElement.outerHTML)
      }
    })

    return results
  }

  const gatherUseElements = () => {
    const results: string[] = []
    const elements = document.querySelectorAll('use')

    // Checking for use elements that call to a remote sprite source
    elements.forEach((element) => {
      const href = element.getAttribute('href')
      if (href?.includes('.svg')) {
        results.push(createImage(href))
      }

      const xLinkHref = element.getAttribute('xlink:href')
      if (xLinkHref?.includes('.svg')) {
        results.push(createImage(xLinkHref))
      }
    })

    return results
  }

  const data = [
    ...new Set([
      ...parseSrcAndBgImages(),
      ...gatherInlineSvgElements(),
      ...gatherGElements(),
      ...gatherSymbolElements(),
      ...gatherUseElements(),
    ]),
  ]

  return {
    data: data.map((svg) => ({ id: crypto.randomUUID(), svg })),
    host: document.location?.host ?? '',
    origin: document.location?.origin ?? '',
  }
}
