import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listAvailableModels() {
  console.log('🔍 Checking available Gemini models...\n');
  
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    const models = response.data.models || [];
    console.log(`✅ Found ${models.length} models:\n`);
    
    // Filter for text generation models
    const chatModels = models.filter(m => 
      m.supportedGenerationMethods?.includes('generateContent')
    );
    
    console.log('📝 Models supporting generateContent:');
    chatModels.forEach(model => {
      console.log(`  - ${model.name}`);
      console.log(`    Display Name: ${model.displayName}`);
      console.log(`    Methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    });
    
    if (chatModels.length > 0) {
      console.log('\n🎯 Recommended model to use:');
      console.log(`   ${chatModels[0].name}`);
    }
    
  } catch (error) {
    console.error('❌ Error fetching models:', error.response?.data || error.message);
  }
}

async function testModel(modelName) {
  console.log(`\n🧪 Testing model: ${modelName}`);
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Say "Hello, I am working!" in one sentence.' }]
          }
        ]
      }
    );
    
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`✅ Model works! Response: ${text}`);
    return true;
  } catch (error) {
    console.error(`❌ Model failed:`, error.response?.data?.error?.message || error.message);
    return false;
  }
}

async function main() {
  if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
  }
  
  console.log('🔑 API Key found (first 10 chars):', API_KEY.substring(0, 10) + '...\n');
  
  // List all available models
  await listAvailableModels();
  
  // Test specific models
  console.log('\n' + '='.repeat(60));
  console.log('Testing specific models:');
  console.log('='.repeat(60));
  
  const modelsToTest = [
    'models/gemini-1.5-flash-latest',
    'models/gemini-1.5-pro-latest',
    'models/gemini-pro',
    'models/gemini-1.5-flash',
  ];
  
  for (const model of modelsToTest) {
    await testModel(model);
  }
}

main();