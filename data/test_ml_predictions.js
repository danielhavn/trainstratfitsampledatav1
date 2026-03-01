/**
 * ML Predictions Validator
 * Run with: node test_ml_predictions.js
 * 
 * Tests the ml_predictions.json file for:
 * - Valid JSON structure
 * - All 100 scenarios present
 * - Correct data types
 * - Score ranges (0-120)
 * - Required fields
 */

const fs = require('fs');

function validateMLPredictions() {
  console.log('🔍 Validating ML Predictions Dataset...\n');
  
  let data;
  
  // Test 1: Valid JSON
  try {
    const rawData = fs.readFileSync('./ml_predictions.json', 'utf8');
    data = JSON.parse(rawData);
    console.log('✅ Test 1: Valid JSON structure');
  } catch (error) {
    console.log('❌ Test 1 FAILED: Invalid JSON');
    console.error(error.message);
    return;
  }
  
  // Test 2: 100 scenarios
  if (data.scenarios && data.scenarios.length === 100) {
    console.log(`✅ Test 2: All 100 scenarios present`);
  } else {
    console.log(`❌ Test 2 FAILED: Expected 100 scenarios, got ${data.scenarios?.length || 0}`);
    return;
  }
  
  // Test 3: Validate each scenario structure
  let structureErrors = 0;
  let scoreErrors = 0;
  
  data.scenarios.forEach((scenario, index) => {
    // Check required fields
    const requiredFields = ['id', 'name', 'description', 'market_conditions', 'predictions'];
    const missingFields = requiredFields.filter(field => !(field in scenario));
    
    if (missingFields.length > 0) {
      console.log(`❌ Scenario ${scenario.id || index}: Missing fields: ${missingFields.join(', ')}`);
      structureErrors++;
    }
    
    // Check market_conditions
    if (scenario.market_conditions) {
      const requiredMC = ['vix', 'iv_percentile', 'vvix', 'regime', 'stability'];
      const missingMC = requiredMC.filter(field => !(field in scenario.market_conditions));
      
      if (missingMC.length > 0) {
        console.log(`❌ Scenario ${scenario.id}: Missing market_conditions: ${missingMC.join(', ')}`);
        structureErrors++;
      }
    }
    
    // Check predictions and score ranges
    if (scenario.predictions) {
      const strategies = ['collar_score', 'covered_call_score', 'iron_condor_score', 'cash_secured_put_score'];
      
      strategies.forEach(strategy => {
        const score = scenario.predictions[strategy];
        
        if (typeof score !== 'number') {
          console.log(`❌ Scenario ${scenario.id}: ${strategy} is not a number`);
          scoreErrors++;
        } else if (score < 0 || score > 120) {
          console.log(`⚠️  Scenario ${scenario.id}: ${strategy} = ${score} (outside 0-120 range)`);
          scoreErrors++;
        }
      });
    }
  });
  
  if (structureErrors === 0) {
    console.log('✅ Test 3: All scenarios have correct structure');
  } else {
    console.log(`❌ Test 3 FAILED: ${structureErrors} structure errors found`);
  }
  
  if (scoreErrors === 0) {
    console.log('✅ Test 4: All prediction scores valid (0-120 range)');
  } else {
    console.log(`⚠️  Test 4 WARNING: ${scoreErrors} score validation issues`);
  }
  
  // Test 5: Metadata validation
  if (data.metadata) {
    console.log('✅ Test 5: Metadata present');
    
    if (data.metadata.regime_coverage) {
      const totalRegimes = Object.values(data.metadata.regime_coverage).reduce((a, b) => a + b, 0);
      console.log(`   📊 Regime distribution: ${JSON.stringify(data.metadata.regime_coverage)}`);
    }
    
    if (data.metadata.stability_coverage) {
      console.log(`   📊 Stability distribution: ${JSON.stringify(data.metadata.stability_coverage)}`);
    }
  } else {
    console.log('⚠️  Test 5: No metadata found (optional)');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (structureErrors === 0 && scoreErrors === 0) {
    console.log('🎉 ALL TESTS PASSED! Dataset is ready for production.');
  } else {
    console.log('⚠️  VALIDATION COMPLETED WITH WARNINGS');
    console.log(`   - Structure errors: ${structureErrors}`);
    console.log(`   - Score warnings: ${scoreErrors}`);
  }
  console.log('='.repeat(50) + '\n');
  
  // Display sample scenarios
  console.log('📋 Sample Scenarios:');
  [0, 49, 99].forEach(i => {
    const s = data.scenarios[i];
    console.log(`\n   [${s.id}] ${s.name}`);
    console.log(`   VIX: ${s.market_conditions.vix} | IV%: ${s.market_conditions.iv_percentile} | Regime: ${s.market_conditions.regime}`);
    console.log(`   Top Strategy: ${getTopStrategy(s.predictions)}`);
  });
}

function getTopStrategy(predictions) {
  const strategies = [
    { name: 'Collar', score: predictions.collar_score },
    { name: 'Covered Call', score: predictions.covered_call_score },
    { name: 'Iron Condor', score: predictions.iron_condor_score },
    { name: 'Cash Secured Put', score: predictions.cash_secured_put_score }
  ];
  
  const top = strategies.reduce((max, s) => s.score > max.score ? s : max);
  return `${top.name} (${top.score})`;
}

// Run validation
validateMLPredictions();
