import { Message } from 'discord.js';
import prettyMilliseconds from 'pretty-ms';

export async function run(msg: Message): Promise<Message> {
	const responce = await msg.channel.send('Ping?');
	return responce.edit(`Pong! Round trip took ${prettyMilliseconds(responce.createdTimestamp - msg.createdTimestamp)}, REST ping ${msg.client.ws.ping}ms.`);
}