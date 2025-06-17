// cssParser.ts - Utilities for parsing and formatting CSS

import { CssRule, CssDeclaration } from './types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function parseEscapedCss(escapedCss: string): string {
  // Decode escaped characters
  return escapedCss
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

export function escapeForJson(css: string): string {
  // Escape for JSON format
  return css
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, '\\r\\n')
    .replace(/\n/g, '\\r\\n');
}

export function parseCssToRules(css: string): CssRule[] {
  const rules: CssRule[] = [];
  
  // Remove comments
  const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Match CSS rules (selector { declarations })
  const ruleRegex = /([^{}]+)\s*\{([^}]*)\}/g;
  let match;
  
  while ((match = ruleRegex.exec(cleanCss)) !== null) {
    const selector = match[1].trim();
    const declarationsText = match[2].trim();
    
    if (!selector || !declarationsText) continue;
    
    const declarations: CssDeclaration[] = [];
    
    // Parse declarations
    const declRegex = /([^:]+):\s*([^;]+);?/g;
    let declMatch;
    
    while ((declMatch = declRegex.exec(declarationsText)) !== null) {
      declarations.push({
        property: declMatch[1].trim(),
        value: declMatch[2].trim()
      });
    }
    
    if (declarations.length > 0) {
      rules.push({
        id: generateId(),
        selector,
        declarations
      });
    }
  }
  
  return rules;
}

export function rulesToCss(rules: CssRule[]): string {
  return rules.map(rule => {
    const declarations = rule.declarations
      .map(decl => `  ${decl.property}: ${decl.value};`)
      .join('\n');
    
    return `${rule.selector} {\n${declarations}\n}`;
  }).join('\n\n');
}

export function formatCss(css: string): string {
  // Simple CSS formatter
  const rules = parseCssToRules(css);
  return rulesToCss(rules);
}