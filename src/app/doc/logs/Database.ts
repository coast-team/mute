export abstract class Database {
  public abstract init(name: string, address?: string)
  public abstract store(obj: object)
  public abstract get(): Promise<object>
}
