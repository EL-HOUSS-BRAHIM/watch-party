import "@testing-library/jest-dom"

Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  value: jest.fn(),
  writable: true,
})
