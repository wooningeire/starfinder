const Discord = require("../node_modules/discord.js");
const {token, guildId} = require("./config.js");
const client = new Discord.Client();

client.on("ready", async () => {
    const channels = [...client.guilds.get(guildId).channels.values()]
            .filter(a => a instanceof Discord.TextChannel)
            .sort((a, b) => BigInt(a.position) - BigInt(b.position));

    channelLoop:
    for (let channel of channels) {
        if (channel.type !== "text") continue;
        console.log(channel.name);
        
        try {
            let messages = new Discord.Collection();
            let earliestMessageId = "";

            do {
                messages = await channel.fetchMessages({limit: 100, before: earliestMessageId});

                let newEarliestMessageId = findEarliestId(messages);

                if (!newEarliestMessageId || earliestMessageId === newEarliestMessageId) {
                    continue channelLoop;
                }

                earliestMessageId = newEarliestMessageId;

                printStars(messages);
            } while ([...messages.values()].length !== 0)
        } catch (error) {
            console.log(" - ", error.message);
        }
    }

    process.exit(0);
});

client.on("message", async message => {
});

client.login(token);

function findEarliestId(messages) {
    messages = [...messages.values()];
    if (!messages[0]) return false;

    let earliestId = BigInt(messages[0].id);

    for (let i = 0; i < messages.length; i++) {
        if (earliestId <= BigInt(messages[i].id)) continue;
        earliestId = BigInt(messages[i].id);
    }

    return earliestId.toString();
}

function printStars(messages) {
    for (let message of messages.values()) {
        const reactions = message.reactions;
        if ([...reactions.values()].length === 0) continue;

        const starReactions = reactions.get("⭐");
        if (starReactions && starReactions.count === 4) {
            console.log(`${message.id} — ${message.author.tag}: ${message.content}`);
        }
    }
}