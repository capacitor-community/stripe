import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { publishedWithSameContents } from "./release-package-state.mjs";

const spec = "@example/plugin@8.4.0";
const payload = "the same package tar contents ".repeat(100);
const archive = gzipSync(payload, { level: 1 });
const compressed = gzipSync(payload, { level: 9 });
const integrity = (bytes) =>
  "sha512-" + createHash("sha512").update(bytes).digest("base64");
const manifest = {
  name: "@example/plugin",
  version: "8.4.0",
  dist: {
    integrity: integrity(archive),
    tarball: "https://registry.npmjs.org/plugin.tgz",
  },
  "dist-tags": { latest: "8.4.0" },
};
const result = (value) => ({
  status: 0,
  stdout: JSON.stringify(value),
  stderr: "",
});
const check = (value, fetcher) =>
  publishedWithSameContents(value, spec, archive, "latest", fetcher);
const response = (bytes) => async () => ({
  ok: true,
  arrayBuffer: async () => bytes,
});

test("skips an identical published version with the requested tag", async () => {
  assert.equal(await check(result(manifest)), true);
  assert.equal(await check(result([manifest])), true);
});
test("accepts different gzip encoding only when the full tar contents match", async () => {
  assert.notEqual(integrity(archive), integrity(compressed));
  const remote = {
    ...manifest,
    dist: { ...manifest.dist, integrity: integrity(compressed) },
  };
  assert.equal(await check(result(remote), response(compressed)), true);
});
test("marks an absent version as pending", async () => {
  assert.equal(
    await check({ status: 1, stdout: '{"error":{"code":"E404"}}' }),
    false,
  );
});
test("rejects authentication, network, and malformed metadata errors", async () => {
  for (const code of ["E401", "E403", "ETIMEDOUT"]) {
    await assert.rejects(
      check({ status: 1, stdout: JSON.stringify({ error: { code } }) }),
    );
  }
  await assert.rejects(check({ status: 1, stdout: "not JSON" }));
});
test("rejects changed package identity or contents", async () => {
  await assert.rejects(check(result({ ...manifest, version: "8.4.1" })));
  const changed = gzipSync("different package");
  const remote = {
    ...manifest,
    dist: { ...manifest.dist, integrity: integrity(changed) },
  };
  await assert.rejects(check(result(remote), response(changed)));
});
test("verifies downloaded integrity and restricts tarballs to the npm registry", async () => {
  const remote = {
    ...manifest,
    dist: { ...manifest.dist, integrity: integrity(compressed) },
  };
  await assert.rejects(check(result(remote), response(archive)));
  await assert.rejects(
    check(
      result({
        ...remote,
        dist: { ...remote.dist, tarball: "https://other.example/a.tgz" },
      }),
    ),
  );
  await assert.rejects(check(result(remote), async () => ({ ok: false })));
});
test("does not silently move latest back from a newer version", async () => {
  await assert.rejects(
    check(result({ ...manifest, "dist-tags": { latest: "8.5.0" } })),
  );
});
