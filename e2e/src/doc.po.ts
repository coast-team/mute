import { promise, ProtractorBrowser } from 'protractor'

const declareEditor = 'const editor = document.querySelector(".CodeMirror").CodeMirror'

function focusEditor (browser: ProtractorBrowser): promise.Promise<{}> {
  return browser.executeScript(`${declareEditor}; editor.focus()`)
}

function getEditorValue (browser: ProtractorBrowser): promise.Promise<{}> {
  return browser.executeScript(`${declareEditor}; return editor.getValue()`)
}

export { focusEditor, getEditorValue }
