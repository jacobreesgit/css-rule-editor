# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev`
- **Build**: `npm run build` (includes TypeScript compilation)
- **Type checking**: `npm run type-check`
- **Preview build**: `npm run preview`

## Architecture Overview

This is a Vue 3 + TypeScript single-page application that provides a visual editor for CSS rules stored in JSON-escaped format. The application follows a two-step workflow:

1. **Input/Parse**: Users paste JSON-escaped CSS strings, which are decoded and parsed into structured CSS rules
2. **Edit/Export**: Users visually edit the rules and re-export them as JSON-escaped strings

### Core Components

- **CssEditor.vue**: Main container component managing the two-step workflow with step indicators
- **CssRuleEditor.vue**: Individual rule editor component for editing selectors and declarations
- **cssParser.ts**: Core parsing utilities that handle JSON escape sequences (`\r\n`, `\"`) and CSS rule parsing/formatting
- **types.ts**: TypeScript interfaces for CssRule, CssDeclaration, and CssData

### Key Data Flow

1. JSON input is parsed using `parseEscapedCss()` to decode escape sequences
2. Decoded CSS is converted to structured rules using `parseCssToRules()`
3. Rules are edited through reactive Vue components
4. Modified rules are converted back to CSS using `rulesToCss()`
5. Final CSS is re-encoded using `escapeForJson()` for JSON output

### Input Formats Supported

- Complete JSON object: `{ "customCss": "css here" }`
- Property-only format: `"customCss": "css here"`

The application handles common JSON escape sequences including `\r\n`, `\"`, and `\\`.