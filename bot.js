// REDDIT LIBRARY AND SETUP ////////////////////////////////////////
var fs = require('fs');

var axios = require('axios');
// Controlling our environment so that the bot works correctly when deployed on Heroku
var environment = process.env.NODE_ENV || 'development'

// we only use the config.js on dev machines to test without sharing credentials
if (environment == "development") {
    var redditConfig = require('./config.js');
}

// This is a wrapper for the Reddit api. It isn't necessary, but it makes working with the API easier
var snoowrap = require('snoowrap');

// configure the reddit library using all of your super-secret config data
const reddit = new snoowrap({
    userAgent: 'Javascript bot that informs those that call Winston a monkey or gorilla that he is, in fact, a scientist.',
    // These variables in CAPS are environment variables set in heroku via CLI or web interface. If the app is in dev mode, it will use the config file instead.
    clientId: process.env.REDDIT_CLIENT || redditConfig.clientId,
    clientSecret: process.env.REDDIT_SECRET || redditConfig.clientSecret,
    username: process.env.REDDIT_USER || redditConfig.username,
    password: process.env.REDDIT_PASS || redditConfig.password
});

getNewComments = (sub = 'Overwatch') => {
    reddit.getSubreddit(sub).getNewComments().then(function(listing) {
        console.log("\n")
        for (var i = 0; i < listing.length; i++) {
            var comment = listing[i];
            console.log(comment.author);

            if (!commentRepliedTo(comment) && comment.author.name != "winstonScientistBot2" ) {
                harambeMentioned(comment);
            }
            else if (comment.author.name == "winstonScientistBot2"){
              console.log("\nINFINITE LOOP!!", comment.body)
            }
        }
    })
}

harambeMentioned = (comment) => {
    var searchTerms = /gorilla|harambe|monkey|primate/i;
    if (searchTerms.test(comment.body)) {
        // console.log('\nMonkey Business:', comment.body)
        var insult = searchTerms.exec(comment.body)
        commentReply(comment, insult)
    } else {
        // console.log('\nNo monkeys :(')
    }
}

commentReply = (comment, insult) => {
    reddit.getComment(comment.id)
    .reply('He is *not* a ' + insult + ". He's a *scientist*." + "\n - /u/winstonScientistBot2  ")

    // write the comment id to file so that we know it was replied to already
    fs.appendFile("./comments_replied_to.txt", comment.id + "\n", 'utf8', function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("Replied to comment:", comment.id, comment.body)
    })
}

commentRepliedTo = (comment) => {
    var text = fs.readFileSync('./comments_replied_to.txt', 'utf8');
    // console.log(text);
    if (text.indexOf(comment.id) > -1) {
        return true
    } else {
        return false
    }
}

// // We run the function once so that it runs immediately when deployed
// // Set how often the bot will run in milliseconds. Be careful not to set it for too frequently!
// // This one is set for an hour
getNewComments();
setInterval(getNewComments, 10000);
