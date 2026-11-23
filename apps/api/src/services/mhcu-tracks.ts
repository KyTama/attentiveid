import { priceFor } from './assessment-payment'

/**
 * The tracks of the Mental Health Check-Up (team demo v7, dashboard spec 4):
 * - asesmen  : invited new client; Rp 150.000 was paid at registration, the full report is included
 * - free     : invited free session; MHCU and full report are free
 * - mandiri  : anyone with the public link; gets a summary, the full report is bought
 * - paket    : a person with credits left from a package of 3; the check-up uses one credit
 * - lanjutan : a client who came through an invitation earlier and keeps their psychologist; the psychologist sets the report price
 * - legacy   : data from the old Google Form (never created by the form)
 */
export type MhcuTrack = 'mandiri' | 'asesmen' | 'free' | 'paket' | 'lanjutan' | 'legacy';
export type InvitedTrack = 'asesmen' | 'free';

export const MHCU_TRACKS: readonly MhcuTrack[] = ['mandiri', 'asesmen', 'free', 'paket', 'lanjutan', 'legacy'];
export const INVITED_TRACKS: readonly InvitedTrack[] = ['asesmen', 'free'];
export const isInvitedTrack = (value: unknown): value is InvitedTrack => value === 'asesmen' || value === 'free';

/** What a new client pays at registration for the initial assessment (the MHCU and its full report are included). */
export const ASESMEN_FEE = 150_000;
/** A package of 3 check-ups: the payment covers this check-up and 2 more. */
export const PACKAGE_SIZE = 3;
export const PACKAGE_CREDITS_AFTER_PAYMENT = PACKAGE_SIZE - 1;

export interface TrackDecisionInput {
    /** The open invitation the person used, if any. */
    invite: { track: InvitedTrack; psychologistId: string } | null;
    /** The person this check-up belongs to, as they were before this check-up (null = new person). */
    participant: { creditsRemaining: number; psychologistId: string | null; trackOrigin: string | null } | null;
    today?: Date;
}

export interface TrackDecision {
    track: MhcuTrack;
    paymentStatus: 'UNPAID' | 'PAID' | 'FREE' | 'INCLUDED';
    paymentPackage: '3x' | null;
    paymentAmount: number | null;
    /** What the report costs for this check-up; null = not set yet (lanjutan: the psychologist sets it). */
    priceDue: number | null;
    psychologistId: string | null;
    /** This check-up consumes one credit of the person's package. */
    creditUsed: boolean;
}

/**
 * Which track a new check-up gets. In this order:
 * 1. a valid invitation decides the track and the psychologist (asesmen: included, free: free);
 * 2. a person with credits left uses one (paket);
 * 3. a person who first came through an invitation continues as 'lanjutan' with their psychologist;
 * 4. everyone else is 'mandiri' with the current single-report price.
 * Pure: the caller makes the credit use atomic.
 */
export const decideTrack = (input: TrackDecisionInput): TrackDecision => {
    const { invite, participant } = input;
    if (invite) {
        return {
            track: invite.track,
            paymentStatus: invite.track === 'asesmen' ? 'INCLUDED' : 'FREE',
            paymentPackage: null,
            paymentAmount: invite.track === 'asesmen' ? ASESMEN_FEE : 0,
            priceDue: 0,
            psychologistId: invite.psychologistId,
            creditUsed: false
        };
    }
    if (participant && participant.creditsRemaining > 0) {
        return {
            track: 'paket',
            paymentStatus: 'PAID',
            paymentPackage: '3x',
            paymentAmount: 0,
            priceDue: 0,
            psychologistId: participant.psychologistId,
            creditUsed: true
        };
    }
    if (participant && participant.psychologistId && isInvitedTrack(participant.trackOrigin)) {
        return {
            track: 'lanjutan',
            paymentStatus: 'UNPAID',
            paymentPackage: null,
            paymentAmount: null,
            priceDue: null,
            psychologistId: participant.psychologistId,
            creditUsed: false
        };
    }
    return {
        track: 'mandiri',
        paymentStatus: 'UNPAID',
        paymentPackage: null,
        paymentAmount: null,
        priceDue: priceFor('single', input.today),
        psychologistId: null,
        creditUsed: false
    };
};

/** One sentence per track, as in the staff panel (dashboard spec 1.5h). */
export const TRACK_SENTENCE: Record<MhcuTrack, string> = {
    asesmen: 'Asesmen awal: Rp 150.000 sudah dibayar saat registrasi; MHCU dan laporan lengkap termasuk.',
    free: 'Free session: MHCU dan laporan lengkap gratis.',
    mandiri: 'Pemeriksaan mandiri: klien hanya menerima ringkasan. Psikolog ditugaskan otomatis begitu status diubah ke PAID.',
    paket: 'Memakai kuota paket 3x klien.',
    lanjutan: 'Klien lama dengan psikolog: harga laporan ditentukan psikolog (isi di bawah).',
    legacy: 'Data dari Google Form lama.'
};

/** How a payment of a package of 3 changes the person's credits (+3 bought, +2 left because this check-up is the first one). */
export const creditDelta = (granted: number, wanted: number): { total: number; remaining: number } => {
    const difference = wanted - granted;
    if (difference === 0) return { total: 0, remaining: 0 };
    return difference > 0
        ? { total: difference, remaining: difference - 1 }
        : { total: difference, remaining: difference + 1 };
};
