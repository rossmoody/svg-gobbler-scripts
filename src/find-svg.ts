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

  const gatherInlineSvgElements = () => {
    return [...document.querySelectorAll('svg:not(:has(use))')].map((element) => element.outerHTML)
  }

  const gatherGElements = () => {
    return [...document.querySelectorAll('g')].map((element) => element.outerHTML)
  }

  const gatherSymbolElements = () => {
    return [...document.querySelectorAll('symbol')].map((element) => element.outerHTML)
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
