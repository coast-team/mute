
export abstract class Database {
  public abstract init (name: string, address?: string): void
  public abstract store (obj: object): void
  public abstract get (): Promise<object>
}
