import { ProfileService } from './profile.service'
import { async } from '@angular/core/testing'

describe('ProfileService', () => {
  let profileService: ProfileService

  beforeEach(async(() => profileService = new ProfileService()))

  it('Correct Init', () => expect(profileService).toBeTruthy())

  it('Get default pseudo', () => {
    console.log(profileService.pseudonymDefault)
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
    console.log(profileService['getItem']('testKey'))
    profileService['removeItem']('testKey')
    expect(profileService['getItem']('testKey')).toBeFalsy()
  })

})
