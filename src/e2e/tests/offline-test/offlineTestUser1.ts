/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Tools } from '../../tools';
import { Selector } from 'testcafe';
import * as gv from '../../globalVariables'

const tool = new Tools()

fixture`offlineTestUser1`

test('Main user for the offline scenario', async t => {

// 1. A browser tab is launched, with the URL of Mute
    await t.navigateTo(gv.muteDoc) 

//  Components that will be tested
    const editorComponent = Selector('div').child('.CodeMirror')
    const usersComponent = Selector('div').child('.chips-block')

//  Get the document at the same status as the final step of the offline scenario
    await t.typeText(editorComponent, 'Hello, i am the first user')
            .pressKey('enter')
            .pressKey('enter')
            .typeText(editorComponent, 'This is a simple line of text')
            .pressKey('space')
            .pressKey('space')
            .typeText(editorComponent, gv.textAddedAfterWhitespace)

    await t.wait(2000) //Wait for the editor to save the text

//  Stop the signaling server
    await tool.stopSignalingServer()

//  ----------------Switch to User 2-------------------
    await gv.stopExecAndResumeOther() //  Wait for the other user to join the document
    while (gv.getExecutingTestUser1() !== true){
        await t.wait(1000)
    }
//      - b. There should be two user on the document
    const numberOfVisibleUsers = await usersComponent.child(0).childElementCount
    await t.expect(numberOfVisibleUsers).eql(2, '5.b. There should be two users on the document')

//      - c.2 Text added by User 2 is seen in User 1 tab. (User 2 has added the text 'access while offline by user 2' to the document)
    let editorText = await tool.getTextWrittenInTheEditor(t)
    let expectedText = gv.textAddedWhileOfflineUser2 + gv.onlineExpectedText
    const commandToDeleteText = tool.deleteTextFromEditor(gv.textAddedWhileOfflineUser2, "delete")
    await t.expect(editorText).eql(expectedText, '5.c.2 Text added by User 2 is seen in User 1 tab.')
    await t.click(editorComponent)
            .pressKey('home up up ')
            .pressKey(commandToDeleteText) // - User 1 remove what User 2 added to the editor
            .typeText(editorComponent, gv.textAddedWhileOfflineUser1) // - User 1 adds some text to the editor

    await t.wait(2000) //Wait for the editor to save the text

    editorText = await tool.getTextWrittenInTheEditor(t)
    expectedText =gv.textAddedWhileOfflineUser1 + gv.onlineExpectedText
    await t.expect(editorText).eql(expectedText, 'Some text should have been added to the editor - while offline by user 1') // - Verify that text was added in the editor

//  ----------------Switch to User 2-------------------
    await gv.stopExecAndResumeOther()
    while (gv.getExecutingTestUser1() !== true){
        await t.wait(1000)
    }
})