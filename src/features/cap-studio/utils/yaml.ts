import { parse, stringify } from 'yaml';

/**
 * Parse YAML text into a strongly typed object.
 */
export function parseYaml<T = unknown>(text: string): T {
  return parse(text) as T;
}

/**
 * Convert an object into YAML with stable formatting.
 */
export function stringifyYaml(value: unknown): string {
  return stringify(value, {
    lineWidth: 0, // avoid inserting hard line breaks
  });
}
