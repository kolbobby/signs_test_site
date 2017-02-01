import './scss/main.scss'

import { throttle } from './js/throttle'
import Slider from './js/slider'

(function() {
  const init = () => {
    throttle('before.slider.init', 'optimizedBeforeSliderInit')

    throttle('resize', 'optimizedResize')
  }

  init()

  /**
   * Event listeners go here
   */

  const slideshow = new Slider(document.body)
})()
