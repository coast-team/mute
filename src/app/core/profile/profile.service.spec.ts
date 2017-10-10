import { async } from '@angular/core/testing'
import { ProfileService } from './profile.service'

describe('ProfileService', () => {
  let profileService: ProfileService

  beforeEach(async(() => profileService = new ProfileService()))

  it('Correct Init', () => expect(profileService).toBeTruthy())

  it('Get default pseudo', () => {
    expect(profileService.pseudonymDefault === 'Anonymous').toBe(true)
  })

  it('Set pseudo', () => {
    profileService.pseudonym = 'Testing'
    expect(profileService.pseudonym === 'Testing').toBe(true)
  })

  it('Set an item', () => {
    profileService['setItem']('testKey', 'testValue')
    expect(profileService['getItem']('testKey') === 'testValue').toBe(true)
  })

  it('Remove an item', () => {
    profileService['setItem']('testKey', 'testValue')
    profileService['removeItem']('testKey')
    expect(profileService['getItem']('testKey')).toBeFalsy()
  })

})
