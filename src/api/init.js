import Autopass from 'autopass'
import Corestore from 'corestore'

export let pass
export let initialised = false

export const init = async () => {
  pass = new Autopass(new Corestore('./pass'))

  await pass.ready()

  initialised = true

  return true
}
