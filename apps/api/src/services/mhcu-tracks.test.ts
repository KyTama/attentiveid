import { describe, expect, it } from 'bun:test';
import { ASESMEN_FEE, creditDelta, decideTrack, isInvitedTrack, PACKAGE_CREDITS_AFTER_PAYMENT, TRACK_SENTENCE, MHCU_TRACKS } from './mhcu-tracks';
import { PAYMENT_OPTIONS } from './assessment-payment';

const PSY = 'psy-1';
const newPerson = null;
const person = (o: Partial<{ creditsRemaining: number; psychologistId: string | null; trackOrigin: string | null }> = {}) => ({ creditsRemaining: 0, psychologistId: null, trackOrigin: 'mandiri', ...o });

describe('decideTrack', () => {
    it('asesmen invitation: INCLUDED, Rp 150.000 paid at registration, nothing due, the psychologist of the invitation', () => {
        expect(decideTrack({ invite: { track: 'asesmen', psychologistId: PSY }, participant: newPerson })).toEqual({
            track: 'asesmen', paymentStatus: 'INCLUDED', paymentPackage: null, paymentAmount: ASESMEN_FEE, priceDue: 0, psychologistId: PSY, creditUsed: false
        });
        expect(ASESMEN_FEE).toBe(150_000);
    });

    it('free invitation: FREE and nothing paid or due', () => {
        expect(decideTrack({ invite: { track: 'free', psychologistId: PSY }, participant: newPerson })).toMatchObject({ track: 'free', paymentStatus: 'FREE', paymentAmount: 0, priceDue: 0, psychologistId: PSY });
    });

    it('an invitation wins over package credits and keeps them for later', () => {
        const d = decideTrack({ invite: { track: 'free', psychologistId: PSY }, participant: person({ creditsRemaining: 2, psychologistId: 'other' }) });
        expect(d).toMatchObject({ track: 'free', creditUsed: false, psychologistId: PSY });
    });

    it('a person with credits uses one: paket, PAID 3x, nothing due, their psychologist', () => {
        expect(decideTrack({ invite: null, participant: person({ creditsRemaining: 2, psychologistId: 'p-9' }) })).toEqual({
            track: 'paket', paymentStatus: 'PAID', paymentPackage: '3x', paymentAmount: 0, priceDue: 0, psychologistId: 'p-9', creditUsed: true
        });
    });

    it('credits win over lanjutan', () => {
        expect(decideTrack({ invite: null, participant: person({ creditsRemaining: 1, psychologistId: 'p', trackOrigin: 'asesmen' }) }).track).toBe('paket');
    });

    it('a client from an invitation with a psychologist and no credits is lanjutan: UNPAID, price not set yet', () => {
        for (const origin of ['asesmen', 'free']) {
            expect(decideTrack({ invite: null, participant: person({ psychologistId: 'p', trackOrigin: origin }) })).toEqual({
                track: 'lanjutan', paymentStatus: 'UNPAID', paymentPackage: null, paymentAmount: null, priceDue: null, psychologistId: 'p', creditUsed: false
            });
        }
    });

    it('a client from an invitation without a psychologist falls back to mandiri', () => {
        expect(decideTrack({ invite: null, participant: person({ trackOrigin: 'asesmen' }) }).track).toBe('mandiri');
    });

    it('a returning mandiri person stays mandiri even with a psychologist (team demo: P00002 T4, P00006 T2)', () => {
        expect(decideTrack({ invite: null, participant: person({ psychologistId: 'p', trackOrigin: 'mandiri' }) }).track).toBe('mandiri');
        expect(decideTrack({ invite: null, participant: person({ psychologistId: 'p', trackOrigin: null }) }).track).toBe('mandiri');
    });

    it('a new person on the public link: mandiri, UNPAID, the current single price due, no psychologist', () => {
        const promo = decideTrack({ invite: null, participant: newPerson, today: new Date('2026-11-23T03:00:00Z') });
        expect(promo).toEqual({ track: 'mandiri', paymentStatus: 'UNPAID', paymentPackage: null, paymentAmount: null, priceDue: PAYMENT_OPTIONS.single.amount, psychologistId: null, creditUsed: false });
        const afterPromo = decideTrack({ invite: null, participant: newPerson, today: new Date('2027-06-01T03:00:00Z') });
        expect(afterPromo.priceDue).toBe(PAYMENT_OPTIONS.single.normal);
    });

    it('knows the six tracks, the two invited ones, and has a sentence for each', () => {
        expect(MHCU_TRACKS).toEqual(['mandiri', 'asesmen', 'free', 'paket', 'lanjutan', 'legacy']);
        expect(isInvitedTrack('asesmen')).toBe(true);
        expect(isInvitedTrack('free')).toBe(true);
        expect(isInvitedTrack('mandiri')).toBe(false);
        expect(isInvitedTrack(undefined)).toBe(false);
        for (const track of MHCU_TRACKS) expect(TRACK_SENTENCE[track].length).toBeGreaterThan(10);
    });
});

describe('creditDelta', () => {
    it('buying the package adds 3 and leaves 2 (this check-up is the first one)', () => {
        expect(PACKAGE_CREDITS_AFTER_PAYMENT).toBe(2);
        expect(creditDelta(0, 3)).toEqual({ total: 3, remaining: 2 });
    });
    it('saving again changes nothing', () => {
        expect(creditDelta(3, 3)).toEqual({ total: 0, remaining: 0 });
        expect(creditDelta(0, 0)).toEqual({ total: 0, remaining: 0 });
    });
    it('undoing takes the credits back', () => {
        expect(creditDelta(3, 0)).toEqual({ total: -3, remaining: -2 });
    });
});
