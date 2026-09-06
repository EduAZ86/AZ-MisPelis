import { describe, it, expect } from "vitest";
import { AppError, toAppError, isAppError } from "@core/errors";

describe("AppError", () => {
  it("crea error con código y mensaje", () => {
    const err = new AppError("SOURCE_NOT_FOUND", "no se encontró fuente");
    expect(err.code).toBe("SOURCE_NOT_FOUND");
    expect(err.message).toBe("no se encontró fuente");
    expect(err.name).toBe("AppError");
  });

  it("conserva la causa original", () => {
    const cause = new Error("fallo de red");
    const err = new AppError("NETWORK", "petición falló", cause);
    expect(err.cause).toBe(cause);
  });
});

describe("toAppError", () => {
  it("pasa AppError intacto", () => {
    const original = new AppError("PARSE", "parseo fallido");
    expect(toAppError(original)).toBe(original);
  });

  it("envuelve Error genérico con código por defecto", () => {
    const wrapped = toAppError(new Error("boom"), "NETWORK");
    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.code).toBe("NETWORK");
    expect(wrapped.message).toBe("boom");
  });

  it("envuelve valores no-Error", () => {
    const wrapped = toAppError("algo raro");
    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.message).toBe("algo raro");
  });
});

describe("isAppError", () => {
  it("true para AppError", () => {
    expect(isAppError(new AppError("PARSE", "x"))).toBe(true);
  });

  it("false para Error genérico", () => {
    expect(isAppError(new Error("x"))).toBe(false);
  });
});