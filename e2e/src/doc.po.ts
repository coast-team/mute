import { ProtractorBrowser, by, element, promise, protractor } from 'protractor'

const EC = protractor.ExpectedConditions

const editorSelector = '.CodeMirror'
const editorElement = element(by.css(editorSelector))
const declareEditor = `const editor = document.querySelector("${editorSelector}").CodeMirror`

function focusEditor (browser: ProtractorBrowser): promise.Promise<{}> {
  browser.wait(EC.presenceOf(editorElement), 5000)
  return browser.executeScript(`${declareEditor}; editor.focus()`)
}

function getEditorValue (browser: ProtractorBrowser): promise.Promise<string> {
  browser.wait(EC.presenceOf(editorElement), 5000)
  return browser.executeScript<string>(`${declareEditor}; return editor.getValue()`)
}

function waitUntilEditorNotEmpty (browser: ProtractorBrowser): promise.Promise<{}> {
  const editorHasValue = async () => (await getEditorValue(browser)) !== ''
  return browser.wait(editorHasValue, 5000, 'editor is empty')
}

export {
  focusEditor,
  getEditorValue,
  waitUntilEditorNotEmpty
}
