import type {
  Config,
  Field,
  FieldAffectingData,
  FieldSchemaMap,
  SanitizedConfig,
} from "payload";

import { sanitizeFields } from "payload";

import {
  convertLexicalNodesToHTML,
  createNode,
  createServerFeature,
} from "@payloadcms/richtext-lexical";
import { getBaseFields } from "./baseFields";
import { BackgroundColorNode } from "../nodes/BackgroundColorNode";
import { ClientProps } from "src/features/backgroundColor/client/index";

export interface colorMap {
  label: string;
  className: string;
}

export type ExclusiveBackgroundColorCollectionProps = {
  enabledColors: colorMap[];
};

export type TextColorFeatureServerProps = {
  fields?:
    | ((args: {
        config: SanitizedConfig;
        defaultFields: FieldAffectingData[];
      }) => (Field | FieldAffectingData)[])
    | Field[];
} & ExclusiveBackgroundColorCollectionProps;

export const BackgroundColorFeature = createServerFeature<
  ExclusiveBackgroundColorCollectionProps,
  TextColorFeatureServerProps,
  ClientProps
>({
  feature: async ({ config: _config, isRoot, parentIsLocalized, props }) => {
    const validRelationships = _config.collections.map((c) => c.slug) || [];

    const sanitizedProps: TextColorFeatureServerProps = props;
    const _transformedFields = getBaseFields(props.enabledColors);

    // Strip any functions or non-serializable data from fields
    const sanitizedFields = await sanitizeFields({
      config: _config as unknown as Config,
      fields: _transformedFields as Field[],
      parentIsLocalized,
      requireFieldLevelRichTextEditor: isRoot,
      validRelationships,
    });

    sanitizedProps.fields = sanitizedFields;
    return {
      ClientFeature: {
        path: "/features/backgroundColor/client",
        exportName: "BackgroundColorFeatureClient",
      },
      clientFeatureProps: {
        enabledColors: sanitizedProps.enabledColors,
      } as ExclusiveBackgroundColorCollectionProps,
      generateSchemaMap: () => {
        const schemaMap: FieldSchemaMap = new Map();
        schemaMap.set("fields", {
          fields: sanitizedFields,
        });
        return schemaMap;
      },
      nodes: [
        createNode({
          node: BackgroundColorNode,
          converters: {
            html: {
              converter: async ({
                converters,
                currentDepth,
                depth,
                draft,
                node,
                overrideAccess,
                parent,
                req,
                showHiddenFields,
              }) => {
                const childrenText = await convertLexicalNodesToHTML({
                  converters,
                  currentDepth,
                  depth,
                  draft,
                  lexicalNodes: node.children,
                  overrideAccess,
                  parent: {
                    ...node,
                    parent,
                  },
                  req,
                  showHiddenFields,
                });
                const className = node.fields.backgroundColor;
                return `<mark class="${className}">${childrenText}</mark>`;
              },
              nodeTypes: [BackgroundColorNode.getType()],
            },
          },
          getSubFields: () => {
            return sanitizedFields;
          },
          getSubFieldsData: ({ node }) => {
            return node?.fields;
          },
        }),
      ],
      sanitizedServerFeatureProps: sanitizedProps,
    };
  },
  key: "backgroundColor",
});
