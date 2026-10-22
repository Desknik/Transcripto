import fs from 'node:fs'
import path from 'node:path'

export type ByteProgress = (done: number, total: number) => void

/** Baixa uma URL para `dest` com retomada (Range) e progresso. Grava em `dest.part` e renomeia ao final. */
export async function downloadFile(url: string, dest: string, onProgress?: ByteProgress): Promise<void> {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true })
  const part = `${dest}.part`
  let offset = fs.existsSync(part) ? fs.statSync(part).size : 0

  const res = await fetch(url, { headers: offset ? { Range: `bytes=${offset}-` } : {} })
  if (res.status === 416) {
    // .part já está completo
    await fs.promises.rename(part, dest)
    return
  }
  if (!res.ok || !res.body) throw new Error(`Falha ao baixar ${url} (HTTP ${res.status})`)
  if (res.status === 200) offset = 0 // servidor ignorou o Range: recomeça

  const total = offset + Number(res.headers.get('content-length') ?? 0)
  const out = fs.createWriteStream(part, { flags: offset ? 'a' : 'w' })
  let done = offset
  let lastPct = -1
  try {
    const reader = res.body.getReader()
    for (;;) {
      const { done: end, value } = await reader.read()
      if (end) break
      if (!out.write(value)) await new Promise<void>(r => out.once('drain', r))
      done += value.length
      const pct = total ? Math.floor((done / total) * 100) : -1
      if (pct !== lastPct) { lastPct = pct; onProgress?.(done, total) }
    }
  } finally {
    await new Promise<void>(r => out.end(r))
  }
  await fs.promises.rename(part, dest)
}
