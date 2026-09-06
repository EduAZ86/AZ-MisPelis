import { describe, it, expect } from "vitest";
import { base64Decode, base64Encode, base64ToBytes, bytesToBase64 } from "@core/base64";

describe("base64 utils", () => {
  it("decode básico", () => {
    expect(base64Decode("aG9sYQ==")).toBe("hola");
  });

  it("decode inválido retorna vacío", () => {
    expect(base64Decode("!!!no-es-base64!!!")).toBe("");
  });

  it("encode/decode roundtrip", () => {
    const text = "m3u8 ñoño ✓ 12345";
    expect(base64Decode(base64Encode(text))).toBe(text);
  });

  it("bytes roundtrip", () => {
    const original = new Uint8Array([104, 111, 108, 97]); // "hola"
    const encoded = bytesToBase64(original);
    const decoded = base64ToBytes(encoded);
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });
});