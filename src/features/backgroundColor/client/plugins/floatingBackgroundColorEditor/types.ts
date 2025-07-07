import { LexicalNode } from "@payloadcms/richtext-lexical/lexical";
import { BackgroundColorFields } from "../../../nodes/types";

export type BackgroundColorPayload = {
  fields: BackgroundColorFields;
  selectedNodes?: LexicalNode[];
  text: null | string;
};
