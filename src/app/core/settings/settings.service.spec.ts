import { async } from '@angular/core/testing'
import { SettingsService } from './profile.service'

describe('SettingsService', () => {
  let settings: SettingsService

  beforeEach(async(() => (settings = new SettingsService())))

  it('Correct Init', () => expect(settings).toBeTruthy())

  it('Get default displayName', () => {
    expect(settings.pseudonymDefault === 'Anonymous').toBe(true)
  })

  it('Set pseudo', () => {
    settings.pseudonym = 'Testing'
    expect(settings.pseudonym === 'Testing').toBe(true)
  })

  it('Set an item', () => {
    settings['setItem']('testKey', 'testValue')
    expect(settings['getItem']('testKey') === 'testValue').toBe(true)
  })

  it('Remove an item', () => {
    settings['setItem']('testKey', 'testValue')
    settings['removeItem']('testKey')
    expect(settings['getItem']('testKey')).toBeFalsy()
  })
})
