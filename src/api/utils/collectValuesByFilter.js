import { pass } from '../init'

export const collectValuesByFilter = async (filterFn) => {
  const stream = await pass.list()
  const results = []

  return new Promise((resolve, reject) => {
    stream.on('data', ({ key, value }) => {
      if (filterFn(key)) {
        results.push(value)
      }
    })

    stream.on('end', () => resolve(results))

    stream.on('error', (error) => reject(error))
  })
}
