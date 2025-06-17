# CSS Rule Editor

A powerful, feature-rich Vue 3 + TypeScript web application for parsing, editing, and managing CSS rules from JSON-escaped strings. Built with modern web technologies and designed for developer productivity.

## ✨ Features

### Core Functionality
- **🔄 Two-Step Workflow**: Intuitive input/parse → edit/export process
- **📝 JSON Input Parsing**: Parse JSON-escaped CSS strings with proper handling of escape sequences (`\r\n`, `\"`, `\\`)
- **🎯 Visual CSS Editor**: View and edit CSS rules in a user-friendly interface with syntax highlighting
- **🚀 Live Preview**: See formatted CSS output in real-time with active rule highlighting
- **📤 Multi-Format Export**: Export as complete JSON object, property-only format, or raw CSS

### Advanced Features
- **💾 Auto-Save**: Automatic localStorage persistence with visual saving indicators
- **⚡ Offline-First**: Works without internet connection, saves data locally
- **🎨 Syntax Highlighting**: Color-coded CSS preview with proper formatting
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **🔍 Error Handling**: Comprehensive error detection and user-friendly messages
- **🔍 Search & Filter**: Powerful search functionality with real-time filtering and highlighting

### Search & Filtering Features
- **🔎 Real-time Search**: Search across selectors, property names, and values instantly
- **🎯 Smart Filtering**: Filter by empty rules, specific properties, or CSS patterns
- **💡 Search Highlighting**: Yellow highlighting of search matches with visual indicators
- **📊 Results Counter**: Shows "X of Y results" to track filtered content
- **🎯 Pattern Matching**: Filter by CSS patterns (classes, IDs, element selectors)
- **🧹 Quick Clear**: Easy-to-use buttons to clear search and filter criteria

### Developer Experience
- **🛠️ TypeScript**: Full type safety throughout the application
- **🏗️ Modern Architecture**: Feature-based directory structure with clean separation of concerns
- **🔧 Composables**: Reusable Vue 3 composition functions for shared logic
- **📊 Storage Management**: Visual storage usage indicators and data management tools

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser with ES6+ support

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd css-rule-editor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

The project follows a feature-based architecture for better maintainability and scalability:

```
src/
├── features/                          # Feature modules
│   └── css-editor/                    # CSS editor feature
│       └── components/                # Feature-specific components
│           ├── CssEditor.vue          # Main editor container
│           ├── CssRuleEditor.vue      # Individual rule editor
│           └── index.ts               # Component exports
├── lib/                               # Core libraries
│   ├── types/                         # TypeScript type definitions
│   │   ├── types.ts                   # Application types
│   │   └── index.ts                   # Type exports
│   └── utils/                         # Utility functions
│       ├── cssParser.ts               # CSS parsing/formatting logic
│       └── index.ts                   # Utility exports
├── shared/                            # Shared application code
│   └── composables/                   # Reusable Vue composables
│       ├── useAutoSave.ts             # Auto-save functionality
│       └── index.ts                   # Composable exports
├── App.vue                            # Root application component
├── main.ts                            # Application entry point
├── shims-vue.d.ts                     # Vue type declarations
└── vite-env.d.ts                      # Vite environment types
```

### Architecture Principles

- **Feature-based organization**: Related components grouped by feature
- **Separation of concerns**: Business logic separated from UI components
- **Reusable composables**: Shared functionality extracted into composables
- **Type safety**: Comprehensive TypeScript coverage
- **Clean imports**: Barrel exports for better import paths

## 🎯 Usage Guide

### Basic Workflow

1. **Input Phase**
   - Paste your JSON-escaped CSS string in the input textarea
   - Choose from supported formats:
     - Complete JSON: `{ "customCss": "..." }`
     - Property-only: `"customCss": "..."`
   - Click "Parse & Continue to Editor"

2. **Editing Phase**
   - Visually edit CSS rules using inline editors
   - Add/remove CSS declarations
   - Create new CSS rules
   - View real-time preview with syntax highlighting
   - Use search and filtering to find specific rules quickly

3. **Export Phase**
   - Choose export format (JSON object, property-only, or raw CSS)
   - Copy to clipboard with one click
   - Auto-save ensures your work is never lost

### Supported Input Formats

#### Complete JSON Object
```json
{
  "customCss": ".my-class { color: red; }\\r\\n.another-class { font-size: 16px; }"
}
```

#### Property-Only Format
```json
"customCss": ".my-class { color: red; }\\r\\n.another-class { font-size: 16px; }"
```

### Search & Filtering

The CSS Rule Editor includes powerful search and filtering capabilities to help you find and manage CSS rules efficiently:

