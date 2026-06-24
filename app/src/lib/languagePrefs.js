/**
 * Language preference helpers (RU native -> HE target for this project).
 */

export const LS_TARGET = 'immergo_language';
export const LS_NATIVE = 'immergo_from_language';

/** Full option labels as shown in <select> (must match view-missions.js). */
export const DEFAULT_NATIVE_LABEL = '\u{1F1F7}\u{1F1FA} Russian';
export const DEFAULT_TARGET_LABEL = '\u{1F1EE}\u{1F1F1} Hebrew';

const ENGLISH_LABEL = '\u{1F1EC}\u{1F1E7} English';

export function findOptionByLabel(select, label) {
  if (!select || !label) return null;
  return Array.from(select.options).find(
    (o) => o.value === label || o.text === label
  );
}

export function findOptionByLanguageName(select, languageName) {
  if (!select || !languageName) return null;
  const needle = languageName.trim().toLowerCase();
  return Array.from(select.options).find((o) =>
    o.text.toLowerCase().includes(needle)
  );
}

export function isEnglishEnglishPair(nativeLabel, targetLabel) {
  const fromEn =
    nativeLabel && nativeLabel.includes('English') && !nativeLabel.includes('Russian');
  const toEn =
    targetLabel && targetLabel.includes('English') && !targetLabel.includes('Hebrew');
  return Boolean(fromEn && toEn);
}

export function readStoredLanguageLabels() {
  return {
    native: localStorage.getItem(LS_NATIVE),
    target: localStorage.getItem(LS_TARGET),
  };
}

export function writeStoredLanguageLabels(nativeLabel, targetLabel) {
  if (nativeLabel) localStorage.setItem(LS_NATIVE, nativeLabel);
  if (targetLabel) localStorage.setItem(LS_TARGET, targetLabel);
}

export function getEffectiveLanguageLabels(fromSelect, toSelect) {
  const stored = readStoredLanguageLabels();
  let native = stored.native;
  let target = stored.target;

  if (isEnglishEnglishPair(native, target)) {
    native = null;
    target = null;
  }

  if (native && fromSelect && !findOptionByLabel(fromSelect, native)) {
    native = null;
  }
  if (target && toSelect && !findOptionByLabel(toSelect, target)) {
    target = null;
  }

  if (fromSelect && fromSelect.value) {
    native = fromSelect.value;
  }
  if (toSelect && toSelect.value) {
    target = toSelect.value;
  }

  if (!native) native = DEFAULT_NATIVE_LABEL;
  if (!target) target = DEFAULT_TARGET_LABEL;

  return { native, target };
}

/**
 * Apply labels to selects and localStorage (sync).
 */
export function applyLanguageLabels(fromSelect, toSelect, nativeLabel, targetLabel) {
  const nativeOpt = findOptionByLabel(fromSelect, nativeLabel);
  const targetOpt = findOptionByLabel(toSelect, targetLabel);

  if (nativeOpt) fromSelect.value = nativeOpt.value;
  if (targetOpt) toSelect.value = targetOpt.value;

  writeStoredLanguageLabels(fromSelect.value, toSelect.value);
  return { native: fromSelect.value, target: toSelect.value };
}

/**
 * Sync restore: localStorage -> selects, else project defaults (RU/HE).
 */
export function restoreLanguageSelects(fromSelect, toSelect) {
  if (!fromSelect || !toSelect) {
    return { native: DEFAULT_NATIVE_LABEL, target: DEFAULT_TARGET_LABEL };
  }

  const stored = readStoredLanguageLabels();
  let native = stored.native;
  let target = stored.target;

  if (stored.target && stored.target.includes('French')) {
    localStorage.removeItem(LS_TARGET);
    target = null;
  }

  if (isEnglishEnglishPair(native, target)) {
    native = null;
    target = null;
  }

  const nativeOk = native && findOptionByLabel(fromSelect, native);
  const targetOk = target && findOptionByLabel(toSelect, target);

  if (nativeOk) fromSelect.value = native;
  else fromSelect.value = DEFAULT_NATIVE_LABEL;

  if (targetOk) toSelect.value = target;
  else toSelect.value = DEFAULT_TARGET_LABEL;

  writeStoredLanguageLabels(fromSelect.value, toSelect.value);
  return { native: fromSelect.value, target: toSelect.value };
}

/**
 * Fill missing prefs from /api/config or hardcoded RU/HE fallback.
 */
export async function ensureLanguageDefaults(fromSelect, toSelect) {
  const stored = readStoredLanguageLabels();
  const needsNative =
    !stored.native ||
    isEnglishEnglishPair(stored.native, stored.target) ||
    !findOptionByLabel(fromSelect, stored.native);
  const needsTarget =
    !stored.target ||
    isEnglishEnglishPair(stored.native, stored.target) ||
    !findOptionByLabel(toSelect, stored.target);

  if (!needsNative && !needsTarget) {
    return restoreLanguageSelects(fromSelect, toSelect);
  }

  let nativeName = 'Russian';
  let targetName = 'Hebrew';

  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    if (config.native_language) nativeName = config.native_language;
    if (config.target_language) targetName = config.target_language;
  } catch (err) {
    console.error('Failed to fetch /api/config for language defaults:', err);
  }

  const nativeOpt = findOptionByLanguageName(fromSelect, nativeName);
  const targetOpt = findOptionByLanguageName(toSelect, targetName);

  return applyLanguageLabels(
    fromSelect,
    toSelect,
    nativeOpt ? nativeOpt.value : DEFAULT_NATIVE_LABEL,
    targetOpt ? targetOpt.value : DEFAULT_TARGET_LABEL
  );
}
