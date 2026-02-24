'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { uploadApi } from '@/lib/api/upload.api';
import { storiesApi } from '@/lib/api/stories.api';
import { StoryWithAuthor, TextOverlay, StickerOverlay, STORY_BG_COLORS } from '@/types/stories.types';
import { Camera, Image, Type, Smile, ArrowLeft, Loader2, Plus, Scissors, Palette, Video } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Filter definitions (Instagram-style) ────────────────────────────────────
export const STORY_FILTERS = [
  { key: 'normal',  label: 'Normal', css: 'none' },
  { key: 'pop',     label: 'Pop',    css: 'contrast(1.4) saturate(1.8) brightness(1.05)' },
  { key: 'vivid',   label: 'Vívido', css: 'contrast(1.2) saturate(1.5) brightness(1.05) hue-rotate(5deg)' },
  { key: 'fade',    label: 'Fade',   css: 'contrast(0.88) brightness(1.15) saturate(0.75)' },
  { key: 'aden',    label: 'Aden',   css: 'hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)' },
  { key: 'amaro',   label: 'Amaro',  css: 'hue-rotate(-10deg) contrast(0.9) brightness(1.1) saturate(1.5)' },
  { key: 'rise',    label: 'Rise',   css: 'saturate(1.4) sepia(0.25) hue-rotate(-15deg) contrast(0.8) brightness(1.15)' },
  { key: 'nash',    label: 'Nash',   css: 'sepia(0.35) saturate(1.5) contrast(0.9) brightness(1.1) hue-rotate(-10deg)' },
  { key: '1977',    label: '1977',   css: 'sepia(0.5) hue-rotate(-30deg) saturate(1.2) contrast(0.85)' },
  { key: 'warm',    label: 'Quente', css: 'sepia(0.3) saturate(1.2) brightness(1.08) contrast(0.95)' },
  { key: 'noir',    label: 'Noir',   css: 'grayscale(1) contrast(1.25) brightness(0.88)' },
  { key: 'moon',    label: 'Moon',   css: 'grayscale(0.8) contrast(0.85) brightness(1.15) sepia(0.1)' },
];

const EMOJI_LIST = ['🔥', '❤️', '😍', '💪', '🏆', '⚡', '🎯', '✨', '🚀', '📚', '💡', '🌟'];
const TEXT_COLORS = ['#FFFFFF', '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#FED766', '#FF9A3C'];

type Step = 'pick' | 'camera' | 'edit' | 'publishing';
type ToolPanel = 'filters' | 'text' | 'emoji' | 'trim' | null;

interface StoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (story: StoryWithAuthor) => void;
}

