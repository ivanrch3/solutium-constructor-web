import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, MapPin, RefreshCw, Upload, X } from 'lucide-react';
import { specialEventApi, SpecialEventApiError, type SpecialEventPhoto } from '../../../services/specialEventApi';
import { resolveSpecialEventModerationToken } from '../../../utils/specialEventModerationPath';
import './SpecialEventModule.css';

type ModerationStatus = 'pending' | 'approved' | 'hidden';
type StoryImage = { url: string; alt?: string };
type CarouselMode = 'manual' | 'continuous';
type LightboxGesture = { scale: number; translateX: number; translateY: number };
const LIGHTBOX_MIN_SCALE = 1;
const LIGHTBOX_MAX_SCALE = 4;
const LIGHTBOX_TAP_THRESHOLD = 8;
const statuses: ModerationStatus[] = ['approved', 'pending', 'hidden'];
const tabs: Record<ModerationStatus, string> = { approved: 'Mostradas', pending: 'En revisión', hidden: 'Ocultas' };
const value = (settings: Record<string, any>, id: string, fallback: any) => settings[id] ?? fallback;
const key = (moduleId: string, group: string, id: string) => `${moduleId}_${group}_${id}`;
const readableError = (error: unknown) => { const code = error instanceof SpecialEventApiError ? error.code : ''; if (code === 'SPECIAL_EVENT_UPLOAD_RATE_LIMITED') return 'Hemos recibido muchas cargas. Intenta de nuevo en unos minutos.'; if (code === 'SPECIAL_EVENT_NOT_FOUND') return 'Este evento aún no está disponible.'; if (code.startsWith('IMAGE_')) return 'Una de las fotografías no cumple los requisitos.'; return 'No pudimos completar la operación. Intenta nuevamente.'; };
export const resetSpecialEventLightboxGesture = (): LightboxGesture => ({ scale: 1, translateX: 0, translateY: 0 });

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

