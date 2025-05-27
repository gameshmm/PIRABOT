/**
   * Evento ready é disparado assim que o bot é conectado ao Discord
   */
const { ActivityType } = require('discord.js'); // Import ActivityType

module.exports = async (client) => {
  // The way to access total users and guilds might differ if not all are cached.
  // For a general count, client.guilds.cache.size is standard.
  // client.users.cache.size might not represent all users the bot can see,
  // but rather those cached. For a simple "bot is online" message, guild count is often sufficient.
  console.log(`Eu estou online agora, meu nome é ${client.user.username}. Online em ${client.guilds.cache.size} servidor(es)!`);

  if (process.env.GAME) { // Only set activity if GAME is defined in .env
    client.user.setPresence({
      activities: [{ name: process.env.GAME, type: ActivityType.Playing }],
      status: 'online',
    });
  } else {
    client.user.setPresence({
      status: 'online',
    });
  }
};
