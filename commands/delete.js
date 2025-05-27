const { PermissionsBitField } = require('discord.js');

module.exports = {
  run: async (client, message, args) => {
    if (!message.guild || !message.member) {
        return message.reply("Este comando só pode ser usado em um servidor.");
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('Você não tem permissão para usar esse comando!');
    }

    const prefix = process.env.PREFIX || '!'; // Fallback prefix
    const usage = `\`\`\`${prefix}${module.exports.help.usage}\`\`\``;
    let amountToDelete;

    if (args.length === 1) {
      amountToDelete = parseInt(args[0]);
    } else {
      return message.reply(`Determine uma quantidade de mensagens para serem excluídas (1-100): ${usage}`);
    }

    if (isNaN(amountToDelete) || amountToDelete <= 0 || amountToDelete > 100) {
      return message.reply(`Determine uma quantidade válida entre 1 e 100: ${usage}`);
    }

    try {
      // Delete the command message itself
      await message.delete().catch(e => console.warn("Delete Command: Falha ao deletar mensagem de comando:", e.message)); // Warn instead of error
      
      // Fetch messages to delete (max 100, younger than 14 days for bulk)
      // amountToDelete is already validated to be <= 100
      const fetchedMessages = await message.channel.messages.fetch({ limit: amountToDelete });
      
      if (fetchedMessages.size === 0) {
        const noMessagesNote = await message.channel.send("Nenhuma mensagem encontrada para deletar (que se qualifique para exclusão em massa).");
        setTimeout(() => noMessagesNote.delete().catch(console.error), 5000);
        return;
      }

      // Perform bulk delete. The `true` argument filters out messages older than 14 days.
      const deletedMessages = await message.channel.bulkDelete(fetchedMessages, true);

      const confirmationMessage = await message.channel.send(`${deletedMessages.size} mensagens foram deletadas!`);
      setTimeout(() => confirmationMessage.delete().catch(console.error), 5000);

    } catch (err) {
      console.error("Erro ao tentar deletar mensagens em massa:", err);
      let replyText = 'Ocorreu um erro ao tentar deletar as mensagens.';
      if (err.code === 50034) { // DiscordAPIError: You can only bulk delete messages that are under 14 days old.
        replyText = 'Não posso deletar mensagens com mais de 14 dias.';
      } else if (err.code === 10008) { // Unknown message
        replyText = 'Uma ou mais mensagens não puderam ser encontradas para exclusão (podem já ter sido excluídas ou serem muito antigas).';
      } else if (err.code === 50013 || err.code === 50001) { // Missing Permissions or Missing Access
        replyText = 'Não tenho permissão para deletar mensagens neste canal.';
      }
      
      const errorReply = await message.channel.send(replyText);
      setTimeout(() => errorReply.delete().catch(console.error), 5000);
    }
  },

  conf: {
    onlyguilds: true
  },

  get help () {
    return {
      name: 'delete',
      category: 'Moderação',
      description: 'Apaga uma quantidade especificada de mensagens de um canal (até 100, com menos de 14 dias).',
      usage: 'delete <quantidade>',
      admin: true
    };
  }
};
