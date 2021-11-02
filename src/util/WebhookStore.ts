import { botIcon } from '@config';
import Eris, { Client, GuildTextableChannel, Message, WebhookPayload } from 'eris'

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