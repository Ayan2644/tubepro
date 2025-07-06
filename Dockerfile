# Começamos com a imagem oficial do n8n
FROM n8nio/n8n:latest

# Mudamos para o usuário root para poder instalar pacotes
USER root

# Instala o ffmpeg e outras dependências necessárias (python e pip)
# Usamos o comando 'apk' pois a imagem do n8n é baseada em Alpine Linux
RUN apk add --no-cache ffmpeg python3 py3-pip

# Instala a ferramenta yt-dlp usando o pip do python
RUN pip install yt-dlp

# Opcional: Limpa o cache para manter a imagem pequena
RUN rm -rf /root/.cache/pip

# Volta para o usuário padrão do n8n para segurança
USER node