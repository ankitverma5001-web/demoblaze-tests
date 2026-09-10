# demoblaze-tests

Playwright + Cucumber QA automation for [demoblaze.com](https://www.demoblaze.com/index.html), a public e-commerce demo site.

## Setup

```
npm install
npx playwright install
cp .env.example .env   # fill in a real (throwaway) demoblaze account
```

## Running tests

```
npx playwright test                                 # full Playwright suite (chrome/msedge/firefox)
npx playwright test tests/smoke.spec.js --reporter=line   # single file
npx cucumber-js                                      # Cucumber/BDD suite under features/
```

## Running tests in Docker (no local Node/browsers needed)

Requires only [Docker](https://docs.docker.com/get-docker/) installed.

```
cp .env.example .env   # optional -- only needed for login/signup tests
docker compose up --build
```

That builds the image (installs deps + real Chrome/Edge/Firefox builds inside
the container) and runs the full Playwright suite. Reports land back on your
host in `playwright-report/`, `test-results/`, and `allure-results/` via
bind-mounted volumes -- open `playwright-report/index.html` afterwards.

Run something other than the default suite by overriding the command:

```
docker compose run --rm tests npx playwright test tests/smoke.spec.js --reporter=line
docker compose run --rm tests npx cucumber-js
```

## Reports

```
npx playwright show-report
npx allure generate allure-results --clean -o allure-report && npx allure open allure-report
```

## Structure

```
tests/          plain Playwright specs
pageobjects/    Page Object Model classes + POManager
features/       Cucumber BDD (.feature files, step_definitions/, support/hooks.js)
specs/          markdown test plans
```

## Notes

- demoblaze's login/signup use native `alert()` popups for success/failure messages — Playwright auto-dismisses these by default, so tests that need to read the message must register a `page.on('dialog', ...)` handler before submitting.
- Login/signup tests use a throwaway test account via `DEMOBLAZE_USERNAME`/`DEMOBLAZE_PASSWORD` in `.env` — never commit real values.
