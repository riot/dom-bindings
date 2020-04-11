exports.fireEvent = function(el, name) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(name, false, true)
  el.dispatchEvent(e)
}
