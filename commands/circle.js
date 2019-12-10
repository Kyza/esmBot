const gm = require("gm").subClass({
  imageMagick: true
});
const gmToBuffer = require("../utils/gmbuffer.js");

exports.run = async (message) => {
  message.channel.sendTyping();
  const image = await require("../utils/imagedetect.js")(message);
  if (image === undefined) return `${message.author.mention}, you need to provide an image to add radial blur!`;
  const data = gm(image.data).out("-radial-blur", 10);
  const resultBuffer = await gmToBuffer(data);
  return message.channel.createMessage("", {
    file: resultBuffer,
    name: `circle.${image.type}`
  });
};

exports.aliases = ["cblur", "radial", "radialblur"];
exports.category = 5;
exports.help = "Applies a radial blur effect on an image";