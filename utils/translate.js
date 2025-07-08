
const { InferenceClient } = require("@huggingface/inference");
require("dotenv").config();

const hf = new InferenceClient(process.env.HF_API_TOKEN);

async function translateText(text, targetLang = "hi") {
  try {
    const modelId = `Helsinki-NLP/opus-mt-en-hi`;

    const result = await hf.translation({
      model: "Helsinki-NLP/opus-mt-en-hi",
      inputs: text,
    });

    return result.translation_text;
  } catch (error) {
    console.error(`❌ Translation to '${targetLang}' failed:`, error.message);
    return text;
  }
}

module.exports = { translateText };
