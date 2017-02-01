import { throttle } from './throttle'
import defaults from './utils/defaults'
import prefixDetection from './utils/prefixDetection'

const slice = Array.prototype.slice

export default class Slider {
  constructor(slider, opts) {
    if(window.jQuery && slider instanceof window.jQuery) slider = slider[0]

    this.slider = slider
    this.options = { ...defaults, ...opts }

    this.state = {
      prefixes: undefined,
      frame: undefined,
      container: undefined,
      prevNav: undefined,
      nextNav: undefined,
      slides: undefined,
      currSlide: 0,
      positionY: 0,
      touchOffsetY: 0,
      deltaY: 0
    }

    this.dispatchEvent = this.dispatchEvent.bind(this)
    this.setup = this.setup.bind(this)
    this.confirmSlides = this.confirmSlides.bind(this)
    this.confirmNav = this.confirmNav.bind(this)
    this.transition = this.transition.bind(this)
    this.checkNextTransition = this.checkNextTransition.bind(this)
    this.navigatePrev = this.navigatePrev.bind(this)
    this.navigateNext = this.navigateNext.bind(this)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)

    this.setup()
  }

  dispatchEvent(phase, eve, detail) {
    let event = new CustomEvent(`${phase}.slider.${eve}`, {
      bubbles: true,
      cancelable: true,
      detail: detail
    })

    this.slider.dispatchEvent(event)
  }

  confirmSlides() {
    const w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0]
    const windowHeight = (w.innerHeight || e.clientHeight || g.clientHeight)
    let slides

    // set consistent size for each slide, enlongate slides greater than page length to necessary amount of slides

    let slideHeight, heightDifference
    let cont = true
    while(cont) {
      slides = this.state.slides
      for(let i = 0;i < slides.length;i++) {
        slideHeight = Math.max(slides[i].clientHeight, slides[i].offsetHeight)
        heightDifference = Math.ceil(slideHeight / windowHeight)

        this.state.slides[i].style['height'] = (windowHeight * heightDifference) + 'px'

        if(heightDifference !== 1 && (slideHeight % windowHeight !== 0)) {
          for(let x = 1;x < heightDifference;x++) {
            this.state.slides.splice(i + x, 0, slides[i].cloneNode(true))
          }

          break
        }

        if(i === slides.length - 1) cont = false
      }
    }
  }

  confirmNav(direction) {
    const w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0]
    let { prevNav, nextNav } = this.state

    if(typeof direction !== 'undefined') {
      let { slides } = this.state

      if(direction === 'next') {
        if(this.transition((this.state.currSlide + 1) * -(w.innerHeight || e.clientHeight || g.clientHeight), '0.3s', null)) {
          this.state.currSlide++
        }

        if(this.state.currSlide !== 0) {
          prevNav.classList.remove('hide')
          prevNav.classList.add('show')
        }
        if(this.state.currSlide === slides.length - 1) {
          nextNav.classList.remove('show')
          nextNav.classList.add('hide')
        }

        this.dispatchEvent('on', 'nextSlide')
      } else if (direction === 'prev') {
        if(this.transition((this.state.currSlide - 1) * -(w.innerHeight || e.clientHeight || g.clientHeight), '0.3s', null)) {
          this.state.currSlide--
        }

        if(this.state.currSlide === 0) {
          prevNav.classList.remove('show')
          prevNav.classList.add('hide')
        }
        if(this.state.currSlide !== slides.length - 1) {
          nextNav.classList.remove('hide')
          nextNav.classList.add('show')
        }

        this.dispatchEvent('on', 'prevSlide')
      }

      this.state.positionY = this.state.currSlide * -(w.innerHeight || e.clientHeight || g.clientHeight) || 0
    }
  }

  setup() {
    this.dispatchEvent('before', 'init')

    const {
      frameClass, containerClass,
      prevNavClass, nextNavClass
    } = this.options

    this.state.prefixes = prefixDetection()
    this.state.frame = this.slider.getElementsByClassName(frameClass)[0]
    this.state.container = this.state.frame.getElementsByClassName(containerClass)[0]
    this.state.prevNav = this.slider.getElementsByClassName(prevNavClass)[0]
    this.state.nextNav = this.slider.getElementsByClassName(nextNavClass)[0]
    this.state.slides = slice.call(this.state.container.children)

    this.state.positionY = this.state.container.offsetTop

    this.confirmSlides()
    this.confirmNav(undefined)

    const {
      frame,
      prevNav, nextNav
    } = this.state

    throttle('click', 'optimizedClick', prevNav)
    throttle('click', 'optimizedClick', nextNav)

    throttle('touchstart', 'optimizedTouchStart', frame)
    throttle('touchmove', 'optimizedTouchMove', frame)
    throttle('touchend', 'optimizedTouchEnd', frame)

    prevNav.addEventListener('optimizedClick', this.navigatePrev)
    nextNav.addEventListener('optimizedClick', this.navigateNext)

    frame.addEventListener('optimizedTouchStart', this.onTouchStart)

    this.dispatchEvent('after', 'init')
  }

  transition(to, duration, ease) {
    const style = this.state.container && this.state.container.style

    let nextTransition = this.checkNextTransition(to)

    if(nextTransition) {
      if(style) {
        style[this.state.prefixes.transition + 'TimingFunction'] = ease
        style[this.state.prefixes.transition + 'Duration'] = duration

        if(this.state.prefixes.hasTranslate3d) {
          style[this.state.prefixes.transform] = 'translate3d(0, ' + to + 'px, 0)'
        } else {
          style[this.state.prefixes.transform] = 'translate(0, ' + to + 'px)'
        }

        return true
      }
    }

    return false
  }

  checkNextTransition(to) {
    const containerHeight = Math.max(this.state.container.clientHeight, this.state.container.offsetHeight)
    if(to <= 0 && to >= -(containerHeight - (containerHeight / this.state.slides.length))) return true

    return false
  }

  navigatePrev(event) {
    this.confirmNav('prev')
  }

  navigateNext(event) {
    this.confirmNav('next')
  }

  onTouchStart(event) {
    event.preventDefault()
    const touches = event.detail.touches ? event.detail.touches[0] : event
    const { pageY } = touches

    this.state.touchOffsetY = pageY

    this.state.frame.addEventListener('optimizedTouchMove', this.onTouchMove)
    this.state.frame.addEventListener('optimizedTouchEnd', this.onTouchEnd)

    this.dispatchEvent('on', 'touchstart', { event })
  }

  onTouchMove(event) {
    event.preventDefault()
    const touches = event.detail.touches ? event.detail.touches[0] : event
    const { pageY } = touches

    this.state.deltaY = pageY - this.state.touchOffsetY

    this.transition(this.state.positionY + this.state.deltaY, '0s', null)

    this.dispatchEvent('on', 'touchmove', { event })
  }

  onTouchEnd(event) {
    event.preventDefault()
    const w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0]

    if(this.state.deltaY < 0) { // scrolling down
      if(this.state.deltaY < (-(w.innerHeight || e.clientHeight || g.clientHeight) / 4)) {
        // slide
        this.confirmNav('next')
      } else {
        // transition back
        this.transition((this.state.currSlide * -(w.innerHeight || e.clientHeight || g.clientHeight)), '0.3s', null)
      }
    } else { // scrolling up
      if(this.state.deltaY > ((w.innerHeight || e.clientHeight || g.clientHeight) / 4)) {
        // slide
        this.confirmNav('prev')
      } else {
        // transition back
        this.transition(this.state.currSlide * -(w.innerHeight || e.clientHeight || g.clientHeight), '0.3s', null)
      }
    }

    this.state.touchOffsetY = 0
    this.state.deltaY = 0

    this.state.frame.removeEventListener('optimizedTouchMove', this.onTouchMove)
    this.state.frame.removeEventListener('optimizedTouchEnd', this.onTouchEnd)

    this.dispatchEvent('on', 'touchend', { event })
  }
}
