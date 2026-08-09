import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, MapPin, RefreshCw, Upload, X } from 'lucide-react';
import { SPECIAL_EVENT_REACTIONS, specialEventApi, SpecialEventApiError, type SpecialEventPhoto, type SpecialEventReactionType } from '../../../services/specialEventApi';
import { resolveSpecialEventModerationToken } from '../../../utils/specialEventModerationPath';
import './SpecialEventModule.css';

type ModerationStatus = 'pending' | 'approved' | 'hidden';
type StoryImage = { url: string; alt?: string };
type CarouselMode = 'manual' | 'continuous';
const LIGHTBOX_ZOOM_LEVELS = [1, 1.5, 2, 2.5, 3] as const;
const statuses: ModerationStatus[] = ['approved', 'pending', 'hidden'];
const tabs: Record<ModerationStatus, string> = { approved: 'Mostradas', pending: 'En revisión', hidden: 'Ocultas' };
const value = (settings: Record<string, any>, id: string, fallback: any) => settings[id] ?? fallback;
const key = (moduleId: string, group: string, id: string) => `${moduleId}_${group}_${id}`;
const readableError = (error: unknown) => { const code = error instanceof SpecialEventApiError ? error.code : ''; if (code === 'SPECIAL_EVENT_UPLOAD_RATE_LIMITED') return 'Hemos recibido muchas cargas. Intenta de nuevo en unos minutos.'; if (code === 'SPECIAL_EVENT_NOT_FOUND') return 'Este evento aún no está disponible.'; if (code.startsWith('IMAGE_')) return 'Una de las fotografías no cumple los requisitos.'; return 'No pudimos completar la operación. Intenta nuevamente.'; };
const anonymousReactionActor = () => { if (typeof window === 'undefined') return ''; const stored = window.localStorage.getItem('special_event_actor_id'); if (stored) return stored; const actor = window.crypto?.randomUUID?.() || `00000000-0000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, '0').slice(0, 12)}`; window.localStorage.setItem('special_event_actor_id', actor); return actor; };
const ReactionBar: React.FC<{ photo: SpecialEventPhoto; onToggle: (type: SpecialEventReactionType) => void; pending: Set<string> }> = ({ photo, onToggle, pending }) => <div className="special-event-reactions" onClick={(event) => event.stopPropagation()}>{SPECIAL_EVENT_REACTIONS.map(({ type, emoji, label }) => { const active = photo.activeReactions?.includes(type) || false; const isPending = pending.has(`${photo.id}:${type}`); return <button key={type} type="button" aria-label={label} aria-pressed={active} disabled={isPending} onClick={() => onToggle(type)} className={`special-event-reaction${active ? ' is-active' : ''}`}>{emoji}<span>{Math.max(0, photo.reactions?.[type] || 0)}</span></button>; })}</div>;

const SpecialEventHero: React.FC<{ cover: string; title: string; subtitle: string; showTitle: boolean; showSubtitle: boolean }> = ({ cover, title, subtitle, showTitle, showSubtitle }) => (
  <header className="special-event-hero relative overflow-hidden rounded-3xl text-center">
    <div className="special-event-hero-media flex min-h-[180px] items-center justify-center sm:min-h-[360px]">
      {cover && <img src={cover} alt="Portada del evento" className="h-auto max-h-[55svh] w-full object-contain object-center sm:max-h-[72svh] md:h-[clamp(26rem,62vh,44rem)] md:max-w-full md:w-auto" />}
    </div>
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
      {showTitle && <h1 className="text-4xl font-black text-white drop-shadow">{title}</h1>}
      {showSubtitle && subtitle && <p className="text-white drop-shadow">{subtitle}</p>}
    </div>
  </header>
);

