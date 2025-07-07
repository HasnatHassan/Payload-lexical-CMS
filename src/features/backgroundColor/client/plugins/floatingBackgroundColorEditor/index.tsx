'use client'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { PluginComponentWithAnchor } from '@payloadcms/richtext-lexical'
import { BackgroundColorEditor } from './BackgroundColorEditor'
import { ClientProps } from '../..'

export const FloatingBackgroundColorEditorPlugin: PluginComponentWithAnchor<ClientProps> = (props) => {
  const { anchorElem = document.body } = props
  return createPortal(<BackgroundColorEditor anchorElem={anchorElem} />, anchorElem)
} 