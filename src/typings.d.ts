/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

// Logging
declare var log: Log
declare var BRAGI: any

// Other dependencies
declare var jIO: any
declare module 'mnemonicjs'
declare module 'netflux'
declare module 'random-material-color'
