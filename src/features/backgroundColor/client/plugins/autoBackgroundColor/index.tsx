import { useEffect } from "react";
import type { PluginComponent } from "@payloadcms/richtext-lexical";
import { BackgroundColorFields } from "../../../nodes/types";
import { colorMap } from "../../../server";
import { ClientProps } from "../..";
import { useLexicalComposerContext } from "@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext";

interface BackgroundColorMatcherResult {
  fields: BackgroundColorFields;
  index: number;
  length: number;
  text: string;
  className: string;
}

type BackgroundColorMatcher = (
  text: string
) => BackgroundColorMatcherResult | null;

const SPAN_CLASS_REGEX = /<span\s+class=["']([^"']+)["']\s*>([^<]+)<\/span>/;
const SPAN_CLASSNAME_REGEX =
  /<span\s+className=["']([^"']+)["']\s*>([^<]+)<\/span>/;

const createBackgroundColorMatcher = (
  enabledColors: colorMap[]
): BackgroundColorMatcher => {
  return (text: string) => {
    const classMatch = SPAN_CLASS_REGEX.exec(text);
    const classNameMatch = SPAN_CLASSNAME_REGEX.exec(text);
    const match = classMatch || classNameMatch;
    if (!match) return null;
    const [fullMatch, className, content] = match;
    const matchedColor = enabledColors.find(
      (color) => className === color.className
    );
    if (!matchedColor) return null;
    return {
      index: match.index,
      length: fullMatch.length,
      text: content,
      className: className,
      fields: {
        backgroundColor: className,
      },
    };
  };
};

export const AutoBackgroundColorPlugin: PluginComponent<ClientProps> = ({
  clientProps,
}) => {
  const [editor] = useLexicalComposerContext();
  const matcher = createBackgroundColorMatcher(clientProps.enabledColors);
  useEffect(() => {}, [editor, matcher, clientProps.enabledColors]);
  return null;
};
