import { PluginComponent } from "@payloadcms/richtext-lexical";
import { useLexicalComposerContext } from "@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  TOGGLE_BACKGROUND_COLOR_COMMAND,
  $toggleBackgroundColor,
} from "../../../nodes/BackgroundColorNode";
import { mergeRegister } from "@payloadcms/richtext-lexical/lexical/utils";

export const BackgroundColorPlugin: PluginComponent = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        TOGGLE_BACKGROUND_COLOR_COMMAND,
        (payload) => {
          $toggleBackgroundColor(payload);
          return true;
        },
        0
      )
    );
  }, [editor]);

  return null;
};
