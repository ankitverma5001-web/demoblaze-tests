const DEFAULT_BASE_URL = 'https://demoblaze.com';

function normalizeBaseUrl(value) {
    const trimmed = (value || DEFAULT_BASE_URL).trim();
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return withProtocol.replace(/\/+$/, '');
}

const baseUrl = normalizeBaseUrl(process.env.DEMOBLAZE_BASE_URL);

function buildStoreUrl(pathname) {
    return new URL(pathname, `${baseUrl}/`).toString();
}

module.exports = {
    DEFAULT_BASE_URL,
    baseUrl,
    buildStoreUrl,
};
