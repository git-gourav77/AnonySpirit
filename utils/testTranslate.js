const { InferenceClient } = require("@huggingface/inference");
require("dotenv").config({ path: "../.env" });


const hf = new InferenceClient(process.env.HF_API_TOKEN);
console.log("Token loaded from .env:", process.env.HF_API_TOKEN);

async function testTranslation() {
  const text = "My name is gourav 😂😂";

  try {   
    const result = await hf.translation({
      model: "Helsinki-NLP/opus-mt-en-hi",
      inputs: text,
    });

    console.log("✅ Translated Output:\n", result.translation_text);
  } catch (err) {
    console.error("❌ Translation failed:", err.message);
  }
}

testTranslation();

