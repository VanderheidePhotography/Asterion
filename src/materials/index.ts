import { useMemo } from 'react';
import { getMaterial, type MaterialId } from './registry';
import type { AnyStandardMaterial, MaterialRequest } from './types';

export {
  configureMaterials,
  disposeMaterials,
  getMaterial,
  getMaterialDef,
  materialStatus,
  primeMaterials,
  MATERIAL_IDS,
  type MaterialId,
} from './registry';
export { PALETTE, LIGHT_BUDGET, type PaletteKey } from './palette';
export type {
  AnyStandardMaterial,
  MapSlot,
  MaterialDef,
  MaterialFamily,
  MaterialParams,
  MaterialRequest,
  UvDef,
} from './types';

/**
 * The React face of the registry.
 *
 * `getMaterial` is already cached, so this hook exists only to stop a fresh
 * request object being built on every render — the cache key is derived from
 * that object, and rebuilding it each frame would defeat the cache entirely.
 */
export function useMaterial(id: MaterialId, req: MaterialRequest = {}): AnyStandardMaterial {
  const { repeat, size, overrides } = req;
  const rx = repeat?.[0];
  const ry = repeat?.[1];
  const sx = size?.[0];
  const sy = size?.[1];
  const ov = overrides ? JSON.stringify(overrides) : '';
  return useMemo(
    () =>
      getMaterial(id, {
        repeat: rx !== undefined && ry !== undefined ? [rx, ry] : undefined,
        size: sx !== undefined && sy !== undefined ? [sx, sy] : undefined,
        overrides: ov ? (JSON.parse(ov) as MaterialRequest['overrides']) : undefined,
      }),
    [id, rx, ry, sx, sy, ov],
  );
}
