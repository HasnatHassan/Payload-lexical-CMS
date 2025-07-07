import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import {
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Post } from "./collections/Posts";
import { BackgroundColorFeature } from "./features/backgroundColor/server";
import { YELLOW_BG_CLASS, YELLOW_LABEL } from "./constants/colors";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Post],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => {
      return [
        ...defaultFeatures,
        BackgroundColorFeature({
          enabledColors: [
            {
              label: YELLOW_LABEL,
              className: YELLOW_BG_CLASS,
            },
          ],
        }),
      ];
    },
  }),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "",
    },
  }),
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URI || "",
  // }),
  sharp,
  plugins: [payloadCloudPlugin()],
});
