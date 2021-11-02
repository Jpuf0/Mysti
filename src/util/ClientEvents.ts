import Mysti from "@Mysti";
import Eris from "eris";

export default class ClientEvent<K extends keyof Eris.ClientEvents = keyof Eris.ClientEvents> {
  name: K;
  listener: (this: Mysti, ...args: Eris.ClientEvents[K]) => void;
  constructor (event: K, listener: (this: Mysti, ...args: Eris.ClientEvents[K]) => void) {
    this.name = event;
    this.listener = listener;
  }
}