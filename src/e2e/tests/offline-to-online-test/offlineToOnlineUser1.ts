import { Tools } from '../../tools'
import { Selector } from 'testcafe'
import * as gv from '../../globalVariables'

const tool = new Tools()

fixture`offlineToOnlineUser1`

test('Main user for the offline To Online scenario', async (t) => {
  // 1. A browser tab is launched, with the URL of Mute
  await t.navigateTo(gv.muteDoc)

  //  Components that will be tested
  const editorComponent = Selector('.CodeMirror')
  const usersComponent = Selector('.collaborators-chips-block')

  //  3. Text is written on the document
  await t
    .typeText(editorComponent, 'Hello, i am the first user')
    .pressKey('enter')
    .pressKey('enter')
    .typeText(editorComponent, 'This is a simple line of text')
    .pressKey('space')
    .pressKey('space')
    .typeText(editorComponent, gv.textAddedAfterWhitespace)

  await t.wait(2000)

  await tool.stopSignalingServer()

  //  ----------------Switch to User 2-------------------
  await gv.stopExecAndResumeOther()
  while (gv.getExecutingTestUser1() !== true) {
    await t.wait(1000)
  }

  //  6. Testing the offline mode

  await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)

  const numberOfVisibleUsers = await usersComponent.child(0).childElementCount
  await t
    .expect(numberOfVisibleUsers)
    .eql(1, 'User 1 is alone as they left the document and re-joined it while the signaling server was off')

  await t.click(editorComponent).pressKey('home up end').typeText(editorComponent, 'This text should show on both tabs')

  await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)

  let editorText = await tool.getTextWrittenInTheEditor(t)
  await t
    .expect(editorText)
    .eql(gv.expectedTextSignalingOffUser1, '6.b.2 The modification bound to the user 1 tab should still be visible in the document')

  //  7. The signaling server is rebooted
  await tool.startSignalingServer()

  await gv.stopExecAndResumeOther()
  while (gv.getExecutingTestUser2() !== true) {
    await t.wait(1000)
  }

  //      - a. The signaling server is accessible after a few seconds
  const signalingServerIsUp = await tool.setupSignalingServerTest(gv.urlSignaling)
  await t.expect(signalingServerIsUp).ok('7.a. The signaling server is accessible after a few seconds')

  await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)
  await tool.waitForPeersConnecting()

  await t.wait(15000) //Additional waiting time for merging text

  //      - b. Text is merged and appears the same in the two browser tabs
  editorText = await tool.getTextWrittenInTheEditor(t)
  await t.expect(editorText).eql(gv.expectedTextSignalingMerge, '7.b. Text is merged and appears the same in the two browser tabs (User 1)')

  //  ----------------Switch to User 2-------------------
  await gv.stopExecAndResumeOther()
})
