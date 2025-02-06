export const extractBasePath = (input) => {
  const regex = /^--user-data-dir=(.+)$/
  const match = input.match(regex)

  return match[1]
}

export const buildPath = (input, path) => {
  return extractBasePath(input) + '/' + path
}
