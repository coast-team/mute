import { WebSocket } from 'ws';
import { exec } from 'child_process'
import createTestCafe from "testcafe";


//This class lists tool function that can be used across the TestCafe project
export class Tools{


    constructor(){
    }

    /**
     * Function that returns the text written in the mute editor using the `muteTest.getText()` from mute
     * @param t The test Controller from testCafe
     * @returns the text in the mute editor
     */
    public async getTextWrittenInTheEditor(t : TestController){
        //@ts-ignore
        return await t.eval(() => window.muteTest.getText());
    }

    /**
     * Function that returns the correct command to give to testcafe to delete text written in the editor
     * @param strToRemove the string value to remove from the editor
     * @param typeOfRemoval `delete` or `backspace`
     * @returns the full command to delete the `strToRemove` parameter 
     */
    public deleteTextFromEditor(strToRemove : string, typeOfRemoval : string) : string{
        let commandToRemoveString = ''
        for (const char of strToRemove){
            if (typeOfRemoval === "backspace") {
                commandToRemoveString += 'backspace '
            }
            if (typeOfRemoval === "delete") {
                commandToRemoveString += 'delete '
            }
        }
        return commandToRemoveString
    }

    //----------------Network testing----------------
    /**
     * Test if the signaling Server is up
     * @param url the url of the signaling server
     * @returns `true` if the signaling server is atteignable, `false` if not
     */
    public async setupSignalingServerTest(url : string) : Promise<boolean>{
        const ws = new WebSocket(url)
        let isSignalingServerAccessible = true
        
        //If the signaling server isn't up, then this following code should be executed
        ws.onerror = (errorEvent) => isSignalingServerAccessible = false

        //Waiting for an error (one will happen if the signaling server is not running online)
        await new Promise(resolve => setTimeout(resolve, 2500));

        return isSignalingServerAccessible
    }

    public async startSignalingServer(){
        this.handleSignalingServer("start")
        await this.waitAfterActionOnSignaling(7500)
    }

    public async stopSignalingServer(){
        this.handleSignalingServer("stop")
        await this.waitAfterActionOnSignaling(3500)
    }

    public async waitAfterActionOnSignaling(timeToWait : number){
        await new Promise(resolve => setTimeout(resolve, timeToWait)); 
    }

    /**
     * Function that runs docker commands to start or stop the signaling server container
     * @param option `start`or `stop
     */
    public handleSignalingServer(option : string){
        let commandFullLine = ''
        const runningInAContainerEnv = process.argv[5]
        if (runningInAContainerEnv === 'true') { // If we are in a container environment
            commandFullLine = 'docker ' + option + ' sigver'
        } else { //If we are in a local environment (with docker compose running)
            commandFullLine = 'cd ../../ && docker compose ' + option + ' sigver' 
        }
        exec(commandFullLine, (err, stdout, stdrr) => {
            /* Uncomment if there is an error during execution of a test
            console.log("Error : ", err)
            console.log("stdout : ", stdout)
            console.log("stdrr : ", stdrr)
            */
        })
    }

    //----------------Documents testing----------------
    /**
     * Leave and join the document to test full logout of the peer to peer network
     * @param t TestCafe Test Controller
     * @param muteHomeMenuURL The mute home menu
     * @param documentURL The url to access the mute document
     */
    public async leaveAndRejoin(t : TestController, muteHomeMenuURL : string, documentURL : string){
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before quitting the doc to make sure text is saved in the editor
        await t.navigateTo(muteHomeMenuURL)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for desynchronization to happen completely
        await t.navigateTo(documentURL)
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait after joining the doc for the text to appear
    }


    //----------------Launching a TestCafe runner----------------
    /**
     * Launch a Test Cafe runner with a test file path and a specific browser to run the test
     * @param pathToFile the path to the file to run *(defined in `globalVariables` file)*
     * @param browser the browser to use for the Test Cafe runner
     */
    public async launchRunner(pathToFile : string, browser : string) {
        const testcafe = await createTestCafe("localhost");
        const runner = testcafe.createRunner();
        const failed = await runner
            .src(pathToFile)
            .browsers(browser)
            .reporter('xunit', 'e2e.xml')
            .run({stopOnFirstFail : true})
        console.log('Tests failed: ' + failed);
        if (failed > 0){
            process.exit(1)
        }
    }
}