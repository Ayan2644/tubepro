# Começamos com a imagem oficial do n8n
FROM n8nio/n8n:latest

# Mudamos para o usuário root para poder instalar pacotes
USER root

# AÇÃO PRINCIPAL: Instala ffmpeg E yt-dlp diretamente pelo gerenciador de pacotes.
# Esta é a forma mais estável.
RUN apk add --no-cache ffmpeg yt-dlp

# Volta para o usuário padrão do n8n para segurança
USER node