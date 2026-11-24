export function flatten(o: any, p = '', r: Record<string, any> = {}) {
  for (const k in o) {
    const v = o[k], q = p ? p + '.' + k : k
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, q, r)
    else r[q] = v
  }
  return r
}
