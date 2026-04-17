const BASE = 76561197960265728n;

/**
 * Converts any supported Steam ID format to SteamID64.
 * Supported formats:
 *   - SteamID64      : 76561198012345678
 *   - SteamID2       : STEAM_0:1:26034463  /  STEAM_1:1:26034463
 *   - SteamID3       : [U:1:52068927]
 * Returns null if the input doesn't match any known format.
 */
function toSteamId64(input) {
  input = input.trim();

  // SteamID64: 17 digits starting with 765611
  if (/^\d{17}$/.test(input)) return input;

  // SteamID2: STEAM_0:Y:Z or STEAM_1:Y:Z
  const id2 = input.match(/^STEAM_[01]:([01]):(\d+)$/i);
  if (id2) {
    return String(BigInt(id2[2]) * 2n + BigInt(id2[1]) + BASE);
  }

  // SteamID3: [U:1:W]
  const id3 = input.match(/^\[U:1:(\d+)\]$/i);
  if (id3) {
    return String(BigInt(id3[1]) + BASE);
  }

  return null;
}

/** Returns true if the input looks like any supported Steam ID format. */
function isSteamId(input) {
  return toSteamId64(input) !== null;
}

module.exports = { toSteamId64, isSteamId };
