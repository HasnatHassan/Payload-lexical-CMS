import { CollectionConfig } from "payload";

export const Post: CollectionConfig = {
  slug: "post",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "content",
      type: "richText",
    },
  ],
};
