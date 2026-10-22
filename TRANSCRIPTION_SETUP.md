# Transcripto - Conversor e Transcritor de Áudio/Vídeo

## Funcionalidades Implementadas

✅ **Conversão de Áudio/Vídeo**
- Converte arquivos de vídeo (MP4, MOV, AVI, MKV) e áudio (WAV, M4A, AAC, OGG) para MP3
- Utiliza FFmpeg para conversão com bitrate de 93k
- Download do arquivo MP3 convertido

✅ **Transcrição com OpenAI**
- Integração modular com API da OpenAI Whisper
- Seletor de provedor e modelo de transcrição
- Estrutura preparada para futuras integrações (ElevenLabs, Microsoft, Oracle, AWS)

✅ **Interface de Usuário**
- Drag & drop de arquivos
- Progresso visual de upload, conversão e transcrição
- Sidebar com histórico de transcrições
- Painel detalhado com estatísticas

## Configuração

Tudo é configurado dentro do app (ícone de engrenagem). Não há mais `.env` nem caminhos de Python.

### Primeiro uso (usuário final)

Ao abrir o Transcripto pela primeira vez, o assistente baixa e instala, em `%APPDATA%\transcripto\`:

1. Python 3.12 embarcado + pip;
2. o motor (faster-whisper e dependências) e, se houver GPU NVIDIA, as bibliotecas CUDA (~1,5 GB);
3. o modelo **large-v3-turbo** (~1,6 GB).

Depois disso a transcrição local funciona offline. Sem GPU NVIDIA o app usa a CPU (mais lento).

### Configurações

- **Idioma:** português por padrão; escolha outro idioma ou "detectar automaticamente" (vale para o local e a OpenAI).
- **Motor local:** reparar/atualizar a instalação, dispositivo (automático, GPU, CPU) e ociosidade do servidor.
- **Modelos:** baixar, usar e remover modelos (tiny, base, small, medium, large-v3-turbo, large-v3).
- **OpenAI (opcional):** chave da API (testada antes de salvar e guardada criptografada). Marque
  "usar a OpenAI como fallback" para repetir na OpenAI quando o motor local falhar. A cobrança é na sua conta.

### Servidor local

O servidor (`whisper_server.py`) mantém o modelo carregado. Sobe sozinho na primeira transcrição local
(ou pelo botão "Servidor" do seletor) e é encerrado ao fechar o app, se o app o iniciou.

### Código Python

Em `resources/python/`: `transcriber.py` (CLI única, `--diarize` para locutor por canal), `vlk_whisper.py`
(núcleo), `whisper_server.py`, `model_manager.py` e os `requirements-*.txt` (versões fixadas).
A configuração chega por variáveis `VLK_*` definidas pelo app.

### Gerar o instalador (Windows)

```bash
npm install
npm run dist     # gera release/<versão>/Transcripto-Windows-<versão>-Setup.exe (~100 MB)
```

Observações:
- Ative o **Modo Desenvolvedor** do Windows (ou rode o terminal como administrador): o electron-builder precisa
  criar links simbólicos ao extrair o `winCodeSign`. Sem isso o build falha na etapa de edição do executável.
- O executável não é assinado; o SmartScreen mostrará um aviso até que seja assinado.
- Desinstalar não apaga `%APPDATA%\transcripto\` (runtime e modelos, vários GB).

### Executar em desenvolvimento

```bash
npm run dev
```

## Como Usar

1. **Configurar Transcrição**: Selecione o modelo de transcrição no dropdown (OpenAI aparecerá se a API key estiver configurada)

2. **Enviar Arquivos**: Arraste e solte ou clique para selecionar arquivos de áudio/vídeo

3. **Processamento Automático**:
   - Upload do arquivo
   - Conversão para MP3 (se necessário)
   - Transcrição usando a API selecionada

4. **Visualizar Resultados**: Acesse a transcrição na sidebar e veja detalhes no painel principal

5. **Download**: Se o arquivo foi convertido, use o botão "Baixar MP3" no canto superior direito

## Estrutura do Código

### Serviços de Transcrição (Modular)
- `src/services/transcription/base.ts` - Interface base
- `src/services/transcription/openai.ts` - Implementação OpenAI
- `src/services/transcription/manager.ts` - Gerenciador de provedores

### Componentes
- `FileUpload.tsx` - Upload e seleção de provedores
- `TranscriptionProviderSelector.tsx` - Seletor de APIs
- `TranscriptionPanel.tsx` - Visualização de resultados
- `Sidebar.tsx` - Histórico de transcrições

### Electron
- `electron/main.ts` - Processo principal com FFmpeg e APIs
- `electron/preload.ts` - Bridge seguro para o renderer

## Formatos Suportados

**Vídeo**: MP4, MOV, AVI, MKV
**Áudio**: MP3, WAV, M4A, AAC, OGG

## Próximas Integrações Planejadas

- 🔲 ElevenLabs Speech-to-Text
- 🔲 Microsoft Azure Speech Services
- 🔲 Oracle Cloud Speech
- 🔲 AWS Transcribe
- 🔲 Google Cloud Speech-to-Text

## Notas Técnicas

- A conversão de áudio usa FFmpeg integrado via `ffmpeg-static`
- As transcrições são processadas via APIs externas
- O sistema é modular para facilitar adição de novos provedores
- Todos os arquivos temporários são gerenciados automaticamente
