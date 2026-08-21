// server/services/llm/geminiProvider.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function getModel() {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });
  }
  return model;
}

/**
 * Generate JSON completion using Google Gemini Generative AI.
 * @param {string} prompt
 * @returns {Promise<string>} raw JSON text
 */
async function generate(prompt) {
  const activeModel = getModel();
  const result = await activeModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

module.exports = {
  generate,
  getModel,
};
