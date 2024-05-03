import type NanoidLib from 'nanoid';

let _lib: typeof NanoidLib;

/**
 * Wrapper to import the ESM module into this project
 *
 */
export async function nanoid(size?: number) {
  // Load library
  if (!_lib) {
    _lib = await import('nanoid');
  }

  // Create ID
  return _lib.nanoid(size);
}
