import { Tools } from '../../tools'
import { Selector } from 'testcafe'
import * as gv from '../../globalVariables'

const tool = new Tools()

fixture`onlineTestUser2`

test('Additional user for the online test', async (t) => {
  //  Initial loading of Mute
  await t.navigateTo(gv.muteHomeMenu)

  //  Wait for the main user to "wake us up" code
  while (gv.getExecutingTestUser2() !== true) {
    await t.wait(1000)
  }

  //  4. Another browser tab is launched, with the URL of the previous document.
  //      - a. The document is opened
  await t.navigateTo(gv.muteDoc)

  await tool.waitForPeersConnecting()

  //  Components that will be tested
  const editorComponent = Selector('.CodeMirror')
  const usersComponent = Selector('.chips-block')

  await tool.waitForPeersConnecting()

  // Testing if the cursor is visible (the cursor should be visible on the user 1 screen)
  await t.click(editorComponent)

  await gv.stopExecAndResumeOther()
  //  Wait for the main user to "wake us up" code
  while (gv.getExecutingTestUser2() !== true) {
    await t.wait(1000)
  }

  // The other user has clicked the document, his cursor should be visible
  const collaboratorCursorExists = Selector('.CodeMirror-widget').exists
  await t.expect(collaboratorCursorExists).ok()

  //      - b. The signaling server is accessible after a second
  const signalingServerIsUp = await tool.setupSignalingServerTest(gv.urlSignaling)
  await t.expect(signalingServerIsUp).ok('4.b. The signaling server is accessible after a few seconds')

  //      - c. There should be two user on the document
  const numberOfVisibleUsers = await usersComponent.child(0).childElementCount
  await t.expect(numberOfVisibleUsers).eql(2, '4.c. There should be two users on the document')

  //      - d. Text in the editor should be the exact same as the text written in the previous step by User 1.
  let editorText = await tool.getTextWrittenInTheEditor(t)
  await t
    .expect(editorText)
    .eql(gv.onlineExpectedText, '4.d. Text in the editor should be the exact same as the text written in the previous step by User 1')

  //      - e. The editor is accessible by User 2.
  await t.click(editorComponent).pressKey('home up up').typeText(editorComponent, 'access')

  editorText = await tool.getTextWrittenInTheEditor(t)
  await t
    .expect(editorText)
    .eql(gv.onlineExpectedTextAccessTest, '4.e. The editor is accessible by User 2 (access should have been added to the editor)')

  //  ----------------Switch to User 1-------------------
  await gv.stopExecAndResumeOther()
  while (gv.getExecutingTestUser2() !== true) {
    await t.wait(1000)
  }

  //      - h. The text is back to normal (User 1 removed what was added by User 2)
  editorText = await tool.getTextWrittenInTheEditor(t)
  await t.expect(editorText).eql(gv.onlineExpectedText, '4.h. The text is back to normal (User 1 removed what was added by User 2)')
})
