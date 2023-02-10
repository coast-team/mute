/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Tools } from '../../tools';
import { Selector } from 'testcafe';
import * as gv from '../../globalVariables'

const tool = new Tools()

fixture`offlineTestUser2`

test('Additional user for the offline scenario', async t => {
//  Initial loading of Mute
    await t.navigateTo(gv.muteDoc)

//  Wait for the main user to "wake us up" code
    while (gv.getExecutingTestUser2() !== true){
        await t.wait(1000)
    }

//  Components that will be tested
    const editorComponent = Selector('div').child('.CodeMirror')
    const usersComponent = Selector('div').child('.chips-block')

//  The signaling server has been killed off by the user 1

//      - a. The signaling server is unatteignable
    const signalingServerIsUp = await tool.setupSignalingServerTest(gv.urlSignaling)
    await t.expect(signalingServerIsUp).notOk('5.a. The signaling server is unatteignable')

//      - b. There should still be two user on the document
    const numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(2, '5.b. There should still be two users on the document (User2)')    

//  - Each user can add text to the doc and modification is visible from the other tab
//      - User 2 adds some text to the editor. 
    await t.click(editorComponent)
            .pressKey("home up up")
    await t.typeText(editorComponent, gv.textAddedWhileOfflineUser2)
    
    await t.wait(2000) //Wait for the text to be saved in the editor

    let editorText = await tool.getTextWrittenInTheEditor(t)
    let expectedText = gv.textAddedWhileOfflineUser2 + gv.onlineExpectedText
    await t.expect(editorText).eql(expectedText, 'Some text should have been added to the editor - while offline by user 2')  // Verify that text was added in the editor  

//  ----------------Switch to User 1-------------------
    await gv.stopExecAndResumeOther()
    while (gv.getExecutingTestUser2() !== true){
        await t.wait(1000)
    }

//      - c.3 Text added by User 1 is seen in User 2 tab
    editorText = await tool.getTextWrittenInTheEditor(t)
    expectedText = gv.textAddedWhileOfflineUser1+ gv.onlineExpectedText
    const commandToDeleteText = tool.deleteTextFromEditor(gv.textAddedWhileOfflineUser1, "backspace")
    await t.expect(editorText).eql(expectedText, '5.c.3 Text added by User 1 is seen in User 2 tab')
            .pressKey(commandToDeleteText) // User 2 remove what User 1 added to the editor

})