const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      original: { type: String, required: true },
      translated: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", MessageSchema);

