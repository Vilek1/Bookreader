export function createId(prefix: string) {
  const maybeRandomUuid = globalThis.crypto?.randomUUID?.();

  if (maybeRandomUuid) {
    return `${prefix}-${maybeRandomUuid}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}
