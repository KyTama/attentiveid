import nodemailer from 'nodemailer'

export interface MailAttachment {
    filename: string
    content: Uint8Array
    contentType: string
}

export interface MailMessage {
    to: string
    subject: string
    html: string
    text: string
    attachments?: MailAttachment[]
}

export interface Mailer {
    isConfigured: boolean
    send(message: MailMessage): Promise<void>
}

export interface SmtpSettings {
    host?: string
    port?: string
    user?: string
    pass?: string
    from?: string
    fromName?: string
    replyTo?: string
}

/**
 * Sends e-mail through an SMTP account (for Gmail: smtp.gmail.com, port 587, an app password).
 * Without a user and password nothing is sent: `isConfigured` is false and `send` does nothing, so the site works without it.
 */
export const createMailer = (settings: SmtpSettings, transportFactory = nodemailer.createTransport): Mailer => {
    if (!settings.user || !settings.pass) {
        return { isConfigured: false, async send() {} }
    }
    const port = Number(settings.port) || 587
    const transport = transportFactory({
        host: settings.host || 'smtp.gmail.com',
        port,
        // 465 is implicit TLS; 587 starts plain and upgrades (STARTTLS), which nodemailer requires here.
        secure: port === 465,
        requireTLS: port !== 465,
        auth: { user: settings.user, pass: settings.pass },
        connectionTimeout: 15_000,
        socketTimeout: 20_000
    })
    const fromAddress = settings.from || settings.user
    const from = settings.fromName ? { name: settings.fromName, address: fromAddress } : fromAddress
    return {
        isConfigured: true,
        async send(message) {
            await transport.sendMail({
                from,
                to: message.to,
                replyTo: settings.replyTo || fromAddress,
                subject: message.subject,
                html: message.html,
                text: message.text,
                ...(message.attachments?.length
                    ? { attachments: message.attachments.map((file) => ({ filename: file.filename, content: Buffer.from(file.content), contentType: file.contentType })) }
                    : {})
            })
        }
    }
}
