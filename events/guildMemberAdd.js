const moment = require('moment');
const { EmbedBuilder } = require('discord.js'); // Changed

/**
 * O evento guildMemberAdd é emitido após um membro entrar (ser adicionado em uma guild).
 */

module.exports = async (client, member) => {
  // Verificações anti-selfbot de divulgação
  const daysSinceCreation = moment().diff(moment(member.user.createdAt), 'days');
  // More robust default avatar check for v14
  const isDefaultAvatar = member.user.avatar === null;
  const usernameAnalysis = member.user.username.match(/((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}/);
  const domainInUsername = usernameAnalysis ? usernameAnalysis.length > 0 : false;

  if (domainInUsername && (isDefaultAvatar || daysSinceCreation < 3)) {
    try {
      await member.send('Olá! Você foi kickado automaticamente por suspeita de divulgação em nosso servidor. Contas com menos de 3 dias no discord não podem ter domínios (exemplo twitter.com)');
    } catch (dmError) {
      console.error(`Falha ao enviar DM para ${member.user.tag} antes do kick:`, dmError);
    }
    try {
      await member.kick('Autokick: Selfbots não são bem vindos');
    } catch (kickError) {
      console.error(`Falha ao kickar ${member.user.tag}:`, kickError);
    }
    return; // Simplified return
  }

  const welcomeEmbed = new EmbedBuilder() // Changed
    .setThumbnail(member.user.displayAvatarURL()) // Changed
    .setColor('Random') // Changed (PascalCase, though 'RANDOM' might still work)
    .setAuthor({ name: '👋 Bem-vindo(a) ao servidor dos Piratas!' }) // Changed
    .setTitle('Tire duvidas e compartilhe conhecimentos!')
    .setDescription(`${member}, vá para o chat de regras e as leia!!`)
    .setFooter({ text: '2020 ©Piratas' }) // Changed
    .setTimestamp();

  const joinNotificationEmbed = new EmbedBuilder() // Changed
    .setThumbnail(member.user.displayAvatarURL()) // Changed
    .setColor('Random') // Changed
    .setAuthor({ name: '✨ Um novo membro entrou no servidor!' }) // Changed
    .setDescription(`${member} acabou de entrar!!! Seja bem vindo.`)
    .setFooter({ text: '2020 ©Piratas' }) // Changed
    .setTimestamp();

  const joinChannelId = process.env.JOINCHANNEL;
  if (joinChannelId) {
    const joinChannel = member.guild.channels.cache.get(joinChannelId);
    if (joinChannel && joinChannel.isTextBased()) { // Check if channel is text-based
      joinChannel.send({ embeds: [joinNotificationEmbed] }).catch(e => console.error("Falha ao enviar msg de join:",e));
    } else {
      console.error(`Canal de JOINCHANNEL (ID: ${joinChannelId}) não encontrado ou não é um canal de texto.`);
    }
  } else {
    console.log("Variável de ambiente JOINCHANNEL não definida."); // Log if env var is missing
  }

  const greetChannelId = process.env.GREETCHANNEL;
  if (greetChannelId) {
    const greetChannel = member.guild.channels.cache.get(greetChannelId);
    if (greetChannel && greetChannel.isTextBased()) { // Check if channel is text-based
      greetChannel.send({ embeds: [welcomeEmbed] }).catch(e => console.error("Falha ao enviar msg de greet:",e));
    } else {
      console.error(`Canal de GREETCHANNEL (ID: ${greetChannelId}) não encontrado ou não é um canal de texto.`);
    }
  } else {
    console.log("Variável de ambiente GREETCHANNEL não definida."); // Log if env var is missing
  }
};
