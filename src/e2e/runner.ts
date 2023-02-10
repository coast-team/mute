import createTestCafe from "testcafe";
import { Tools } from './tools.js';
import * as gv from './globalVariables.js';

const testCafe = await createTestCafe("localhost");

export class Runner{

    public tool : Tools

    public constructor(){
        this.tool = new Tools()
    }

    public async launchRunners(){
        this.prepareVariablesBeforeRun(gv.scenarioToRun)
        try {
            if (process.argv[3] === 'null'){ // placing null as the second browser means that we want to run a solo scenario
                await this.tool.launchRunner(gv.pathUser1, gv.browser1)
            } else {
                await Promise.race([
                    this.tool.launchRunner(gv.pathUser1, gv.browser1),
                    this.tool.launchRunner(gv.pathUser2, gv.browser2),
                ])
            }
            process.exit(0) // The runners have been successfull
        } catch (error){
            console.log("There has been an error during the execution : ", error)
            await testCafe.close();
            process.exit(1) // There has been an error
        }
        finally {
            await testCafe.close();
        }
    }

    /**
     * Prepare the variables before the run (correct browser configuration and returns correct path for scenario files)
     * @param scenarioName The scenario to execute
     */
     public prepareVariablesBeforeRun(scenarioName : string ){
        gv.whichPath(scenarioName)
        this.prepareBrowsers()
    }

    /**
     * We can specify wether we want to use the headless version of browsers 
     * (useful when launching TestCafe from a Docker container, like in our CI process)
     */
     public prepareBrowsers(){
        if (gv.runningInDockerContainer === 'true') {
            gv.setHeadlessBrowser()
        }
    }
}

const r = new Runner()

await r.launchRunners()