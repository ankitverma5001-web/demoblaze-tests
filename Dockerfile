# Runs the full Playwright + Cucumber suite with zero host dependencies:
# no local Node, browsers, or OS packages needed -- just Docker.
FROM node:lts-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Downloads real Chrome/Edge builds (not just the bundled Chromium) plus
# Firefox, and the Debian system libraries each of them needs to run headless.
RUN npx playwright install --with-deps chrome msedge firefox chromium

# playwright.config.js keys headless mode off CI, and there's no display
# server in the container, so this must stay set.
ENV CI=true

CMD ["npx", "playwright", "test"]
