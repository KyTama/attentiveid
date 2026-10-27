# i18n Browser Language Detector vs Explicit Default Locale

## Context
When building localized web applications with `i18next-browser-languagedetector`, configuring `fallbackLng: 'id'` does not guarantee that first-time visitors see Indonesian if `navigator` is present in the detector's lookup order.

## Problem
Most developer and user machines (macOS, Chrome, iOS) have English as their system or browser locale (`navigator.language`). If `detection.order` includes `navigator`, the detector prioritizes the browser's English setting over the application's intended regional default (`id`), ignoring `fallbackLng`.

## Solution
1. Explicitly constrain `detection.order` to `['localStorage', 'cookie']`, excluding `navigator`.
2. Set `fallbackLng: 'id'`.
3. First-time visitors default directly to Indonesian (`id`).
4. If a user manually toggles the language switch (e.g. to English), `i18n.changeLanguage()` persists their choice to `localStorage` and `cookie`, which the detector respects on subsequent visits.
