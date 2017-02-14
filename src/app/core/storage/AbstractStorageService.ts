export abstract class AbstractStorageService {

  readonly name: string

  abstract delete (name: string): Promise<void>
  abstract deleteAll (): Promise<void>
  abstract isReachable (): Promise<any>
  abstract getDocuments (): Promise<any>
}
