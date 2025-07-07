"use client";

import { ToolbarGroup } from "@payloadcms/richtext-lexical";
import {
  createClientFeature,
  getSelectedNode,
  toolbarFeatureButtonsGroupWithItems,
} from "@payloadcms/richtext-lexical/client";
import { AutoBackgroundColorPlugin } from "./plugins/autoBackgroundColor";
import { BackgroundColorPlugin } from "./plugins/backgroundColor";
import { BackgroundColorFields } from "../nodes/types";
import {
  BackgroundColorNode,
  $isBackgroundColorNode,
  TOGGLE_BACKGROUND_COLOR_COMMAND,
} from "../nodes/BackgroundColorNode";
import { ExclusiveBackgroundColorCollectionProps } from "../server";
import {
  $getSelection,
  $isRangeSelection,
  LexicalNode,
} from "@payloadcms/richtext-lexical/lexical";
import { $findMatchingParent } from "@payloadcms/richtext-lexical/lexical/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHighlighter } from "@fortawesome/free-solid-svg-icons";
import { YELLOW_BG_CLASS } from "../../../constants/colors";

export type ClientProps = ExclusiveBackgroundColorCollectionProps;

const toolbarGroups: ToolbarGroup[] = [
  toolbarFeatureButtonsGroupWithItems([
    {
      ChildComponent: () => <FontAwesomeIcon icon={faHighlighter} size="lg" />,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          const selectedNode = getSelectedNode(selection);
          const backgroundColorParent = $findMatchingParent(
            selectedNode,
            $isBackgroundColorNode
          );
          // Only active if the background color is yellow
          return (
            backgroundColorParent != null &&
            backgroundColorParent.getFields &&
            backgroundColorParent.getFields().backgroundColor ===
              YELLOW_BG_CLASS
          );
        }
        return false;
      },
      isEnabled: ({ selection }) => {
        return !!(
          $isRangeSelection(selection) &&
          $getSelection()?.getTextContent()?.length
        );
      },
      key: "backgroundColor",
      label: "Background Color",
      onSelect: ({ editor, isActive }) => {
        let selectedText: string | undefined;
        let selectedNodes: LexicalNode[] = [];
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          selectedText = selection?.getTextContent();
          selectedNodes = selection?.getNodes() ?? [];
        });
        if (!selectedText?.length) {
          return;
        }
        if (isActive) {
          editor.dispatchCommand(TOGGLE_BACKGROUND_COLOR_COMMAND, null);
        } else {
          const backgroundColorFields: BackgroundColorFields = {
            backgroundColor: YELLOW_BG_CLASS,
            text: selectedText,
          };
          editor.dispatchCommand(TOGGLE_BACKGROUND_COLOR_COMMAND, {
            fields: backgroundColorFields,
            selectedNodes,
            text: selectedText,
          });
        }
      },
    },
  ]),
];
export const BackgroundColorFeatureClient = createClientFeature({
  nodes: [BackgroundColorNode],
  plugins: [
    {
      Component: BackgroundColorPlugin,
      position: "normal",
    },
    {
      Component: AutoBackgroundColorPlugin,
      position: "normal",
    },
  ],
  toolbarFixed: {
    groups: toolbarGroups,
  },
  toolbarInline: {
    groups: toolbarGroups,
  },
});
