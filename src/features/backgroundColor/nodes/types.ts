import type { JsonValue } from 'payload'
import { colorMap } from '../server'
import {
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from '@payloadcms/richtext-lexical/lexical'

export type BackgroundColorFields = {
  [key: string]: JsonValue
  backgroundColor: colorMap['className']
}

export type SerializedLinkNode<T extends SerializedLexicalNode = SerializedLexicalNode> = Spread<
  {
    fields: BackgroundColorFields
    id?: string // optional if AutoLinkNode
    type: 'backgroundColor'
  },
  SerializedElementNode<T>
>

export type SerializedAutoLinkNode<T extends SerializedLexicalNode = SerializedLexicalNode> = {
  type: 'autoColorText'
} & Omit<SerializedLinkNode<T>, 'id' | 'type'>
