const Messages = require("../models/messageModel");
const { translateText } = require("../utils/translate");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: { $all: [from, to] },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        original: msg.message.original,
        translated: msg.message.translated,
      };
    });
console.log("Fetched messages from DB:", messages);

    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, targetLang } = req.body;
    const translated = await translateText(message, targetLang || "en");

    const data = await Messages.create({
      message: {
        original: message,
        translated: translated,
      },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
