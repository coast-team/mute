import { browser, protractor, ProtractorBrowser } from 'protractor'
import { focusEditor, getEditorValue, waitUntilEditorNotEmpty } from './doc.po'

describe('basic checks (1 document, 1 browser)', () => {

  it('angular should stabilize on docs page', async () => {
    await browser.get('/')
    await browser.waitForAngular()
  })

  // TODO: Fix this test
  it('angular should stabilize on doc page', async () => {
    await browser.get('/test-e2e-stabilize')
    await browser.waitForAngular()
  })

  it('should have a title', async () => {
    await browser.get('/')
    const actualTitle = await browser.getTitle()
    expect(actualTitle).toEqual('Mute')
  })

  it('should store updates of the document', async () => {
    const expectedText = 'Hello world !'
    await browser.get('/test-e2e-recover')
    await browser.waitForAngular()
    await focusEditor(browser)
    await browser.actions().sendKeys(expectedText).perform()
    await browser.sleep(1000) // Leave some time to the app to store updates
    await browser.waitForAngular()
    await browser.refresh()
    await browser.waitForAngular()
    const actualText = await getEditorValue(browser)
    expect(actualText).toEqual(expectedText)
  })

})

describe('browser consistency (1 document, 2 browsers)', () => {
  let peerBrowser: ProtractorBrowser

  beforeEach(async () => {
    peerBrowser =  await browser.forkNewDriverInstance(true).ready
  })

  afterEach(async () => {
    await peerBrowser.quit()
  })

  it('should connect to peers', async () => {
    await browser.get('/test-e2e-connect')
    await browser.waitForAngular()
    const browserState = await browser.executeScript('return wg.state')
    expect(browserState).toEqual(1) // Connected

    await peerBrowser.get('/test-e2e-connect')
    await peerBrowser.waitForAngular()
    const peerBrowserState = await peerBrowser.executeScript('return wg.state')
    expect(peerBrowserState).toEqual(1) // Connected
  })

  it('should broadcast updates to peers', async () => {
    const expectedText1 = 'Hellow'
    const expectedText2 = 'Hello world !'
    await browser.get('/test-e2e-broadcast')
    await peerBrowser.get('/test-e2e-broadcast')
    await browser.waitForAngular()
    await peerBrowser.waitForAngular()

    await focusEditor(browser)
    await focusEditor(peerBrowser)

    await browser.actions().sendKeys(expectedText1).perform()
    await browser.sleep(1000) // Leave some time to the app to store updates
    await browser.waitForAngular()
    expect(await getEditorValue(browser)).toEqual(expectedText1, 'browser should have its own text :o')
    expect(await getEditorValue(peerBrowser)).toEqual(expectedText1, 'peerBrowser should have its text, possible sync error')

    const sequence = `${protractor.Key.BACK_SPACE} world !`
    await peerBrowser.actions().sendKeys(sequence).perform()
    await browser.waitForAngular()
    const actualText2 = await getEditorValue(browser)
    expect(actualText2).toEqual(expectedText2)
  })

  it('should retrieve updates from peers when connecting', async () => {
    const expectedText = 'Hello world !'

    await browser.get('/test-e2e-retrieve-doc-on-connection')
    await browser.waitForAngular()
    await focusEditor(browser)
    await browser.actions().sendKeys(expectedText).perform()

    await peerBrowser.get('/test-e2e-retrieve-doc-on-connection')
    await waitUntilEditorNotEmpty(peerBrowser) // Handle the updates
    await peerBrowser.waitForAngular()
    const actualText = await getEditorValue(peerBrowser)
    expect(actualText).toEqual(expectedText)
  })

  it('should send updates to peers when connecting', async () => {
    const expectedText = 'Hello world !'

    // Edit a document
    await browser.get('/test-e2e-share-updates-on-connection')
    await browser.waitForAngular()
    await focusEditor(browser)
    await browser.actions().sendKeys(expectedText).perform()
    await browser.sleep(1000) // Leave some time to the app to store updates
    await browser.waitForAngular()

    // Leave the collaboration before other peer joins
    await browser.get('/')
    await peerBrowser.get('/test-e2e-share-updates-on-connection')
    await peerBrowser.waitForAngular()
    const actualText1 = await getEditorValue(peerBrowser)
    expect(actualText1).toEqual('')

    // Re-join the collaboration and share previous updates
    await browser.get('/test-e2e-share-updates-on-connection')
    await browser.waitForAngular()
    await waitUntilEditorNotEmpty(peerBrowser) // Handle the updates
    await peerBrowser.sleep(1000) // Leave some time to the app to store updates
    const actualText2 = await getEditorValue(peerBrowser)
    expect(actualText2).toEqual(expectedText)
  })
})
