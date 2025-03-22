import { validateAndPrepareCustomFields } from './validateAndPrepareCustomFields'
import { validateAndPrepareLoginData } from './validateAndPrepareLoginData'

jest.mock('./validateAndPrepareCustomFields', () => ({
  validateAndPrepareCustomFields: jest.fn((fields) => fields || [])
}))

describe('validateAndPrepareLoginData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should validate and prepare valid login data', () => {
    const loginData = {
      title: 'My Login',
      username: 'user123',
      password: 'password123',
      note: 'This is a note',
      websites: ['https://example.com'],
      customFields: [{ name: 'field1', value: 'value1', type: 'text' }]
    }

    const result = validateAndPrepareLoginData(loginData)

    expect(result).toEqual(loginData)
    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(
      loginData.customFields
    )
  })

  test('should validate with minimal required fields', () => {
    const loginData = {
      title: 'My Login',
      websites: ['https://example.com']
    }

    const result = validateAndPrepareLoginData(loginData)

    expect(result).toEqual({
      title: 'My Login',
      username: undefined,
      password: undefined,
      note: undefined,
      websites: ['https://example.com'],
      customFields: []
    })
  })

  test('should throw error if title is missing', () => {
    const loginData = {
      username: 'user123',
      websites: ['https://example.com']
    }

    expect(() => {
      validateAndPrepareLoginData(loginData)
    }).toThrow('Invalid login data:')
  })

  test('should throw error if websites is not an array', () => {
    const loginData = {
      title: 'My Login',
      websites: 'https://example.com'
    }

    expect(() => {
      validateAndPrepareLoginData(loginData)
    }).toThrow('Invalid login data:')
  })

  test('should accept empty username', () => {
    const loginData = {
      title: 'My Login',
      username: '',
      websites: ['https://example.com']
    }

    const result = validateAndPrepareLoginData(loginData)
    expect(result.username).toBe('')
  })

  test('should accept null and undefined values for optional fields', () => {
    const loginData = {
      title: 'My Login',
      username: null,
      password: undefined,
      note: null,
      websites: ['https://example.com'],
      customFields: null
    }

    const result = validateAndPrepareLoginData(loginData)

    expect(result).toEqual({
      title: 'My Login',
      username: null,
      password: undefined,
      note: null,
      websites: ['https://example.com'],
      customFields: []
    })
  })
})
