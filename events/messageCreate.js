const { EmbedBuilder } = require('discord.js'); // Import EmbedBuilder

module.exports = async (client, message) => {
  if (message.author.bot) return;

  // APRESENTACAO CHANNEL LOGIC
  if (message.channel.id === process.env.APRESENTACAO) {
    // This logic is guild-specific, so ensure message.guild and message.member exist
    if (!message.guild || !message.member) {
      console.log("Evento de mensagem recebido em APRESENTACAO sem guild ou member context. Ignorando.");
      return;
    }

    const roleName = 'Apresentado';
    const role = message.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
      console.error(`Role "${roleName}" não encontrada no servidor ${message.guild.name} (ID: ${message.guild.id})`);
      return; // Cannot proceed without the role
    }

    if (!message.member.roles.cache.has(role.id)) {
      try {
        await message.member.roles.add(role);
        const emojiName = 'liga'; // Custom emoji name
        const customEmoji = message.guild.emojis.cache.find(e => e.name === emojiName);
        if (customEmoji) {
          await message.react(customEmoji);
        } else {
          await message.react('👍'); // Fallback if custom emoji 'liga' is not found
          console.log(`Emoji customizado "${emojiName}" não encontrado. Usando fallback 👍.`);
        }
      } catch (err) {
        console.error(`Falha ao adicionar role ou reagir em #apresente-se para ${message.author.tag}:`, err);
      }
    } else {
      // User already has the role, treat as spam/mistake
      const embed = new EmbedBuilder()
        .setColor(0xFF7A7B) // Hex for 16739451
        .setTitle('Como resetar seu status de apresentação:')
        .setDescription('**Hey**, caso você tenha errado a digitação de algo em sua mensagem de apresentação, basta digitar o comando `p!reset` no *chat de comandos do servidor* para resetar a sua apresentação!');
      
      try {
        await message.author.send({ embeds: [embed] });
      } catch (dmError) {
        console.error(`Falha ao enviar DM de reset de apresentação para ${message.author.tag}:`, dmError);
        // Discord API Error Code 50007: Cannot send messages to this user
        if (dmError.code === 50007) {
          message.reply('Me desculpe, mas eu não tenho permissões para enviar DM para você! Sua mensagem no canal de apresentação foi removida. Use `p!reset` para tentar novamente se precisar.')
            .catch(replyError => console.error("Falha ao enviar mensagem de fallback no canal de apresentação:", replyError));
        }
      }
      
      message.delete().catch(err => console.error(`Falha ao deletar mensagem em #apresente-se de ${message.author.tag}:`, err));
    }
    return; // End of APRESENTACAO logic
  }

  // SUGESTOES / PROJETOS CHANNEL LOGIC
  if (message.channel.id === process.env.SUGESTOES || message.channel.id === process.env.PROJETOS) {
    if (message.content.startsWith('^')) return;
    try {
      // Ensure these emoji IDs are correct for the bot/server or are standard unicode emojis
      await message.react('662625034770186241'); 
      await message.react('662624803756441600');
    } catch (reactError) {
      console.error(`Falha ao reagir em #sugestoes/#projetos (Channel ID: ${message.channel.id}):`, reactError);
    }
    return; // End of SUGESTOES/PROJETOS logic
  }

  // DESAFIOS CHANNEL LOGIC
  if (message.channel.id === process.env.DESAFIOS) {
    try {
      await message.react('✅');
    } catch (reactError) {
      console.error(`Falha ao reagir em #desafios (Channel ID: ${message.channel.id}):`, reactError);
    }
    return; // End of DESAFIOS logic
  }

  // COMMAND HANDLING
  if (!process.env.PREFIX || typeof process.env.PREFIX !== 'string' || message.content.indexOf(process.env.PREFIX) !== 0) {
    return; // Silently ignore if no prefix or prefix is not a string
  }

  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
  const commandName = args.shift().toLowerCase();

  const cmd = client.commands.get(commandName);

  if (!cmd || !cmd.run || typeof cmd.run !== 'function' || !cmd.help || !cmd.help.name) {
    // Silently ignore if command not found or malformed
    return;
  }
  
  const logSource = message.guild ? `servidor: ${message.guild.name} (${message.guild.id})` : 'DM';
  console.log(`log: ${message.author.tag} (${message.author.id}) executou o comando: ${cmd.help.name} em ${logSource}`);

  if (cmd.conf && cmd.conf.onlyguilds && !message.guild) {
    // message.reply('Este comando só pode ser usado em um servidor.').catch(console.error); // Optional: notify user
    return; 
  }

  try {
    await cmd.run(client, message, args); // Assuming cmd.run can be async
  } catch (error) {
    console.error(`Erro ao executar o comando ${cmd.help.name} por ${message.author.tag}:`, error);
    message.reply('Houve um erro ao tentar executar esse comando!').catch(err => console.error(`Falha ao notificar usuário sobre erro de comando ${cmd.help.name}:`, err));
  }
};
