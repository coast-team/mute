/* SystemJS module definition */
declare var module: NodeModule
interface NodeModule {
  id: string
}

// Logging
declare var log: any
declare var BRAGI: any

// For Quentin's test
interface Window {
  wg: any
  muteTest: {
    insert: (index: number, text: string) => void
    delete: (index: number, length: number) => void
    getText: (index?: number, length?: number) => string
  }
}

// Other dependencies
declare var jIO: any
declare module 'mnemonicjs'
