const { EmbedBuilder } = require('discord.js'); // Changed

/**
 * O evento guildMemberRemove é emitido quando um membro sai ou é removido de uma guild.
 * (Doc comment updated for clarity as original said guildMemberAdd)
 */

module.exports = async (client, member) => {
  // Ensure member and user are defined before proceeding
  if (!member || !member.user) {
    console.error('Evento guildMemberRemove acionado sem um membro válido ou usuário do membro.');
    return;
  }

  // It's possible member details (like guild) are not available if the bot was offline
  // or if the member object is partial. A check for guild can be useful.
  if (!member.guild) {
      console.error(`Evento guildMemberRemove acionado para ${member.user.tag} mas sem informações do servidor (guild).`);
      return;
  }

  const leaveEmbed = new EmbedBuilder() // Changed
    .setThumbnail(member.user.displayAvatarURL()) // Changed
    .setColor('Random') // Changed
    .setAuthor({ name: '👤 Um membro saiu do servidor!' }) // Changed
    .setDescription(`${member.user.tag} acabou de sair.`) // Changed to use tag as member object might not resolve to mention
    .setFooter({ text: '2020 ©Piratas' }) // Changed
    .setTimestamp();

  const leaveChannelId = process.env.LEAVECHANNEL;
  if (leaveChannelId) {
    const leaveChannel = member.guild.channels.cache.get(leaveChannelId); // Changed
    if (leaveChannel && leaveChannel.isTextBased()) { // Changed
      leaveChannel.send({ embeds: [leaveEmbed] }).catch(e => console.error("Falha ao enviar msg de leave:", e)); // Changed
    } else {
      console.error(`Canal de LEAVECHANNEL (ID: ${leaveChannelId}) não encontrado ou não é um canal de texto.`);
    }
  } else {
    console.log("Variável de ambiente LEAVECHANNEL não definida.");
  }
};
