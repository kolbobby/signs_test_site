export function throttle(type, name, obj) {
  obj = obj || window
  let running = false

  let func = (e) => {
    if(running) return
    running = true

    requestAnimationFrame(() => {
      obj.dispatchEvent(new CustomEvent(name, { detail: e }))
      running = false
    })
  }

  obj.addEventListener(type, func)
}
