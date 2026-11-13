import {
  validateWikiStandardFrontmatter,
  type FrontmatterValidationResult as ContractFrontmatterValidationResult,
  type WikiStandardFrontmatter,
} from '@sergeylc/knowledge-vault-contract';

/**
 * Result of frontmatter validation against the shared wiki-standard contract.
 */
export type FrontmatterValidationResult = ContractFrontmatterValidationResult;

/**
 * Validate a frontmatter object via `@sergeylc/knowledge-vault-contract`.
 *
 * Producers call this before writing so notes satisfy
 * `validateWikiStandardFrontmatter` (and the portable vault minimum).
 */
export class FrontmatterValidator {
  static validate(
    frontmatter: Record<string, unknown>,
  ): FrontmatterValidationResult {
    return validateWikiStandardFrontmatter(
      frontmatter as Partial<WikiStandardFrontmatter>,
    );
  }

  /**
   * Parse a simple YAML frontmatter string into a Record.
   * Handles flow arrays like [a, b] and [] correctly.
   */
  static parseSimpleYaml(yaml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = yaml.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const key = line.slice(0, colonIdx).trim();
      let rawValue = line.slice(colonIdx + 1).trim();

      // Parse YAML flow arrays: [a, b, c] or []
      if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
        const inner = rawValue.slice(1, -1).trim();
        if (inner.length === 0) {
          result[key] = [];
        } else {
          result[key] = inner.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
        continue;
      }

      // Parse YAML block lists: key with empty value followed by indented - items
      if (rawValue === '' || rawValue === '|' || rawValue === '>') {
        // Check if next lines are indented list items (starting with "  -")
        const items: string[] = [];
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];
          const itemMatch = nextLine.match(/^\s+-\s+(.+)/);
          if (itemMatch) {
            items.push(itemMatch[1].trim().replace(/^["']|["']$/g, ''));
            j++;
          } else {
            break;
          }
        }
        if (items.length > 0) {
          result[key] = items;
          i = j - 1; // skip consumed lines
          continue;
        }
        // Empty scalar — still set it
        result[key] = '';
        continue;
      }

      // Scalar values: strip quotes
      let value: unknown = rawValue.replace(/^["']|["']$/g, '');
      if (/^\d+$/.test(value as string)) value = Number(value);
      if ((value as string).toLowerCase() === 'true') value = true;
      if ((value as string).toLowerCase() === 'false') value = false;

      result[key] = value;
    }

    return result;
  }
}
