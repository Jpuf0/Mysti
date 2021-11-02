import { Client, ClientOptions } from "eris";

export default class Mysti extends Client {
  constructor (token: string, options: ClientOptions) {
    super(token, options);
  }

  async launch() {
		await this.connect();
	}
}