const SpecialEventLightbox: React.FC<{ image: StoryImage; onClose: () => void; onPrevious?: () => void; onNext?: () => void; reactions?: React.ReactNode }> = ({ image, onClose, onPrevious, onNext, reactions }) => {
  const [zoomIndex, setZoomIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const resetView = () => { setZoomIndex(0); if (viewportRef.current) { viewportRef.current.scrollLeft = 0; viewportRef.current.scrollTop = 0; } };
  const close = () => { resetView(); onClose(); };
  const changeImage = (change?: () => void) => { if (!change) return; resetView(); change(); };
  const zoom = LIGHTBOX_ZOOM_LEVELS[zoomIndex];

  useEffect(() => { resetView(); }, [image.url]);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.body.style.overflow = 'hidden'; document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown); };
  }, []);

  return <div className="special-event-lightbox fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={close}><button type="button" aria-label="Cerrar foto ampliada" className="special-event-lightbox-close fixed right-4 top-4 z-[110] rounded-full bg-white/90 p-2 text-slate-900" onClick={(event) => { event.stopPropagation(); close(); }}><X size={20} /></button><div className="special-event-lightbox-controls fixed bottom-4 left-1/2 z-[110] flex -translate-x-1/2 gap-2 rounded-full bg-white/90 p-2 text-slate-900"><button type="button" aria-label="Alejar" disabled={zoomIndex === 0} onClick={(event) => { event.stopPropagation(); setZoomIndex((current) => Math.max(0, current - 1)); }} className="rounded-full px-3 py-1 font-black disabled:opacity-40">−</button><span className="min-w-12 self-center text-center text-sm font-bold">{Math.round(zoom * 100)}%</span><button type="button" aria-label="Acercar" disabled={zoomIndex === LIGHTBOX_ZOOM_LEVELS.length - 1} onClick={(event) => { event.stopPropagation(); setZoomIndex((current) => Math.min(LIGHTBOX_ZOOM_LEVELS.length - 1, current + 1)); }} className="rounded-full px-3 py-1 font-black disabled:opacity-40">+</button></div>{reactions && <div className="fixed bottom-16 left-1/2 z-[110] -translate-x-1/2">{reactions}</div>}{onPrevious && <button type="button" aria-label="Foto anterior" className="fixed left-3 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900" onClick={(event) => { event.stopPropagation(); changeImage(onPrevious); }}><ChevronLeft /></button>}{onNext && <button type="button" aria-label="Foto siguiente" className="fixed right-3 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900" onClick={(event) => { event.stopPropagation(); changeImage(onNext); }}><ChevronRight /></button>}<div ref={viewportRef} className={`special-event-lightbox-viewport${zoom > 1 ? ' is-zoomed' : ''}`} onClick={(event) => event.stopPropagation()}><img src={image.url} alt={image.alt || 'Foto ampliada'} className="special-event-lightbox-image" onClick={close} style={zoom > 1 ? { width: `${zoom * 100}%`, maxWidth: 'none' } : undefined} /></div></div>;
};

const speedToPixelsPerSecond = (speed: number) => 20 + Math.min(10, Math.max(1, speed)) * 12;

const SpecialEventCarousel: React.FC<{ images: StoryImage[]; mode: CarouselMode; speed: number; autoplay: boolean; lightboxOpen: boolean; onOpen: (image: StoryImage) => void }> = ({ images, mode, speed, autoplay, lightboxOpen, onOpen }) => {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cycleWidth, setCycleWidth] = useState(0);
  const cycleRef = useRef<HTMLDivElement>(null);
  const manual = mode !== 'continuous' || reducedMotion;

  useEffect(() => {
    if (!manual || !autoplay || images.length < 2) return;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [autoplay, images.length, manual]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (manual || !cycleRef.current) return;
    const measure = () => setCycleWidth(cycleRef.current?.scrollWidth ?? 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(cycleRef.current);
    return () => observer.disconnect();
  }, [images.length, manual]);

  if (!images.length) return null;
  if (manual) return <div className="mt-4 sm:mt-6"><div className="relative rounded-3xl bg-white p-3 shadow"><button onClick={() => onOpen(images[slide])} className="block w-full"><img src={images[slide]?.url} alt={images[slide]?.alt || 'Historia del evento'} className="h-80 w-full object-contain" /></button><button aria-label="Foto anterior" onClick={() => setSlide((slide - 1 + images.length) % images.length)} className="absolute left-5 top-1/2 rounded-full bg-white p-2 shadow"><ChevronLeft /></button><button aria-label="Foto siguiente" onClick={() => setSlide((slide + 1) % images.length)} className="absolute right-5 top-1/2 rounded-full bg-white p-2 shadow"><ChevronRight /></button></div></div>;

  const duration = Math.max(1, cycleWidth / speedToPixelsPerSecond(speed));
  const interaction = { onPointerEnter: () => setPaused(true), onPointerLeave: () => setPaused(false), onPointerDown: () => setPaused(true), onPointerUp: () => setPaused(false), onPointerCancel: () => setPaused(false) };
  const renderedImages = (cycle: string) => images.map((image, index) => <button key={`${cycle}-${index}-${image.url}`} type="button" className="special-event-carousel-card" onClick={() => onOpen(image)}><img src={image.url} alt={image.alt || 'Historia del evento'} /></button>);
  return <div className="special-event-continuous mt-4 sm:mt-6" {...interaction} aria-label="Carrusel continuo de fotografías"><div className={`special-event-continuous-track${paused || lightboxOpen ? ' is-paused' : ''}`} style={{ '--special-event-duration': `${duration}s` } as React.CSSProperties}><div ref={cycleRef} className="special-event-continuous-cycle">{renderedImages('first')}</div><div className="special-event-continuous-cycle" aria-hidden="true">{renderedImages('second')}</div></div></div>;
};

