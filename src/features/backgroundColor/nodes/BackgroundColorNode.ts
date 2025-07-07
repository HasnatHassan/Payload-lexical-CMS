import type {
  BaseSelection,
  EditorConfig,
  ElementNode as ElementNodeType,
  LexicalNode,
  NodeKey,
  RangeSelection,
  DOMConversionOutput,
  LexicalCommand,
} from "@payloadcms/richtext-lexical/lexical";
import {
  $createParagraphNode,
  $isRangeSelection,
  $applyNodeReplacement,
  ElementNode,
  $createTextNode,
  $getSelection,
  $isElementNode,
  createCommand,
} from "@payloadcms/richtext-lexical/lexical";
import { BackgroundColorFields, SerializedLinkNode } from "./types";
import { addClassNamesToElement } from "@payloadcms/richtext-lexical/lexical/utils";
import { isHTMLElement } from "@payloadcms/richtext-lexical/client";
import ObjectID from "bson-objectid";
import { BackgroundColorPayload } from "../client/plugins/floatingBackgroundColorEditor/types";

/** @noInheritDoc */
export class BackgroundColorNode extends ElementNode {
  __fields: BackgroundColorFields;
  __id: string;

  constructor({
    id,
    fields = {
      backgroundColor: "",
    },
    key,
  }: {
    fields: BackgroundColorFields;
    id: string;
    key?: NodeKey;
  }) {
    super(key);
    this.__fields = {
      ...fields,
      text: typeof fields.text === "string" ? fields.text : "",
    };
    this.__id = id;
  }

  static getType(): string {
    return "backgroundColor";
  }

  getFields(): BackgroundColorFields {
    return this.getLatest().__fields;
  }

  getID(): string {
    return this.getLatest().__id;
  }
  canBeEmpty(): false {
    return false;
  }

  canInsertTextAfter(): false {
    return false;
  }

  canInsertTextBefore(): false {
    return false;
  }
  static clone(node: BackgroundColorNode): BackgroundColorNode {
    return new BackgroundColorNode({
      id: node.__id,
      fields: node.__fields,
      key: node.__key,
    });
  }

  createDOM(_: EditorConfig): HTMLElement {
    const element = document.createElement("mark");
    addClassNamesToElement(element, this.__fields.backgroundColor);
    return element;
  }

  extractWithChild(
    child: LexicalNode,
    selection: BaseSelection,
    destination: "clone" | "html"
  ): boolean {
    if (!$isRangeSelection(selection)) {
      return false;
    }

    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();

    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      selection.getTextContent().length > 0
    );
  }

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true
  ): ElementNodeType | null {
    const element = this.getParentOrThrow().insertNewAfter(
      selection,
      restoreSelection
    );
    if ($isElementNode(element)) {
      const node = $createBackgroundColorNode({ fields: this.__fields });
      element.append(node);
      return node;
    }
    return null;
  }

  isInline(): true {
    return true;
  }

  setFields(fields: BackgroundColorFields): void {
    const writable = this.getWritable();
    writable.__fields = fields;
  }

  updateDOM(
    prevNode: BackgroundColorNode,
    span: HTMLSpanElement,
    config: EditorConfig
  ): boolean {
    const className = this.__fields?.backgroundColor;
    addClassNamesToElement(span, className);
    return false;
  }

  exportJSON(): SerializedLinkNode {
    return {
      ...super.exportJSON(),
      type: "backgroundColor",
      version: 1,
      id: this.__id,
      fields: {
        ...this.__fields,
        text: typeof this.__fields.text === "string" ? this.__fields.text : "",
      },
    };
  }

  static importJSON(serializedNode: SerializedLinkNode): BackgroundColorNode {
    serializedNode.id = new ObjectID().toHexString();
    serializedNode.version = 3;

    const node = $createBackgroundColorNode({
      id: serializedNode.id,
      fields: serializedNode.fields,
    });
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
}

export function $createBackgroundColorNode({
  id,
  fields,
}: {
  fields: BackgroundColorFields;
  id?: string;
}): BackgroundColorNode {
  return $applyNodeReplacement(
    new BackgroundColorNode({
      id: id ?? new ObjectID().toHexString(),
      fields,
    })
  );
}

export function $isBackgroundColorNode(
  node: LexicalNode | null | undefined
): node is BackgroundColorNode {
  return node instanceof BackgroundColorNode;
}

export const TOGGLE_BACKGROUND_COLOR_COMMAND: LexicalCommand<BackgroundColorPayload | null> =
  createCommand("TOGGLE_BACKGROUND_COLOR_COMMAND");

export function $toggleBackgroundColor(
  payload: BackgroundColorPayload | null
): void {
  if (payload === null) {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const nodes = selection.extract();
    nodes?.forEach((node) => {
      const parent = node.getParent();
      if (parent instanceof BackgroundColorNode) {
        const children = parent.getChildren();
        if (parent?.__parent === "root") {
          const paragraph = $createParagraphNode();
          children.forEach((child) => paragraph.append(child));
          parent.replace(paragraph);
        } else {
          children.forEach((child) => {
            parent.insertBefore(child);
          });
          parent.remove();
        }
      }
    });
    return;
  }
  const selection = $getSelection();

  if (!$isRangeSelection(selection) && !payload?.selectedNodes?.length) {
    return;
  }
  const nodes = $isRangeSelection(selection)
    ? selection.extract()
    : payload.selectedNodes;

  if (nodes?.length === 1) {
    const firstNode = nodes[0];
    const bgNode: BackgroundColorNode | null =
      firstNode instanceof BackgroundColorNode ? firstNode : null;
    if (bgNode !== null) {
      bgNode.setFields(payload.fields);
      if (payload.text != null && payload.text !== bgNode.getTextContent()) {
        bgNode.append($createTextNode(payload.text));
        bgNode.getChildren().forEach((child) => {
          if (child !== bgNode.getLastChild()) {
            child.remove();
          }
        });
      }
      return;
    }
  }

  let prevParent: ElementNodeType | BackgroundColorNode | null = null;
  let bgNode: BackgroundColorNode | null = null;

  nodes?.forEach((node) => {
    const parent = node.getParent();
    if (
      parent === bgNode ||
      parent === null ||
      ($isElementNode(node) && !node.isInline())
    ) {
      return;
    }
    if (parent instanceof BackgroundColorNode) {
      bgNode = parent;
      parent.setFields(payload.fields);
      if (payload.text != null && payload.text !== parent.getTextContent()) {
        parent.append($createTextNode(payload.text));
        parent.getChildren().forEach((child) => {
          if (child !== parent.getLastChild()) {
            child.remove();
          }
        });
      }
      return;
    }
    if (!parent.is(prevParent)) {
      prevParent = parent;
      bgNode = $createBackgroundColorNode({ fields: payload.fields });
      if (parent instanceof BackgroundColorNode) {
        if (node.getPreviousSibling() === null) {
          parent.insertBefore(bgNode);
        } else {
          parent.insertAfter(bgNode);
        }
      } else {
        node.insertBefore(bgNode);
      }
    }
    if (node instanceof BackgroundColorNode) {
      if (node.is(bgNode)) {
        return;
      }
      if (bgNode !== null) {
        const children = node.getChildren();
        for (let i = 0; i < children.length; i += 1) {
          bgNode.append(children[i]);
        }
      }
      node.remove();
      return;
    }
    if (bgNode !== null) {
      bgNode.append(node);
    }
  });
}
