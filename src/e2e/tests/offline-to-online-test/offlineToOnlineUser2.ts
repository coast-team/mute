import { Tools } from '../../tools'
import { Selector } from 'testcafe'
import * as gv from '../../globalVariables'

const tool = new Tools()

fixture`offlineToOnlineUser2`

test('Additional user for the offline To Online scenario', async (t) => {
  //  Initial loading of Mute
  await t.navigateTo(gv.muteDoc)

  //  Wait for the main user to "wake us up" code
  while (gv.getExecutingTestUser2() !== true) {
    await t.wait(1000)
  }

  //  Components that will be tested
  const editorComponent = Selector('.CodeMirror')
  const usersComponent = Selector('.chips-block')

  await t.wait(3000) //  Wait for the selector to be updated and get what's written in the editor

  //  6. Testing the offline mode
  //      - a. Browser tab 2 leave the document and then re-join it.
  await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)

  //          - a.1 User 2 is alone as they left the document and re-joined it while the signaling server was off
  const numberOfVisibleUsers = await usersComponent.child(0).childElementCount
  await t
    .expect(numberOfVisibleUsers)
    .eql(1, '6.a.1 User 2 is alone as they left the document and re-joined it while the signaling server was off')
  const commandToDeleteText = tool.deleteTextFromEditor(gv.textAddedAfterWhitespace, 'backspace')

  await t
    .click(editorComponent)
    .pressKey('home up up end space') // When we click on the document, we are at the end of the text written in the editor
    .typeText(editorComponent, '(This text should also show on both tabs)')
    .pressKey('down down end')
    .pressKey(commandToDeleteText)
    .pressKey('backspace backspace')

  await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)
  await tool.waitForPeersConnecting()

  //          - a.2. The modification bound to the user 2 tab should still be visible in the document
  let editorText = await tool.getTextWrittenInTheEditor(t)
  await t
    .expect(editorText)
    .eql(gv.expectedTextSignalingOffUser2, '6.a.2. The modification bound to the user 2 tab should still be visible in the document')

  //  ----------------Switch to User 1-------------------
  await gv.stopExecAndResumeOther()
  while (gv.getExecutingTestUser2() !== true) {
    await t.wait(1000)
  }

  //  7. The signaling server is rebooted
  //      b. Text is merged and appears the same in the two browser tabs
  await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)
  await tool.waitForPeersConnecting()

  await gv.stopExecAndResumeOther()
  while (gv.getExecutingTestUser2() !== true) {
    await t.wait(1000)
  }

  editorText = await tool.getTextWrittenInTheEditor(t)
  await t.expect(editorText).eql(gv.expectedTextSignalingMerge, '7.b. Text is merged and appears the same in the two browser tabs (User 2)')
})
