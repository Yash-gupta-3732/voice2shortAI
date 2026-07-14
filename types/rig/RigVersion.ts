/**
 * @file RigVersion.ts
 * @description Rig version specification and backward compatibility contract.
 *
 * Every rig, animation clip, and asset declares the rig version it was authored for.
 * The compatibility matrix defines which older asset versions work with newer rigs.
 */

export interface RigVersion {
  /** Semver string: 'MAJOR.MINOR.PATCH' */
  version: string;
  /** Release date */
  releasedAt: string;
  /** Human-readable change summary */
  changelog: string;
  /**
   * Minimum asset version that is compatible with this rig.
   * Assets older than this must be migrated or rejected.
   */
  minimumAssetVersion: string;
  /**
   * Whether this rig is backward-compatible with the previous major version.
   * Breaking: new required bones added; Non-breaking: constraint changes only.
   */
  breakingChange: boolean;
  /** Deprecation notice (if this rig version is being retired) */
  deprecatedAt?: string;
}

/** The authoritative rig version history */
export const RIG_VERSION_HISTORY: RigVersion[] = [
  {
    version: '1.0.0',
    releasedAt: '2026-07-12',
    changelog: 'Initial Universal Stickman Rig. 24 bones, 13 attachment sockets, full constraint table.',
    minimumAssetVersion: '1.0.0',
    breakingChange: false,
  },
  // Future versions are appended here. Example:
  // {
  //   version: '2.0.0',
  //   releasedAt: '2027-01-01',
  //   changelog: 'Added finger bones for detailed hand animation.',
  //   minimumAssetVersion: '1.0.0',
  //   breakingChange: false, // existing assets still work; fingers default to rest
  // },
];

/** The currently active rig version */
export const CURRENT_RIG_VERSION = '1.0.0';

// ─── Asset Compatibility Declaration ─────────────────────────────────────────

/**
 * Every animation asset must embed this block.
 * The RigValidator uses it to accept or reject assets at load time.
 */
export interface AssetRigCompatibility {
  /** Rig version this asset was authored for */
  authoredForRigVersion: string;
  /** Minimum rig version required to play this asset */
  minimumRigVersion: string;
  /** Maximum rig version tested (open-ended if undefined) */
  maximumRigVersion?: string;
  /** Explicit list of bones this asset requires (validator checks they exist) */
  requiredBones: string[];
  /** Attachment sockets used */
  requiredSockets: string[];
}
