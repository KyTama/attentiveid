import type { MhcuOpsRepository } from '../repositories/mhcu-ops.repository';
import { applyPricing, defaultSettings, mergeSettings, type MhcuSettings } from './mhcu-settings';

/** Reads the settings from the database (with a short memory so busy pages do not hit it every time) and applies the prices. */
export const createMhcuSettingsStore = (ops: Pick<MhcuOpsRepository, 'loadSettings' | 'saveSettings'>, defaultAlertEmail?: string, ttlMs = 15_000) => {
    let cached: { value: MhcuSettings; at: number } | null = null;
    const get = async (): Promise<MhcuSettings> => {
        if (cached && Date.now() - cached.at < ttlMs) return cached.value;
        let value: MhcuSettings;
        try {
            value = mergeSettings(await ops.loadSettings(), defaultAlertEmail);
        } catch {
            value = cached?.value ?? defaultSettings(defaultAlertEmail);
        }
        applyPricing(value);
        cached = { value, at: Date.now() };
        return value;
    };
    const set = async (value: MhcuSettings): Promise<void> => {
        await ops.saveSettings(value);
        applyPricing(value);
        cached = { value, at: Date.now() };
    };
    return { get, set };
};

/** Settings kept in memory only (tests, or when no database is attached): starts from the defaults. */
export const createMemorySettingsStore = (alertEmail?: string) => {
    let value = defaultSettings(alertEmail)
    return {
        get: async (): Promise<MhcuSettings> => value,
        set: async (next: MhcuSettings): Promise<void> => {
            value = next
            applyPricing(next)
        }
    }
}
