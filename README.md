# CSS Rule Editor

A Vue 3 + TypeScript web application for parsing, editing, and managing CSS rules from JSON-escaped strings.

## Features

- **JSON Input**: Parse JSON-escaped CSS strings with proper handling of escape sequences (`\r\n`, `\"`)
- **Visual CSS Editor**: View and edit CSS rules in a user-friendly interface
- **Rule Management**: Add, edit, and remove CSS rules with a form-based interface
- **Live Preview**: See formatted CSS output in real-time
- **JSON Export**: Re-encode edited CSS back to JSON-escaped format
- **Copy to Clipboard**: Easy export functionality

## Project Structure

```
src/
├── components/
│   ├── CssEditor.vue      # Main editor component
│   └── CssRuleEditor.vue  # Individual rule editor
├── types.ts               # TypeScript interfaces
├── cssParser.ts           # CSS parsing utilities
├── App.vue                # Root component
└── main.ts                # Application entry point
```

## Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Usage

1. Paste your JSON-escaped CSS string in the input textarea

   - Example: `{ "customCss": ".my-class { color: red; }\\r\\n.another-class { font-size: 16px; }" }`

2. Click "Parse & Decode CSS" to load the rules

3. Edit rules using the visual interface:

   - Modify selectors and declarations inline
   - Add new declarations to existing rules
   - Remove rules or individual declarations

4. Add new rules using the form at the bottom

5. Click "Re-encode to JSON Format" to export your changes

6. Copy the exported JSON to use in your application

## Input/Output Format

**Input Format:**

```json
{
  "customCss": ".my-class { color: red; }\\r\\n.another-class { font-size: 16px; }"
}
```

**Output Format:**
Same structure with updated CSS, properly escaped for JSON.

## Technologies Used

- Vue 3 (Composition API)
- TypeScript
- Vite
- CSS-in-JS parsing utilities
