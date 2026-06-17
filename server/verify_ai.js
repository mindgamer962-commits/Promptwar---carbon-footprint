import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

console.log('🔍 Running OpenRouter API connection diagnostics...');
console.log('Model: google/gemma-2-9b-it:free');

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('❌ Error: OPENROUTER_API_KEY is missing from environment variables!');
  process.exit(1);
}

console.log(`Key Prefix: ${apiKey.slice(0, 12)}...`);

async function testConnection() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Is this image transparent? Reply yes or no." },
              { type: "image_url", image_url: { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" } }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.choices && data.choices[0]) {
      console.log('\n🟢 CONNECTION SUCCESSFUL!');
      console.log(`🤖 AI Response: "${data.choices[0].message.content.trim()}"`);
      process.exit(0);
    } else {
      throw new Error('Invalid response structure received.');
    }
  } catch (err) {
    console.error('\n🔴 CONNECTION FAILED!');
    console.error('Error Details:', err.message);
    process.exit(1);
  }
}

testConnection();
