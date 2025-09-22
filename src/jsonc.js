/*
  Tools for JSONC files
*/

// cleans a JSONC file
export function clean(jsonc) {
    // remove multi-line comments /* ... */
    return jsonc.replace(/\/\*[\s\S]*?\*\//g, '').trim();
}

