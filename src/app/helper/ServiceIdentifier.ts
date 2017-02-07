const identifiers = new Set()

export abstract class ServiceIdentifier {
  constructor (protected id: string) {
    if (identifiers.has(id)) {
      throw new Error(`Service with "${id}" id has already been registered`)
    }
    identifiers.add(id)
  }
}
