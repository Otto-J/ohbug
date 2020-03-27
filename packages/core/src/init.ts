import { getGlobal, error, getUUID } from '@ohbug/utils'
import { Init } from '@ohbug/types'
import { defaultConfig } from './config'

/**
 * An init function common to multiple JavaScript platforms for saving config information and capture report plugin, etc.
 *
 * @param config Config information
 * @param platform Each issue will record its original platform
 * @param handleCapture Used to bind monitoring functions
 * @param handleReport Used to pass the report function
 * @param handleAsync control for asynchronous tasks
 * @param handleDestroy Used to offload listening events
 * @param enhancer Used to pass the return value of the applyPlugin function
 */
function init<T>({
  config,
  platform,
  handleCapture,
  handleReport,
  handleAsync,
  handleDestroy,
  enhancer
}: Init) {
  const global = getGlobal<T>()
  error(
    Boolean(global),
    `Ohbug: It is detected that the current environment does not support Ohbug.`
  )

  if (global.__OHBUG__ === undefined) {
    error(Boolean(config.apiKey), `Ohbug: Please pass in apiKey!`)

    const _config = {
      ...defaultConfig,
      ...config
    }

    global.__OHBUG__ = {
      uuid: getUUID(),
      platform,
      version: '__VERSION__',
      config: _config
    }

    // Insert plugin
    if (enhancer) {
      error(
        typeof enhancer === 'function',
        '`enhancer` is not a function, please check `Ohbug.init`!'
      )

      global.__OHBUG__.enhancer = enhancer(_config)
    }
    global.__OHBUG__._report = handleReport
    handleAsync()
    handleCapture()
    handleDestroy && handleDestroy()
  }
}

export default init
