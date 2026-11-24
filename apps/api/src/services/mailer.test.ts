import { describe, expect, test } from 'bun:test'
import { createMailer } from './mailer'

const capture = () => {
    const sent: Array<Record<string, unknown>> = []
    const transportFactory = (() => ({ sendMail: async (message: Record<string, unknown>) => { sent.push(message) } })) as never
    return { sent, mailer: createMailer({ user: 'u@example.com', pass: 'p' }, transportFactory) }
}

describe('mailer', () => {
    test('passes attachments to the transport as files', async () => {
        const { sent, mailer } = capture()
        await mailer.send({
            to: 'a@example.com',
            subject: 'S',
            html: '<p>h</p>',
            text: 't',
            attachments: [{ filename: 'report.pdf', content: new TextEncoder().encode('%PDF-1'), contentType: 'application/pdf' }],
        })
        const attachments = sent[0].attachments as Array<{ filename: string; content: Buffer; contentType: string }>
        expect(attachments).toHaveLength(1)
        expect(attachments[0].filename).toBe('report.pdf')
        expect(attachments[0].contentType).toBe('application/pdf')
        expect(Buffer.isBuffer(attachments[0].content)).toBe(true)
        expect(attachments[0].content.toString()).toBe('%PDF-1')
    })

    test('a message without attachments carries none', async () => {
        const { sent, mailer } = capture()
        await mailer.send({ to: 'a@example.com', subject: 'S', html: '<p>h</p>', text: 't' })
        expect('attachments' in sent[0]).toBe(false)
    })

    test('does nothing without a login', async () => {
        const mailer = createMailer({})
        expect(mailer.isConfigured).toBe(false)
        await mailer.send({ to: 'a@example.com', subject: 'S', html: '', text: '' })
    })
})
