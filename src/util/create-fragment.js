/**
 * Create a template node
 * @param   { String } html - template inner html
 * @returns { HTMLElement } the new template node just created
 */
export default function createFragment(html) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template
}