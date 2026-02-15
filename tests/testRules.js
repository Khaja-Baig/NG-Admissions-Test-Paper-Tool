// ============================================================================
// RULE ENGINE — COMPREHENSIVE TEST SCRIPT
// ============================================================================
//
// Run with:   node tests/testRules.js
//
// Tests all 28 rules across the registry for:
//   1. Interface conformance (id, name, description, generate, validate, etc.)
//   2. Generation correctness (generate → validate round-trip)
//   3. Wrong-answer rejection
//   4. Uniqueness (random generation produces varied output)
//   5. Explicit param tests for key rules
//   6. Edge cases (invalid inputs throw)
//
// ============================================================================

const { getRule, listRules, listRuleIds } = require('../rules/ruleRegistry');
const { schoolRuleMap, schoolLabels, getSlots, getConceptConfig, listSchools } = require('../rules/schoolRuleMap');

// Formatting helpers
const PASS = '\x1b[32m✅ PASS\x1b[0m';
const FAIL = '\x1b[31m❌ FAIL\x1b[0m';
const DIVIDER = '─'.repeat(60);

let totalTests = 0;
let passedTests = 0;

function assert(condition, label) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ${PASS}  ${label}`);
    } else {
        console.log(`  ${FAIL}  ${label}`);
    }
}

// ============================================================================
// TEST 1: Registry basics
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 1: Rule Registry');
console.log(DIVIDER);

const allIds = listRuleIds();
console.log(`  Registered rules: ${allIds.length}`);
assert(allIds.length === 28, `Registry has exactly 28 rules (got ${allIds.length})`);

const allRules = listRules();
assert(allRules.length === allIds.length, 'listRules() count matches listRuleIds() count');

const nullRule = getRule('nonexistent_rule');
assert(nullRule === null, 'getRule() returns null for unknown id');

// Check all expected IDs are present
const expectedIds = [
    'constant_difference', 'increasing_difference', 'perfect_squares', 'alternating_multiplier',
    'pct_not_fresh', 'pct_after_addition', 'pct_reverse_find_count',
    'pct_part_of_whole', 'pct_discount_tax_amount', 'pct_marks_percentage', 'pct_population_change',
    'wt_find_time', 'wt_find_taps', 'wt_different_glasses_taps',
    'pl_simple_cp_sp', 'pl_target_profit_sp', 'pl_bulk_buy', 'pl_split_selling',
    'si_find_interest', 'si_find_principal', 'si_find_amount', 'si_find_rate',
    'le_bus_capacity', 'le_box_capacity', 'le_cashier_notes', 'le_notebook_pen_combo',
    'le_notes_with_ratio', 'le_weight_with_ratio'
];

expectedIds.forEach(id => {
    assert(allIds.includes(id), `Rule "${id}" is registered`);
});

// ============================================================================
// TEST 2: Interface conformance for ALL rules
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 2: Interface Conformance — ALL rules');
console.log(DIVIDER);

allRules.forEach(rule => {
    assert(typeof rule.id === 'string' && rule.id.length > 0, `[${rule.id}] id is a non-empty string`);
    assert(typeof rule.name === 'string' && rule.name.length > 0, `[${rule.id}] name is a non-empty string`);
    assert(typeof rule.description === 'string' && rule.description.length > 0, `[${rule.id}] description is a non-empty string`);
    assert(typeof rule.generate === 'function', `[${rule.id}] generate is a function`);
    assert(typeof rule.validate === 'function', `[${rule.id}] validate is a function`);
    assert(typeof rule.difficultyConfig === 'object' && rule.difficultyConfig !== null, `[${rule.id}] difficultyConfig is an object`);
    assert(typeof rule.generateForDifficulty === 'function', `[${rule.id}] generateForDifficulty is a function`);
});

// ============================================================================
// TEST 3: Generate → Validate round-trip for ALL rules
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 3: Generate → Validate round-trip (3 per rule, per difficulty)');
console.log(DIVIDER);

allRules.forEach(rule => {
    const difficulties = Object.keys(rule.difficultyConfig);

    difficulties.forEach(diff => {
        for (let i = 0; i < 3; i++) {
            try {
                const result = rule.generateForDifficulty(diff);
                const isValid = rule.validate(result.questionData, result.answer);
                assert(isValid, `[${rule.id}] [${diff}] Q${i + 1} passes validation`);
            } catch (e) {
                assert(false, `[${rule.id}] [${diff}] Q${i + 1} — threw: ${e.message}`);
            }
        }
    });
});

// ============================================================================
// TEST 4: Wrong answer rejection for ALL rules
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 4: Wrong answer rejection');
console.log(DIVIDER);

allRules.forEach(rule => {
    const difficulties = Object.keys(rule.difficultyConfig);
    const diff = difficulties[0]; // test with first difficulty

    try {
        const result = rule.generateForDifficulty(diff);

        if (typeof result.answer === 'number') {
            const wrongAnswer = result.answer + 999;
            const rejects = rule.validate(result.questionData, wrongAnswer) === false;
            assert(rejects, `[${rule.id}] rejects wrong numeric answer`);
        } else if (typeof result.answer === 'object') {
            // For MCQ rules with object answers, test with null
            const rejects = rule.validate(result.questionData, null) === false;
            assert(rejects, `[${rule.id}] rejects null answer`);
        }
    } catch (e) {
        assert(false, `[${rule.id}] wrong-answer test threw: ${e.message}`);
    }
});

// ============================================================================
// TEST 5: Uniqueness check — 10 questions, expect multiple unique
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 5: Uniqueness (10 per rule)');
console.log(DIVIDER);

allRules.forEach(rule => {
    const difficulties = Object.keys(rule.difficultyConfig);
    const diff = difficulties[0];

    const answerSet = new Set();
    for (let i = 0; i < 10; i++) {
        try {
            const result = rule.generateForDifficulty(diff);
            answerSet.add(JSON.stringify(result.answer));
        } catch (e) {
            // ignore generation failures in uniqueness test
        }
    }
    assert(answerSet.size > 1, `[${rule.id}] produces varied output (${answerSet.size}/10 unique)`);
});

// ============================================================================
// TEST 6: Explicit params — constant_difference
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 6: Explicit params — constant_difference');
console.log(DIVIDER);

const cdRule = getRule('constant_difference');
const cdResult = cdRule.generate({ start: 3, difference: 2, length: 4 });
assert(JSON.stringify(cdResult.questionData.sequence) === JSON.stringify([3, 5, 7, 9]), 'Sequence is [3, 5, 7, 9]');
assert(cdResult.answer === 11, 'Answer is 11');
assert(cdRule.validate(cdResult.questionData, 11) === true, 'Validates correct answer');
assert(cdRule.validate(cdResult.questionData, 12) === false, 'Rejects wrong answer');

// ============================================================================
// TEST 7: Explicit params — increasing_difference
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 7: Explicit params — increasing_difference');
console.log(DIVIDER);

const idRule = getRule('increasing_difference');
const idResult = idRule.generate({ start: 10 });
assert(JSON.stringify(idResult.questionData.sequence) === JSON.stringify([10, 15, 22, 31]), 'Sequence is [10, 15, 22, 31]');
assert(idResult.answer === 42, 'Answer is 42 (10+32)');

// ============================================================================
// TEST 8: Explicit params — perfect_squares
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 8: Explicit params — perfect_squares');
console.log(DIVIDER);

const psRule = getRule('perfect_squares');
const psResult = psRule.generate({ base: 3 });
assert(JSON.stringify(psResult.questionData.sequence) === JSON.stringify([9, 16, 25, 36]), 'Sequence is [9, 16, 25, 36]');
assert(psResult.answer === 49, 'Answer is 49 (7²)');

// ============================================================================
// TEST 9: Explicit params — alternating_multiplier
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 9: Explicit params — alternating_multiplier');
console.log(DIVIDER);

const amRule = getRule('alternating_multiplier');
const amResult = amRule.generate({ x1: 2, x2: 3 });
assert(JSON.stringify(amResult.questionData.sequence) === JSON.stringify([2, 3, 4, 9, 8]), 'Sequence is [2, 3, 4, 9, 8]');
assert(amResult.answer === 27, 'Answer is 27 (3*9)');

// ============================================================================
// TEST 10: Explicit params — pl_target_profit_sp
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 10: Explicit params — pl_target_profit_sp');
console.log(DIVIDER);

const tpRule = getRule('pl_target_profit_sp');
const tpResult = tpRule.generate({ costPrice: 500, targetProfit: 200 });
assert(tpResult.answer === 700, 'SP = 500 + 200 = 700');
assert(tpRule.validate(tpResult.questionData, 700) === true, 'Validates correct SP');

// ============================================================================
// TEST 11: Explicit params — le_bus_capacity
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 11: Explicit params — le_bus_capacity');
console.log(DIVIDER);

const bcRule = getRule('le_bus_capacity');
const bcResult = bcRule.generate({ redSeats: 80, greenSeats: 60, redCount: 5, greenCount: 4 });
assert(bcResult.answer === 640, 'Total = 80*5 + 60*4 = 640');

// ============================================================================
// TEST 12: Explicit params — si_find_interest
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 12: Explicit params — si_find_interest');
console.log(DIVIDER);

const siRule = getRule('si_find_interest');
const siResult = siRule.generate({ principal: 5000, rate: 10 });
assert(siResult.answer === 500, 'SI = 5000 * 10 / 100 = 500');

// ============================================================================
// TEST 13: Explicit params — le_cashier_notes (MCQ)
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 13: Explicit params — le_cashier_notes (MCQ)');
console.log(DIVIDER);

const cnRule = getRule('le_cashier_notes');
// 60 * 10 + 40 * 50 = 600 + 2000 = 2600, total notes = 100
const cnResult = cnRule.generate({ note1: 10, note2: 50, totalNotes: 100, totalAmount: 2600 });
assert(cnResult.answer.count1 === 60, 'count1 = 60');
assert(cnResult.answer.count2 === 40, 'count2 = 40');
assert(cnRule.validate(cnResult.questionData, { count1: 60, count2: 40 }) === true, 'Validates correct MCQ answer');
assert(cnRule.validate(cnResult.questionData, { count1: 50, count2: 50 }) === false, 'Rejects wrong MCQ answer');

// ============================================================================
// TEST 14: Edge cases — throws on invalid params
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 14: Edge cases — throws on invalid');
console.log(DIVIDER);

// constant_difference: difference = 0
let threw = false;
try { cdRule.generate({ start: 1, difference: 0, length: 4 }); } catch (e) { threw = true; }
assert(threw, '[constant_difference] throws on difference = 0');

threw = false;
try { cdRule.generate({ start: 1, difference: 2, length: 1 }); } catch (e) { threw = true; }
assert(threw, '[constant_difference] throws on length < 2');

threw = false;
try { cdRule.generateForDifficulty('impossible'); } catch (e) { threw = true; }
assert(threw, '[constant_difference] throws on unknown difficulty');

// alternating_multiplier: x1 = 0
threw = false;
try { amRule.generate({ x1: 0, x2: 3 }); } catch (e) { threw = true; }
assert(threw, '[alternating_multiplier] throws on x1 = 0');

// pl_simple_cp_sp: CP === SP
threw = false;
try { getRule('pl_simple_cp_sp').generate({ costPrice: 100, sellingPrice: 100 }); } catch (e) { threw = true; }
assert(threw, '[pl_simple_cp_sp] throws when CP = SP');

// Validate with broken data
const brokenResult = cdRule.validate({ sequence: [1, 2, 5, 7] }, 9);
assert(brokenResult === false, '[constant_difference] rejects non-constant-difference sequence');

const shortResult = cdRule.validate({ sequence: [5] }, 10);
assert(shortResult === false, '[constant_difference] rejects sequence with < 2 terms');

// ============================================================================
// TEST 15: Explicit params — le_weight_with_ratio
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 15: Explicit params — le_weight_with_ratio');
console.log(DIVIDER);

const wrRule = getRule('le_weight_with_ratio');
// w1=25, w2=50, r1=3, r2=2, n=10
// totalWeight = 25*3*10 + 50*2*10 = 750 + 1000 = 1750
// answer = r1 * n = 30
const wrResult = wrRule.generate({ w1: 25, w2: 50, item1: 'rice', item2: 'sugar', r1: 3, r2: 2, multiplier: 10 });
assert(wrResult.questionData.totalWeight === 1750, 'Total weight = 1750');
assert(wrResult.answer === 30, 'Rice sacks = 30');
assert(wrRule.validate(wrResult.questionData, 30) === true, 'Validates correct sack count');

// ============================================================================
// TEST 16: Explicit params — pct_population_change
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 16: Explicit params — pct_population_change');
console.log(DIVIDER);

const pcRule = getRule('pct_population_change');
const pcResult = pcRule.generate({ population: 1000, rate: 10, isIncrease: true });
assert(pcResult.answer === 1100, 'New population = 1000 + 100 = 1100');
const pcResult2 = pcRule.generate({ population: 1000, rate: 10, isIncrease: false });
assert(pcResult2.answer === 900, 'New population = 1000 - 100 = 900');

// ============================================================================
// TEST 17: formatQuestion — all 28 rules
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 17: formatQuestion() for all 28 rules');
console.log(DIVIDER);

allIds.forEach(id => {
    const rule = getRule(id);
    assert(typeof rule.formatQuestion === 'function', `${id}: has formatQuestion function`);

    // Generate a question and format it
    const firstDifficulty = Object.keys(rule.difficultyConfig)[0];
    const result = rule.generateForDifficulty(firstDifficulty);
    const text = rule.formatQuestion(result.questionData);

    assert(typeof text === 'string' && text.length > 10, `${id}: formatQuestion returns non-empty string (${text.length} chars)`);

    // Determinism: calling twice with same data gives same result
    const text2 = rule.formatQuestion(result.questionData);
    assert(text === text2, `${id}: formatQuestion is deterministic`);
});

// ============================================================================
// TEST 18: schoolRuleMap — structure & integrity
// ============================================================================

console.log('\n' + DIVIDER);
console.log('TEST 18: schoolRuleMap — structure & integrity');
console.log(DIVIDER);

// 18a: All 4 schools are mapped
const schools = listSchools();
assert(schools.length === 4, `4 schools mapped (got ${schools.length})`);
['SOP', 'SOB', 'SOF', 'BCA'].forEach(s => {
    assert(schools.includes(s), `School "${s}" is mapped`);
});

// 18b: schoolLabels has all 4
['SOP', 'SOB', 'SOF', 'BCA'].forEach(s => {
    assert(typeof schoolLabels[s] === 'string' && schoolLabels[s].length > 0, `schoolLabels["${s}"] exists`);
});

// 18c: Every ruleId in the map exists in the registry
const registryIds = new Set(listRuleIds());
let allMapRuleIds = [];
schools.forEach(school => {
    const concepts = schoolRuleMap[school];
    Object.keys(concepts).forEach(conceptKey => {
        concepts[conceptKey].forEach(slot => {
            allMapRuleIds.push({ school, concept: conceptKey, ruleId: slot.ruleId, difficulty: slot.difficulty });
        });
    });
});

allMapRuleIds.forEach(entry => {
    assert(registryIds.has(entry.ruleId), `${entry.school}/${entry.concept}: ruleId "${entry.ruleId}" exists in registry`);
});

// 18d: Every ruleId's difficultyConfig includes the mapped difficulty key
allMapRuleIds.forEach(entry => {
    const rule = getRule(entry.ruleId);
    const hasDiff = rule && rule.difficultyConfig && (entry.difficulty in rule.difficultyConfig);
    assert(hasDiff, `${entry.school}/${entry.concept}: rule "${entry.ruleId}" supports difficulty "${entry.difficulty}"`);
});

// 18e: Slot counts — SOP=16, SOB=16, SOF=16, BCA=16
const expectedCounts = { SOP: 16, SOB: 16, SOF: 16, BCA: 16 };
schools.forEach(school => {
    const slots = getSlots(school);
    assert(slots !== null, `getSlots("${school}") returns non-null`);
    assert(slots.length === expectedCounts[school], `${school}: ${expectedCounts[school]} slots (got ${slots.length})`);
});

// 18f: No duplicate ruleId within the same concept for a school
schools.forEach(school => {
    const concepts = schoolRuleMap[school];
    Object.keys(concepts).forEach(conceptKey => {
        const ids = concepts[conceptKey].map(s => s.ruleId);
        const unique = new Set(ids);
        assert(ids.length === unique.size, `${school}/${conceptKey}: no duplicate ruleIds (${ids.length} slots, ${unique.size} unique)`);
    });
});

// 18g: getConceptConfig returns proper structure
schools.forEach(school => {
    const config = getConceptConfig(school);
    assert(config !== null, `getConceptConfig("${school}") returns non-null`);
    Object.keys(config).forEach(conceptKey => {
        assert(typeof config[conceptKey].label === 'string', `${school}/${conceptKey}: has label`);
        assert(Array.isArray(config[conceptKey].slots), `${school}/${conceptKey}: has slots array`);
        assert(config[conceptKey].slots.length > 0, `${school}/${conceptKey}: has at least 1 slot`);
    });
});

// 18h: SOB and SOF have identical concept keys
const sobConcepts = Object.keys(schoolRuleMap.SOB).sort();
const sofConcepts = Object.keys(schoolRuleMap.SOF).sort();
assert(JSON.stringify(sobConcepts) === JSON.stringify(sofConcepts), 'SOB and SOF have identical concept keys');

// 18i: SOP and BCA have identical concept keys
const sopConcepts = Object.keys(schoolRuleMap.SOP).sort();
const bcaConcepts = Object.keys(schoolRuleMap.BCA).sort();
assert(JSON.stringify(sopConcepts) === JSON.stringify(bcaConcepts), 'SOP and BCA have identical concept keys');

// 18j: getSlots returns null for unknown school
assert(getSlots('UNKNOWN') === null, 'getSlots("UNKNOWN") returns null');
assert(getConceptConfig('UNKNOWN') === null, 'getConceptConfig("UNKNOWN") returns null');

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + DIVIDER);
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed`);
if (passedTests === totalTests) {
    console.log('\x1b[32m🎉 All tests passed!\x1b[0m');
} else {
    console.log(`\x1b[31m⚠️  ${totalTests - passedTests} test(s) failed.\x1b[0m`);
}
console.log(DIVIDER + '\n');

// Exit with non-zero if any test failed
process.exit(passedTests === totalTests ? 0 : 1);
