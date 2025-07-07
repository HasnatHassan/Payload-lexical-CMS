import type { FieldAffectingData } from "payload";
import { colorMap } from ".";

export const getBaseFields = (
  enabledColors: colorMap[]
): FieldAffectingData[] => {
  const baseFields: FieldAffectingData[] = [
    {
      name: "text",
      type: "text",
      label: "Text to display",
      required: true,
    },
    {
      name: "backgroundColor",
      type: "select",
      admin: {
        description: "Background color of the text",
      },
      defaultValue: enabledColors[0].className,
      label: "Background Color",
      options: enabledColors.map((color) => ({
        label: color.label,
        value: color.className,
      })),
      required: true,
    },
  ];
  return baseFields;
};
