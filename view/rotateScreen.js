class RotateScreenView {

  constructor() {
    this.onWindowResizeProxy = this.onWindowResize.bind(this)
    this.element = this.initElement()
    this.init()
    this.addEventListeners()
  }

  addEventListeners() {
    window.addEventListener('resize', this.onWindowResizeProxy)
  }

  removeEventListeners() {
    window.removeEventListener('resize', this.onWindowResizeProxy)
  }

  onWindowResize (event) {
    this.init()
  }

  init() {
    const w = document.documentElement.clientWidth
    const h = document.documentElement.clientHeight

    if (w < h) {
      this.showOverlay(w, h)
    } else {
      this.hideOverlay()
    }
  }

  getSVG(s) {
    return `<svg viewBox="0 0 24 24"
     width="${s}" height="${s}" fill="none" stroke="currentColor"
     stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"
     role="img" aria-labelledby="rotateTitle rotateDesc">
  <title id="rotateTitle">Rotate the phone</title>
  <desc id="rotateDesc">A smartphone with curved arrows around it showing rotation.</desc>

  <!-- Phone -->
  <rect x="8" y="5" width="8" height="14" rx="1.8"/>

  <!-- Top-right arrow (clockwise) -->
  <path d="M14.5 3.5a7 7 0 0 1 6 6"/>
  <path d="M20.5 9.5L22 8l-1.5-1.5"/>

  <!-- Bottom-left arrow (counter-clockwise) -->
  <path d="M9.5 20.5a7 7 0 0 1-6-6"/>
  <path d="M3.5 14.5L2 16l1.5 1.5"/>
</svg>`
  }

  initElement() {
    const element = document.createElement('div')

    element.style.position = 'absolute'
    element.style.top = '0px'
    element.style.left = '0px'
    element.style.backgroundColor = 'black'
    element.style.opacity = '0.9'
    element.style.display = 'none'
    element.style.zIndex = '999'
    element.style.alignItems = 'center'
    element.style.justifyContent = 'center'
    document.body.appendChild(element)

    return element
  }

  showOverlay (w, h) {
    this.element.style.width = `${w}px`
    this.element.style.height = `${h}px`
    this.element.innerHTML = this.getSVG(w/1.4)
    this.element.style.display = 'flex'
  }

  hideOverlay() {
    this.element.style.display = 'none'
  }

  destroy() {
    this.removeEventListeners()
    this.element = null
    this.onWindowResizeProxy = null
    console.log("RotateScreenView destroy")
  }
}
