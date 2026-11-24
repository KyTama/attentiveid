import { describe, expect, test } from 'bun:test'
import { withCredential } from './psychologist-title'

describe('withCredential', () => {
    test('adds the title after the name', () => {
        expect(withCredential('Dr. Haykal Hafizul Arifin', 'S.Psi., M.Si.')).toBe('Dr. Haykal Hafizul Arifin, S.Psi., M.Si.')
    })

    test('leaves the name alone without a title, or when the name already has it', () => {
        expect(withCredential('Syazka Kirani Narindra', null)).toBe('Syazka Kirani Narindra')
        expect(withCredential('  Aly  ', '   ')).toBe('Aly')
        expect(withCredential('Haykal, S.Psi., M.Si.', 'S.Psi., M.Si.')).toBe('Haykal, S.Psi., M.Si.')
    })

    test('ignores a leading comma in the stored title', () => {
        expect(withCredential('Budi', ', M.Psi., Psikolog')).toBe('Budi, M.Psi., Psikolog')
    })
})
