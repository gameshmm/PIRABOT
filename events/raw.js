// events/raw.js
module.exports = async (client, event) => {
  // Only process specific reaction events
  if (event.t !== 'MESSAGE_REACTION_ADD' && event.t !== 'MESSAGE_REACTION_REMOVE') {
    return;
  }

  // Destructure data from the event payload
  const { user_id, message_id, guild_id, emoji } = event.d;

  // Ignore reactions from the bot itself or other bots
  // Note: user_id is the ID of the user who reacted. client.user.id is the bot's ID.
  if (!user_id || user_id === client.user.id) {
    // Also check if the user who reacted is a bot, if guild and member data were fetched:
    // const guildForBotCheck = client.guilds.cache.get(guild_id);
    // if (guildForBotCheck) {
    //   const memberForBotCheck = guildForBotCheck.members.cache.get(user_id);
    //   if (memberForBotCheck && memberForBotCheck.user.bot) return;
    // }
    // For simplicity in raw event, just checking against client.user.id is a common first step.
    return;
  }

  let emojiRoleConfig;
  try {
    // Clear cache for fresh read - consider a more robust config management strategy long-term
    const configPath = require.resolve('../emojiRole.json');
    delete require.cache[configPath];
    emojiRoleConfig = require(configPath);
  } catch (error) {
    console.error('[Raw Event] Falha ao carregar emojiRole.json:', error);
    return;
  }

  // Check if the reaction is on the configured message
  if (emojiRoleConfig.id !== message_id) {
    return;
  }

  // Determine the emoji key (ID for custom emojis, name for Unicode emojis)
  const emojiKey = emoji.id ? emoji.id : emoji.name;

  const roleId = emojiRoleConfig.emojis[emojiKey];
  if (!roleId) {
    // This emoji is not configured for a role on this message
    return;
  }

  try {
    const guild = await client.guilds.fetch(guild_id).catch(err => {
      // console.error(`[Raw Event] Falha ao buscar guild ${guild_id}: ${err.message}`);
      return null;
    });

    if (!guild) return; // Guild not found or bot is not in it

    const member = await guild.members.fetch(user_id).catch(err => {
      // console.error(`[Raw Event] Falha ao buscar membro ${user_id} na guild ${guild.name}: ${err.message}`);
      return null;
    });
    
    if (!member) return; // Member not found (e.g., left the server)
    if (member.user.bot) return; // Double check if the fetched member is a bot

    const role = guild.roles.cache.get(roleId);
    if (!role) {
      console.error(`[Raw Event] Role com ID ${roleId} (associada ao emoji ${emojiKey}) não encontrada no servidor ${guild.name}.`);
      // Future enhancement: consider notifying an admin or auto-removing this broken mapping
      return;
    }

    if (event.t === 'MESSAGE_REACTION_ADD') {
      await member.roles.add(role);
      // console.log(`[Raw Event] Cargo ${role.name} adicionado para ${member.user.tag} via reaction (Emoji: ${emojiKey}).`);
    } else if (event.t === 'MESSAGE_REACTION_REMOVE') {
      await member.roles.remove(role);
      // console.log(`[Raw Event] Cargo ${role.name} removido de ${member.user.tag} via reaction (Emoji: ${emojiKey}).`);
    }
  } catch (error) {
    console.error(`[Raw Event] Erro ao processar reaction role (Evento: ${event.t}, Emoji: ${emojiKey}, User: ${user_id}):`, error);
  }
};
