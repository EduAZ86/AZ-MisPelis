export function base64Decode(input: string): string {
  try {
    return decodeURIComponent(escape(atob(input)));
  } catch {
    return "";
  }
}

export function base64Encode(input: string): string {
  try {
    return btoa(unescape(encodeURIComponent(input)));
  } catch {
    return "";
  }
}

export function base64ToBytes(input: string): Uint8Array {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}