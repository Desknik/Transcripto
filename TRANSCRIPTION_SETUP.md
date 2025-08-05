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

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar API Keys

Crie um arquivo `.env` na raiz do projeto:

```env
# OpenAI API Key (obrigatório para transcrição)
OPENAI_API_KEY=sua_chave_api_openai_aqui

# Futuras integrações (opcional)
# ELEVENLABS_API_KEY=sua_chave_elevenlabs
# AZURE_API_KEY=sua_chave_azure
# AWS_ACCESS_KEY_ID=sua_chave_aws
# AWS_SECRET_ACCESS_KEY=sua_chave_secreta_aws
```

### 3. Executar o Projeto

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
