const { EmbedBuilder, Colors } = require('discord.js'); // Added Colors for default

module.exports = {
  run: async (client, message, args) => {
    // Determine target user: mentioned user or command author
    const targetUser = message.mentions.users.first() || message.author;

    const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 512 });

    // Determine embed color
    let embedColor = Colors.Blue; // Default color
    if (message.guild && message.member) {
      // message.member might be null if the command is used in DMs by mentioning a user from a shared server
      // or if the author is the target and the command is in DMs.
      // If the targetUser is different from message.author, and we want targetUser's color:
      // const targetMember = message.guild.members.cache.get(targetUser.id);
      // if (targetMember && targetMember.displayHexColor !== '#000000') {
      //   embedColor = targetMember.displayHexColor;
      // } else if (message.member.displayHexColor !== '#000000') {
      //   embedColor = message.member.displayHexColor;
      // }
      // For simplicity, using the command author's member color if in guild.
      if (message.member.displayHexColor !== '#000000') {
         embedColor = message.member.displayHexColor;
      }
    }


    const embed = new EmbedBuilder()
      .setTitle(`Avatar de ${targetUser.username}`)
      .setImage(avatarURL)
      .setColor(embedColor)
      .setFooter({ text: `Solicitado por ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

    message.channel.send({ embeds: [embed] }).catch(console.error);
  },

  conf: {},

  get help () {
    return {
      name: 'avatar',
      category: 'Info',
      description: 'Mostra o avatar do usuário ou de um bot.',
      usage: 'avatar [@usuário]' // Updated usage
    };
  }
};
