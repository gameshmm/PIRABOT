const RoleManager = require('../utils/rolemanager'); // Capitalized for class
const rolemgr = new RoleManager();
const { PermissionsBitField } = require('discord.js'); // For permission checking

module.exports = {
  run: async (client, message, [option, value, value2]) => {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply('Você não pode fazer isto :c');
    }

    if (!message.guild) {
        // This check is technically redundant due to conf.onlyguilds but good for direct feedback
        return message.reply("Este comando só pode ser utilizado em um servidor.");
    }

    // Attempt to get prefix from environment, fallback to a default if necessary (e.g. client.defaultPrefix if set elsewhere)
    const prefix = process.env.PREFIX || '!'; // Assuming '!' as a last resort default if not set
    const usage = `\`\`\`${prefix}${module.exports.help.usage}\`\`\``;

    if (!option) {
      return message.reply(`Talvez isso possa ajudá-lo(a): ${usage}`);
    }

    option = option.toLowerCase();

    if (option === 'addrole' || option === 'remrole') {
      let currentRoles;
      try {
        const cargosPath = require.resolve('../cargos.json');
        delete require.cache[cargosPath];
        currentRoles = require(cargosPath);
      } catch (e) {
        console.error("Erro ao carregar cargos.json:", e);
        return message.reply("Erro ao carregar configuração de cargos. Tente novamente.");
      }

      if (!value) return message.reply(`Por favor, especifique o nome do cargo. Uso: ${usage}`);
      
      const roleName = value;
      const shouldAdd = option === 'addrole';
      const roleExistsInConfig = currentRoles.includes(roleName);
      const guildRole = message.guild.roles.cache.find(r => r.name === roleName);

      if (shouldAdd) {
        if (roleExistsInConfig) return message.reply('Esse cargo já está na lista de cargos auto-assignáveis!');
        
        try {
          if (!guildRole) {
            await message.guild.roles.create({ name: roleName, reason: `Adicionado via comando config por ${message.author.tag}` });
            message.channel.send(`Cargo "${roleName}" criado no servidor.`);
          }
          // Ensure rolemgr.addrole is robust or add checks for its return value
          if (rolemgr.addrole(roleName)) {
            message.reply(`Cargo "${roleName}" adicionado à lista de cargos auto-assignáveis.`);
          } else {
            message.reply('Não consegui adicionar esse cargo à configuração (pode já existir ou outro erro). Verifique os logs.');
          }
        } catch (err) {
          console.error(`Erro ao adicionar/criar role "${roleName}":`, err);
          message.reply(`Ocorreu um erro ao tentar adicionar o cargo "${roleName}".`);
        }
      } else { // remrole
        if (!roleExistsInConfig) return message.reply('Esse cargo não está na lista de cargos auto-assignáveis!');
        
        try {
          if (guildRole) {
            await guildRole.delete(`Removido via comando config por ${message.author.tag}`);
            message.channel.send(`Cargo "${roleName}" removido do servidor.`);
          }
          // Ensure rolemgr.removerole is robust
          if (rolemgr.removerole(roleName)) {
             message.reply(`Cargo "${roleName}" removido da lista de cargos auto-assignáveis.`);
          } else {
             message.reply('Não consegui remover esse cargo da configuração (pode não existir ou outro erro). Verifique os logs.');
          }
        } catch (err) {
          console.error(`Erro ao remover/deletar role "${roleName}":`, err);
          message.reply(`Ocorreu um erro ao tentar remover o cargo "${roleName}".`);
        }
      }
    } else if (option === 'rrmsg') {
      try {
        const reactionRoleMessage = await message.channel.send('Esta será a mensagem de role reaction. Configure os emojis e cargos usando `config rradd emoji cargo`.');
        rolemgr.setMessage(reactionRoleMessage.id, message.channel.id);
        message.reply(`Mensagem de reaction role configurada em ${message.channel}. ID: ${reactionRoleMessage.id}`);
      } catch (err) {
        console.error("Erro ao enviar mensagem para rrmsg:", err);
        message.reply("Não foi possível configurar la mensagem de reaction role.");
      }
    } else if (option === 'rradd') {
      if (!value || !value2) return message.reply(`Uso: \`${prefix}config rradd <emoji> <nome_do_cargo_ou_ID>\`. O emoji deve ser um emoji customizado do servidor ou um unicode emoji. O cargo deve existir.`);
      
      const targetRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === value2.toLowerCase()) || message.guild.roles.cache.get(value2);
      if (!targetRole) return message.reply(`Cargo "${value2}" não encontrado. Verifique o nome ou ID e tente novamente.`);

      try {
        rolemgr.addEmoji(value, targetRole.id); 
        await rolemgr.updateMsg(client); 
        message.reply(`Emoji ${value} adicionado para o cargo **${targetRole.name}**. Mensagem de reaction role atualizada.`);
      } catch (err) {
        console.error("Erro em rradd:", err);
        message.reply("Ocorreu um erro ao adicionar o emoji para reaction role. Verifique se a mensagem de reaction role está configurada (`config rrmsg`).");
      }
    } else if (option === 'rrrem') {
      if (!value) return message.reply("Por favor, especifique o emoji a ser removido.");
      try {
        rolemgr.removeEmoji(value); 
        await rolemgr.updateMsg(client);
        message.reply(`Emoji ${value} removido. Mensagem de reaction role atualizada.`);
      } catch (err) {
        console.error("Erro em rrrem:", err);
        message.reply("Ocorreu um erro ao remover o emoji. Verifique se a mensagem de reaction role está configurada.");
      }
    } else if (option === 'rrupd') {
      try {
        await rolemgr.updateMsg(client);
        message.reply('Mensagem de reaction role atualizada.');
      } catch (err) {
        console.error("Erro em rrupd:", err);
        message.reply("Ocorreu um erro ao atualizar a mensagem de reaction role. Verifique se está configurada (`config rrmsg`).");
      }
    } else {
      return message.reply(`Opção inválida. Talvez isso possa ajudá-lo(a): ${usage}`);
    }
  },

  conf: {
    onlyguilds: true
  },

  get help () {
    return {
      name: 'config',
      category: 'Moderação',
      description: 'Altera as configurações do bot para cargos auto-assignáveis e reaction roles.',
      usage: 'config [addrole <nome> | remrole <nome> | rrmsg | rradd <emoji> <cargo> | rrrem <emoji> | rrupd]',
      admin: true
    };
  }
};