export const SpecialEventModule: React.FC<{ moduleId: string; settingsValues: Record<string, any> }> = ({ moduleId, settingsValues }) => {
  const renderPublicEventDetails = false;
  const slug = String(value(settingsValues, key(moduleId, 'el_special_event_identity', 'slug'), '')).trim();
  const title = value(settingsValues, key(moduleId, 'el_special_event_cover', 'title'), 'Evento especial');
  const subtitle = value(settingsValues, key(moduleId, 'el_special_event_cover', 'subtitle'), '');
  const story = value(settingsValues, key(moduleId, 'el_special_event_carousel', 'images'), []) as StoryImage[];
  const carouselMode = value(settingsValues, key(moduleId, 'el_special_event_carousel', 'carouselMode'), 'manual') as CarouselMode;
  const carouselSpeed = Number(value(settingsValues, key(moduleId, 'el_special_event_carousel', 'carouselSpeed'), 4));
  const autoplay = value(settingsValues, key(moduleId, 'el_special_event_carousel', 'autoplay'), true);
  const enableReactions = value(settingsValues, key(moduleId, 'el_special_event_gallery', 'enableReactions'), true);
  const actorId = useMemo(anonymousReactionActor, []);
  const primary = value(settingsValues, key(moduleId, 'el_special_event_cover', 'primary_color'), '#D99AAA'); const bg = value(settingsValues, key(moduleId, 'el_special_event_cover', 'background_color'), '#FFF9F5'); const text = value(settingsValues, key(moduleId, 'el_special_event_cover', 'text_color'), '#4B3440');
  const token = typeof window !== 'undefined' ? resolveSpecialEventModerationToken(window.location.pathname, window.location.search) : '';
  const [photos, setPhotos] = useState<SpecialEventPhoto[]>([]); const [filter, setFilter] = useState('all'); const [selected, setSelected] = useState<number | null>(null); const [storyLightbox, setStoryLightbox] = useState<StoryImage | null>(null);
  const [pendingReactions, setPendingReactions] = useState<Set<string>>(() => new Set());
  const [files, setFiles] = useState<File[]>([]); const [name, setName] = useState(''); const [message, setMessage] = useState(''); const [uploading, setUploading] = useState(false); const [progress, setProgress] = useState(0); const [notice, setNotice] = useState(''); const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<ModerationStatus>('approved'); const [byStatus, setByStatus] = useState<Record<ModerationStatus, SpecialEventPhoto[]>>({ pending: [], approved: [], hidden: [] }); const [moderationError, setModerationError] = useState(''); const [movingId, setMovingId] = useState('');
  const loadGallery = async (signal?: AbortSignal) => { if (slug) try { setPhotos(await specialEventApi.getPhotos(slug, enableReactions ? actorId : '', signal)); } catch {} };
  useEffect(() => { const controller = new AbortController(); void loadGallery(controller.signal); const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void loadGallery(); }, 30000); return () => { controller.abort(); window.clearInterval(timer); }; }, [slug, enableReactions, actorId]);
  const loadModeration = async () => { if (!slug || !token) return; setModerationError(''); try { const lists = await Promise.all(statuses.map((status) => specialEventApi.moderationPhotos(slug, token, status))); setByStatus({ approved: lists[0], pending: lists[1], hidden: lists[2] }); } catch (error) { setModerationError(readableError(error)); } };
  useEffect(() => { if (token) void loadModeration(); }, [token, slug]);
  const move = async (photo: SpecialEventPhoto, next: 'approved' | 'hidden') => { setMovingId(photo.id); setModerationError(''); try { await specialEventApi.moderate(slug, token, [photo.id], next); setByStatus((current) => ({ ...current, [tab]: current[tab].filter((item) => item.id !== photo.id), [next]: [...current[next].filter((item) => item.id !== photo.id), { ...photo, status: next }] })); } catch (error) { setModerationError(readableError(error)); } finally { setMovingId(''); } };
  const contributors = useMemo(() => Array.from(new Map(photos.map((photo) => [photo.contributor.id, photo.contributor])).values()), [photos]); const filtered = filter === 'all' ? photos : photos.filter((photo) => photo.contributor.id === filter);
  const pickFiles = (list: FileList | null) => { const next = Array.from(list || []); if (next.length + files.length > 10) return setNotice('Puedes seleccionar un máximo de 10 fotografías.'); if (next.some((file) => !['image/jpeg', 'image/png'].includes(file.type) || file.size > 15 * 1024 * 1024)) return setNotice('Usa únicamente JPEG o PNG de hasta 15 MB.'); setFiles((current) => [...current, ...next]); };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || !files.length) return setNotice('Indica tu nombre y selecciona al menos una fotografía.'); setUploading(true); try { await specialEventApi.uploadPhotos(slug, { name: name.trim(), message: message.trim(), files, onProgress: setProgress }); setFiles([]); setName(''); setMessage(''); setNotice('¡Gracias por compartir estos recuerdos!'); void loadGallery(); } catch (error) { setNotice(readableError(error)); } finally { setUploading(false); } };
  const toggleReaction = async (photoId: string, type: SpecialEventReactionType) => { if (!enableReactions) return; const requestKey = `${photoId}:${type}`; if (pendingReactions.has(requestKey)) return; const previous = photos.find((photo) => photo.id === photoId); if (!previous) return; const active = !(previous.activeReactions || []).includes(type); setPendingReactions((current) => new Set(current).add(requestKey)); setPhotos((current) => current.map((photo) => photo.id !== photoId ? photo : { ...photo, reactions: { ...photo.reactions, [type]: Math.max(0, (photo.reactions?.[type] || 0) + (active ? 1 : -1)) } as any, activeReactions: active ? [...(photo.activeReactions || []), type] : (photo.activeReactions || []).filter((item) => item !== type) })); try { const result = await specialEventApi.toggleReaction(slug, photoId, type, actorId); setPhotos((current) => current.map((photo) => photo.id === photoId ? { ...photo, reactions: result.reactions, activeReactions: result.activeReactions } : photo)); } catch { setPhotos((current) => current.map((photo) => photo.id === photoId ? previous : photo)); setNotice('No pudimos guardar tu reacción. Intenta nuevamente.'); } finally { setPendingReactions((current) => { const next = new Set(current); next.delete(requestKey); return next; }); } };
  if (token) return <section className="min-h-screen p-4 sm:p-8" style={{ background: bg, color: text }}><div className="mx-auto max-w-3xl"><h1 className="text-3xl font-black">{title}</h1><p className="mb-4">Moderación de fotografías</p><div className="mb-4 flex flex-wrap gap-2">{statuses.map((status) => <button key={status} onClick={() => setTab(status)} className="rounded-full px-4 py-2 font-semibold" style={{ background: tab === status ? primary : '#fff' }}>{tabs[status]} ({byStatus[status].length})</button>)}<button onClick={() => void loadModeration()} className="ml-auto rounded-full bg-white p-2" aria-label="Actualizar"><RefreshCw size={18}/></button></div>{moderationError && <p className="mb-4 rounded-xl bg-rose-100 p-3 text-rose-700">{moderationError}</p>}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{byStatus[tab].map((photo) => <article key={photo.id} className="overflow-hidden rounded-2xl bg-white shadow"><img src={photo.imageUrl} alt={`Foto de ${photo.contributor.name}`} className="h-48 w-full bg-slate-100 object-contain" /><div className="p-3"><p className="font-semibold">{photo.contributor.name}</p>{photo.contributor.message && <p className="mt-1 text-sm italic text-slate-600">{photo.contributor.message}</p>}<div className="mt-3 flex gap-2">{tab !== 'approved' && <button disabled={movingId === photo.id} onClick={() => void move(photo, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white"><Check size={16} className="mr-1 inline" />Mostrar</button>}{tab !== 'hidden' && <button disabled={movingId === photo.id} onClick={() => void move(photo, 'hidden')} className="rounded-lg bg-slate-700 px-3 py-2 font-semibold text-white"><X size={16} className="mr-1 inline" />Ocultar</button>}</div></div></article>)}</div></div></section>;
  const cover = String(value(settingsValues, key(moduleId, 'el_special_event_cover', 'image'), '')).trim();
  const selectedPhoto = selected !== null ? filtered[selected] : null;
  const activeImage = storyLightbox || (selectedPhoto ? { url: selectedPhoto.imageUrl, alt: `Foto de ${selectedPhoto.contributor.name}` } : null);
  const closeLightbox = () => { setSelected(null); setStoryLightbox(null); };
  const selectGalleryPhoto = (direction: -1 | 1) => setSelected((current) => current === null ? null : (current + direction + filtered.length) % filtered.length);
  return <section className="@container special-event-module" style={{ background: 'transparent', color: text }}><div className="mx-auto max-w-5xl px-4 py-2 sm:py-6"><SpecialEventHero cover={cover} title={title} subtitle={subtitle} showTitle={value(settingsValues, key(moduleId, 'el_special_event_cover', 'show_title'), true)} showSubtitle={value(settingsValues, key(moduleId, 'el_special_event_cover', 'show_subtitle'), true)} /><SpecialEventCarousel images={story} mode={carouselMode} speed={carouselSpeed} autoplay={autoplay} lightboxOpen={Boolean(activeImage?.url)} onOpen={setStoryLightbox} /><div className="mt-8">{renderPublicEventDetails && <div><MapPin /></div>}<form onSubmit={submit} className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow"><h2 className="text-2xl font-black">{value(settingsValues, key(moduleId, 'el_special_event_upload', 'heading'), 'Comparte tus recuerdos')}</h2><input className="mt-3 w-full rounded-xl border p-3" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /><textarea className="mt-3 w-full rounded-xl border p-3" placeholder="Mensaje opcional" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} /><input ref={fileRef} className="hidden" type="file" accept="image/jpeg,image/png" multiple onChange={(e) => pickFiles(e.target.files)} /><button type="button" onClick={() => fileRef.current?.click()} className="mt-3 flex w-full justify-center gap-2 rounded-xl border-2 border-dashed p-4"><Upload size={18} />Seleccionar fotos ({files.length}/10)</button>{uploading && <div className="mt-3 h-2 overflow-hidden rounded bg-slate-100"><div className="h-full" style={{ width: `${progress}%`, background: primary }} /></div>}<button disabled={uploading || !slug} className="mt-4 w-full rounded-xl p-4 font-black text-white disabled:opacity-50" style={{ background: primary }}>{uploading ? `Subiendo ${progress}%` : 'Enviar fotografías'}</button>{notice && <p className="mt-3 text-sm">{notice}</p>}</form></div><div className="mt-8"><div className="mb-4 flex gap-2 overflow-x-auto"><button onClick={() => setFilter('all')} className="rounded-full bg-white px-4 py-2">Todos</button>{contributors.map((contributor) => <button key={contributor.id} onClick={() => setFilter(contributor.id)} className="rounded-full bg-white px-4 py-2">{contributor.name}</button>)}</div><div className="columns-2 gap-3 sm:columns-3">{filtered.map((photo, index) => <article key={photo.id} className="mb-3 break-inside-avoid rounded-2xl bg-white p-2 text-left shadow"><button type="button" onClick={() => setSelected(index)} className="block w-full"><img src={photo.imageUrl} alt={`Foto de ${photo.contributor.name}`} className="w-full object-contain" /></button><span className="block px-2 pt-2 text-sm font-semibold">{photo.contributor.name}</span>{photo.contributor.message && <span className="block px-2 pb-2 pt-1 text-xs italic text-slate-600">{photo.contributor.message}</span>}{enableReactions && <ReactionBar photo={photo} onToggle={(type) => void toggleReaction(photo.id, type)} pending={pendingReactions} />}</article>)}</div></div>{activeImage?.url && <SpecialEventLightbox image={activeImage} onClose={closeLightbox} onPrevious={selected !== null && filtered.length > 1 ? () => selectGalleryPhoto(-1) : undefined} onNext={selected !== null && filtered.length > 1 ? () => selectGalleryPhoto(1) : undefined} reactions={enableReactions && selectedPhoto ? <ReactionBar photo={selectedPhoto} onToggle={(type) => void toggleReaction(selectedPhoto.id, type)} pending={pendingReactions} /> : undefined} />}</div></section>;
};
