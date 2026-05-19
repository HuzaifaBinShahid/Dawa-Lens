const samples = [
  // Real OCR outputs from Pakistani medicine boxes
  "AUGMENTIN 625mg\nAmoxicillin 500mg\nClavulanic Acid 125mg\nGSK\nFor oral use only\n30 Film-Coated Tablets",
  "Panadol Extra\nParacetamol 500mg Caffeine 65mg\nGlaxoSmithKline\nRelief from pain and fever",
  "BRUFEN 400\nIbuprofen 400mg\nAbbott\nAnti-inflammatory analgesic",
  "Disprin\nAspirin 300mg\nReckitt\nFor headache and fever",
  "FLAGYL 400\nMetronidazole 400mg\nSanofi\n21 tablets",
  "CAVOL - C\nParacetamol 500mg\nAscorbic Acid 500mg\nGetz Pharma\n10 Tablets"
];

async function testModel(modelName, sample) {
  try {
    const prompt = `You are a medicine label parser. From the following text extracted from a medicine box, identify ONLY the brand/trade name of the medicine. 
    
Text: "${sample}"

Rules:
- Return ONLY the brand name (e.g., "Augmentin", "Panadol", "Brufen")
- Do NOT include: salt names, dosages (mg/ml), manufacturer names, instructions
- If multiple brand names exist, return the most prominent one
- Return ONLY the name, no explanation

Brand name:`;

    const startTime = Date.now();
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false
      })
    });
    
    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    
    return {
      result: data.response.trim(),
      timeMs: endTime - startTime
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function runTests() {
    console.log("Starting LLM tests...\n");
    // You can change these to whatever models you have pulled in Ollama
    const models = ['medgemma:4b']; 

    for (const sample of samples) {
        console.log(`\nTesting Sample:\n${'-'.repeat(20)}\n${sample}\n${'-'.repeat(20)}`);
        
        for (const model of models) {
             console.log(`\nModel: ${model}`);
             const result = await testModel(model, sample);
             if (result.error) {
                 console.log(`❌ Error: ${result.error}`);
             } else {
                 console.log(`✅ Extracted: "${result.result}"`);
                 console.log(`⏱️  Time: ${result.timeMs}ms`);
             }
        }
    }
}

runTests();
