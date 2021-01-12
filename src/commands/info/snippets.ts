import { Message, MessageEmbed } from 'discord.js';
import { Snippet } from '@lib/types/Snippet';
import { PREFIX, ROLES } from '@root/config';

export const decirption = 'Easily access useful bits of information about the server.';
export const usage = '<list | run/view | add/new | update/edit | delete/remove> (snipName) | (snipContent)';
export const extendedHelp = 'If given no arguemnts, you will recive the list of all avaliable snippets. Only staff can edit snips.';
export const aliases = ['snip', 'snips', 'snippet'];

type SnipCommand = 'list' | 'run' | 'add' | 'update' | 'delete';

export async function run(msg: Message, [subCommand, snipName, contents]: [SnipCommand, string, string]): Promise<Message> {
	msg.channel.send(`**sub command**: ${subCommand}\n**snip**: ${snipName}\n**content**: ${contents}`);

	const snippets: Array<Snippet> = await msg.client.mongo.collection('snips').find().toArray();
	const snippet = snippets.find(snip => snip.name === snipName);
	const newSnip: Snippet = { name: snipName, content: contents };

	switch (subCommand) {
		case 'list':
			console.log(snippets);
			return msg.channel.send(new MessageEmbed()
				.setTitle('Avaliable Snippets')
				.setColor('GOLD')
				.setDescription(`\`${snippets.map(doc => `${PREFIX}${doc.name}`).join('`, `')}\``));
		case 'run':
			if (!snippet) {
				return msg.channel.send(`There is no snippet with the name ${snipName}.`);
			}
			return msg.channel.send(snippet.content);
		case 'add':
			if (snippet) {
				return msg.channel.send(`There is already a snippet called ${snipName}.`);
			}
			msg.client.mongo.collection('snips').insertOne(newSnip);
			return msg.channel.send(`Created a snip with the name **${snipName}**.`);
	}
}


export function argParser(msg: Message, input: string): [SnipCommand, string, string] {
	const isStaff = msg.member.roles.cache.has(ROLES.STAFF);

	let subCommand: SnipCommand;
	let snip: string;
	let contents: string;

	switch (input.split(' ')[0]) {
		case 'add':
		case 'new':
			if (!isStaff) throw 'You do not have permssion to do that.';
			if (!input.includes('|')) throw usage;
			subCommand = 'add';
			[snip, contents] = input.split('|');
			[, snip] = snip.split(' ');
			break;
		case 'update':
		case 'edit':
			if (!isStaff) throw 'You do not have permssion to do that.';
			if (!input.includes('|')) throw usage;
			subCommand = 'update';
			[snip, contents] = input.split('|');
			[, snip] = snip.split(' ');
			break;
		case 'delete':
		case 'remove':
			if (!isStaff) throw 'You do not have permssion to do that.';
			subCommand = 'delete';
			[, snip] = input.split(' ');
			if (!snip) throw 'Invalid snippet name';
			break;
		case 'list':
		case '':
			subCommand = 'list';
			console.log([subCommand, snip.toLowerCase(), contents]);
			break;
		default:
			subCommand = 'run';
			if (input.includes(' ')) {
				[, snip] = input.split(' ');
			} else {
				snip = input;
			}
	}

	if (snip !== undefined && (snip.includes(' ') || snip === '')) throw 'Invalid snippet name';

	return [subCommand, snip.toLowerCase(), contents];
}
