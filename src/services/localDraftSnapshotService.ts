import { EditorState } from '../types/constructor';

const SNAPSHOT_VERSION = 1;
export const SNAPSHOT_PREFIX = 'solutium_constructor_local_draft_snapshot';
const MAX_SNAPSHOT_BYTES = 4 * 1024 * 1024;
const DATA_URL_PREFIX = 'data:';
const INLINE_SVG_PREFIX = '<svg';
const MAX_PRESERVED_STRING_LENGTH = 32 * 1024;
const SNAPSHOT_PRUNE_KEEP_MOST_RECENT = 2;

export interface LocalDraftSnapshotIdentity {
  projectId?: string | null;
  siteId?: string | null;
  pageId?: string | null;
}

export interface LocalDraftSnapshot {
  version: number;
  projectId: string;
  siteId: string;
  pageId?: string | null;
  updatedAt: string;
  siteName: string;
  currentStatus?: 'draft' | 'published' | 'modified';
  editorState: EditorState;
}

export interface LocalDraftSnapshotSaveResult {
  saved: boolean;
  snapshot?: LocalDraftSnapshot;
  error?: string;
  sizeBytes?: number;
  degraded?: boolean;
  cleanupRemoved?: number;
}

const isBrowserStorageAvailable = () => (
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
);

const normalizeKeyPart = (value?: string | null) => (
  String(value || 'unknown').trim() || 'unknown'
);

const isQuotaExceededError = (error: any) => {
  const message = String(error?.message || '');
  return (
    error?.name === 'QuotaExceededError' ||
    message.includes('QuotaExceededError') ||
    message.includes('exceeded the quota')
  );
};

const getSerializedSizeBytes = (value: unknown) => {
  const serialized = JSON.stringify(value);
  return {
    serialized,
    sizeBytes: new Blob([serialized]).size
  };
};

const isLikelyHeavyInlineAsset = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length <= MAX_PRESERVED_STRING_LENGTH) return false;
  return (
    trimmed.startsWith(DATA_URL_PREFIX) ||
    trimmed.startsWith(INLINE_SVG_PREFIX) ||
    trimmed.includes('base64,')
  );
};

const compactSnapshotValue = (value: any): any => {
  if (typeof value === 'string') {
    return isLikelyHeavyInlineAsset(value) ? '' : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => compactSnapshotValue(item));
  }

  if (value && typeof value === 'object') {
    if (
      typeof File !== 'undefined' && value instanceof File
    ) {
      return {
        name: value.name,
        type: value.type,
        size: value.size
      };
    }

    return Object.entries(value).reduce<Record<string, any>>((acc, [key, entryValue]) => {
      if (key === '__referenceDebug' || key === 'referenceDebug') {
        return acc;
      }

      acc[key] = compactSnapshotValue(entryValue);
      return acc;
    }, {});
  }

  return value;
};

const createCompactEditorState = (editorState: EditorState): EditorState => ({
  ...editorState,
  settingsValues: compactSnapshotValue(editorState.settingsValues) || {}
});

const listSnapshotKeys = () => {
  if (!isBrowserStorageAvailable()) return [] as string[];

  const keys: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(`${SNAPSHOT_PREFIX}:`)) {
      keys.push(key);
    }
  }
  return keys;
};

const readSnapshotUpdatedAt = (key: string) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as LocalDraftSnapshot;
    const timestamp = Date.parse(parsed?.updatedAt || '');
    return Number.isFinite(timestamp) ? timestamp : 0;
  } catch {
    return 0;
  }
};

export const pruneStoredLocalDraftSnapshots = (
  keepKey?: string | null,
  keepMostRecent: number = SNAPSHOT_PRUNE_KEEP_MOST_RECENT
) => {
  if (!isBrowserStorageAvailable()) return 0;

  const keys = listSnapshotKeys();
  const removableKeys = keys
    .filter((key) => key !== keepKey)
    .sort((a, b) => readSnapshotUpdatedAt(a) - readSnapshotUpdatedAt(b));

  const keysToRemove = removableKeys.slice(0, Math.max(0, removableKeys.length - keepMostRecent));
  let removed = 0;

  keysToRemove.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
      removed += 1;
    } catch {
      // Best effort cleanup only.
    }
  });

  return removed;
};

export const buildLocalDraftSnapshotKey = ({
  projectId,
  siteId,
  pageId
}: LocalDraftSnapshotIdentity): string | null => {
  if (!projectId || !siteId) return null;
  return [
    SNAPSHOT_PREFIX,
    normalizeKeyPart(projectId),
    normalizeKeyPart(siteId),
    normalizeKeyPart(pageId || 'page')
  ].join(':');
};

const isUsableEditorState = (editorState: EditorState | null | undefined) => (
  Boolean(
    editorState &&
    Array.isArray(editorState.addedModules) &&
    editorState.settingsValues &&
    typeof editorState.settingsValues === 'object'
  )
);

