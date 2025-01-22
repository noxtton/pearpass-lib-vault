import { createAsyncThunk } from '@reduxjs/toolkit'

import { generateUniqueId } from '../utils/generateUniqueId'

const RECORDS = Array.from({ length: 30 }, (_, i) => {
  const id = `record/vault${i + 1}/record${i + 1}`
  const types = ['login', 'identity', 'creditCard', 'note', 'custom']
  const type = types[Math.floor(Math.random() * types.length)]

  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  const timestamp = Math.floor(
    Math.random() * (now - thirtyDaysAgo) + thirtyDaysAgo
  )

  let data

  switch (type) {
    case 'login':
      data = {
        title: `Account ${i + 1}`,
        username: `user${i + 1}`,
        password: `Pass${i + 1}@123`,
        websites: [`https://website${i + 1}.com`],
        note: `Note for login ${i + 1}`,
        customFields: [
          { name: 'Note for', note: 'Note for Enabled', type: 'note' }
        ]
      }
      break
    case 'identity':
      data = {
        title: `Identity ${i + 1}`,
        fullName: `User Fullname ${i + 1}`,
        email: `user${i + 1}@mail.com`,
        phoneNumber: `+12345678${i + 1}`,
        address: `${i + 1} Main St`,
        zip: `ZIP${1000 + i}`,
        city: `City${i + 1}`,
        region: `Region${i + 1}`,
        country: `Country${i + 1}`,
        note: `Identity note ${i + 1}`,
        customFields: [
          { name: 'DOB', note: `199${i % 10}-01-01`, type: 'note' }
        ]
      }
      break
    case 'creditCard':
      data = {
        title: `Card ${i + 1}`,
        name: `Cardholder ${i + 1}`,
        expireDate: `202${(i % 5) + 5}-12`,
        securityCode: Math.floor(100 + Math.random() * 900).toString(),
        pinCode: Math.floor(1000 + Math.random() * 9000).toString(),
        note: `Credit card note ${i + 1}`,
        customFields: [{ name: 'Bank', note: `Bank${i + 1}`, type: 'note' }],
        number: `1234 5678 1234 5678`
      }
      break
    case 'note':
      data = {
        title: `Secure Note ${i + 1}`,
        note: `This is a secure note ${i + 1}`,
        customFields: [{ name: 'Tag', note: 'Important', type: 'note' }]
      }
      break
    case 'custom':
      data = {
        title: `Custom Item ${i + 1}`,
        note: `Custom note ${i + 1}`,
        customFields: [
          { name: 'CustomField', note: `Value${i + 1}`, type: 'note' }
        ]
      }
      break
  }

  return {
    id: id,
    version: 1,
    type: type,
    vaultId: `vault${i + 1}`,
    data: data,
    folder: `Folder ${(i % 5) + 1}`,
    isPinned: Math.random() < 0.3,
    isFavorite: Math.random() < 0.5,
    createdAt: timestamp,
    updatedAt: timestamp + 5000
  }
})

const MOCK_VAULT = {
  id: generateUniqueId(),
  records: RECORDS,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

export const getVaultById = createAsyncThunk(
  'vault/getVault',
  async (vaultId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(vaultId ? MOCK_VAULT : null)
      }, 0)
    })
  }
)
