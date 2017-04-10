/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

// Logging
declare var log: Log
declare var BRAGI: any

// For Quentin's test
interface InsertFunc {
    (index: number, text: string): void
}
interface DeleteFunc {
    (index: number, length: number): void
}
interface GetTextFunc {
    (index: number, length?: number): void
}
interface Window {
  muteTest: {
    insert: InsertFunc,
    delete: DeleteFunc,
    getText: GetTextFunc
  }
}

// Other dependencies
declare var jIO: any
declare module 'mnemonicjs'
declare module 'netflux'
declare module 'random-material-color'
