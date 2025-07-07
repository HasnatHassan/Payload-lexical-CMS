'use client'
import type { Data, FormState } from 'payload'

import { CloseMenuIcon, EditIcon, formatDrawerSlug, useEditDepth } from '@payloadcms/ui'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { BackgroundColorPayload } from '../types'
import {
  FieldsDrawer,
  getSelectedNode,
  setFloatingElemPositionForLinkEditor,
  useEditorConfigContext,
  useLexicalDrawer,
} from '@payloadcms/richtext-lexical/client'
import { TOGGLE_BACKGROUND_COLOR_WITH_MODAL_COMMAND } from './commands'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { BackgroundColorFields } from '@/features/backgroundColor/nodes/types'
import {
  $getSelection,
  $isLineBreakNode,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  LexicalNode,
  SELECTION_CHANGE_COMMAND,
} from '@payloadcms/richtext-lexical/lexical'
import { $findMatchingParent, mergeRegister } from '@payloadcms/richtext-lexical/lexical/utils'
import {
  $isBackgroundColorNode,
  TOGGLE_BACKGROUND_COLOR_COMMAND,
} from '@/features/backgroundColor/nodes/BackgroundColorNode'
import { YELLOW_BG_CLASS } from "../../../../constants/colors"

export function BackgroundColorEditor({
  anchorElem,
}: {
  anchorElem: HTMLElement
}): React.ReactNode {
  const [editor] = useLexicalComposerContext()
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [backgroundColor, setBackgroundColor] = useState<null | string>(null)

  const {
    fieldProps: { schemaPath },
    uuid,
  } = useEditorConfigContext()

  const [stateData, setStateData] = useState<
    ({ id?: string; text: string } & BackgroundColorFields) | undefined
  >()

  const editDepth = useEditDepth()
  const [isBackgroundColor, setIsBackgroundColor] = useState(false)
  const [selectedNodes, setSelectedNodes] = useState<LexicalNode[]>([])

  const drawerSlug = formatDrawerSlug({
    slug: `lexical-rich-text-backgroundColor-` + uuid,
    depth: editDepth,
  })

  const { toggleDrawer } = useLexicalDrawer(drawerSlug)

  const setNotBackgroundColor = useCallback(() => {
    setIsBackgroundColor(false)
    if (editorRef && editorRef.current) {
      editorRef.current.style.opacity = '0'
      editorRef.current.style.transform = 'translate(-10000px, -10000px)'
    }
    setBackgroundColor(null)
    setSelectedNodes([])
    setStateData(undefined)
  }, [setIsBackgroundColor, setBackgroundColor, setSelectedNodes])

  const $updateBackgroundColorEditor = useCallback(() => {
    const selection = $getSelection()
    let selectedNodeDomRect: DOMRect | undefined

    if (!$isRangeSelection(selection) || !selection) {
      setNotBackgroundColor()
      return
    }

    const focusNode = getSelectedNode(selection)
    selectedNodeDomRect = editor.getElementByKey(focusNode.getKey())?.getBoundingClientRect()
    const focusBackgroundColorParent = $findMatchingParent(focusNode, $isBackgroundColorNode)

    const badNode = selection
      .getNodes()
      .filter((node) => !$isLineBreakNode(node))
      .find((node) => {
        const backgroundColorNode = $findMatchingParent(node, $isBackgroundColorNode)
        return (
          (focusBackgroundColorParent && !focusBackgroundColorParent.is(backgroundColorNode)) ||
          (backgroundColorNode && !backgroundColorNode.is(focusBackgroundColorParent))
        )
      })

    if (badNode) {
      setNotBackgroundColor()
      return
    }

    let data: { text: string } & BackgroundColorFields
    if (focusBackgroundColorParent) {
      data = {
        ...focusBackgroundColorParent.getFields(),
        id: focusBackgroundColorParent.getID(),
        text: focusBackgroundColorParent.getTextContent(),
      }
    } else {
      data = {
        backgroundColor: '', 
        id: undefined,
        text: selection.getTextContent(),
      }
    }

    setBackgroundColor(data.backgroundColor ?? null)
    setStateData(data)
    setIsBackgroundColor(true)
    setSelectedNodes(selection ? selection?.getNodes() : [])

    const editorElem = editorRef.current
    const nativeSelection = window.getSelection()
    const { activeElement } = document

    if (editorElem === null) {
      return
    }

    const rootElement = editor.getRootElement()

    if (
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      if (!selectedNodeDomRect) {
        selectedNodeDomRect = nativeSelection.getRangeAt(0).getBoundingClientRect()
      }

      if (selectedNodeDomRect != null) {
        selectedNodeDomRect.y += 40
        setFloatingElemPositionForLinkEditor(selectedNodeDomRect, editorElem, anchorElem)
      }
    } else if (activeElement == null || activeElement.className !== 'link-input') {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem)
      }
      setBackgroundColor(null)
    }

    return true
  }, [editor, setNotBackgroundColor, anchorElem])

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        TOGGLE_BACKGROUND_COLOR_WITH_MODAL_COMMAND,
        (payload: BackgroundColorPayload) => {
          editor.dispatchCommand(TOGGLE_BACKGROUND_COLOR_COMMAND, payload)
          $updateBackgroundColorEditor()
          toggleDrawer()
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, $updateBackgroundColorEditor, toggleDrawer, drawerSlug])

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement
    const update = (): void => {
      editor.getEditorState().read(() => {
        void $updateBackgroundColorEditor()
      })
    }
    window.addEventListener('resize', update)
    if (scrollerElem != null) {
      scrollerElem.addEventListener('scroll', update)
    }
    return () => {
      window.removeEventListener('resize', update)
      if (scrollerElem != null) {
        scrollerElem.removeEventListener('scroll', update)
      }
    }
  }, [anchorElem.parentElement, editor, $updateBackgroundColorEditor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          void $updateBackgroundColorEditor()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          void $updateBackgroundColorEditor()
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isBackgroundColor) {
            setNotBackgroundColor()
            return true
          }
          return false
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor, $updateBackgroundColorEditor, isBackgroundColor, setNotBackgroundColor])

  useEffect(() => {
    editor.getEditorState().read(() => {
      void $updateBackgroundColorEditor()
    })
  }, [editor, $updateBackgroundColorEditor])

  return (
    <React.Fragment>
      <div className="link-editor" ref={editorRef}>
        <div className="link-input">
          {backgroundColor && backgroundColor.length > 0 ? (
            <span className={backgroundColor}>{backgroundColor}</span>
          ) : null}

          {editor.isEditable() && (
            <React.Fragment>
              <button
                aria-label="Edit background color"
                className="link-edit"
                onClick={() => {
                  toggleDrawer()
                }}
                onMouseDown={(event) => {
                  event.preventDefault()
                }}
                tabIndex={0}
                type="button"
              >
                <EditIcon />
              </button>
              <button
                aria-label="Remove background color"
                className="link-trash"
                onClick={() => {
                  editor.dispatchCommand(TOGGLE_BACKGROUND_COLOR_COMMAND, null)
                }}
                onMouseDown={(event) => {
                  event.preventDefault()
                }}
                tabIndex={0}
                type="button"
              >
                <CloseMenuIcon />
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
      <FieldsDrawer
        className="lexical-link-edit-drawer"
        data={stateData}
        drawerSlug={drawerSlug}
        drawerTitle={`Edit Background Color`}
        featureKey="backgroundColor"
        handleDrawerSubmit={(fields: FormState, data: Data) => {
          // Always use yellow background
          const bareBackgroundColorFields: BackgroundColorFields = {
            backgroundColor: YELLOW_BG_CLASS,
          }
          editor.update(() => {
            editor.dispatchCommand(TOGGLE_BACKGROUND_COLOR_COMMAND, {
              fields: bareBackgroundColorFields,
              selectedNodes,
              text: data.text,
            })
          })
        }}
        schemaPath={schemaPath}
        schemaPathSuffix="fields"
      />
    </React.Fragment>
  )
}
