// really don't like this file

const gm = require("gm").subClass({
  imageMagick: true
});

exports.run = async (message) => {
  message.channel.sendTyping();
  const image = await require("../utils/imagedetect.js")(message);
  if (image === undefined) return `${message.author.mention}, you need to provide an image to mirror!`;
  const data = `/tmp/${Math.random().toString(36).substring(2, 15)}.${image.type}`;
  const data2 = `/tmp/${Math.random().toString(36).substring(2, 15)}.${image.type}`;
  gm(image.data).gravity("West").crop("50%", 0).strip().write(data2, (error) => {
    if (error) throw error;
    gm(data2).flop().strip().write(data, async (error) => {
      if (error) throw error;
      gm(data2).append(data, true).toBuffer(image.type, (error, resultBuffer) => {
        if (error) throw error;
        return message.channel.createMessage("", {
          file: resultBuffer,
          name: `haah.${image.type}`
        });
      });
    });
  });
};

exports.aliases = ["magik4", "mirror2"];
exports.category = 5;
exports.help = "Mirrors the left side of an image onto the right";