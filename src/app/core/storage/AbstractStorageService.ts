export abstract class AbstractStorageService {

  constructor (
    readonly title: string,
    readonly link: string,
    readonly icon: string
  ) { }

  abstract delete (name: string): Promise<void>
  abstract deleteAll (): Promise<void>
  abstract isReachable (): Promise<any>
  abstract getDocuments (): Promise<any>
}
