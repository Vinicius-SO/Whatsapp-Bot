FROM node:slim AS app

ENV PORT=8080

# # Install Google Chrome Stable and fonts
# # Note: this installs the necessary libs to make the browser work with Puppeteer.
# RUN apt-get update && apt-get install curl gnupg -y \
#   && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#   && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#   && apt-get update \
#   && apt-get install google-chrome-stable -y --no-install-recommends \
#   && rm -rf /var/lib/apt/lists/*


# RUN useradd -m -s /bin/bash puppeteer_user && echo "puppeteer_user:puppeteer_user " | chpasswd && adduser puppeteer_user sudo

WORKDIR /app

COPY package*.json ./

# Ajustar permissões
# RUN chown -R puppeteer_user:puppeteer_user /app

RUN npm install

# Mudar para o usuário não root
# USER puppeteer_user

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]