import { botIcon, webhooks } from '@config';
import { Client, GuildTextableChannel, Message, WebhookPayload } from 'eris'
import DebugEvent from '@events/debug';
import Mysti from '@Mysti';
interface WebhookInfo {
  id: string,
  token: string,
  name?: string,
  avatar?: string
}

class Webhook {
  private info: WebhookInfo;
  private client: Client;
  constructor(info: WebhookInfo, client: Client) {
    this.info = info;
    this.client = client;
  }

  async send(payload: WebhookPayload, wait: true): Promise<Message<GuildTextableChannel>>;
  async send(payload: WebhookPayload, wait?: false): Promise<void>;
  async send(payload: WebhookPayload, wait = false): Promise<void | Message<GuildTextableChannel>> {
    if (!payload.username && this.info.name) payload.username = this.info.name;
    if (!payload.avatarURL) {
      if (this.info.avatar) payload.avatarURL = this.info.avatar;
      else payload.avatarURL = botIcon;
    }
    payload.wait = wait;
    return this.client.executeWebhook(this.info.id, this.info.token, payload);
  }

  async delete(reason?: string) { return this.client.deleteWebhook(this.info.id, this.info.id, reason) }
}

export default class WebhookStore {
  private static list = new Map<String, Webhook>();
  static client = new Client("", { intents: [] }).on('debug', (info, id) => DebugEvent.listener.call(undefined as unknown as Mysti, info, id));
  static get(name: keyof typeof webhooks) { return (this.list.get(name) ?? this.list.set(name, new Webhook(webhooks[name], this.client)).get(name))!; }

  static async send(name: keyof typeof webhooks, payload: WebhookPayload, wait: true): Promise<Message<GuildTextableChannel>>;
	static async send(name: keyof typeof webhooks, payload: WebhookPayload, wait?: false): Promise<void>;
	static async send(name: keyof typeof webhooks, payload: WebhookPayload, wait = false): Promise<void | Message<GuildTextableChannel>> { return this.get(name).send(payload, wait as true); }

	static async delete(name: keyof typeof webhooks, reason?: string) { return this.get(name).delete(reason); }
}