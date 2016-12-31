var token = process.env.TOKEN;

var Bot = require('node-telegram-bot-api');
var Q = require('q');
var request = Q.denodeify(require("request"));
var CronJob = require('cron').CronJob;
var bot;

if(process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
}
else {
  bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

bot.onText(/\/start|Hello|Hey/ig, function (msg) {
  var name = msg.from.first_name;
  var greetingMsgArr = [
    `Greetings master, how may I be of assistance?`,
    `Oh hello, the silence was pleasing, but since I'm still bound by contract, how may I be of service.`,
    `Your wish is my command... cliché... but you get the idea.`,
    `I was beginning to think you forgot my existence... how can I help master?`,
    `Welcome back master, I have been awaiting your orders.`,
    `I'm one hell of a butler, you need only to say the words and consider the command done.`,
    `Hello master, what can I do for you?`
  ];
  var message =
  randomResult(greetingMsgArr) + `\n
  1.Magic8 Ball:\t magic8 <question>
  2.Decision Maker:\t choose <option A> ... <option Z>
  3.Coin flip:\t coinflip
  4.Reminder:\t remind <event> <time>`

  bot.sendMessage(msg.chat.id, message ).then(function () {
    // reply sent!
  });
});

bot.onText(/magic8 (.+)/, function(msg, match){
  var fromId = msg.from.id;
  var question = encodeURIComponent(match[1]);

  getMagicAns(question).then(function(data){

    bot.sendMessage(fromId, data);
  });
});

function getMagicAns(question) {
  var url = "https://8ball.delegator.com/magic/JSON/"+question;

  var options = {
    url: url,
    method: "GET",
    json: true
  };

  var response = request(options);
  return response.then(function(r){
    return r[0].body.magic.answer;
  });
}

bot.onText(/choose (.+)/, function(msg, match) {
  var fromId = msg.from.id;
  var name = msg.from.first_name;
  var choiceArr = match[1].split(" ");
  var choice = Math.floor(Math.random() * choiceArr.length);
  var replyArr = [
    `Such interesting choices, I'd say go with `,
    `Eeny, meeny, miny, moe... it'd have to be `,
    `Seriously? Without a doubt `,
    `The demon butler says `,
    `Fascinating... a tough choice, but the way to go is `,
    `If you'd ask me, definitely `,
    `I'm not good with deciding, but my gut feeling says to go with `,
    `That's a clear-cut choice, definitely `
  ]
  var message = randomResult(replyArr) + choiceArr[choice];
  bot.sendMessage(fromId, message);
});

bot.onText(/coinflip/, function(msg, match){
  var fromId = msg.from.id;
  var choices = ["Heads", "Tails"];
  var headImgArr = [
    "https://s-media-cache-ak0.pinimg.com/236x/4d/f3/1a/4df31abe9e876e62071bbfa9200cff58.jpg",
    "http://nardio.net/wp-content/uploads/2012/12/whack-a-kitty-300x216.jpg",
    "https://s-media-cache-ak0.pinimg.com/236x/3b/25/4d/3b254dee736974771227f367605d8458.jpg",
    "https://s-media-cache-ak0.pinimg.com/564x/e5/e3/33/e5e333875951e1e4aeed64b8ce0e7ee2.jpg",
    "https://s-media-cache-ak0.pinimg.com/564x/74/4e/a3/744ea3f6c9f4f6be7272b086a12b4665.jpg",
    "http://24.media.tumblr.com/6f408402d25c9bb04a05e5a1b94b4b8f/tumblr_mzxoy4lpj71se16ejo2_1280.jpg"
  ];
  var tailImgArr = [
    "https://i.ytimg.com/vi/s8BOaKa3Zps/hqdefault.jpg",
    "http://www.animalsbase.com/wp-content/uploads/2015/09/Cream-Colored-Squirrel-On-Railing-Holds-Bent-Tail-In-Cute-Paws.jpg",
    "http://orig10.deviantart.net/1121/f/2013/149/1/4/fluffy_tails_unite__by_pichu90-d6702lf.png",
    "https://stbeavers.files.wordpress.com/2016/05/cute-baby-foxes-2-574436930d433__880.jpg?w=529&h=382"
  ]
  var result = Math.floor(Math.random()*2) === 0 ? "Heads!" : "Tails!";
  var img = result === "Heads!" ? randomResult(headImgArr) : randomResult(tailImgArr);

  bot.sendPhoto(fromId, img);
  bot.sendMessage(fromId, result);
});

function randomResult(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

bot.onText(/remind (.+)/, function(msg, match){
  var fromId = msg.from.id;
  var sentDate = new Date(msg.date * 1000);

  var time = parseInt(match[1]);
  var remindDate = new Date(sentDate.getTime() + time * 1000);
  var timeStr = match[match.length-1].charAt(match[match.length-1].length-1).toLowerCase();

  switch(timeStr) {
    case 's':
      remindDate = new Date(sentDate.getTime() + time * 1000);
      break;
    case 'h':
      remindDate = new Date(sentDate.getTime() + time * 60 * 60 * 1000);
      break;
    case 'd':
      remindDate = new Date(sentDate.getTime() + time * 24 * 60 * 60 * 1000);
      break;
  }
  console.log(sentDate, remindDate);
  // var job = new CronJob(remindDate, function(){
  //   bot.sendMessage(fromId, "reminder");
  // }, null, true);

});
module.exports = bot;
