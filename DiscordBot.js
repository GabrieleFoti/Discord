require('dotenv-flow').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const mysql = require('mysql')
const DBL = require('dblapi.js')
var prefix = '.'
var palese = '.'
const config = {
  token : process.env.TOKEN,
  host : process.env.host,
  user : process.env.user,
  password : process.env.password,
  database : process.env.database,
  dbltoken : process.env.dbltoken,
}
const dbl = new DBL(config.dbltoken, client)

const connection = mysql.createConnection({

  host : config.host,
  user : config.user,
  password : config.password,
  database : config.database,

})

connection.connect((err) => {
  if(err) console.error(err)
})

client.on('guildCreate', (guild) => {
  name = guild.name.replace('\'', '\\\'')
  connection.query(`INSERT INTO \`Guild\`(\`id\`, \`prefix\`, \`name\`, \`guild_id\`) VALUES (NULL, '.','${name}',${guild.id})`, (err) => {})
})

client.on('guildDelete', (guild) => {

  connection.query(`DELETE FROM \`Guild\` WHERE guild_id = ${guild.id}`, (err) => {})

})
client.on('guildUpdate', (oldGuild, newGuild) => {
  connection.query(`UPDATE Guild SET name = "${newGuild.name}" WHERE guild_id = ${newGuild.id}`)
})
client.on('ready', () => {
  console.log('Ready.')
  client.user.setPresence({activity : {type : 'LISTENING', name : '.help'}, status : 'idle'})
    .catch(console.error)
})

client.on('guildMemberAdd', (member) => {
  connection.query(`SELECT welcome_msg, welcome_channel_id, welcome_role, welcome_role_id FROM Guild WHERE guild_id = ${member.guild.id}`, (err, results) => {
    if(err) console.error(err)
    else {

      if(results[0].welcome_msg === 0);
      else{
        var channel = results[0].welcome_channel_id
        var welcome_channel = member.guild.channels.cache.get(channel)
        welcome_channel.send(`Welcome, ${member}. (っ◔◡◔)っ`)
      }
      if(results[0].welcome_role === 0);
      else{
        var role = results[0].welcome_role_id
        var welcome_role = member.guild.roles.cache.get(role)
        member.roles.add(welcome_role)
      }
    }

  })
})

