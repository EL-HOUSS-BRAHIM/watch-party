import '@jest/globals'

declare global {
  const jest: typeof import('@jest/globals').jest
  
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string | RegExp): R
      toBeDisabled(): R
      toHaveClass(className: string): R
      toHaveAttribute(attr: string, value?: string): R
      toBeVisible(): R
      toBeChecked(): R
      toHaveValue(value: string | number): R
      toHaveFocus(): R
    }
  }
}

export {}
