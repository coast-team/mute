export abstract class AbstractStorageService {

    readonly name: string

    abstract isReachable (): Promise<any>
    abstract getDocuments (): Promise<any>
}
