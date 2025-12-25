// ============================================
// DISCORD WELCOME BOT - Complete Setup
// ============================================

// 1. INSTALL DEPENDENCIES
// Run: npm install discord.js dotenv

// 2. CREATE .env FILE
// BOT_TOKEN=your_bot_token_here
// WELCOME_CHANNEL_ID=your_welcome_channel_id
// RULES_CHANNEL_ID=your_rules_channel_id
// GENERAL_CHANNEL_ID=your_general_channel_id
// YOUTUBE_LINK=https://youtube.com/@yourchannel
// AUTO_ROLE_ID=your_default_role_id (optional)

// ============================================
// MAIN BOT CODE - index.js
// ============================================

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  AttachmentBuilder,
  ActivityType,
  PermissionFlagsBits,
} = require("discord.js");
require("dotenv").config();

// Bot Configuration
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Environment Variables
const CONFIG = {
  token: process.env.BOT_TOKEN,
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID,
  rulesChannelId: process.env.RULES_CHANNEL_ID,
  generalChannelId: process.env.GENERAL_CHANNEL_ID,
  youtubeLink: process.env.YOUTUBE_LINK || "https://youtube.com",
  autoRoleId: process.env.AUTO_ROLE_ID,
};

// ============================================
// BOT READY EVENT
// ============================================
client.once("ready", () => {
  console.log("╔════════════════════════════════════╗");
  console.log("║   🎮 WELCOME BOT IS ONLINE! 🎮   ║");
  console.log("╚════════════════════════════════════╝");
  console.log(`✅ Logged in as: ${client.user.tag}`);
  console.log(`📊 Servers: ${client.guilds.cache.size}`);
  console.log(
    `👥 Users: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`
  );
  console.log("════════════════════════════════════");

  // Set Bot Status
  client.user.setActivity("new members join! 👋", {
    type: ActivityType.Watching,
  });
});

// ============================================
// MEMBER JOIN EVENT - WELCOME MESSAGE
// ============================================
client.on("guildMemberAdd", async (member) => {
  console.log(`👋 New member joined: ${member.user.tag}`);

  // Get welcome channel
  const welcomeChannel = member.guild.channels.cache.get(
    CONFIG.welcomeChannelId
  );

  if (!welcomeChannel) {
    console.error(
      "❌ Welcome channel not found! Check WELCOME_CHANNEL_ID in .env"
    );
    return;
  }

  const banner = new AttachmentBuilder("./images/banner_welcome.png", {
    name: "banner_welcome.png",
  });

  // Create welcome embed
  const welcomeEmbed = new EmbedBuilder()
    .setColor("#FF6B6B") // Red color
    .setTitle("🎮 WELCOME TO THE SERVER!")
    .setDescription(
      `Halo ${member}! Selamat datang di **${member.guild.name}**!\n\nKami senang kamu bergabung dengan komunitas gaming yang paling have fun! 🚀`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
    .addFields(
      {
        name: "📊 Member Count",
        value: `Kamu member ke-**${member.guild.memberCount}**!`,
        inline: true,
      },
      {
        name: "📅 Account Created",
        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
        inline: true,
      },
      {
        name: "📜 Read Rules",
        value: CONFIG.rulesChannelId
          ? `Jangan lupa baca rules di <#${CONFIG.rulesChannelId}>`
          : "Baca rules server!",
        inline: false,
      },
      {
        name: "💬 Say Hello!",
        value: CONFIG.generalChannelId
          ? `Kenalan di <#${CONFIG.generalChannelId}> yuk!`
          : "Say hi di chat!",
        inline: false,
      },
      {
        name: "🎬 YouTube Channel",
        value: `[Subscribe sekarang!](${CONFIG.youtubeLink})`,
        inline: false,
      }
    )
    .setImage("attachment://banner_welcome.png")
    .setFooter({
      text: "Have fun and enjoy your stay! 🎯",
      iconURL: member.guild.iconURL(),
    })
    .setTimestamp();

  // Send welcome message
  try {
    await welcomeChannel.send({
      content: `${member} 🎉`,
      embeds: [welcomeEmbed],
      files: [banner],
    });

    console.log(`✅ Welcome message sent for ${member.user.tag}`);
  } catch (error) {
    console.error("❌ Error sending welcome message:", error);
  }

  // Auto-assign role (optional) - IMPROVED WITH BETTER ERROR HANDLING
  if (CONFIG.autoRoleId) {
    try {
      const role = member.guild.roles.cache.get(CONFIG.autoRoleId);

      if (!role) {
        console.error(
          `❌ Role with ID ${CONFIG.autoRoleId} not found in server`
        );
        return;
      }

      // Get bot member to check permissions
      const botMember = member.guild.members.me;

      // Check if bot has MANAGE_ROLES permission
      if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
        console.error(
          "❌ Bot lacks MANAGE_ROLES permission. Please enable it in Server Settings → Roles"
        );
        return;
      }

      // Check role hierarchy (bot's role must be higher than the role to assign)
      if (botMember.roles.highest.position <= role.position) {
        console.error(
          `❌ Cannot assign role "${role.name}". Bot's role must be HIGHER in the role hierarchy.`
        );
        console.error(
          `   Bot's highest role: "${botMember.roles.highest.name}" (position: ${botMember.roles.highest.position})`
        );
        console.error(
          `   Target role: "${role.name}" (position: ${role.position})`
        );
        console.error(
          `   Fix: Drag bot's role ABOVE "${role.name}" in Server Settings → Roles`
        );
        return;
      }

      // All checks passed, assign the role
      await member.roles.add(role);
      console.log(`✅ Auto-role "${role.name}" assigned to ${member.user.tag}`);
    } catch (error) {
      console.error("❌ Error assigning auto-role:", error.message);
      if (error.code === 50013) {
        console.error(
          "   → Missing Permissions. Check role hierarchy and bot permissions."
        );
      }
    }
  }

  // Send DM to new member (optional)
  try {
    const dmEmbed = new EmbedBuilder()
      .setColor("#4ECDC4")
      .setTitle(`👋 Welcome to ${member.guild.name}!`)
      .setDescription(
        `Hai ${member.user.username}!\n\nTerima kasih sudah join server kami. Jangan lupa:\n\n✅ Baca rules\n✅ Kenalan di chat\n✅ Subscribe YouTube kami!\n\nHave fun! 🎮`
      )
      .setThumbnail(member.guild.iconURL())
      .setFooter({ text: member.guild.name });

    await member.send({ embeds: [dmEmbed] });
    console.log(`✅ DM sent to ${member.user.tag}`);
  } catch (error) {
    // User might have DMs disabled
    console.log(
      `⚠️ Could not send DM to ${member.user.tag} (DMs might be disabled)`
    );
  }
});

