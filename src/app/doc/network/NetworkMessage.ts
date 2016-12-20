export class NetworkMessage {
  constructor (
    public service: string,
    public id: number,
    public isBroadcast: boolean,
    public content: ArrayBuffer
  ) {}
}
