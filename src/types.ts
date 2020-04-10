import { gmail_v1 as GmailV1 } from 'googleapis';

export type SNU = string | null | undefined

export type GmailClient = GmailV1.Gmail

export type Thread = GmailV1.Schema$Thread
export type Message = GmailV1.Schema$Message
export type MessagePart = GmailV1.Schema$MessagePart
export type MessagePartBody = GmailV1.Schema$MessagePartBody
