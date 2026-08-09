import { getAppMadreBaseUrl } from './secureLaunchSession';

export const SPECIAL_EVENT_REACTIONS = [{ type: 'like', emoji: '👍', label: 'Me gusta' }, { type: 'love', emoji: '❤️', label: 'Me encanta' }, { type: 'heart_eyes', emoji: '😍', label: 'Enamorado' }, { type: 'party', emoji: '🥳', label: 'Fiesta' }, { type: 'surprise', emoji: '😮', label: 'Sorpresa' }, { type: 'laugh', emoji: '😂', label: 'Risa' }] as const;
export type SpecialEventReactionType = typeof SPECIAL_EVENT_REACTIONS[number]['type'];
export type SpecialEventReactionCounts = Record<SpecialEventReactionType, number>;
export type SpecialEventPhoto = { id: string; imageUrl: string; contributor: { id: string; name: string; message?: string | null }; createdAt: string; status?: 'pending' | 'approved' | 'hidden'; updatedAt?: string; reactions?: SpecialEventReactionCounts; activeReactions?: SpecialEventReactionType[] };
export class SpecialEventApiError extends Error { constructor(public code: string, public status = 0) { super(code); } }
const base = () => getAppMadreBaseUrl().replace(/\/$/, '');
const error = async (response: Response) => { const body = await response.json().catch(() => ({})); throw new SpecialEventApiError(body?.error || 'SPECIAL_EVENT_UNAVAILABLE', response.status); };
const path = (slug: string, suffix = '') => `${base()}/api/public/special-events/${encodeURIComponent(slug)}${suffix}`;

export const specialEventApi = {
  async getEvent(slug: string) { const r = await fetch(path(slug)); if (!r.ok) await error(r); return (await r.json()).event; },
  async getPhotos(slug: string, actorId?: string, signal?: AbortSignal): Promise<SpecialEventPhoto[]> { const suffix = `/photos${actorId ? `?actorId=${encodeURIComponent(actorId)}` : ''}`; const r = await fetch(path(slug, suffix), { signal }); if (!r.ok) await error(r); return (await r.json()).photos || []; },
  async toggleReaction(slug: string, photoId: string, reaction: SpecialEventReactionType, actorId: string) { const r = await fetch(path(slug, `/photos/${encodeURIComponent(photoId)}/reactions`), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reaction, actorId }) }); if (!r.ok) await error(r); return await r.json() as { active: boolean; reactions: SpecialEventReactionCounts; activeReactions: SpecialEventReactionType[] }; },
  uploadPhotos(slug: string, input: { name: string; message?: string; files: File[]; onProgress?: (value: number) => void }) {
    return new Promise<any>((resolve, reject) => {
      const form = new FormData(); form.set('name', input.name); if (input.message) form.set('message', input.message); input.files.forEach((file) => form.append('photos', file));
      const xhr = new XMLHttpRequest(); xhr.open('POST', path(slug, '/photos'));
      xhr.upload.onprogress = (event) => { if (event.lengthComputable) input.onProgress?.(Math.round((event.loaded / event.total) * 100)); };
      xhr.onerror = () => reject(new SpecialEventApiError('SPECIAL_EVENT_NETWORK_ERROR'));
      xhr.onload = () => { let body: any = {}; try { body = JSON.parse(xhr.responseText); } catch {} if (xhr.status < 200 || xhr.status >= 300 || !body.success) reject(new SpecialEventApiError(body.error || 'SPECIAL_EVENT_UPLOAD_FAILED', xhr.status)); else resolve(body); };
      xhr.send(form);
    });
  },
  async moderationPhotos(slug: string, token: string, status: 'pending' | 'approved' | 'hidden') { const r = await fetch(path(slug, `/moderation/photos?status=${status}`), { headers: { 'X-Special-Event-Moderation-Token': token } }); if (!r.ok) await error(r); return (await r.json()).photos as SpecialEventPhoto[]; },
  async moderate(slug: string, token: string, photoIds: string[], status: 'approved' | 'hidden') { const r = await fetch(path(slug, '/moderation/photos'), { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-Special-Event-Moderation-Token': token }, body: JSON.stringify({ photoIds, status }) }); if (!r.ok) await error(r); return (await r.json()).photos; }
};
