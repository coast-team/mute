/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Tools } from '../../tools';
import { Selector } from 'testcafe';
import * as gv from '../../globalVariables'

const tool = new Tools()

fixture`fullScenarioUser2`

test('Additional user for the full scenario', async t => {
//  Initial loading of Mute
    await t.navigateTo(gv.muteHomeMenu)

//  Wait for the main user to "wake us up" code
    while (gv.getExecutingTestUser2() !== true){
        await t.wait(1000)
    }

//  4. Another browser tab is launched, with the URL of the previous document.
//      - a. The document is opened
    await t.navigateTo(gv.muteDoc)
    
//  Components that will be tested
    const editorComponent = Selector('div').child('.CodeMirror')
    const usersComponent = Selector('div').child('.chips-block')

    await t.wait(3000) //  Wait for the selector to be updated and get what's written in the editor

//      - b. The signaling server is accessible after a second
    let signalingServerIsUp = await tool.setupSignalingServerTest(gv.urlSignaling)
    await t.expect(signalingServerIsUp).ok('4.b. The signaling server is accessible after a few seconds')

//      - c. There should be two user on the document
    let numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(2, '4.c. There should be two users on the document')

//      - d. Text in the editor should be the exact same as the text written in the previous step by User 1.
    let editorText = await tool.getTextWrittenInTheEditor(t)
    await t.expect(editorText).eql(gv.onlineExpectedText, '4.d. Text in the editor should be the exact same as the text written in the previous step by User 1')

//      - e. The editor is accessible by User 2.
    await t.click(editorComponent)
            .pressKey('home up up')
            .typeText(editorComponent, 'access')

    editorText = await tool.getTextWrittenInTheEditor(t)
    await t.expect(editorText).eql(gv.onlineExpectedTextAccessTest, '4.e. The editor is accessible by User 2 (access should have been added to the editor)')

//  ----------------Switch to User 1-------------------
    await gv.stopExecAndResumeOther()
    while (gv.getExecutingTestUser2() !== true){
        await t.wait(1000)
    }

//      - h. The text is back to normal (User 1 removed what was added by User 2)
    editorText = await tool.getTextWrittenInTheEditor(t)
    await t.expect(editorText).eql(gv.onlineExpectedText, '4.h. The text is back to normal (User 1 removed what was added by User 2)')

//  5. The signaling server is killed off
    await tool.stopSignalingServer()

//      - a. The signaling server is unatteignable
    signalingServerIsUp = await tool.setupSignalingServerTest(gv.urlSignaling)
    await t.expect(signalingServerIsUp).notOk('5.a. The signaling server is unatteignable')

//      - b. There should still be two user on the document
    numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(2, '5.b. There should still be two users on the document (User2)')    

//  - c. Each user can add text to the doc and modification is visible from the other tab
//      - c.1 User 2 adds some text to the editor. 
    await t.typeText(editorComponent, gv.textAddedWhileOfflineUser2)
    await t.wait(1000) //Wait for the text to be saved in the editor

    editorText = await tool.getTextWrittenInTheEditor(t)
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
    let commandToDeleteText = tool.deleteTextFromEditor(gv.textAddedWhileOfflineUser1, "backspace")
    await t.expect(editorText).eql(expectedText, '5.c.3 Text added by User 1 is seen in User 2 tab')
            .pressKey(commandToDeleteText) // User 2 remove what User 1 added to the editor

//  6. Testing the offline mode
//      - a. Browser tab 2 leave the document and then re-join it. 
    await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)

//          - a.1 User 2 is alone as he left the document and re-joined it while the signaling server was off
    numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(1, ' 6.a.1 User 2 is alone as he left the document and re-joined it while the signaling server was off') 

    
    commandToDeleteText = tool.deleteTextFromEditor(gv.textAddedAfterWhitespace, "backspace")
    await t.click(editorComponent)
            .pressKey('home up up end space') // When we click on the document, we are at the end of the text written in the editor
            .typeText(editorComponent, '(This text should also show on both tabs)')
            .pressKey('down down end')
            .pressKey(commandToDeleteText)
            .pressKey('backspace backspace')
    
    await tool.leaveAndRejoin(t, gv.muteHomeMenu, gv.muteDoc)

//          - a.2. The modification bound to the user 2 tab should still be visible in the document
    editorText = await tool.getTextWrittenInTheEditor(t)
    await t.expect(editorText).eql(gv.expectedTextSignalingOffUser2, '6.a.2. The modification bound to the user 2 tab should still be visible in the document')

//  ----------------Switch to User 1-------------------            
    await gv.stopExecAndResumeOther()
    while (gv.getExecutingTestUser2() !== true){
        await t.wait(1000)
    }

//  7. The signaling server is rebooted
//      b. Text is merged and appears the same in the two browser tabs
    editorText = await tool.getTextWrittenInTheEditor(t)
    await t.expect(editorText).eql(gv.expectedTextSignalingMerge, '7.b. Text is merged and appears the same in the two browser tabs (User 2)')
})