import { OutputFormat } from '../../types/transcription';

export interface Segment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface TranscriptData {
  segments: Segment[];
  duration: number;
  language?: string;
}

export interface FormatOptions {
  /** Texto com [início -> fim] por trecho (como no script original); padrão: só o texto em parágrafos */
  includeTimestamps: boolean;
}

// Pós-tratamento do texto corrido: junta trechos em parágrafos em vez de uma linha por trecho do Whisper
const PARAGRAPH_PAUSE_SECONDS = 2;
const PARAGRAPH_SOFT_MAX_CHARS = 500;

/** Tempo efetivo de fala: união dos intervalos (canais de locutores diferentes podem se sobrepor). */
export function speechSeconds(segments: Segment[], duration?: number): number {
  const sorted = [...segments].filter(s => s.end > s.start).sort((a, b) => a.start - b.start);
  let total = 0;
  let curStart = 0;
  let curEnd = -1;
  for (const s of sorted) {
    if (s.start > curEnd) {
      if (curEnd >= 0) total += curEnd - curStart;
      curStart = s.start;
      curEnd = s.end;
    } else if (s.end > curEnd) {
      curEnd = s.end;
    }
  }
  if (curEnd >= 0) total += curEnd - curStart;
  return duration ? Math.min(total, duration) : total;
}

const label = (s: Segment) => (s.speaker ? `${s.speaker}: ${s.text}` : s.text);

function timestamp(seconds: number, sep: ',' | '.'): string {
  const ms = Math.round(seconds * 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${pad(Math.floor(ms / 3_600_000))}:${pad(Math.floor(ms / 60_000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}${sep}${pad(ms % 1000, 3)}`;
}

/** Agrupa trechos em parágrafos: quebra na troca de locutor, em pausa longa ou ao passar do tamanho em fim de frase. */
export function toParagraphs(segments: Segment[]): string[] {
  const paragraphs: { speaker?: string; text: string }[] = [];
  let prevEnd = -Infinity;
  const sorted = segments.map((s, i) => ({ s, i })).sort((a, b) => a.s.start - b.s.start || a.i - b.i);
  for (const { s } of sorted) {
    const text = s.text.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const cur = paragraphs[paragraphs.length - 1];
    const mergeable =
      cur &&
      cur.speaker === s.speaker &&
      s.start - prevEnd <= PARAGRAPH_PAUSE_SECONDS &&
      !(cur.text.length > PARAGRAPH_SOFT_MAX_CHARS && /[.!?…]$/.test(cur.text));
    if (mergeable) cur.text += ' ' + text;
    else paragraphs.push({ speaker: s.speaker, text });
    prevEnd = Math.max(prevEnd, s.end);
  }
  return paragraphs.map(p => (p.speaker ? `${p.speaker}: ${p.text}` : p.text));
}

function plainText(data: TranscriptData, options: FormatOptions): string {
  if (options.includeTimestamps) {
    return data.segments
      .map(s => `[${s.start.toFixed(2)}s -> ${s.end.toFixed(2)}s] ${label(s)}`)
      .join('\n');
  }
  return toParagraphs(data.segments).join('\n\n');
}

export function formatTranscript(data: TranscriptData, format: OutputFormat, options: FormatOptions): string {
  const segs = data.segments;
  switch (format) {
    case 'srt':
      return segs
        .map((s, i) => `${i + 1}\n${timestamp(s.start, ',')} --> ${timestamp(s.end, ',')}\n${label(s)}\n`)
        .join('\n');
    case 'vtt':
      return 'WEBVTT\n\n' + segs
        .map(s => `${timestamp(s.start, '.')} --> ${timestamp(s.end, '.')}\n${label(s)}\n`)
        .join('\n');
    case 'json':
      return JSON.stringify({ text: plainText(data, options) }, null, 2);
    case 'verbose_json':
      return JSON.stringify({
        task: 'transcribe',
        language: data.language,
        duration: data.duration,
        text: plainText(data, options),
        segments: segs.map((s, i) => ({ id: i, ...s })),
      }, null, 2);
    default:
      return plainText(data, options);
  }
}
