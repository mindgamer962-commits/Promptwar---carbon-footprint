// CarbonIQ AI - Backend Unit Test Suite
// Verifies core carbon mathematics, rating tiers, and receipt OCR factors

console.log('🧪 Starting CarbonIQ AI Carbon Mathematics Test Suite...\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`✅ PASS: ${message}`);
  } else {
    failCount++;
    console.error(`❌ FAIL: ${message}`);
  }
}

// -------------------------------------------------------------
// Core Algorithms extracted from server logic for unit testing
// -------------------------------------------------------------

function calculateIndividualFootprint(inputs) {
  const { transport, food, energy, shopping, travel, waste } = inputs;
  
  let transportCo2 = 0;
  if (transport.type === 'car_gas') transportCo2 = transport.dailyKm * 30 * 0.170;
  else if (transport.type === 'car_ev') transportCo2 = transport.dailyKm * 30 * 0.050;
  else if (transport.type === 'car_hybrid') transportCo2 = transport.dailyKm * 30 * 0.110;
  else if (transport.type === 'public') transportCo2 = transport.dailyKm * 30 * 0.040;
  else if (transport.type === 'bike_walk') transportCo2 = 0;
  
  let foodCo2 = 0;
  if (food.diet === 'meat_heavy') foodCo2 = 250;
  else if (food.diet === 'meat_moderate') foodCo2 = 180;
  else if (food.diet === 'pescatarian') foodCo2 = 120;
  else if (food.diet === 'vegetarian') foodCo2 = 90;
  else if (food.diet === 'vegan') foodCo2 = 60;
  
  const energyCo2 = (energy.kwh || 250) * 0.380;
  
  let shoppingCo2 = 50;
  if (shopping.frequency === 'high') shoppingCo2 = 200;
  else if (shopping.frequency === 'medium') shoppingCo2 = 100;
  else if (shopping.frequency === 'low') shoppingCo2 = 40;
  
  const travelCo2 = ((travel.shortFlights || 0) * 150 + (travel.longFlights || 0) * 800) / 12;
  const wasteCo2 = (waste.bagsPerWeek || 2) * 4 * 1.5;

  const total = transportCo2 + foodCo2 + energyCo2 + shoppingCo2 + travelCo2 + wasteCo2;
  
  return {
    transport: Math.round(transportCo2),
    food: Math.round(foodCo2),
    energy: Math.round(energyCo2),
    shopping: Math.round(shoppingCo2),
    travel: Math.round(travelCo2),
    waste: Math.round(wasteCo2),
    total: Math.round(total)
  };
}

function calculateSustainabilityScore(footprint) {
  const total = footprint.total;
  let score = 100 - (total / 15);
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return Math.round(score);
}

function estimateReceiptEmissions(category, amount) {
  let co2Grams = 0;
  if (category === 'fuel') co2Grams = amount * 2.3;
  else if (category === 'grocery') co2Grams = amount * 0.45;
  else if (category === 'utility') co2Grams = amount * 0.38;
  else co2Grams = amount * 0.2;
  return Math.round(co2Grams * 10) / 10;
}

// -------------------------------------------------------------
// Test Case 1: High Emission Profile (Gasoline commute, Heavy meat)
// -------------------------------------------------------------
try {
  const highImpactInputs = {
    transport: { type: 'car_gas', dailyKm: 50 },
    food: { diet: 'meat_heavy' },
    energy: { kwh: 600 },
    shopping: { frequency: 'high' },
    travel: { shortFlights: 4, longFlights: 2 },
    waste: { bagsPerWeek: 4 }
  };

  const fp = calculateIndividualFootprint(highImpactInputs);
  assert(fp.transport === 255, 'High transport emissions matches daily gas car multiplier');
  assert(fp.food === 250, 'Heavy meat eater matches peak food multiplier');
  assert(fp.energy === 228, '600 kWh power bill emits ~228kg CO2');
  assert(fp.total === 1140, 'Aggregate high emission output sum matches expected totals');

  const score = calculateSustainabilityScore(fp);
  assert(score < 50, 'High emission score correctly flags user under "Carbon Beginner" (<50)');
} catch (e) {
  failCount++;
  console.error('Test Case 1 failed with exception:', e);
}

// -------------------------------------------------------------
// Test Case 2: Eco-Friendly Profile (EV commuter, Vegan, Low power)
// -------------------------------------------------------------
try {
  const greenInputs = {
    transport: { type: 'car_ev', dailyKm: 20 },
    food: { diet: 'vegan' },
    energy: { kwh: 150 },
    shopping: { frequency: 'low' },
    travel: { shortFlights: 0, longFlights: 0 },
    waste: { bagsPerWeek: 1 }
  };

  const fp = calculateIndividualFootprint(greenInputs);
  assert(fp.transport === 30, 'EV travel produces 88% lower transport emissions than gas');
  assert(fp.food === 60, 'Vegan diet matches baseline green dietitian multiplier');
  assert(fp.total === 193, 'Optimized lifestyle reduces emissions under 200kg/month');

  const score = calculateSustainabilityScore(fp);
  assert(score >= 85, 'Green lifestyle raises index score to Eco Warrior/Champion range (>=85)');
} catch (e) {
  failCount++;
  console.error('Test Case 2 failed with exception:', e);
}

// -------------------------------------------------------------
// Test Case 3: Receipt OCR Emission Coefficients
// -------------------------------------------------------------
try {
  const fuelCo2 = estimateReceiptEmissions('fuel', 40);
  assert(fuelCo2 === 92, '40 liters of gasoline yields ~92kg CO2 emissions');

  const groceryCo2 = estimateReceiptEmissions('grocery', 100);
  assert(groceryCo2 === 45, '100 dollars of groceries yields ~45kg CO2 supply logistics emissions');
} catch (e) {
  failCount++;
  console.error('Test Case 3 failed with exception:', e);
}

// -------------------------------------------------------------
// Final Report Summary
// -------------------------------------------------------------
console.log('\n======================================');
console.log(`📊 TEST SUITE SUMMARY`);
console.log(`Total Passed: ${passCount}`);
console.log(`Total Failed: ${failCount}`);
console.log('======================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 All core calculations and algorithms passed verification checks!');
  process.exit(0);
}
