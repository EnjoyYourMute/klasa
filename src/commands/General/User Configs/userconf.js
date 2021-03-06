const { Command, util: { toTitleCase, codeBlock } } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: (msg) => msg.language.get('COMMAND_CONF_USER_DESCRIPTION'),
			subcommands: true,
			usage: '<get|set|remove|reset|list> (key:key) (value:value) [...]',
			usageDelim: ' '
		});

		this
			.createCustomResolver('key', (arg, possible, msg, [action]) => {
				if (action === 'list' || arg) return arg;
				throw msg.language.get('COMMAND_CONF_NOKEY');
			})
			.createCustomResolver('value', (arg, possible, msg, [action]) => {
				if (!['set', 'remove'].includes(action) || arg) return arg;
				throw msg.language.get('COMMAND_CONF_NOVALUE');
			});
	}

	get(msg, [key]) {
		const { path } = this.client.gateways.users.getPath(key, { avoidUnconfigurable: true, piece: true });
		return msg.sendMessage(msg.language.get('COMMAND_CONF_GET', path.path, path.resolveString(msg)));
	}

	async set(msg, [key, ...valueToSet]) {
		const { path } = await msg.author.configs.update(key, valueToSet.join(' '), msg.guild, { avoidUnconfigurable: true, action: 'add' });
		return msg.sendMessage(msg.language.get('COMMAND_CONF_UPDATED', path.path, path.resolveString(msg)));
	}

	async remove(msg, [key, ...valueToRemove]) {
		const { path } = await msg.author.configs.update(key, valueToRemove.join(' '), msg.guild, { avoidUnconfigurable: true, action: 'remove' });
		return msg.sendMessage(msg.language.get('COMMAND_CONF_UPDATED', path.path, path.resolveString(msg)));
	}

	async reset(msg, [key]) {
		const { path } = await msg.author.configs.reset(key, true);
		return msg.sendMessage(msg.language.get('COMMAND_CONF_RESET', path.path, path.resolveString(msg)));
	}

	list(msg, [key]) {
		const { path } = this.client.gateways.users.getPath(key, { avoidUnconfigurable: true, piece: false });
		return msg.sendMessage(msg.language.get('COMMAND_CONF_USER', key ? `: ${key.split('.').map(toTitleCase).join('/')}` : '', codeBlock('asciidoc', path.getList(msg))));
	}

};