export const createLocalDraftSnapshot = ({
  projectId,
  siteId,
  pageId,
  siteName,
  currentStatus,
  editorState
}: LocalDraftSnapshotIdentity & {
  siteName?: string | null;
  currentStatus?: 'draft' | 'published' | 'modified';
  editorState: EditorState;
}): LocalDraftSnapshot | null => {
  if (!projectId || !siteId || !isUsableEditorState(editorState)) return null;

  return {
    version: SNAPSHOT_VERSION,
    projectId,
    siteId,
    pageId: pageId || null,
    updatedAt: new Date().toISOString(),
    siteName: siteName || '',
    currentStatus,
    editorState
  };
};

export const saveLocalDraftSnapshot = (
  identity: LocalDraftSnapshotIdentity,
  data: {
    siteName?: string | null;
    currentStatus?: 'draft' | 'published' | 'modified';
    editorState: EditorState;
  }
): LocalDraftSnapshotSaveResult => {
  if (!isBrowserStorageAvailable()) {
    return { saved: false, error: 'localStorage is not available.' };
  }

  const key = buildLocalDraftSnapshotKey(identity);
  const snapshot = createLocalDraftSnapshot({ ...identity, ...data });

  if (!key || !snapshot) {
    return { saved: false, error: 'Snapshot identity or editor state is incomplete.' };
  }

  const attemptPersist = (candidateSnapshot: LocalDraftSnapshot, degraded: boolean, cleanupRemoved: number) => {
    try {
      const { serialized, sizeBytes } = getSerializedSizeBytes(candidateSnapshot);
      if (sizeBytes > MAX_SNAPSHOT_BYTES) {
        return {
          saved: false,
          snapshot: candidateSnapshot,
          sizeBytes,
          degraded,
          cleanupRemoved,
          error: `Snapshot exceeds localStorage safety limit (${sizeBytes} bytes).`
        } satisfies LocalDraftSnapshotSaveResult;
      }

      window.localStorage.setItem(key, serialized);
      return {
        saved: true,
        snapshot: candidateSnapshot,
        sizeBytes,
        degraded,
        cleanupRemoved
      } satisfies LocalDraftSnapshotSaveResult;
    } catch (error: any) {
      return {
        saved: false,
        snapshot: candidateSnapshot,
        sizeBytes: undefined,
        degraded,
        cleanupRemoved,
        error: error?.message || 'Unable to save local draft snapshot.'
      } satisfies LocalDraftSnapshotSaveResult;
    }
  };

  const initialAttempt = attemptPersist(snapshot, false, 0);
  if (initialAttempt.saved) return initialAttempt;

  let cleanupRemoved = 0;
  if (isQuotaExceededError(initialAttempt.error)) {
    cleanupRemoved = pruneStoredLocalDraftSnapshots(key);
    const retryAfterCleanup = attemptPersist(snapshot, false, cleanupRemoved);
    if (retryAfterCleanup.saved) return retryAfterCleanup;
    if (!isQuotaExceededError(retryAfterCleanup.error)) return retryAfterCleanup;
  }

  const compactSnapshot = createLocalDraftSnapshot({
    ...identity,
    ...data,
    editorState: createCompactEditorState(data.editorState)
  });

  if (!compactSnapshot) {
    return initialAttempt;
  }

  const compactAttempt = attemptPersist(compactSnapshot, true, cleanupRemoved);
  if (compactAttempt.saved) return compactAttempt;

  if (isQuotaExceededError(compactAttempt.error)) {
    const additionalRemoved = pruneStoredLocalDraftSnapshots(key, 1);
    const finalAttempt = attemptPersist(compactSnapshot, true, cleanupRemoved + additionalRemoved);
    if (finalAttempt.saved) return finalAttempt;
    return finalAttempt;
  }

  return compactAttempt;
};

export const readLocalDraftSnapshot = (
  identity: LocalDraftSnapshotIdentity
): LocalDraftSnapshot | null => {
  if (!isBrowserStorageAvailable()) return null;

  const key = buildLocalDraftSnapshotKey(identity);
  if (!key) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LocalDraftSnapshot;
    if (
      parsed?.version !== SNAPSHOT_VERSION ||
      parsed.projectId !== identity.projectId ||
      parsed.siteId !== identity.siteId ||
      !isUsableEditorState(parsed.editorState) ||
      !parsed.updatedAt
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const removeLocalDraftSnapshot = (identity: LocalDraftSnapshotIdentity): boolean => {
  if (!isBrowserStorageAvailable()) return false;

  const key = buildLocalDraftSnapshotKey(identity);
  if (!key) return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const isLocalDraftSnapshotNewerThan = (
  snapshot: LocalDraftSnapshot | null | undefined,
  savedAt?: string | null
) => {
  if (!snapshot?.updatedAt) return false;
  if (!savedAt) return true;

  const snapshotTime = Date.parse(snapshot.updatedAt);
  const savedTime = Date.parse(savedAt);
  if (!Number.isFinite(snapshotTime)) return false;
  if (!Number.isFinite(savedTime)) return true;

  return snapshotTime > savedTime;
};