// ============================================
// MEMBER LEAVE EVENT - GOODBYE MESSAGE
// ============================================
client.on("guildMemberRemove", async (member) => {
  console.log(`👋 Member left: ${member.user.tag}`);

  const welcomeChannel = member.guild.channels.cache.get(
    CONFIG.welcomeChannelId
  );

  if (!welcomeChannel) return;

  const goodbyeEmbed = new EmbedBuilder()
    .setColor("#95A5A6") // Gray color
    .setDescription(
      `😢 **${member.user.tag}** telah meninggalkan server.\n\nSemoga bertemu lagi! 👋`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `Member count: ${member.guild.memberCount}` })
    .setTimestamp();

  try {
    await welcomeChannel.send({ embeds: [goodbyeEmbed] });
    console.log(`✅ Goodbye message sent for ${member.user.tag}`);
  } catch (error) {
    console.error("❌ Error sending goodbye message:", error);
  }
});

// ============================================
// SIMPLE COMMANDS (Optional)
// ============================================
client.on("messageCreate", async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // !ping command
  if (message.content.toLowerCase() === "!ping") {
    const latency = Date.now() - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("🏓 Pong!")
      .addFields(
        { name: "Latency", value: `${latency}ms`, inline: true },
        { name: "API Latency", value: `${apiLatency}ms`, inline: true }
      );

    message.reply({ embeds: [embed] });
  }

  // !serverinfo command
  if (message.content.toLowerCase() === "!serverinfo") {
    const guild = message.guild;

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle(`📊 ${guild.name} - Server Info`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "👥 Members", value: `${guild.memberCount}`, inline: true },
        {
          name: "📅 Created",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        { name: "👑 Owner", value: `<@${guild.ownerId}>`, inline: true },
        {
          name: "💬 Channels",
          value: `${guild.channels.cache.size}`,
          inline: true,
        },
        { name: "🎭 Roles", value: `${guild.roles.cache.size}`, inline: true },
        { name: "😀 Emojis", value: `${guild.emojis.cache.size}`, inline: true }
      )
      .setFooter({ text: `Server ID: ${guild.id}` });

    message.reply({ embeds: [embed] });
  }

  // !help command
  if (message.content.toLowerCase() === "!help") {
    const embed = new EmbedBuilder()
      .setColor("#9B59B6")
      .setTitle("🤖 Bot Commands")
      .setDescription("Berikut adalah command yang tersedia:")
      .addFields(
        { name: "!ping", value: "Cek latency bot", inline: false },
        { name: "!serverinfo", value: "Info tentang server", inline: false },
        { name: "!help", value: "Tampilkan pesan ini", inline: false }
      )
      .setFooter({ text: "Have fun! 🎮" });

    message.reply({ embeds: [embed] });
  }

  // !checkperms command - Check bot permissions
  if (message.content.toLowerCase() === "!checkperms") {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Only administrators can use this command.");
    }

    const botMember = message.guild.members.me;
    const hasManageRoles = botMember.permissions.has(
      PermissionFlagsBits.ManageRoles
    );

    let roleInfo = "No auto-role configured";
    if (CONFIG.autoRoleId) {
      const role = message.guild.roles.cache.get(CONFIG.autoRoleId);
      if (role) {
        const canAssign = botMember.roles.highest.position > role.position;
        roleInfo = `**Target Role:** ${role.name}\n**Can Assign:** ${
          canAssign ? "✅ Yes" : "❌ No (role hierarchy issue)"
        }`;
      } else {
        roleInfo = `❌ Role ID ${CONFIG.autoRoleId} not found`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(hasManageRoles ? "#00FF00" : "#FF0000")
      .setTitle("🔐 Bot Permission Check")
      .addFields(
        {
          name: "Manage Roles Permission",
          value: hasManageRoles ? "✅ Enabled" : "❌ Disabled",
          inline: false,
        },
        {
          name: "Bot's Highest Role",
          value: botMember.roles.highest.name,
          inline: true,
        },
        {
          name: "Role Position",
          value: `${botMember.roles.highest.position}`,
          inline: true,
        },
        {
          name: "Auto-Role Status",
          value: roleInfo,
          inline: false,
        }
      )
      .setFooter({ text: "Use this to diagnose permission issues" });

    message.reply({ embeds: [embed] });
  }
});

// ============================================
// ERROR HANDLING
// ============================================
client.on("error", (error) => {
  console.error("❌ Discord client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);
});

// ============================================
// LOGIN BOT
// ============================================
client.login(CONFIG.token).catch((error) => {
  console.error("❌ Failed to login:", error);
  process.exit(1);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down bot gracefully...");
  client.destroy();
  process.exit(0);
});