export function StoryCreator({ isOpen, onClose, onCreated }: StoryCreatorProps) {
  const [step, setStep] = useState<Step>('pick');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [toolPanel, setToolPanel] = useState<ToolPanel>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<StickerOverlay[]>([]);
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState(24);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<'text' | 'sticker' | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [textOnlyContent, setTextOnlyContent] = useState('');
  const [selectedBg, setSelectedBg] = useState(STORY_BG_COLORS[0]);
  // Camera states
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Camera refs
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const filterCss = STORY_FILTERS.find(f => f.key === selectedFilter)?.css ?? 'none';

  // Stop camera stream helper
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
  }, []);

  // Start camera when entering camera step, stop on exit
  useEffect(() => {
    if (step !== 'camera') return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: true })
      .then(stream => {
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
          setStep('pick');
        }
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [step]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      const timer = setTimeout(() => {
        setStep('pick');
        setMediaFile(prev => { if (prev && mediaPreview) URL.revokeObjectURL(mediaPreview); return null; });
        setMediaPreview(null);
        setMediaType(null);
        setSelectedFilter('normal');
        setToolPanel(null);
        setTextOverlays([]);
        setStickers([]);
        setNewText('');
        setTextColor('#FFFFFF');
        setTextSize(24);
        setVideoDuration(0);
        setTrimStart(0);
        setTrimEnd(0);
        setTextOnlyContent('');
        setSelectedBg(STORY_BG_COLORS[0]);
        setCameraMode('photo');
        setIsRecording(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, stopStream]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    const preview = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaPreview(preview);
    setMediaType(type);
    setStep('edit');
    e.target.value = '';
  };

  const handleTextOnly = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setStep('edit');
  };

  // ─── Camera capture ───────────────────────────────────────────────────────
  const capturePhoto = () => {
    const video = liveVideoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Mirror since we show mirrored preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      const preview = URL.createObjectURL(file);
      setMediaFile(file);
      setMediaPreview(preview);
      setMediaType('image');
      stopStream();
      setStep('edit');
    }, 'image/jpeg', 0.92);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      // Strip codec params (e.g. "video/webm;codecs=vp9,opus" → "video/webm")
      // because the File API treats MIME types with unquoted commas as invalid
      // and the browser falls back to "text/plain" which multer rejects.
      const fileMimeType = mimeType.split(';')[0];
      const file = new File([blob], `camera-video.${ext}`, { type: fileMimeType });
      const preview = URL.createObjectURL(file);
      setMediaFile(file);
      setMediaPreview(preview);
      setMediaType('video');
      stopStream();
      setStep('edit');
    };
    mediaRecorderRef.current = recorder;
    recorder.start(100);
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // ─── Drag handling ───────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent, id: string, type: 'text' | 'sticker') => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingId(id);
    setDraggingType(type);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (draggingType === 'text') {
      setTextOverlays(prev => prev.map(t => t.id === draggingId ? { ...t, x, y } : t));
    } else {
      setStickers(prev => prev.map(s => s.id === draggingId ? { ...s, x, y } : s));
    }
  }, [draggingId, draggingType]);

  const handlePointerUp = useCallback(() => {
    setDraggingId(null);
    setDraggingType(null);
  }, []);

  const addText = () => {
    if (!newText.trim()) return;
    const overlay: TextOverlay = {
      id: crypto.randomUUID(),
      text: newText.trim(),
      color: textColor,
      fontSize: textSize,
      x: 50,
      y: 50,
    };
    setTextOverlays(prev => [...prev, overlay]);
    setNewText('');
    setToolPanel(null);
  };

  const addSticker = (emoji: string) => {
    const sticker: StickerOverlay = {
      id: crypto.randomUUID(),
      emoji,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
      size: 40,
    };
    setStickers(prev => [...prev, sticker]);
    setToolPanel(null);
  };

  const handlePublish = async () => {
    setStep('publishing');
    try {
      let uploadedUrl: string | undefined;
      let uploadedType: 'image' | 'video' | undefined;

      if (mediaFile) {
        const result = await uploadApi.uploadMedia(mediaFile);
        uploadedUrl = result.url;
        uploadedType = result.type;
      }

      const metadata: Record<string, unknown> = {};
      if (selectedFilter !== 'normal') metadata.filter = selectedFilter;
      if (textOverlays.length > 0) metadata.text_overlays = textOverlays;
      if (stickers.length > 0) metadata.stickers = stickers;
      if (mediaType === 'video' && trimStart > 0) metadata.trim_start = trimStart;
      if (mediaType === 'video' && trimEnd > 0 && trimEnd < videoDuration) metadata.trim_end = trimEnd;

      const story = await storiesApi.create({
        content_type: uploadedType ?? 'text',
        content: !mediaFile && textOnlyContent.trim() ? textOnlyContent.trim() : undefined,
        media_url: uploadedUrl,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        background_color: selectedBg,
      });

      toast.success('Story publicado!');
      onCreated(story);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Erro ao publicar story');
      setStep('edit');
    }
  };

  const canPublish = step === 'edit' && (
    !!mediaFile ||
    textOnlyContent.trim().length > 0 ||
    textOverlays.length > 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-black border-0 rounded-2xl [&>button]:text-white [&>button]:z-50">
        <DialogTitle className="sr-only">Criar Story</DialogTitle>
        {/* Gallery picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* ── PICK STEP ──────────────────────────────────────────────────────── */}
        {step === 'pick' && (
          <div className="flex flex-col items-center gap-4 p-8">
            <h2 className="text-lg font-semibold text-white">Criar Story</h2>
            <button
              onClick={() => setStep('camera')}
              className="w-full flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-4 text-white transition-colors"
            >
              <Camera className="h-6 w-6" />
              <div className="text-left">
                <p className="font-medium">Câmera</p>
                <p className="text-xs text-white/60">Tirar foto ou gravar vídeo agora</p>
              </div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-4 text-white transition-colors"
            >
              <Image className="h-6 w-6" />
              <div className="text-left">
                <p className="font-medium">Galeria</p>
                <p className="text-xs text-white/60">Escolher foto ou vídeo existente</p>
              </div>
            </button>
            <button
              onClick={handleTextOnly}
              className="w-full flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-4 text-white transition-colors"
            >
              <Type className="h-6 w-6" />
              <div className="text-left">
                <p className="font-medium">Só Texto</p>
                <p className="text-xs text-white/60">Story com fundo colorido e texto</p>
              </div>
            </button>
            <button onClick={onClose} className="text-white/50 text-sm hover:text-white/80 transition-colors">
              Cancelar
            </button>
          </div>
        )}

        {/* ── CAMERA STEP ────────────────────────────────────────────────────── */}
        {step === 'camera' && (
          <div className="relative overflow-hidden bg-black" style={{ aspectRatio: '9/16' }}>
            {/* Live webcam preview (mirrored for natural selfie feel) */}
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 rounded-full px-3 py-1 z-20">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-medium">Gravando…</span>
              </div>
            )}

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-3 bg-gradient-to-b from-black/60 to-transparent z-10">
              <button
                onClick={() => { stopStream(); setStep('pick'); }}
                className="text-white p-1 hover:text-white/70 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              {/* Mode toggle: Photo / Video */}
              <div className="flex bg-black/50 rounded-full p-0.5 gap-0.5">
                <button
                  onClick={() => setCameraMode('photo')}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    cameraMode === 'photo' ? 'bg-white text-black' : 'text-white/80 hover:text-white'
                  )}
                >
                  Foto
                </button>
                <button
                  onClick={() => { if (isRecording) return; setCameraMode('video'); }}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    cameraMode === 'video' ? 'bg-white text-black' : 'text-white/80 hover:text-white',
                    isRecording && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  Vídeo
                </button>
              </div>

              <div className="w-8" />
            </div>

            {/* Capture / Record button */}
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-10">
              {cameraMode === 'photo' ? (
                <button
                  onClick={capturePhoto}
                  className="h-16 w-16 rounded-full bg-white border-4 border-white/40 hover:scale-95 active:scale-90 transition-transform shadow-lg"
                  aria-label="Tirar foto"
                />
              ) : (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
                  className={cn(
                    'h-16 w-16 rounded-full border-4 border-white/40 flex items-center justify-center transition-all shadow-lg',
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-white hover:scale-95 active:scale-90'
                  )}
                >
                  {isRecording ? (
                    <div className="h-5 w-5 rounded-sm bg-white" />
                  ) : (
                    <Video className="h-6 w-6 text-red-500" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── EDIT STEP ──────────────────────────────────────────────────────── */}
        {step === 'edit' && (
          <div className="flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-black/80 backdrop-blur">
              <button
                onClick={() => setStep('pick')}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={!canPublish}
                className="h-7 text-xs rounded-full px-4"
              >
                Publicar
              </Button>
            </div>

            {/* Preview area — 9:16 ratio */}
            <div
              ref={containerRef}
              className="relative w-full overflow-hidden bg-black select-none"
              style={{
                aspectRatio: '9/16',
                backgroundColor: !mediaFile ? selectedBg : undefined,
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {mediaPreview && mediaType === 'image' && (
                <img
                  src={mediaPreview}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: filterCss }}
                  draggable={false}
                />
              )}
              {mediaPreview && mediaType === 'video' && (
                <video
                  ref={videoRef}
                  src={mediaPreview}
                  className="w-full h-full object-cover"
                  style={{ filter: filterCss }}
                  playsInline
                  autoPlay
                  loop
                  muted
                  onLoadedMetadata={() => {
                    const dur = videoRef.current?.duration ?? 0;
                    setVideoDuration(dur);
                    setTrimEnd(dur);
                  }}
                />
              )}

              {/* Text-only background content */}
              {!mediaFile && (
                <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                  <p className="text-white text-xl font-semibold text-center break-words w-full">
                    {textOnlyContent || (
                      <span className="opacity-40 italic text-base">Seu texto aparece aqui...</span>
                    )}
                  </p>
                </div>
              )}

              {/* Text overlays (draggable) */}
              {textOverlays.map(t => (
                <span
                  key={t.id}
                  className="absolute cursor-grab active:cursor-grabbing select-none touch-none"
                  style={{
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    transform: 'translate(-50%, -50%)',
                    color: t.color,
                    fontSize: t.fontSize,
                    fontWeight: 'bold',
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                  onPointerDown={e => handlePointerDown(e, t.id, 'text')}
                >
                  {t.text}
                  <button
                    className="absolute -top-3 -right-3 h-4 w-4 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center z-20"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={() => setTextOverlays(prev => prev.filter(x => x.id !== t.id))}
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Sticker overlays (draggable) */}
              {stickers.map(s => (
                <span
                  key={s.id}
                  className="absolute cursor-grab active:cursor-grabbing select-none touch-none"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: s.size,
                    lineHeight: 1,
                    zIndex: 10,
                  }}
                  onPointerDown={e => handlePointerDown(e, s.id, 'sticker')}
                >
                  {s.emoji}
                  <button
                    className="absolute -top-3 -right-3 h-4 w-4 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center z-20"
                    onPointerDown={e => e.stopPropagation()}
                    onClick={() => setStickers(prev => prev.filter(x => x.id !== s.id))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Tool toolbar */}
            <div className="flex items-center justify-around bg-black/90 px-2 py-2 border-t border-white/10">
              {mediaFile && (
                <button
                  onClick={() => setToolPanel(toolPanel === 'filters' ? null : 'filters')}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors text-xs',
                    toolPanel === 'filters' ? 'text-primary bg-primary/10' : 'text-white/70 hover:text-white'
                  )}
                >
                  <Palette className="h-4 w-4" />
                  Filtros
                </button>
              )}
              <button
                onClick={() => setToolPanel(toolPanel === 'text' ? null : 'text')}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors text-xs',
                  toolPanel === 'text' ? 'text-primary bg-primary/10' : 'text-white/70 hover:text-white'
                )}
              >
                <Type className="h-4 w-4" />
                Texto
              </button>
              <button
                onClick={() => setToolPanel(toolPanel === 'emoji' ? null : 'emoji')}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors text-xs',
                  toolPanel === 'emoji' ? 'text-primary bg-primary/10' : 'text-white/70 hover:text-white'
                )}
              >
                <Smile className="h-4 w-4" />
                Emoji
              </button>
              {mediaType === 'video' && (
                <button
                  onClick={() => setToolPanel(toolPanel === 'trim' ? null : 'trim')}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors text-xs',
                    toolPanel === 'trim' ? 'text-primary bg-primary/10' : 'text-white/70 hover:text-white'
                  )}
                >
                  <Scissors className="h-4 w-4" />
                  Cortar
                </button>
              )}
              {/* Background color picker for text-only stories */}
              {!mediaFile && toolPanel !== 'text' && toolPanel !== 'emoji' && (
                <div className="flex gap-1.5">
                  {STORY_BG_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedBg(color)}
                      className={cn(
                        'h-5 w-5 rounded-full transition-transform',
                        selectedBg === color && 'ring-2 ring-white ring-offset-1 ring-offset-black scale-110'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Active panels ─────────────────────────────────────────────── */}

            {toolPanel === 'filters' && (
              <div className="bg-black/95 px-3 py-3 border-t border-white/10">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {STORY_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setSelectedFilter(f.key)}
                      className={cn(
                        'flex flex-col items-center gap-1 shrink-0 transition-opacity',
                        selectedFilter === f.key ? 'opacity-100' : 'opacity-55 hover:opacity-80'
                      )}
                    >
                      {mediaPreview && mediaType === 'image' ? (
                        <img
                          src={mediaPreview}
                          alt={f.label}
                          className="h-14 w-10 object-cover rounded"
                          style={{ filter: f.css }}
                          draggable={false}
                        />
                      ) : (
                        <div
                          className="h-14 w-10 rounded"
                          style={{ backgroundColor: selectedBg, filter: f.css }}
                        />
                      )}
                      <span className={cn(
                        'text-[10px] font-medium',
                        selectedFilter === f.key ? 'text-primary' : 'text-white/70'
                      )}>
                        {f.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {toolPanel === 'text' && (
              <div className="bg-black/95 px-3 py-3 space-y-2 border-t border-white/10">
                {/* Text-only story content */}
                {!mediaFile && (
                  <input
                    className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                    placeholder="Texto do story (fundo colorido)..."
                    value={textOnlyContent}
                    onChange={e => setTextOnlyContent(e.target.value)}
                    maxLength={500}
                    autoFocus
                  />
                )}
                {/* Text overlay input */}
                <div className="flex gap-2 items-center">
                  <input
                    className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                    placeholder={mediaFile ? 'Adicionar texto sobreposto...' : 'Texto adicional sobreposto...'}
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addText()}
                  />
                  <button
                    onClick={addText}
                    disabled={!newText.trim()}
                    className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center disabled:opacity-40 shrink-0"
                  >
                    <Plus className="h-4 w-4 text-white" />
                  </button>
                </div>
                {/* Color + size */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-white/50">Cor:</span>
                  {TEXT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setTextColor(c)}
                      className={cn(
                        'h-5 w-5 rounded-full border border-white/30 transition-transform shrink-0',
                        textColor === c && 'ring-2 ring-white ring-offset-1 ring-offset-black scale-110'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <span className="text-[10px] text-white/50 ml-1">Tam:</span>
                  <input
                    type="range"
                    min={16} max={48} step={2}
                    value={textSize}
                    onChange={e => setTextSize(Number(e.target.value))}
                    className="flex-1 h-1 accent-primary min-w-[60px]"
                  />
                  <span className="text-[10px] text-white/50">{textSize}px</span>
                </div>
              </div>
            )}

            {toolPanel === 'emoji' && (
              <div className="bg-black/95 px-3 py-3 border-t border-white/10">
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_LIST.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addSticker(emoji)}
                      className="text-2xl hover:scale-125 transition-transform active:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {toolPanel === 'trim' && mediaType === 'video' && videoDuration > 0 && (
              <div className="bg-black/95 px-3 py-3 space-y-2 border-t border-white/10">
                <p className="text-xs text-white/60">Cortar vídeo</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/50 w-10">Início</span>
                    <input
                      type="range"
                      min={0}
                      max={videoDuration}
                      step={0.1}
                      value={trimStart}
                      onChange={e => {
                        const val = Math.min(Number(e.target.value), trimEnd - 0.5);
                        setTrimStart(val);
                        if (videoRef.current) videoRef.current.currentTime = val;
                      }}
                      className="flex-1 h-1 accent-primary"
                    />
                    <span className="text-[10px] text-white/70 w-10 text-right">{trimStart.toFixed(1)}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/50 w-10">Fim</span>
                    <input
                      type="range"
                      min={0}
                      max={videoDuration}
                      step={0.1}
                      value={trimEnd}
                      onChange={e => {
                        const val = Math.max(Number(e.target.value), trimStart + 0.5);
                        setTrimEnd(val);
                      }}
                      className="flex-1 h-1 accent-primary"
                    />
                    <span className="text-[10px] text-white/70 w-10 text-right">{trimEnd.toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PUBLISHING STEP ─────────────────────────────────────────────── */}
        {step === 'publishing' && (
          <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[300px]">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-white/80 text-sm">
              {mediaFile ? 'Enviando mídia...' : 'Publicando story...'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
