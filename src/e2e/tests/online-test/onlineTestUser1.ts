import { Tools } from '../../tools'
import { Selector } from 'testcafe'
import * as gv from '../../globalVariables'

const tool = new Tools()

fixture`onlineTestUser1`

test('Main user for the online test', async (t) => {
  // 1. A browser tab is launched, with the URL of Mute
  await t.navigateTo(gv.muteDoc)

  //  Components that will be tested
  const editorComponent = Selector('.CodeMirror')
  const usersComponent = Selector('.chips-block')

  //  2. A document is opened.
  //      - a. The editor is accessible
  await t.typeText(editorComponent, 'access')
  const commandToDeleteText = tool.deleteTextFromEditor('access', 'backspace')
  let editorText = await tool.getTextWrittenInTheEditor(t)
  await t.expect(editorText).eql('access', '2.a. The editor is accessible').pressKey(commandToDeleteText) // Removing 'access' from the editor

  //      - b. The signaling server is accessible after a few seconds
  const signalingServerIsUp = await tool.setupSignalingServerTest(gv.urlSignaling)
  await t.expect(signalingServerIsUp).ok('2.b. The signaling server is accessible after a few seconds')

  //  3. Text is written on the document
  await t
    .typeText(editorComponent, 'Hello, i am the first user')
    .pressKey('enter')
    .pressKey('enter')
    .typeText(editorComponent, 'This is a simple line of text')
    .pressKey('space')
    .pressKey('space')
    .typeText(editorComponent, gv.textAddedAfterWhitespace)

  //      - a. The text written in the document is displayed as intended
  editorText = await tool.getTextWrittenInTheEditor(t)
  await t.expect(editorText).eql(gv.onlineExpectedText, '3.a. The text written in the document is displayed as intended')
  //  4. Another browser tab is launched, with the url of the previous document.
  //  ----------------Switch to User 2-------------------
  await gv.stopExecAndResumeOther() //  Wait for the other user to join the document
  while (gv.getExecutingTestUser1() !== true) {
    await t.wait(1000)
  }

  const collaboratorCursorExists = Selector('.CodeMirror-widget').exists
  await t.expect(collaboratorCursorExists).ok()
  await t.click(editorComponent) // Click the editor to trigger the appearance of the cursor in the user 2 tab

  await gv.stopExecAndResumeOther() //  Wait for the other user to join the document
  while (gv.getExecutingTestUser1() !== true) {
    await t.wait(1000)
  }

  //      - f. There should be two user on the document
  const numberOfVisibleUsers = await usersComponent.child(0).childElementCount
  await t.expect(numberOfVisibleUsers).eql(2, '4.f. There should be two users on the document')

  //      - g. The second user has added some text to the document
  editorText = await tool.getTextWrittenInTheEditor(t)
  await t
    .expect(editorText)
    .eql(gv.onlineExpectedTextAccessTest, 'g. The second user has added some text to the document')
    .pressKey('home up up delete delete delete delete delete delete') // Go back to the start of the editor and remove what User 2 added

  //  ----------------Switch to User 2-------------------
  await gv.stopExecAndResumeOther()
  while (gv.getExecutingTestUser1() !== true) {
    await t.wait(1000)
  }
})
