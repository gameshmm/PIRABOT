const { EmbedBuilder, Colors } = require('discord.js');
const moment = require('moment');

moment.locale('pt-br');

module.exports = {
  run: async (client, message, args) => {
    const botAvatarURL = client.user.displayAvatarURL();
    const creationDate = client.user.createdAt;
    const botUsername = client.user.username;
    const guildCount = client.guilds.cache.size;
    const userCount = client.users.cache.size; // Represents cached users

    const currentStatus = client.user.presence?.status || 'offline';
    const statusMap = {
      online: '`🟢` Online',
      idle: '`🟡` Ausente',
      dnd: '`🔴` Não Perturbe',
      offline: '`⚫` Offline'
    };

    // Calculate uptime using moment.duration based on client.uptime
    const uptime = moment.duration(client.uptime).humanize();

    const embed = new EmbedBuilder()
      .setColor(Colors.Blue) 
      .setThumbnail(botAvatarURL)
      .setAuthor({ name: '🤖 Minhas informações', iconURL: botAvatarURL })
      .addFields(
        { name: '**Meu nick**', value: botUsername, inline: false },
        { name: '**Meu ID**', value: client.user.id, inline: false },
        { name: '**Servidores**', value: `🛡 ${guildCount}`, inline: true },
        { name: '**Usuários (em cache)**', value: `${userCount}`, inline: true },
        { name: '**Estou online há**', value: uptime, inline: true },
        { name: '**Status**', value: statusMap[currentStatus] || statusMap.offline, inline: true },
        { name: '**Criado em**', value: moment(creationDate).format('DD/MM/YYYY, [às] HH:mm:ss'), inline: false }
      )
      .setFooter({ text: `${new Date().getFullYear()} © ${botUsername}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] }).catch(console.error);
  },

  conf: {},

  get help () {
    return {
      name: 'botinfo',
      category: 'Info',
      description: 'Mostra informações do bot.',
      usage: 'botinfo'
    };
  }
};
// The custom formatDate function should be removed from this file.
