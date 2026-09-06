import { describe, it, expect } from "vitest";
import { unpackPacked, grabHls, grabFile } from "@services/mirrors/decoders/packed-js";

describe("unpackPacked", () => {
  it("desempaqueta Dean Edwards packer (radix 10)", () => {
    // p="hola|mundo", packed con tokens base10
    const packed =
      "eval(function(p,a,c,k,e,d){while(c--)if(k[c])p=p.replace(new RegExp('\\\\b'+c.toString(a)+'\\\\b','g'),k[c]);return p}('0 1',2,2,'hola|mundo'.split('|'),0,{}))";
    expect(unpackPacked(packed)).toBe("hola mundo");
  });

  it("devuelve el texto original si no hay packer", () => {
    const plain = "<html><body>sin packer</body></html>";
    expect(unpackPacked(plain)).toBe(plain);
  });
});

describe("grabHls", () => {
  it("extrae m3u8 de JSON hls2/hls3/hls4", () => {
    const text = '{"hls4":"/pl/abc.m3u8"}';
    expect(grabHls(text, "https://host.com")).toBe("https://host.com/pl/abc.m3u8");
  });

  it("prioriza hls4 sobre hls2", () => {
    const text = '{"hls2":"/a.m3u8","hls4":"/b.m3u8"}';
    expect(grabHls(text, "https://h.com")).toBe("https://h.com/b.m3u8");
  });

  it("fallback: m3u8 directo entre comillas", () => {
    const text = 'var s = "https://cdn.ejemplo.com/path/stream.m3u8?token=abc123def456";';
    expect(grabHls(text)).toBe("https://cdn.ejemplo.com/path/stream.m3u8?token=abc123def456");
  });

  it("retorna null si no hay m3u8", () => {
    expect(grabHls("no hay nada aqui")).toBeNull();
  });
});

describe("grabFile", () => {
  it("extrae file directo", () => {
    expect(grabFile("https://h.com/p", 'file: "https://cdn.com/v.m3u8"')).toBe("https://cdn.com/v.m3u8");
  });

  it("resuelve file relativo al origin", () => {
    expect(grabFile("https://h.com/p", "file: '/pl/v.m3u8'")).toBe("https://h.com/pl/v.m3u8");
  });

  it("retorna null si no hay file", () => {
    expect(grabFile("https://h.com", "sin file")).toBeNull();
  });
});