client.on('message', async message => {
  //if the message is from a dm channel return
  if(message.channel.type === 'dm') return undefined
  // setting the prefix
  connection.query(`SELECT prefix FROM Guild WHERE guild_id = ${message.guild.id}`, (err, result) => {
    if(err){
      console.error(err)
    }
    console.log(result)
    prefix = result[0].prefix

  })
  await resolve(1)
  // if the message author is a bot return
  if(message.author.bot) return undefined
  //if the message doesn't start with the prefix return
  if(!message.content.startsWith(prefix)) return undefined

  if(message.content.startsWith(prefix + 'lock')){
    if(!message.member.permissions.has('MANAGE_CHANNELS')) return message.reply('you do not have the permission to do that.')
    args = message.mentions.channels.first()

    if(!args.permissionOverwrites.first()){
      args.createOverwrite(message.guild.id, { 'SEND_MESSAGES' : false})
    }
    else args.permissionOverwrites.first().update({ 'SEND_MESSAGES' : false, })
    let embed = new Discord.MessageEmbed()
      .setDescription(`❌ locked channel ${args}.`)
    message.channel.send(embed)
  }
  else if(message.content.startsWith(prefix + 'unlock')){
    if(!message.member.permissions.has('MANAGE_CHANNELS')) return message.reply('you do not have the permission to do that.')
    args = message.mentions.channels.first()
    if(!args.permissionOverwrites.first()){
      args.createOverwrite(message.guild.id, { 'SEND_MESSAGES' : null})
    }
    else args.permissionOverwrites.first().update({ 'SEND_MESSAGES' : null, })
    let embed = new Discord.MessageEmbed()
      .setDescription(`✅ unlocked channel ${args}.`)
    message.channel.send(embed)
  }

  else if(message.content.startsWith(prefix + 'info')){
    if(!message.author.id === 366345779687981056 && !message.author.id === 359648176791355403) return mesage.reply('you do not have the permission to do that.')

    message.channel.send(`Sto guardando ${client.guilds.cache.array().length} server \nuptime : ${Math.round(client.uptime / 3600000)} ore \nutenti : ${client.users.cache.array().length}`)
  }
  else if(message.content.startsWith(prefix + 'help')){
    message.react('🌑')
    let embedMsg = new Discord.MessageEmbed()
    embedMsg.setAuthor('Gin', client.user.avatarURL())
    embedMsg.setTitle(`Commands list   |   current prefix: '${prefix}'`)
    embedMsg.setDescription('Hi I\'m Gin, I am capable of executing some moderation commands to help you manage your server.\n Here\'s the invite to my server:\n https://discord.gg/MDa8rHK')
    embedMsg.addFields(
      {name : 'Managing commands: ', value : '``togglewelcome`` [on/off] [tag of the channel to send the message in] \n``autorole`` [on/off] [role tag] sets an autorole for the new members.'},
      {name : 'Moderation commands: ', value : '``setprefix`` [new prefix] \n``clear`` [number of messages(max 100)] \n``kick`` [member tag or member id] [reason(optional)] \n``ban`` [member tag] [reason(optional)] \n``softban`` [member tag or id] \n``unban`` [member tag or id] \n``lock`` [channel tag] \n``unlock`` [channel tag] \n ``roleassign`` [member/s] [role/s]'},
      {name : 'Info commands: ', value : '``userinfo`` [user tag] \n``serverinfo`` \n``roleinfo`` [role tag]'},
      {name : 'Funny commands: ', value : '``coinflip`` \n``dice`` [n faces of the dice] '}
    )
    embedMsg.setTimestamp()
    message.member.send(embedMsg)


  }
  else if(message.content.startsWith(prefix + 'clear')){
    if(!message.member.permissions.has('MANAGE_MESSAGES'))  return message.reply('you do not have the permission to manage messages.')

    args = message.content.split(' ')[1]
    arg = parseInt(args, 10)
    if(arg < 0 || arg > 100 || arg === null) return message.reply('you must specify a number of messages to delete (max 100)')
    message.delete().then(() => {
      message.channel.bulkDelete(arg, true)
      message.reply('messages deleted.').then(message => message.delete({timeout : 3000}))
    })

  }
  else if(message.content.startsWith(prefix + 'kick')){
    if(!message.member.permissions.has('KICK_MEMBERS')) return message.reply('you do not have the permission to kick members.')
    args = message.content.split(' ')
    var member = message.mentions.members.first()
    if(!member){
    memberSnowflake = args[1]
    if(isNaN(memberSnowflake)) return message.reply('you must specify a member to kick')
    member = message.guild.members.cache.get(id = memberSnowflake)
    if(member === undefined) return message.reply('this id does not correspond to any member of the guild')
    }
    if(message.member.permissions.has('ADMINISTRATOR') && member.permissions.has('ADMINISTRATOR')) return message.reply('you cannot kick another administrator.')
    reason = args.splice(2,).join(' ')
    if(!reason) reason = undefined
    if(member.user.bot) member.kick(reason)
    else member.send(`You have been kicked from ***${message.guild.name}*** for reason: ***${reason}***`).then(() => member.kick(reason))
  }
  else if(message.content.startsWith(prefix + 'ban')){

    if(!message.member.permissions.has('BAN_MEMBERS')) return message.reply('you do not have the permission to ban members.')
    args = message.content.split(' ')
    var member = message.mentions.members.first()
    if(!member){memberSnowflake = args[1]
    if(isNaN(memberSnowflake)) return message.reply('you must specify a member to ban')
    member = message.guild.members.cache.get(id = memberSnowflake)
    if(member === undefined) return message.reply('this id does not correspond to any member of the guild')
    }
    if(message.member.permissions.has('ADMINISTRATOR') && member.permissions.has('ADMINISTRATOR')) return message.reply('you cannot ban another administrator.')
    reason = args.splice(2,).join(' ')
    if(!reason) reason = undefined
    if(member.user.bot) member.ban(reason)
    member.send(`You have been banned from ***${message.guild.name}*** for reason: ***${reason}***`).then(() => member.ban({days : 14, reason : reason}))

  }
  else if(message.content.startsWith(prefix + 'softban')){

    if(!message.member.permissions.has('BAN_MEMBERS')) return message.reply('you do not have the permission to ban members.')
    args = message.content.split(' ')
    var member = message.mentions.members.first()
    if(!member){
    memberSnowflake = args[1]
    if(isNaN(memberSnowflake)) return message.reply('You must specify a member to ban')
    member = message.guild.members.cache.get(id = memberSnowflake)
    if(member === undefined) return message.reply('This id does not correspond to any member of the guild')
    }
    if(message.member.permissions.has('ADMINISTRATOR') && member.permissions.has('ADMINISTRATOR')) return message.reply('you cannot softban another administrator.')
    reason = args.splice(2,).join(' ')
    member.send(`You have been kicked from ***${message.guild.name}*** for reason: ***${reason}***`).then(() => {member.ban({days : 7, reason : reason}); message.guild.members.unban(member)})

  }
  else if(message.content.startsWith(prefix + 'unban')){
    if(!message.member.permissions.has('BAN_MEMBERS')) return message.reply('you do not have the permission to ban members.')
    args = message.content.split(' ')
    var member = message.mentions.members.first()
    if(!member){
    memberSnowflake = args[1]
    if(isNaN(memberSnowflake)) return message.reply('You must specify a member to ban')
    member = message.guild.members.cache.get(id = memberSnowflake)
    if(member === undefined) return message.reply('This id does not correspond to any member of the guild')
    }
    message.guild.members.unban(member).then(() => message.reply(`${member} unbanned.`)).catch(() => message.reply('the member is not currently banned.'))
  }
  else if(message.content.startsWith(prefix + 'userinfo')){
    var user = message.mentions.users.first();
    if(user){
        var member = message.guild.member(user);
        var memdate = new Date(member.joinedAt).toGMTString()
        var usedate = new Date(user.createdAt).toGMTString()
        let embedmessage = new Discord.MessageEmbed();
        embedmessage.setColor('GREY')
        embedmessage.setAuthor(user.tag, user.avatarURL())
        embedmessage.setDescription(user)
        embedmessage.setThumbnail(user.avatarURL())
        if(member.roles.cache.array().length > 1){
        embedmessage.addFields(
          { name: 'Joined at:', value: memdate, inline: true },
  		    { name: 'Registered at:', value: usedate, inline: true },
          { name: `Roles [${member.roles.cache.array().length - 1}]`, value: `${member.roles.cache.filter(r => r.id !== message.guild.id).map(r => `${r}`).join(' | ')}`},
        )}else{
          embedmessage.addFields(
            { name: 'Joined at:', value: memdate, inline: true },
            { name: 'Registered at:', value: usedate, inline: true },
          )
        }
        embedmessage.setFooter(`ID: ${member.id}`)
        embedmessage.setTimestamp()
        return message.channel.send(embedmessage);
      }else{
        return message.reply('You must mention someone first.')
      }
  }
  else if(message.content.startsWith(prefix + 'serverinfo')){
      var data = new Date(message.guild.createdTimestamp).toGMTString();
      let embed = new Discord.MessageEmbed()
      .setAuthor('Gin', client.user.avatarURL())
      .setTitle(`${message.guild.name}`)
      .setThumbnail(message.guild.iconURL())
      .addFields(
        {name :'Created by:' , value :`${message.guild.owner}`},
        {name : 'Created at:',value : `${data}`},
        {name : 'Region: ', value : message.guild.region, inline : true},
        {name : 'AFKTimeout: ', value : message.guild.afkTimeout / 60 + ' mins', inline : true},
        {name : 'Member count: ', value : message.guild.memberCount, inline : true},
       )
      .setColor('GREY')
      .setTimestamp()
      .setFooter("Server ID: " + `${message.guild.id}`)
      message.channel.send(embed);
  }
  else if(message.content.startsWith(prefix + 'roleinfo')){
    var role = message.mentions.roles.first()
    if(!role) return message.reply(' you must mention a role.')
    data = new Date(role.createdTimestamp).toGMTString();
    let embed = new Discord.MessageEmbed()
    .setAuthor('Gin', client.user.avatarURL())
    .setTitle('Role info')
    .setThumbnail(message.guild.iconURL())
    .addFields(
      {name : 'Role: ', value : `${role}`},
      {name : 'Role id: ', value : `${role.id}`, inline : true},
      {name : 'Created at: ', value : `${data}`, inline : true},
      {name : 'Mentionable: ', value : `${role.mentionable}`},
      {name : 'Permissions: ', value : `${role.permissions.toArray().join('\n')}`}
    )
    .setTimestamp()
    message.channel.send(embed)
  }
  else if(message.content.startsWith(prefix + 'roleassign')){
    if(!message.member.permissions.has("MANAGE_ROLES")) return message.reply(' you don\'t have the permission to do that.')
    args = message.mentions
    if(!args.roles.first() && !args.members.first()) return message.reply(' you must mention a role/s and a member/s.')
    arg = message.mentions.roles.first()
    if(!arg) return message.reply(' you must mention one or more roles.')
    arga = message.mentions.members.first()
    if(!arga) return message.reply(' you must mention one or more members.')
    var high_role = message.guild.me.roles.highest

    var collection = message.mentions.roles.filter(role => role.rawPosition <= high_role.rawPosition)
    message.mentions.members.each(member => member.roles.add(collection.array()))
    if(collection.array().length !== message.mentions.roles.array().length) return message.reply(' i wasn\'t able to add all the roles to the member/s, make sure to put the Gin role higher on the server roles list.')

  }
  else if(message.content.startsWith(prefix + 'coin')){
    var x = Math.floor(Math.random() * 2)

    if(x == 0) message.reply(' head.')
    else message.reply('tail.')
  }
  else if(message.content.startsWith(prefix + 'dice')){
    let args = message.content.split(' ')[1]
    if(isNaN(args)) return message.reply('you must enter the number of dice\'s faces.')
    var x = Math.floor(Math.random() * args + 1)

    message.reply(x)

  }
  else if(message.content.startsWith(prefix + 'setprefix')){ 
    if(!message.member.permissions.has('MANAGE_GUILD')) return message.reply('you do not have the permission to perform this action.')
    var args = message.content.split(' ')[1]
    if(args === undefined) return message.reply('you must specify a new prefix to set.')
    connection.query(`UPDATE Guild SET prefix = '${args}' WHERE guild_id = '${message.guild.id}'`, (err) => {
      if(err) console.error(err)
    })
    message.reply('the prefix has been changed successfully.')
  }
  else if(message.content.startsWith(prefix + 'togglewelcome')){
    if(!message.member.permissions.has('MANAGE_GUILD')) return message.reply('you do not have the permission to perform this action.')
    var args = message.content.split(' ')
    var toggle = args[1]
    var channel = message.mentions.channels.first()
    if(toggle === undefined || (toggle != 'on' && toggle != 'off')) return message.reply('you must set the message to on or off.')
    if(channel === undefined) return message.reply('you must set a channel for the welcome message.')
    if(toggle === 'on'){
      message.reply('welcome message turned on.')
      connection.query(`UPDATE Guild SET welcome_msg = 1, welcome_channel_id = ${channel.id} WHERE guild_id = ${message.guild.id}`, (err) => {
      if(err) message.reply('there was an error setting the channel, please try again.')

      })
    }
      else{
        message.reply('welcome message turned off.')
        connection.query(`UPDATE Guild SET welcome_msg = 0, welcome_channel_id = NULL WHERE guild_id = ${message.guild.id}`, (err) => {
          if(err) message.reply('there was an error switching off the command, please try again.')

        })
      }
  }else if(message.content.startsWith(prefix + 'autorole')){
    if(!message.member.permissions.has('MANAGE_GUILD')) return message.reply('you do not have the permission to perform this action.')
    if(!message.member.permissions.has('MANAGE_ROLES')) return message.reply('you do not have the permission to perform this action.')
    var args = message.content.split(' ')
    var toggle = args[1]
    var role = message.mentions.roles.first()
    if(toggle === undefined || (toggle != 'on' && toggle != 'off')) return message.reply('you must set the feature to on or off.')
    if(role === undefined) return message.reply('you must set a role.')

    if(toggle === 'on'){ connection.query(`UPDATE Guild SET welcome_role = 1, welcome_role_id = ${role.id} WHERE guild_id = ${message.guild.id}`); message.reply(` the ${role.name} role has been set as a welcome role.`)}
    else{ connection.query(`UPDATE Guild SET welcome_role = 0, welcome_role_id = NULL WHERE guild_id = ${message.guild.id}`); message.reply(` the feature has been disabled.`)}
  }

})
function resolve(x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(x);
    }, 80);
  });
}
client.login(config.token)