#### Search Functionality
- **Real-time search**: Type in the search box to instantly filter rules
- **Multi-field search**: Searches across CSS selectors, property names, and values
- **Search highlighting**: Matching text is highlighted with a yellow background
- **Clear search**: Click the × button to quickly clear your search query

#### Filter Options
- **All Rules** (default): Shows all CSS rules
- **Empty Rules**: Filters to show only rules with no declarations or empty values
- **With Property**: Filters rules containing a specific property name
- **Pattern Match**: Filters rules by CSS patterns:
  - Classes: Search for `.classname` to find rules with class selectors
  - IDs: Search for `#idname` to find rules with ID selectors
  - Elements: Search for element names like `div`, `span`, `p`

#### Results & Navigation
- **Results counter**: Shows "X of Y results" in the panel header
- **Results info bar**: Displays detailed filtering information when active
- **Clear filters**: Dedicated buttons to clear all search and filter criteria
- **No results state**: Helpful message with option to clear filters when no matches found

### Auto-Save Features

- **Automatic saving**: Changes saved to localStorage with 1-second debounce
- **Visual indicators**: See saving status with animated icons
- **Error handling**: Graceful degradation when storage is unavailable
- **Storage management**: View usage statistics and clear data when needed
- **Auto-restore**: Automatically restore your work when returning to the application

## ⚙️ Configuration

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Run TypeScript type checking |

### Environment Variables

The application uses Vite's environment variable system. Create a `.env.local` file for local configuration:

```bash
# Development settings
VITE_APP_NAME="CSS Rule Editor"
VITE_DEBUG_MODE=true
```

## 🏗️ Architecture Details

### Component Architecture

#### CssEditor.vue
- **Purpose**: Main container managing the two-step workflow
- **Features**: Step navigation, auto-save integration, settings modal, search & filtering
- **State**: Manages CSS rules, UI state, auto-save status, search queries, and filter options
- **Search Features**: Real-time filtering, search highlighting, results counting

#### CssRuleEditor.vue
- **Purpose**: Individual CSS rule editing component
- **Features**: Inline editing, declaration management, focus handling, search highlighting
- **Props**: Rule data, active state, and search query for highlighting
- **Events**: Rule updates, removal requests, focus events
- **Search Features**: Displays highlighted search matches within rule content

### Composables

#### useAutoSave
- **Purpose**: localStorage-based auto-save functionality
- **Features**: Debounced saving, error handling, storage management
- **Returns**: Save status, storage info, and control functions

### Utilities

#### cssParser.ts
- **Functions**: 
  - `parseEscapedCss()`: Decode JSON escape sequences
  - `parseCssToRules()`: Parse CSS into structured rule objects
  - `rulesToCss()`: Convert rule objects back to CSS
  - `escapeForJson()`: Encode CSS for JSON storage
  - `generateId()`: Create unique identifiers

## 🔧 Development

### Adding New Features

1. **Create feature directory** under `src/features/`
2. **Add components** in the feature's components directory
3. **Create composables** for reusable logic in `src/shared/composables/`
4. **Add types** to `src/lib/types/`
5. **Export** through index files for clean imports

### Code Style Guidelines

- Use **TypeScript** for all new code
- Follow **Vue 3 Composition API** patterns
- Implement **comprehensive error handling**
- Add **JSDoc comments** for public APIs
- Use **semantic HTML** and proper accessibility attributes

### Testing Considerations

- Test auto-save functionality across different browsers
- Verify localStorage behavior in private browsing mode
- Test responsive design on various screen sizes
- Validate CSS parsing with edge cases and malformed input

## 🔒 Security & Privacy

- **No external dependencies** for core functionality
- **Local storage only** - no data sent to external servers
- **CSP compatible** - follows content security policy best practices
- **XSS protection** - all user input is properly sanitized

## 🐛 Troubleshooting

### Common Issues

#### Auto-save not working
- Check if localStorage is available in your browser
- Verify you're not in private/incognito mode
- Check storage quota in browser settings

#### CSS parsing errors
- Ensure proper JSON escaping (`\"` for quotes, `\\r\\n` for line breaks)
- Validate JSON format using a JSON validator
- Check for unclosed CSS rules or declarations

#### Search not finding results
- Check that your search query matches the exact text in selectors, properties, or values
- Try using partial matches instead of complete words
- Clear any active filters that might be hiding matching rules
- Use the "Clear Filters" button to reset all search and filter criteria

#### Performance issues
- Clear localStorage data if it becomes too large
- Check browser console for error messages
- Ensure you're using a modern browser with ES6+ support
- Large numbers of CSS rules may impact search performance

### Browser Support

- **Chrome/Edge**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 88+

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions, issues, or feature requests:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the architecture documentation for implementation details

---

**Built with ❤️ using Vue 3, TypeScript, and modern web technologies.**