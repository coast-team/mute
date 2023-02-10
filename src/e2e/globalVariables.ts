/* eslint-disable prefer-arrow/prefer-arrow-functions */
// * -------------------------SCENARIOS--------------------------------
// Scenario names and the path to execute the scenarios

// * The full scenario
// Two users are on the same document and they can both write text in the editor
const fullScenario = 'fullscenario'
const pathFullScenarioUser1 = 'tests/full-scenario/fullScenarioUser1.ts'
const pathFullScenarioUser2 = 'tests/full-scenario/fullScenarioUser2.ts'


// * The online scenario
// Two users are on the same document and they can both write text in the editor
const onlineTest = 'online'
const pathOnlineTestUser1 = 'tests/online-test/onlineTestUser1.ts'
const pathOnlineTestUser2 = 'tests/online-test/onlineTestUser2.ts'
 
export { onlineTest, pathOnlineTestUser1, pathOnlineTestUser2}

// * The offline scenario
// Signaling server is killed off, users can still see each other modifications
const offlineTest = 'offline'
const pathOfflineTestUser1 = 'tests/offline-test/offlineTestUser1.ts'
const pathOfflineTestUser2 = 'tests/offline-test/ofllineTestUser2.ts'

export { offlineTest, pathOfflineTestUser1, pathOfflineTestUser2}

// * The offline to online scenario
// Signaling server is started after users added text to doc while disconnected
//
const offlineToOnlineTest = 'offline-to-online'
const pathOfflineToOnlineTestUser1 = 'tests/offline-to-online-test/offlineToOnlineUser1.ts'
const pathOfflineToOnlineTestUser2 = 'tests/offline-to-online-test/offlineToOnlineUser2.ts'
 
 export { offlineToOnlineTest, pathOfflineToOnlineTestUser1, pathOfflineToOnlineTestUser2}


// * ------------------GLOBAL VARIABLES FOR USE IN THE TESTS------------------
                    
// Url variables for the tests 
const urlSignaling = 'ws://localhost:8010'
const muteHomeMenu = 'http://localhost:4200'
const muteDoc = 'http://localhost:4200/urlDoc'

export { urlSignaling, muteHomeMenu, muteDoc}

// Expected texts for TestCafe assertion
const onlineExpectedText = 
`Hello, i am the first user

Have a nice day  `
 
const onlineExpectedTextAccessTest =
`accessHello, i am the first user

Have a nice day  `
 
export { onlineExpectedText, onlineExpectedTextAccessTest }

const textAddedWhileOfflineUser1 ='access while offline by user 1'

const textAddedWhileOfflineUser2 ='access while offline by user 2'

export { textAddedWhileOfflineUser1, textAddedWhileOfflineUser2 }

const expectedTextSignalingOffUser1 = 
`Hello, i am the first user
If i was accompanied, i'd say we come in peace
Have a nice day  `

const expectedTextSignalingOffUser2 = 
`Hello, i am the first user (accompanied by a second user)

Have a nice day`

const expectedTextSignalingMerge = 
`Hello, i am the first user (accompanied by a second user)
If i was accompanied, i'd say we come in peace
Have a nice day`

export { expectedTextSignalingOffUser1, expectedTextSignalingOffUser2, expectedTextSignalingMerge}


// * ------------------PARAMETERS WHEN RUNNING TESTCAFE------------------
// The parameters of the execution and what they represent
let browser1 = process.argv[2]
let browser2 = process.argv[3]
const scenarioToRun = process.argv[4]
const runningInDockerContainer = process.argv[5]

export { browser1, browser2, scenarioToRun, runningInDockerContainer }

// * ----------------SETTING UP BROWSER WHEN IN CONTAINERS------------------

/**
 * Setting up the browser execution as headless when we are executing the tests in a container
 */
function setHeadlessBrowser(){
    browser1 += ":headless"
    browser2 += ":headless"
}

export { setHeadlessBrowser }



// *------------------HANDLING PARRALLEL EXECUTION------------------
// The global path that will be used to launch a test run (this path is determined by running the whichPath function)
// Setting up the path to the files to execute
// Modify below code when a new scenario is developed
let pathUser1 = ''
let pathUser2 = ''

export { pathUser1, pathUser2}

/**
 * Determines the path of the test to execute depending on the scenario
 * @param scenarioName scenario executed for the test *(will be compared to scenario values in globalVariables file)*
 */
function whichPath(scenarioName : string){
    scenarioName = scenarioName.toLowerCase() // Remove eventual typing caps
    switch (scenarioName){
        case fullScenario :
            pathUser1 = pathFullScenarioUser1
            pathUser2 = pathFullScenarioUser2
            break;
        case onlineTest :
            pathUser1 = pathOnlineTestUser1
            pathUser2 = pathOnlineTestUser2
            break;
        case offlineTest :
            pathUser1 = pathOfflineTestUser1
            pathUser2 = pathOfflineTestUser2
            break;
        case offlineToOnlineTest :
            pathUser1 = pathOfflineToOnlineTestUser1
            pathUser2 = pathOfflineToOnlineTestUser2
            break;
        default : 
            pathUser1 = 'Name of the scenario is not known'
            pathUser2 = 'Name of the scenario is not known'
            break;
    }
}

export { whichPath }

// * ------------------HANDLING PARRALLEL EXECUTION------------------
// These variables handle the execution of a test for a specified user (When user 1 is running, user 2 is paused and vice-versa)
// By default, user 1 execution is set to true (user 1 is the main user, and is the first one to start to test)
let executingTestUser1 = true;
let executingTestUser2 = false;

/**
 * Stop current execution and resume the execution of the other user
 */
async function stopExecAndResumeOther() {
    if (executingTestUser1){
        executingTestUser1 = false
    } else {
        executingTestUser1 = true
    }
    if (executingTestUser2){
        executingTestUser2 = false
    } else {
        executingTestUser2 = true
    }
    await new Promise( resolve => setTimeout(resolve, 5000)); // Time to wait while the other user goes out of his while loop
}

/**
 * Returns the execution status of user 1
 */
function getExecutingTestUser1() {
    return executingTestUser1;
}

/**
 * Returns the execution status of user 2
 */
function getExecutingTestUser2() {
    return executingTestUser2;
}

export { stopExecAndResumeOther, getExecutingTestUser1, getExecutingTestUser2 };