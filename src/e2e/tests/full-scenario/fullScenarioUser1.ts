import { Tools } from '../../tools'
import { Selector } from 'testcafe'
import * as gv from '../../globalVariables'

const tool = new Tools()

fixture`fullScenarioUser1`

test('Main user for the full scenario', async (t) => {
  // 1. A browser tab is launched, with the URL of Mute
  await t.navigateTo(gv.muteDoc)

  //  Components that will be tested
  const editorComponent = Selector('.CodeMirror')
  const usersComponent = Selector('.collaborators-chips-block')

  //  2. A document is opened.
  //      - a. The editor is accessible
  await t.typeText(editorComponent, 'access')
  let editorText = await tool.getTextWrittenInTheEditor(t)
  let commandToDeleteText = tool.deleteTextFromEditor('access', 'backspace')
  await t.expect(editorText).eql('access', '2.a. The editor is accessible').pressKey(commandToDeleteText) // Removing 'access' from the editor

  //      - b. The signaling server is accessible after a few seconds
  let signalingServerIsUp = await tool.setupSignalingServerTest(gv.urlSignaling)
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
  let numberOfVisibleUsers = await usersComponent.child(0).childElementCount
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

  //  5. The signaling server is killed off

  //      - b. There should still be two user on the document
  numberOfVisibleUsers = await usersComponent.child(0).childElementCount
  await t.expect(numberOfVisibleUsers).eql(2, '5.b. There should still be two users on the document (User1)')

  //      - c.2 Text added by User 2 is seen in User 1 tab. (User 2 has added the text 'access while offline by user 2' to the document)
  editorText = await tool.getTextWrittenInTheEditor(t)
  let expectedText = gv.textAddedWhileOfflineUser2 + gv.onlineExpectedText
  commandToDeleteText = tool.deleteTextFromEditor(gv.textAddedWhileOfflineUser2, 'backspace')
  await t
    .expect(editorText)
    .eql(expectedText, '5.c.2 Text added by User 2 is seen in User 1 tab.')
    .pressKey(commandToDeleteText) // - User 1 remove what User 2 added to the editor
    .typeText(editorComponent, gv.textAddedWhileOfflineUser1) // - User 1 adds some text to the editor

  await t.wait(1000) //Wait for the editor to save the text

  editorText = await tool.getTextWrittenInTheEditor(t)
  expectedText = gv.textAddedWhileOfflineUser1 + gv.onlineExpectedText
  await t.expect(editorText).eql(expectedText, 'Some text should have been added to the editor - while offline by user 1') // - Verify that text was added in the editor

  //  ----------------Switch to User 2-------------------
  await gv.stopExecAndResumeOther()
  while (gv.getExecutingTestUser1() !== true) {
    await t.wait(1000)
  }

  //  6. Testing the offline mode

  await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)

  numberOfVisibleUsers = await usersComponent.child(0).childElementCount
  await t
    .expect(numberOfVisibleUsers)
    .eql(1, '6.b.1. User 1 is alone as they left the document and re-joined it while the signaling server was off')

  await t.click(editorComponent).pressKey('home up end').typeText(editorComponent, 'This text should show on both tabs')

  await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)

  editorText = await tool.getTextWrittenInTheEditor(t)
  expectedText = gv.expectedTextSignalingOffUser1
  await t.expect(editorText).eql(expectedText, '6.b.2. The modification bound to the user 1 tab should still be visible in the document')

  //  7. The signaling server is rebooted
  await tool.startSignalingServer()

  //  ----------------Switch to User 2-------------------
  await gv.stopExecAndResumeOther()
  while (gv.getExecutingTestUser1() !== true) {
    await t.wait(1000)
  }

  //      - a. The signaling server is accessible after a few seconds
  signalingServerIsUp = await tool.setupSignalingServerTest(gv.urlSignaling)
  await t.expect(signalingServerIsUp).ok('7.a. The signaling server is accessible after a few seconds')

  await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)
  await tool.waitForPeersConnecting()

  await t.wait(10000) //Additional waiting time for merging text

  //      - b. Text is merged and appears the same in the two browser tabs
  editorText = await tool.getTextWrittenInTheEditor(t)
  await t.expect(editorText).eql(gv.expectedTextSignalingMerge, '7.b. Text is merged and appears the same in the two browser tabs (User 1)')

  //  ----------------Switch to User 2-------------------
  await gv.stopExecAndResumeOther()
})
