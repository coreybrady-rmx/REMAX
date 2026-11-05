import assert from "node:assert/strict";
import test from "node:test";
import { publicPath, sessionCookiePath } from "./public-path.ts";

const mounted = "/peaks-home-builders-investor-portal";

test("session cookie path is the mounted portal path", () => {
  assert.equal(sessionCookiePath(undefined), "/");
  assert.equal(sessionCookiePath(""), "/");
  assert.equal(sessionCookiePath(mounted), mounted);
  assert.equal(sessionCookiePath(`${mounted}/`), mounted);
});

test("private file URLs stay under the mounted portal", () => {
  assert.equal(publicPath("/api/documents/abc", undefined), "/api/documents/abc");
  assert.equal(publicPath("/api/documents/abc", mounted), `${mounted}/api/documents/abc`);
  assert.equal(publicPath("/api/media/abc", `${mounted}/`), `${mounted}/api/media/abc`);
  assert.equal(publicPath(`${mounted}/brand/logo-light.png`, mounted), `${mounted}/brand/logo-light.png`);
});
