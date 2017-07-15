const { Command } = require('../../index');
const { inspect } = require('util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, 'eval', {
			aliases: ['ev'],
			permLevel: 10,
			description: 'Evaluates arbitrary Javascript. Reserved for bot owner.',
			usage: '<expression:str>'
		});
	}

	async run(msg, [code]) {
		try {
			let evaled = eval(code);
			if (evaled instanceof Promise) evaled = await evaled;
			if (typeof evaled !== 'string') evaled = inspect(evaled, { depth: 0 });
			msg.sendCode('js', this.client.methods.util.clean(this.client, evaled));
		} catch (err) {
			msg.sendMessage(`\`ERROR\` \`\`\`js\n${this.client.methods.util.clean(this.client, err)}\n\`\`\``);
			if (err.stack) this.client.emit('error', err.stack);
		}
	}

};