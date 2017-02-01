export default function prefixDetection() {
  let transform = undefined
  let transition = undefined
  let transitionEnd = undefined
  let hasTranslate3d = undefined;

  (() => {
    let el = document.createElement('_')
    let style = el.style

    let prop = undefined

    if(style[prop = 'webkitTransition'] === '') {
      transitionEnd = 'webkitTransition'
      transition = prop
    }

    if(style[prop = 'transition'] === '') {
      transitionEnd = 'transitionend'
      transition = prop
    }

    if(style[prop = 'webkitTransform'] === '' || style[prop = 'msTransform'] === '') {
      transform = prop
    }

    if(style[prop = 'transform'] === '') {
      transform = prop
    }

    document.body.insertBefore(el, null)
    style[transform] = 'translate3d(0, 0, 0)'
    hasTranslate3d = !!global.getComputedStyle(el).getPropertyValue(transform)
    document.body.removeChild(el)
  })()

  return {
    transform,
    transition,
    transitionEnd,
    hasTranslate3d
  }
}
