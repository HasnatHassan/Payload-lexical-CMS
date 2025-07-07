import { createCommand } from '@payloadcms/richtext-lexical/lexical'
import { BackgroundColorPayload } from '../types'

export const TOGGLE_BACKGROUND_COLOR_WITH_MODAL_COMMAND = createCommand<BackgroundColorPayload>(
  'TOGGLE_BACKGROUND_COLOR_WITH_MODAL_COMMAND',
)
