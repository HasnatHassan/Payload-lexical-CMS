# Payload Lexical Rich Text Customization

This project is a Payload CMS configuration that uses the [Lexical](https://lexical.dev/) rich text editor, with custom features and collections, and is set up for deployment on Payload Cloud.

## Features

- **Rich Text Editing with Lexical:**  
  Uses the `@payloadcms/richtext-lexical` package for a modern, extensible rich text editing experience in the Payload admin panel.

- **Custom Background Color Feature:**  
  Adds a toolbar button to highlight text with a yellow background.

  - The feature is implemented as a custom Lexical node and includes both server and client logic.
  - The background color can be toggled via the toolbar.
  - Includes plugins for auto-detection and floating editor UI.

- **Collections:**

  - **Users:** Auth-enabled collection using email as the title.
  - **Media:** Upload-enabled collection with an `alt` text field.
  - **Posts:** Contains a `title` and a `content` (rich text) field.

- **Database:**  
  Uses MongoBD .

- **Cloud Ready:**  
  Includes the Payload Cloud plugin for easy deployment.

## 📹 Feature Demo

See the feature in action: [Loom Video Demo](https://www.loom.com/share/3bc8f254e1764acea619e3b7b2e58bf1?sid=daa07500-6872-4df1-b0b7-a60d26fb48dc)

## Project Structure

```
src/
  collections/
    Users.ts
    Media.ts
    Posts.ts
  features/
    backgroundColor/
      client/
        index.tsx
        plugins/
          autoBackgroundColor/
          floatingBackgroundColorEditor/
      server/
        index.ts
  payload.config.ts
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- Yarn or npm

### Installation

1. Install dependencies:

   ```bash
   yarn install
   # or
   npm install
   ```

2. Set up environment variables:

   - `PAYLOAD_SECRET` (required)
   - `DATABASE_URI` (for MongoDB)

3. Run the development server:

   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

### Collections

- **Users:**  
  Auth-enabled. Use email to log in.

- **Media:**  
  Upload images or files, with required alt text.

- **Posts:**  
  Create posts with a title and rich text content. The content field supports the custom background color feature.

### Custom Rich Text Feature: Background Color

- Adds a "Background Color" button to the Lexical editor toolbar.
- Only the color "Yellow" (`bg-yellow-200`) is enabled by default.
- The feature is implemented in `src/features/backgroundColor/` and is fully extensible.

## Extending

- To add more background colors, edit the `enabledColors` array in `payload.config.ts`.
- To change the order of toolbar features, adjust the array returned in the `features` function in the Lexical editor config.

## License

MIT
