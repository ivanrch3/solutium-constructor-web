import { EditorState } from '../types/constructor';

const SNAPSHOT_VERSION = 1;
const SNAPSHOT_PREFIX = 'solutium_constructor_local_draft_snapshot';
const MAX_SNAPSHOT_BYTES = 4 * 1024 * 1024;

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
}

const isBrowserStorageAvailable = () => (
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
);

const normalizeKeyPart = (value?: string | null) => (
  String(value || 'unknown').trim() || 'unknown'
);

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

  try {
    const serialized = JSON.stringify(snapshot);
    const sizeBytes = new Blob([serialized]).size;
    if (sizeBytes > MAX_SNAPSHOT_BYTES) {
      return {
        saved: false,
        snapshot,
        sizeBytes,
        error: `Snapshot exceeds localStorage safety limit (${sizeBytes} bytes).`
      };
    }

    window.localStorage.setItem(key, serialized);
    return { saved: true, snapshot, sizeBytes };
  } catch (error: any) {
    return {
      saved: false,
      snapshot,
      error: error?.message || 'Unable to save local draft snapshot.'
    };
  }
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
