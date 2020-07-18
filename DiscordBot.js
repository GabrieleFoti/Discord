const Discord = require('discord.js')
const client = new Discord.Client()


client.on('ready', () => {
  console.log('Ready.')
  client.user.setPresence({activity : {type : 'LISTENING', name : '.help'}, status : 'idle'})
    .catch(console.error)
})

client.on('message', async message =>{
  prefix = '.'
  if(message.author.bot) return undefined
  if(message.channel.type === 'dm') return undefined
  if(!message.content.startsWith(prefix)) return undefined

  if(message.content.startsWith(prefix + 'help')){
    message.react('🌑')
    let embedMsg = new Discord.MessageEmbed()
    embedMsg.setAuthor('Gin', client.user.avatarURL())
    embedMsg.setTitle('Commands list')
    embedMsg.setDescription('Hi I\'m Gin, I am capable of executing some moderation commands to help you manage your server.')
    embedMsg.addFields(
      {name : 'Moderation commands: ', value : '``clear`` [number of messages(max 100)] \n``kick`` [member tag or member id] [reason(optional)] \n``ban`` [member tag] [reason(optional)] \n``softban`` [member tag or id] \n``unban`` [member tag or id]'},
      {name : 'Info commands: ', value : '``userinfo`` [user tag] \n``serverinfo`` \n``roleinfo`` [role tag]'},
      {name : 'Funny commands: ', value : '``coinflip`` \n``dice`` [n faces of the dice] '}
    )
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
    if(!member){memberSnowflake = args[1]
    if(isNaN(memberSnowflake)) return message.reply('you must specify a member to kick')
    member = message.guild.members.cache.get(id = memberSnowflake)
    if(member === undefined) return message.reply('this id does not correspond to any member of the guild')
    }
    reason = args.splice(2,).join(' ')
    if(!reason) reason = undefined
    member.send(`You have been kicked from ***${message.guild.name}*** for reason: ***${reason}***`).then(() => member.kick(reason))
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
    reason = args.splice(2,).join(' ')
    if(!reason) reason = undefined
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
    reason = args.splice(2,).join(' ')
    member.send(`You have been banned from ***${message.guild.name}*** for reason: ***${reason}***`).then(() => {member.ban({days : 7, reason : reason}); message.guild.members.unban(member)})

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
        embedmessage.addFields(
          { name: 'Joined at:', value: memdate, inline: true },
  		    { name: 'Registered at:', value: usedate, inline: true },
          { name: `Roles [${member.roles.cache.array().length - 1}]`, value: `${member.roles.cache.filter(r => r.id !== message.guild.id).map(r => `${r}`).join(' | ')}`},
        )
        embedmessage.setFooter(`ID: ${member.id}`)
        embedmessage.setTimestamp()
        return message.channel.send(embedmessage);
      }else{
        message.channel.send('You must mention someone first.')
      }
  }
  else if(message.content.startsWith(prefix + 'serverinfo')){
      var data = new Date(message.guild.createdTimestamp).toGMTString();
      let embed = new Discord.MessageEmbed()
      .setAuthor('Gin', client.user.avatarURL())
      .setTitle(`${message.guild.name}`)
      .setThumbnail(message.guild.iconURL())
      .addFields(
        {name:'Created by:' , value:`${message.guild.owner}`},
        {name: 'Created at:',value: `${data}`},
        {name: 'Region: ', value: message.guild.region, inline : true},
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
  else if(message.content.startsWith(prefix + 'coinflip')){
    var x = Math.floor(Math.random() * 2)

    if(x == 0) message.reply(' head.')
    else message.reply('tail.')
  }
  else if(message.content.startsWith(prefix + 'dice')){
    let args = message.content.split(' ')[1]
    var x = Math.floor(Math.random() * args + 1)

    message.reply(x)

  }
  else{
    message.reply('this command does not exist, try the help command to get the list of all the commands.')
  }

})

client.login('NTc2MDI2NTAwNzkzNDk5NjQ4.XxOA0w.41lvK-QaaquFUUGN5yh4cq5rD9c')
