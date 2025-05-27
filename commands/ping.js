const { EmbedBuilder, Colors } = require('discord.js'); // Changed

module.exports = {
  run: async (client, message, args) => {
    const latency = Math.round(client.ws.ping); // Changed: client.ping to client.ws.ping

    // Use member's display color if available and in a guild, and not default (0), otherwise use a default color
    const embedColor = (message.guild && message.member && message.member.displayColor !== 0)
                       ? message.member.displayColor 
                       : Colors.Blue; // Using a default color from discord.js Colors enum

    const embed = new EmbedBuilder()
      .setAuthor({ name: `🏓 ${latency}ms`}) // Changed
      .setColor(embedColor);

    message.channel.send({ embeds: [embed] }).catch(console.error);
  },

  conf: {},

  get help () {
    return {
      name: 'ping',
      description: 'Mostra a latência do bot.',
      usage: 'ping',
      category: 'Info'
    };
  }
};
