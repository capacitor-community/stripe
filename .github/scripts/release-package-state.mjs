import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

const integrity = (bytes) =>
  "sha512-" + createHash("sha512").update(bytes).digest("base64");

export async function publishedWithSameContents(
  result,
  spec,
  archive,
  distTag,
  fetchArchive = fetch,
) {
  let manifest;
  try {
    manifest = JSON.parse(result.stdout);
  } catch {
    throw new Error(`Cannot read registry metadata for ${spec}`);
  }
  if (result.status !== 0) {
    assert.equal(
      manifest.error?.code,
      "E404",
      `Cannot check ${spec}: ${result.stderr}`,
    );
    return false;
  }
  if (Array.isArray(manifest)) {
    assert.equal(manifest.length, 1, `Ambiguous registry metadata for ${spec}`);
    [manifest] = manifest;
  }
  assert.equal(
    `${manifest.name}@${manifest.version}`,
    spec,
    "Registry identity mismatch",
  );
  assert.equal(
    manifest["dist-tags"]?.[distTag],
    manifest.version,
    `${spec} is not tagged ${distTag}`,
  );
  if (manifest.dist?.integrity === integrity(archive)) return true;

  // zlib versions can produce different gzip bytes for the identical tar stream.
  const url = new URL(manifest.dist?.tarball);
  assert.equal(
    url.origin,
    "https://registry.npmjs.org",
    "Unexpected tarball registry",
  );
  const response = await fetchArchive(url, { redirect: "error" });
  assert(response.ok, `Cannot download ${spec}`);
  const existing = Buffer.from(await response.arrayBuffer());
  assert.equal(
    integrity(existing),
    manifest.dist.integrity,
    "Registry tarball integrity mismatch",
  );
  const unpack = (bytes) =>
    gunzipSync(bytes, { maxOutputLength: 64 * 1024 * 1024 });
  assert(
    unpack(existing).equals(unpack(archive)),
    `${spec} already exists with different contents`,
  );
  return true;
}