const SpecialEventLightbox: React.FC<{ image: StoryImage; onClose: () => void }> = ({ image, onClose }) => {
  const [gesture, setGesture] = useState<LightboxGesture>(resetSpecialEventLightboxGesture);
  const imageRef = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ x: number; y: number } | null>(null);
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const tapStart = useRef<{ x: number; y: number } | null>(null);
  const gestureActive = useRef(false);
  const finite = (number: number) => Number.isFinite(number);
  const panLimits = (scale: number) => {
    const width = imageRef.current?.clientWidth ?? 0; const height = imageRef.current?.clientHeight ?? 0;
    const viewportWidth = window.innerWidth || width; const viewportHeight = window.innerHeight || height;
    return { x: Math.max(0, Math.min((width * scale - Math.min(width, viewportWidth)) / 2, viewportWidth * 0.45)), y: Math.max(0, Math.min((height * scale - Math.min(height, viewportHeight)) / 2, viewportHeight * 0.45)) };
  };
  const sanitizeGesture = (next: LightboxGesture): LightboxGesture => {
    if (!finite(next.scale) || !finite(next.translateX) || !finite(next.translateY)) return resetSpecialEventLightboxGesture();
    const scale = Math.min(LIGHTBOX_MAX_SCALE, Math.max(LIGHTBOX_MIN_SCALE, next.scale));
    if (scale <= LIGHTBOX_MIN_SCALE) return resetSpecialEventLightboxGesture();
    const limits = panLimits(scale);
    return { scale, translateX: Math.min(limits.x, Math.max(-limits.x, next.translateX)), translateY: Math.min(limits.y, Math.max(-limits.y, next.translateY)) };
  };
  const clearPointers = () => { pointers.current.clear(); drag.current = null; pinch.current = null; tapStart.current = null; gestureActive.current = false; };
  const resetGesture = () => { clearPointers(); setGesture(resetSpecialEventLightboxGesture()); };
  const close = () => { resetGesture(); onClose(); };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.body.style.overflow = 'hidden'; document.addEventListener('keydown', onKeyDown);
    return () => { clearPointers(); document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown); };
  }, []);

  const distance = () => { const [first, second] = Array.from(pointers.current.values()); return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0; };
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (pointers.current.size === 1) { tapStart.current = { x: event.clientX, y: event.clientY }; drag.current = { x: event.clientX, y: event.clientY }; } if (pointers.current.size === 2) { const initialDistance = distance(); gestureActive.current = true; pinch.current = initialDistance > 0 && finite(initialDistance) ? { distance: initialDistance, scale: gesture.scale } : null; } };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => { if (!pointers.current.has(event.pointerId)) return; event.preventDefault(); pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (tapStart.current && Math.hypot(event.clientX - tapStart.current.x, event.clientY - tapStart.current.y) > LIGHTBOX_TAP_THRESHOLD) gestureActive.current = true; if (pointers.current.size >= 2) { gestureActive.current = true; if (!pinch.current) return; const nextDistance = distance(); if (!finite(nextDistance) || nextDistance <= 0 || !finite(pinch.current.distance) || pinch.current.distance <= 0) { resetGesture(); return; } setGesture((current) => sanitizeGesture({ ...current, scale: pinch.current!.scale * (nextDistance / pinch.current!.distance) })); return; } if (drag.current) { const deltaX = event.clientX - drag.current.x; const deltaY = event.clientY - drag.current.y; drag.current = { x: event.clientX, y: event.clientY }; setGesture((current) => sanitizeGesture({ ...current, translateX: current.translateX + deltaX, translateY: current.translateY + deltaY })); } };
  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => { const isTap = pointers.current.size === 1 && !gestureActive.current && tapStart.current && Math.hypot(event.clientX - tapStart.current.x, event.clientY - tapStart.current.y) <= LIGHTBOX_TAP_THRESHOLD; pointers.current.delete(event.pointerId); pinch.current = null; const remaining = Array.from(pointers.current.values())[0]; drag.current = remaining ? { ...remaining } : null; if (!remaining) { tapStart.current = null; gestureActive.current = false; } if (isTap) close(); };
  const cancelGesture = () => resetGesture();
  const safeGesture = sanitizeGesture(gesture);

  return <div className="special-event-lightbox fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={close}><button type="button" aria-label="Cerrar foto ampliada" className="special-event-lightbox-close fixed right-4 top-4 z-[110] rounded-full bg-white/90 p-2 text-slate-900" onClick={(event) => { event.stopPropagation(); close(); }}><X size={20} /></button><div className="special-event-lightbox-gesture" onClick={(event) => event.stopPropagation()} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPointer} onPointerCancel={cancelGesture} onLostPointerCapture={cancelGesture}><img ref={imageRef} src={image.url} alt={image.alt || 'Foto ampliada'} className="special-event-lightbox-image" style={{ transform: `translate3d(${safeGesture.translateX}px, ${safeGesture.translateY}px, 0) scale(${safeGesture.scale})` }} /></div></div>;
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
  const primary = value(settingsValues, key(moduleId, 'el_special_event_cover', 'primary_color'), '#D99AAA'); const bg = value(settingsValues, key(moduleId, 'el_special_event_cover', 'background_color'), '#FFF9F5'); const text = value(settingsValues, key(moduleId, 'el_special_event_cover', 'text_color'), '#4B3440');
  const token = typeof window !== 'undefined' ? resolveSpecialEventModerationToken(window.location.pathname, window.location.search) : '';
  const [photos, setPhotos] = useState<SpecialEventPhoto[]>([]); const [filter, setFilter] = useState('all'); const [selected, setSelected] = useState<number | null>(null); const [storyLightbox, setStoryLightbox] = useState<StoryImage | null>(null);
  const [files, setFiles] = useState<File[]>([]); const [name, setName] = useState(''); const [message, setMessage] = useState(''); const [uploading, setUploading] = useState(false); const [progress, setProgress] = useState(0); const [notice, setNotice] = useState(''); const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<ModerationStatus>('approved'); const [byStatus, setByStatus] = useState<Record<ModerationStatus, SpecialEventPhoto[]>>({ pending: [], approved: [], hidden: [] }); const [moderationError, setModerationError] = useState(''); const [movingId, setMovingId] = useState('');
  const loadGallery = async (signal?: AbortSignal) => { if (slug) try { setPhotos(await specialEventApi.getPhotos(slug, signal)); } catch {} };
  useEffect(() => { const controller = new AbortController(); void loadGallery(controller.signal); const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void loadGallery(); }, 30000); return () => { controller.abort(); window.clearInterval(timer); }; }, [slug]);
  const loadModeration = async () => { if (!slug || !token) return; setModerationError(''); try { const lists = await Promise.all(statuses.map((status) => specialEventApi.moderationPhotos(slug, token, status))); setByStatus({ approved: lists[0], pending: lists[1], hidden: lists[2] }); } catch (error) { setModerationError(readableError(error)); } };
  useEffect(() => { if (token) void loadModeration(); }, [token, slug]);
  const move = async (photo: SpecialEventPhoto, next: 'approved' | 'hidden') => { setMovingId(photo.id); setModerationError(''); try { await specialEventApi.moderate(slug, token, [photo.id], next); setByStatus((current) => ({ ...current, [tab]: current[tab].filter((item) => item.id !== photo.id), [next]: [...current[next].filter((item) => item.id !== photo.id), { ...photo, status: next }] })); } catch (error) { setModerationError(readableError(error)); } finally { setMovingId(''); } };
  const contributors = useMemo(() => Array.from(new Map(photos.map((photo) => [photo.contributor.id, photo.contributor])).values()), [photos]); const filtered = filter === 'all' ? photos : photos.filter((photo) => photo.contributor.id === filter);
  const pickFiles = (list: FileList | null) => { const next = Array.from(list || []); if (next.length + files.length > 10) return setNotice('Puedes seleccionar un máximo de 10 fotografías.'); if (next.some((file) => !['image/jpeg', 'image/png'].includes(file.type) || file.size > 15 * 1024 * 1024)) return setNotice('Usa únicamente JPEG o PNG de hasta 15 MB.'); setFiles((current) => [...current, ...next]); };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!name.trim() || !files.length) return setNotice('Indica tu nombre y selecciona al menos una fotografía.'); setUploading(true); try { await specialEventApi.uploadPhotos(slug, { name: name.trim(), message: message.trim(), files, onProgress: setProgress }); setFiles([]); setName(''); setMessage(''); setNotice('¡Gracias por compartir estos recuerdos!'); void loadGallery(); } catch (error) { setNotice(readableError(error)); } finally { setUploading(false); } };
  if (token) return <section className="min-h-screen p-4 sm:p-8" style={{ background: bg, color: text }}><div className="mx-auto max-w-3xl"><h1 className="text-3xl font-black">{title}</h1><p className="mb-4">Moderación de fotografías</p><div className="mb-4 flex flex-wrap gap-2">{statuses.map((status) => <button key={status} onClick={() => setTab(status)} className="rounded-full px-4 py-2 font-semibold" style={{ background: tab === status ? primary : '#fff' }}>{tabs[status]} ({byStatus[status].length})</button>)}<button onClick={() => void loadModeration()} className="ml-auto rounded-full bg-white p-2" aria-label="Actualizar"><RefreshCw size={18}/></button></div>{moderationError && <p className="mb-4 rounded-xl bg-rose-100 p-3 text-rose-700">{moderationError}</p>}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{byStatus[tab].map((photo) => <article key={photo.id} className="overflow-hidden rounded-2xl bg-white shadow"><img src={photo.imageUrl} alt={`Foto de ${photo.contributor.name}`} className="h-48 w-full bg-slate-100 object-contain" /><div className="p-3"><p className="font-semibold">{photo.contributor.name}</p>{photo.contributor.message && <p className="mt-1 text-sm italic text-slate-600">{photo.contributor.message}</p>}<div className="mt-3 flex gap-2">{tab !== 'approved' && <button disabled={movingId === photo.id} onClick={() => void move(photo, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white"><Check size={16} className="mr-1 inline" />Mostrar</button>}{tab !== 'hidden' && <button disabled={movingId === photo.id} onClick={() => void move(photo, 'hidden')} className="rounded-lg bg-slate-700 px-3 py-2 font-semibold text-white"><X size={16} className="mr-1 inline" />Ocultar</button>}</div></div></article>)}</div></div></section>;
  const cover = String(value(settingsValues, key(moduleId, 'el_special_event_cover', 'image'), '')).trim();
  const activeImage = storyLightbox || (selected !== null ? { url: filtered[selected]?.imageUrl, alt: `Foto de ${filtered[selected]?.contributor.name}` } : null);
  const closeLightbox = () => { setSelected(null); setStoryLightbox(null); };
  return <section className="@container special-event-module" style={{ background: 'transparent', color: text }}><div className="mx-auto max-w-5xl px-4 py-2 sm:py-6"><SpecialEventHero cover={cover} title={title} subtitle={subtitle} showTitle={value(settingsValues, key(moduleId, 'el_special_event_cover', 'show_title'), true)} showSubtitle={value(settingsValues, key(moduleId, 'el_special_event_cover', 'show_subtitle'), true)} /><SpecialEventCarousel images={story} mode={carouselMode} speed={carouselSpeed} autoplay={autoplay} lightboxOpen={Boolean(activeImage?.url)} onOpen={setStoryLightbox} /><div className="mt-8">{renderPublicEventDetails && <div><MapPin /></div>}<form onSubmit={submit} className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow"><h2 className="text-2xl font-black">{value(settingsValues, key(moduleId, 'el_special_event_upload', 'heading'), 'Comparte tus recuerdos')}</h2><input className="mt-3 w-full rounded-xl border p-3" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /><textarea className="mt-3 w-full rounded-xl border p-3" placeholder="Mensaje opcional" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} /><input ref={fileRef} className="hidden" type="file" accept="image/jpeg,image/png" multiple onChange={(e) => pickFiles(e.target.files)} /><button type="button" onClick={() => fileRef.current?.click()} className="mt-3 flex w-full justify-center gap-2 rounded-xl border-2 border-dashed p-4"><Upload size={18} />Seleccionar fotos ({files.length}/10)</button>{uploading && <div className="mt-3 h-2 overflow-hidden rounded bg-slate-100"><div className="h-full" style={{ width: `${progress}%`, background: primary }} /></div>}<button disabled={uploading || !slug} className="mt-4 w-full rounded-xl p-4 font-black text-white disabled:opacity-50" style={{ background: primary }}>{uploading ? `Subiendo ${progress}%` : 'Enviar fotografías'}</button>{notice && <p className="mt-3 text-sm">{notice}</p>}</form></div><div className="mt-8"><div className="mb-4 flex gap-2 overflow-x-auto"><button onClick={() => setFilter('all')} className="rounded-full bg-white px-4 py-2">Todos</button>{contributors.map((contributor) => <button key={contributor.id} onClick={() => setFilter(contributor.id)} className="rounded-full bg-white px-4 py-2">{contributor.name}</button>)}</div><div className="columns-2 gap-3 sm:columns-3">{filtered.map((photo, index) => <button key={photo.id} onClick={() => setSelected(index)} className="mb-3 block w-full break-inside-avoid rounded-2xl bg-white p-2 text-left shadow"><img src={photo.imageUrl} alt={`Foto de ${photo.contributor.name}`} className="w-full object-contain" /><span className="block px-2 pt-2 text-sm font-semibold">{photo.contributor.name}</span>{photo.contributor.message && <span className="block px-2 pb-2 pt-1 text-xs italic text-slate-600">{photo.contributor.message}</span>}</button>)}</div></div>{activeImage?.url && <SpecialEventLightbox image={activeImage} onClose={closeLightbox} />}</div></section>;
};
