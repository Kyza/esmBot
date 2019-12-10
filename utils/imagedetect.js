const fetch = require("node-fetch");
const fileType = require("file-type");
const urlRegex = /(?:\w+:)?\/\/(\S+)/;

// this checks if the file is, in fact, an image
const typeCheck = async (image) => {
  // download the file to a buffer
  const imageRequest = await fetch(image);
  const imageBuffer = await imageRequest.buffer();
  try {
    // get the file type
    const imageType = fileType(imageBuffer);
    // check if the file is a jpeg, png, or webp
    if (imageType && ["image/jpeg", "image/png", "image/webp"].includes(imageType.mime)) {
      // if it is, then return the url with the file type
      return {
        type: imageType.ext,
        data: imageBuffer
      };
    } else {
      // if not, then return false
      return false;
    }
  } catch (error) {
    throw error;
  }
};

// this checks for the latest message containing an image and returns the url of the image
module.exports = async (cmdMessage) => {
  // we start by getting the messages
  const messages = await cmdMessage.channel.getMessages();
  // iterate over each message
  for (const message of messages) {
    // check the attachments first
    if (message.attachments.length !== 0) {
      // get type of file
      const type = await typeCheck(message.attachments[0].url);
      // move to the next message if the file isn't an image
      if (type === false) continue;
      // if the file is an image then return it
      return type;
      // if there's nothing in the attachments check the urls in the message if there are any
    } else if (urlRegex.test(message.content)) {
      // get url
      const url = message.content.match(urlRegex);
      // get type of file
      const type = await typeCheck(url[0]);
      // move to the next message if the file isn't an image
      if (type === false) continue;
      // if the file is an image then return it
      return type;
      // if there's no urls then check the embeds
    } else if (message.embeds.length !== 0) {
      // embeds can have 2 possible entries with images, we check the thumbnail first
      if (message.embeds[0].thumbnail) {
        const type = await typeCheck(message.embeds[0].thumbnail.url);
        if (type === false) continue;
        return type;
        // if there isn't a thumbnail check the image area
      } else if (message.embeds[0].image) {
        const type = await typeCheck(message.embeds[0].image.url);
        if (type === false) continue;
        return type;
      }
    }
  }
};