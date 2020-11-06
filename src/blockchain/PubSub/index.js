import redis from 'redis';

const CHANNELS = {
  BLOCKCHAIN: 'BLOCKCHAIN',
  TEST: 'TEST',
};

export default class PubSub {
  constructor() {
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscribeToChannels();

    this.subscriber.on('message', this.handleMessage);
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}.`)
  }

  publish({ channel, message }) {
    this.publisher.publish(channel, message);
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => (
      this.subscriber.subscribe(channel)
    ));
  }
}