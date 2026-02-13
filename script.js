// ========================================
// UTILITY FUNCTIONS
// ========================================

// Generate random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if a number has trailing zeros (like 120, 450)
function hasTrailingZeros(num) {
    const str = num.toString();
    return str.endsWith('0') && str.length > 1;
}

// Generate a random integer without trailing zeros
function randomIntNoTrailing(min, max) {
    let num;
    let attempts = 0;
    do {
        num = randomInt(min, max);
        attempts++;
    } while (hasTrailingZeros(num) && attempts < 100);
    return num;
}

// Shuffle array
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Generate unique distractors
function generateDistractors(correct, count = 3) {
    const distractors = new Set();
    const range = Math.max(Math.abs(correct * 0.3), 10);
    
    let attempts = 0;
    while (distractors.size < count && attempts < 1000) {
        let distractor;
        const offset = randomInt(1, Math.ceil(range));
        
        if (Math.random() < 0.5) {
            distractor = correct + offset;
        } else {
            distractor = correct - offset;
        }
        
        if (distractor > 0 && distractor !== correct && !hasTrailingZeros(distractor)) {
            distractors.add(distractor);
        }
        attempts++;
    }
    
    return Array.from(distractors).slice(0, count);
}

// Create shuffled options with correct answer
function createOptions(correct) {
    const distractors = generateDistractors(correct, 3);
    const options = [correct, ...distractors];
    const shuffled = shuffle(options);
    
    const correctIndex = shuffled.indexOf(correct);
    const correctLetter = String.fromCharCode(65 + correctIndex); // A, B, C, D
    
    return { options: shuffled, correctLetter };
}

// Store generated questions to avoid duplicates
let generatedQuestions = new Set();

// ========================================
// SCHOOL → CONCEPT → DIFFICULTY CONFIG
// ========================================
// Master configuration object.
// Structure: school → concept → difficulties[]
// Each difficulty has a `value` (passed to generator functions) and a `label` (shown in dropdown).
// Generator functions (generateNumberPattern, etc.) are NOT modified — they still receive the difficulty value.
//
// To add a new school/concept/difficulty, just edit this object.
// To add a new question template, modify the corresponding generator function
// (e.g., generateNumberPattern) and add a new difficulty branch there,
// then reference that difficulty value here.

const schoolConfig = {
    'SOP': {
        label: 'School of Programming (SOP)',
        concepts: {
            'number patterns': {
                label: 'Number Patterns',
                generator: 'generateNumberPattern',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'percentages': {
                label: 'Percentages',
                generator: 'generatePercentage',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium only', label: 'Medium' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'work and time': {
                label: 'Work and Time',
                generator: 'generateWorkTime',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium only', label: 'Medium' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'linear equations in two variables': {
                label: 'Linear Equations in Two Variables',
                generator: 'generateLinearEquation',
                difficulties: [
                    { value: 'easy 1', label: 'Easy 1' },
                    { value: 'easy 2', label: 'Easy 2' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard 1', label: 'Hard 1' },
                    { value: 'hard 2', label: 'Hard 2' }
                ]
            }
        }
    },
    'SOB': {
        label: 'School of Business (SOB)',
        concepts: {
            'number patterns': {
                label: 'Number Patterns',
                generator: 'generateNumberPattern',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'percentages': {
                label: 'Percentages',
                generator: 'generatePercentageSOB',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'profit and loss': {
                label: 'Profit and Loss',
                generator: 'generateProfitLoss',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'simple interest': {
                label: 'Simple Interest',
                generator: 'generateSimpleInterest',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard only', label: 'Hard' }
                ]
            }
        }
    },
    'SOF': {
        label: 'School of Finance (SOF)',
        concepts: {
            'number patterns': {
                label: 'Number Patterns',
                generator: 'generateNumberPattern',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'percentages': {
                label: 'Percentages',
                generator: 'generatePercentageSOB',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'profit and loss': {
                label: 'Profit and Loss',
                generator: 'generateProfitLoss',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'simple interest': {
                label: 'Simple Interest',
                generator: 'generateSimpleInterest',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard only', label: 'Hard' }
                ]
            }
        }
    },
    'BCA': {
        label: 'BCA',
        concepts: {
            'number patterns': {
                label: 'Number Patterns',
                generator: 'generateNumberPattern',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'percentages': {
                label: 'Percentages',
                generator: 'generatePercentage',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium only', label: 'Medium' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'work and time': {
                label: 'Work and Time',
                generator: 'generateWorkTime',
                difficulties: [
                    { value: 'easy only', label: 'Easy' },
                    { value: 'medium only', label: 'Medium' },
                    { value: 'hard only', label: 'Hard' }
                ]
            },
            'linear equations in two variables': {
                label: 'Linear Equations in Two Variables',
                generator: 'generateLinearEquation',
                difficulties: [
                    { value: 'easy 1', label: 'Easy 1' },
                    { value: 'easy 2', label: 'Easy 2' },
                    { value: 'medium 1', label: 'Medium 1' },
                    { value: 'medium 2', label: 'Medium 2' },
                    { value: 'hard 1', label: 'Hard 1' },
                    { value: 'hard 2', label: 'Hard 2' }
                ]
            }
        }
    }
};

// Map generator function names to actual functions (resolved after functions are defined)
let generatorMap = {};

// ========================================
// CASCADING DROPDOWN FUNCTIONS
// ========================================

// Update Concept dropdown based on selected School
function updateConceptDropdown() {
    const schoolKey = document.getElementById('school').value;
    const conceptSelect = document.getElementById('concept');
    const concepts = schoolConfig[schoolKey]?.concepts || {};

    conceptSelect.innerHTML = '';

    Object.keys(concepts).forEach(conceptKey => {
        const option = document.createElement('option');
        option.value = conceptKey;
        option.textContent = concepts[conceptKey].label;
        conceptSelect.appendChild(option);
    });

    // Cascade: update difficulty for the first concept
    updateDifficultyDropdown();
}

// Update Difficulty dropdown based on selected School + Concept
function updateDifficultyDropdown() {
    const schoolKey = document.getElementById('school').value;
    const conceptKey = document.getElementById('concept').value;
    const difficultySelect = document.getElementById('difficulty');

    const difficulties = schoolConfig[schoolKey]?.concepts[conceptKey]?.difficulties || [];

    difficultySelect.innerHTML = '';

    difficulties.forEach(d => {
        const option = document.createElement('option');
        option.value = d.value;
        option.textContent = d.label;
        difficultySelect.appendChild(option);
    });
}

// ========================================
// NUMBER PATTERNS
// ========================================

function generateNumberPattern(difficulty) {
    let attempts = 0;
    while (attempts < 100) {
        attempts++;
        
        try {
            if (difficulty === 'easy only') {
                const a = randomIntNoTrailing(1, 50);
                const d = randomInt(2, 9);
                const answer = a + 4 * d;
                
                const questionKey = `np_easy_${a}_${d}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const sequence = `${a}, ${a + d}, ${a + 2*d}, ${a + 3*d}, ___`;
                const question = `What will be the next term in the pattern?\n${sequence}`;
                
                return { question, answer };
                
            } else if (difficulty === 'medium 1') {
                const a = randomIntNoTrailing(1, 50);
                const answer = a + 32; // +5, +7, +9, +11 = total 32, but next is +11 from last
                // Actually: a, a+5, a+12, a+21, a+32
                const seq = [a, a+5, a+12, a+21];
                
                const questionKey = `np_m1_${a}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const sequence = seq.join(', ') + ', ___';
                const question = `What will be the next term in the pattern?\n${sequence}`;
                
                return { question, answer };
                
            } else if (difficulty === 'medium 2') {
                const n = randomInt(2, 8);
                const answer = (n + 4) * (n + 4);
                
                const questionKey = `np_m2_${n}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const sequence = `${n*n}, ${(n+1)*(n+1)}, ${(n+2)*(n+2)}, ${(n+3)*(n+3)}, ___`;
                const question = `What will be the next term in the pattern?\n${sequence}`;
                
                return { question, answer };
                
            } else if (difficulty === 'hard 1' || difficulty === 'hard 2' || difficulty === 'hard only') {
                const x1 = randomInt(1, 5);
                const x2 = randomInt(1, 5);
                const x3 = x1 * 2;
                const x4 = x2 * 3;
                const x5 = x3 * 2;
                const answer = x4 * 3;
                
                const questionKey = `np_hard_${x1}_${x2}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const sequence = `${x1}, ${x2}, ${x3}, ${x4}, ${x5}, ___`;
                const question = `What will be the next term in the pattern?\n${sequence}`;
                
                return { question, answer };
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

// ========================================
// PERCENTAGES
// ========================================

function generatePercentage(difficulty) {
    let attempts = 0;
    while (attempts < 100) {
        attempts++;
        
        try {
            if (difficulty === 'easy 1' || difficulty === 'easy 2' || difficulty === 'easy only') {
                const X = randomInt(20, 100);
                const Y = randomInt(5, X - 5);
                const notFresh = X - Y;
                const percent = (notFresh * 100) / X;
                
                if (percent !== Math.floor(percent)) continue;
                
                const questionKey = `pct_easy_${X}_${Y}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `I bought ${X} apples, out of which ${Y} were fresh.\nWhat percentage of apples are not fresh?`;
                
                return { question, answer: Math.floor(percent) };
                
            } else if (difficulty === 'medium only' || difficulty === 'medium 1' || difficulty === 'medium 2') {
                const names = ['Rahul', 'Priya', 'Arman', 'Sita', 'Rohan'];
                const name = names[randomInt(0, names.length - 1)];
                
                const X = randomInt(30, 100);
                const Y = randomInt(5, X - 10);
                const Z = randomInt(5, 30);
                
                const finalRoses = Y + Z;
                const finalTotal = X + Z;
                const percent = (finalRoses * 100) / finalTotal;
                
                if (percent !== Math.floor(percent)) continue;
                
                const questionKey = `pct_med_${X}_${Y}_${Z}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `${name} bought ${X} flowers, out of which ${Y} are roses.\nIf ${name === 'Priya' || name === 'Sita' ? 'she' : 'he'} bought ${Z} more roses, then what is the percentage of roses?`;
                
                return { question, answer: Math.floor(percent) };
                
            } else if (difficulty === 'hard only' || difficulty === 'hard 1' || difficulty === 'hard 2') {
                const X = randomInt(20, 50);
                const Y = randomInt(5, 30);
                const allowedP = [20, 25, 28, 34, 38, 40, 45, 50];
                const P = allowedP[randomInt(0, allowedP.length - 1)];
                
                // Solve: (Y + B) / (X + Y + B) = P/100
                // 100(Y + B) = P(X + Y + B)
                // 100Y + 100B = PX + PY + PB
                // 100B - PB = PX + PY - 100Y
                // B(100 - P) = PX + PY - 100Y
                // B = (PX + PY - 100Y) / (100 - P)
                
                const numerator = P * X + P * Y - 100 * Y;
                const denominator = 100 - P;
                
                if (denominator === 0 || numerator <= 0) continue;
                if (numerator % denominator !== 0) continue;
                
                const B = numerator / denominator;
                if (B <= 0 || B !== Math.floor(B)) continue;
                
                const questionKey = `pct_hard_${X}_${Y}_${P}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `Arman has ${X} red ribbons and ${Y} blue ribbons.\nHow many blue ribbons should he buy so that the percentage of blue ribbons becomes ${P}%?`;
                
                return { question, answer: B };
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

// ========================================
// PERCENTAGES (SOB / SOF)
// ========================================

function generatePercentageSOB(difficulty) {
    let attempts = 0;
    while (attempts < 100) {
        attempts++;

        try {
            if (difficulty === 'easy 1' || difficulty === 'easy 2' || difficulty === 'easy only') {
                // Context variations for "X out of total, find percentage"
                const contexts = [
                    { template: (X, Y) => `In a class of ${X} students, ${Y} students are absent.\nWhat is the percentage of absent students?` },
                    { template: (X, Y) => `In a class of ${X} students, ${Y} are girls.\nWhat is the percentage of girls in the class?` },
                    { template: (X, Y) => `Out of ${X} students who appeared for a test, ${Y} students failed.\nWhat is the percentage of students who failed?` },
                    { template: (X, Y) => `A school has ${X} teachers. ${Y} of them teach science.\nWhat percentage of teachers teach science?` },
                    { template: (X, Y) => `In a garden, there are ${X} flowers. ${Y} of them are red.\nWhat is the percentage of red flowers?` },
                    { template: (X, Y) => `A library has ${X} books. ${Y} of them are fiction.\nWhat percentage of books are fiction?` }
                ];

                const X = randomInt(30, 100);
                const Y = randomInt(5, X - 5);
                const percent = (Y * 100) / X;

                if (percent !== Math.floor(percent)) continue;
                if (hasTrailingZeros(Math.floor(percent))) continue;

                const questionKey = `pct_sob_easy_${X}_${Y}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);

                const ctx = contexts[randomInt(0, contexts.length - 1)];
                const question = ctx.template(X, Y);

                return { question, answer: Math.floor(percent) };

            } else if (difficulty === 'medium 1') {
                // "Price is ₹P, discount/tax of D%. Find the amount."
                const items = ['jacket', 'shirt', 'bag', 'pair of shoes', 'watch', 'saree', 'kurta', 'laptop bag', 'sweater', 'blazer'];
                const actions = [
                    { verb: 'gives a discount of', label: 'discount' },
                    { verb: 'charges a tax of', label: 'tax' },
                    { verb: 'offers a cashback of', label: 'cashback' }
                ];

                const item = items[randomInt(0, items.length - 1)];
                const action = actions[randomInt(0, actions.length - 1)];
                const P = randomIntNoTrailing(200, 2000);
                const D = randomInt(5, 30);
                const amount = (P * D) / 100;

                if (amount !== Math.floor(amount)) continue;
                if (hasTrailingZeros(Math.floor(amount))) continue;

                const questionKey = `pct_sob_m1_${P}_${D}_${action.label}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);

                const question = `The price of a ${item} is ₹${P}. The shopkeeper ${action.verb} ${D}%.\nWhat is the amount of the ${action.label}?`;

                return { question, answer: Math.floor(amount) };

            } else if (difficulty === 'medium 2') {
                // "Got M marks out of T. What is the percentage?"
                const names = ['Aman', 'Priya', 'Rohan', 'Sita', 'Kavya', 'Arjun', 'Meera', 'Vikram'];
                const subjects = ['a test', 'an exam', 'a quiz', 'a maths test', 'a science exam', 'a class test'];

                const name = names[randomInt(0, names.length - 1)];
                const subject = subjects[randomInt(0, subjects.length - 1)];
                const T = randomIntNoTrailing(25, 100);
                const M = randomInt(10, T - 5);
                const percent = (M * 100) / T;

                if (percent !== Math.floor(percent)) continue;
                if (hasTrailingZeros(Math.floor(percent))) continue;

                const questionKey = `pct_sob_m2_${M}_${T}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);

                const pronoun = (name === 'Priya' || name === 'Sita' || name === 'Kavya' || name === 'Meera') ? 'her' : 'his';
                const question = `In ${subject}, ${name} got ${M} marks out of ${T}.\nWhat is ${pronoun} percentage?`;

                return { question, answer: Math.floor(percent) };

            } else if (difficulty === 'hard only' || difficulty === 'hard 1' || difficulty === 'hard 2') {
                // "Population/value changes by R%. Find new value."
                const scenarios = [
                    { template: (P, R, dir) => `The population of a village is ${P}.\nIn one year, it ${dir} by ${R}%.\nWhat will be the new population?` },
                    { template: (P, R, dir) => `The population of a town is ${P}.\nIn one year, it ${dir} by ${R}%.\nWhat will be the new population?` },
                    { template: (P, R, dir) => `A company has ${P} employees.\nThis year, the number ${dir} by ${R}%.\nWhat is the new number of employees?` },
                    { template: (P, R, dir) => `The number of students in a school is ${P}.\nNext year, it ${dir} by ${R}%.\nWhat will be the new number of students?` },
                    { template: (P, R, dir) => `The price of a plot of land is ₹${P}.\nIn one year, the price ${dir} by ${R}%.\nWhat is the new price?` }
                ];

                const P = randomIntNoTrailing(500, 5000);
                const R = randomInt(5, 25);
                const change = (P * R) / 100;

                if (change !== Math.floor(change)) continue;

                const isIncrease = Math.random() < 0.5;
                const direction = isIncrease ? 'increased' : 'decreased';
                const answer = isIncrease ? P + Math.floor(change) : P - Math.floor(change);

                if (answer <= 0) continue;
                if (hasTrailingZeros(answer)) continue;

                const questionKey = `pct_sob_hard_${P}_${R}_${direction}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);

                const scenario = scenarios[randomInt(0, scenarios.length - 1)];
                const question = scenario.template(P, R, direction);

                return { question, answer };
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

// ========================================
// WORK AND TIME
// ========================================

function generateWorkTime(difficulty) {
    let attempts = 0;
    while (attempts < 100) {
        attempts++;
        
        try {
            if (difficulty === 'easy 1' || difficulty === 'easy 2' || difficulty === 'easy only') {
                const G = randomInt(10, 50);
                const T1 = randomInt(2, 8);
                const M1 = randomInt(5, 30);
                let T2 = randomInt(2, 8);
                if (T2 === T1) continue; // avoid trivial question where T2 equals T1
                
                const M2 = (T1 * M1) / T2;
                if (M2 !== Math.floor(M2) || M2 <= 0) continue;
                
                const questionKey = `wt_easy_${G}_${T1}_${M1}_${T2}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `To fill ${G} glasses of water, ${T1} taps take ${M1} minutes.\nThen with ${T2} taps, how much time is needed to fill ${G} glasses?`;
                
                return { question, answer: Math.floor(M2) };
                
            } else if (difficulty === 'medium only' || difficulty === 'medium 1' || difficulty === 'medium 2') {
                const G1 = randomInt(10, 40);
                const T1 = randomInt(2, 6);
                const M1 = randomInt(5, 25);
                const G2 = randomInt(10, 40);
                const M2 = randomInt(5, 25);
                
                const T2 = (T1 * M1 * G2) / (G1 * M2);
                if (T2 !== Math.floor(T2) || T2 <= 0) continue;
                
                const questionKey = `wt_med_${G1}_${T1}_${M1}_${G2}_${M2}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `To fill ${G1} glasses, ${T1} taps take ${M1} minutes.\nTo fill ${G2} glasses in ${M2} minutes, how many taps are needed?`;
                
                return { question, answer: Math.floor(T2) };
                
            } else if (difficulty === 'hard only' || difficulty === 'hard 1' || difficulty === 'hard 2') {
                const G1 = randomInt(10, 30);
                const T1 = randomInt(2, 6);
                const M1 = randomInt(5, 20);
                const G2 = randomInt(10, 30);
                const T2 = randomInt(2, 6);
                
                const M2 = (T1 * M1 * G2) / (G1 * T2);
                if (M2 !== Math.floor(M2) || M2 <= 0) continue;
                
                const questionKey = `wt_hard_${G1}_${T1}_${M1}_${G2}_${T2}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `To fill ${G1} glasses, ${T1} taps take ${M1} minutes.\nWith ${T2} taps, how much time is needed to fill ${G2} glasses?`;
                
                return { question, answer: Math.floor(M2) };
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

// ========================================
// PROFIT AND LOSS
// ========================================

function generateProfitLoss(difficulty) {
    let attempts = 0;
    while (attempts < 100) {
        attempts++;
        
        try {
            if (difficulty === 'easy 1' || difficulty === 'easy 2' || difficulty === 'easy only') {
                const CP = randomInt(50, 200);
                const SP = randomInt(30, 250);
                
                if (CP === SP) continue;
                
                const questionKey = `pl_easy_${CP}_${SP}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const diff = Math.abs(SP - CP);
                const type = SP > CP ? 'profit' : 'loss';
                
                const question = `Anwar buys a notebook for ₹${CP} and sells it for ₹${SP}.\nDid he make a profit or a loss? How much?`;
                
                return { question, answer: diff, type };
                
            } else if (difficulty === 'medium 1') {
                const CP = randomInt(100, 800);
                const P = randomInt(50, 300);
                const SP = CP + P;
                
                const questionKey = `pl_m1_${CP}_${P}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `Riya buys a chair for ₹${CP}.\nShe wants to make an exact profit of ₹${P}.\nAt what price should she sell the chair?`;
                
                return { question, answer: SP };
                
            } else if (difficulty === 'medium 2') {
                const N = randomInt(3, 8);
                const CP_per = randomInt(20, 60);
                const SP_total = randomInt(100, 400);
                
                const totalCP = N * CP_per;
                const diff = SP_total - totalCP;
                
                if (diff === 0) continue;
                
                const questionKey = `pl_m2_${N}_${CP_per}_${SP_total}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const type = diff > 0 ? 'profit' : 'loss';
                
                const question = `A trader buys ${N} kg of oranges at ₹${CP_per} per kg\nand sells all the oranges for ₹${SP_total}.\nFind the profit or loss.`;
                
                return { question, answer: Math.abs(diff), type };
                
            } else if (difficulty === 'hard only' || difficulty === 'hard 1' || difficulty === 'hard 2') {
                const N = randomInt(10, 20);
                const CP1 = randomInt(15, 30);
                const N2 = randomInt(Math.floor(N / 2), N - 2);
                const SP1 = randomInt(12, 35);
                const SP2 = randomInt(12, 35);
                
                const totalCP = N * CP1;
                const totalSP = (N2 * SP1) + ((N - N2) * SP2);
                const diff = totalSP - totalCP;
                
                if (diff === 0) continue;
                
                const questionKey = `pl_hard_${N}_${CP1}_${N2}_${SP1}_${SP2}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const type = diff > 0 ? 'profit' : 'loss';
                
                const question = `A shopkeeper buys ${N} pens at ₹${CP1} per pen.\nHe sells ${N2} pens at ₹${SP1} per pen and\nthe remaining ${N - N2} pens at ₹${SP2} per pen.\nWhat is his total profit or loss?`;
                
                return { question, answer: Math.abs(diff), type };
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

// ========================================
// SIMPLE INTEREST
// ========================================

function generateSimpleInterest(difficulty) {
    let attempts = 0;
    while (attempts < 100) {
        attempts++;
        
        try {
            if (difficulty === 'easy 1' || difficulty === 'easy 2' || difficulty === 'easy only') {
                const P = randomInt(1000, 10000);
                const R = randomInt(5, 15);
                const SI = (P * R) / 100;
                
                if (SI !== Math.floor(SI)) continue;
                
                const questionKey = `si_easy_${P}_${R}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const names = ['Rahul', 'Priya', 'Arman', 'Sita'];
                const name = names[randomInt(0, names.length - 1)];
                
                const question = `${name} deposits ₹${P} in a bank.\nThe bank gives ${R}% interest per year.\nHow much interest will ${name} get in 1 year?`;
                
                return { question, answer: Math.floor(SI) };
                
            } else if (difficulty === 'medium 1') {
                const R = randomInt(5, 15);
                const T = randomInt(2, 4);
                const P = randomInt(1000, 8000);
                const A = P + (P * R * T) / 100;
                
                if (A !== Math.floor(A)) continue;
                
                const questionKey = `si_m1_${A}_${T}_${R}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `An amount becomes ₹${Math.floor(A)} in ${T} years at ${R}% per year simple interest.\nWhat was the original principal amount?`;
                
                return { question, answer: P };
                
            } else if (difficulty === 'medium 2') {
                const P = randomInt(500, 5000);
                const R = randomInt(10, 30);
                const T = randomInt(2, 4);
                const A = P + (P * R * T) / 100;
                
                if (A !== Math.floor(A)) continue;
                
                const questionKey = `si_m2_${P}_${R}_${T}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const names = ['Rahul', 'Priya', 'Arman'];
                const name = names[randomInt(0, names.length - 1)];
                
                const question = `${name} deposits ₹${P} in a bank\nwhere ${name === 'Priya' ? 'she' : 'he'} gets ${R}% simple interest per year.\nHow much total amount will ${name === 'Priya' ? 'she' : 'he'} have after ${T} years?`;
                
                return { question, answer: Math.floor(A) };
                
            } else if (difficulty === 'hard only' || difficulty === 'hard 1' || difficulty === 'hard 2') {
                const P = randomInt(200, 1000);
                const R = randomInt(10, 30);
                const T = 1;
                const SI = (P * R * T) / 100;
                
                if (SI !== Math.floor(SI)) continue;
                
                const questionKey = `si_hard_${P}_${SI}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `The interest on ₹${P} for 1 year is ₹${Math.floor(SI)}.\nWhat is the annual rate of interest?`;
                
                return { question, answer: R };
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

// ========================================
// LINEAR EQUATIONS IN TWO VARIABLES
// ========================================

function generateLinearEquation(difficulty) {
    let attempts = 0;
    while (attempts < 100) {
        attempts++;
        
        try {
            if (difficulty === 'easy 1') {
                // Bus capacity problem only
                const redSeats = randomInt(60, 100);
                const greenSeats = randomInt(50, 90);
                const redCount = randomInt(3, 7);
                const greenCount = randomInt(4, 8);
                const total = (redSeats * redCount) + (greenSeats * greenCount);
                
                const questionKey = `le_easy1_${redSeats}_${greenSeats}_${redCount}_${greenCount}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `A Red bus has ${redSeats} seats, whereas Green bus has ${greenSeats} seats.\nThe school arranges for ${redCount} Red buses and ${greenCount} Green buses.\nHow many people can travel in total?`;
                
                return { question, answer: total };
                
            } else if (difficulty === 'easy 2') {
                // Box capacity problem only
                const yellowCap = randomInt(60, 100);
                const brownCap = randomInt(50, 90);
                const yellowCount = randomInt(4, 8);
                const brownCount = randomInt(5, 10);
                const total = (yellowCap * yellowCount) + (brownCap * brownCount);
                
                const questionKey = `le_easy2_${yellowCap}_${brownCap}_${yellowCount}_${brownCount}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const names = ['Rahul', 'Priya', 'Arman'];
                const name = names[randomInt(0, names.length - 1)];
                
                const question = `${name} has two types of boxes.\nYellow boxes can hold ${yellowCap} books each and Brown boxes can hold ${brownCap} books each. ${name === 'Priya' ? 'She' : 'He'} uses ${yellowCount} Yellow boxes and ${brownCount} Brown boxes.\nHow many books can ${name === 'Priya' ? 'she' : 'he'} pack in total?`;
                
                return { question, answer: total };
                
            } else if (difficulty === 'easy only') {
                // Randomly choose between Easy 1 and Easy 2
                const subType = randomInt(1, 2);
                
                if (subType === 1) {
                    // Bus capacity problem
                    const redSeats = randomInt(60, 100);
                    const greenSeats = randomInt(50, 90);
                    const redCount = randomInt(3, 7);
                    const greenCount = randomInt(4, 8);
                    const total = (redSeats * redCount) + (greenSeats * greenCount);
                    
                    const questionKey = `le_easy1_${redSeats}_${greenSeats}_${redCount}_${greenCount}`;
                    if (generatedQuestions.has(questionKey)) continue;
                    generatedQuestions.add(questionKey);
                    
                    const question = `A Red bus has ${redSeats} seats, whereas Green bus has ${greenSeats} seats.\nThe school arranges for ${redCount} Red buses and ${greenCount} Green buses.\nHow many people can travel in total?`;
                    
                    return { question, answer: total };
                } else {
                    // Box capacity problem
                    const yellowCap = randomInt(60, 100);
                    const brownCap = randomInt(50, 90);
                    const yellowCount = randomInt(4, 8);
                    const brownCount = randomInt(5, 10);
                    const total = (yellowCap * yellowCount) + (brownCap * brownCount);
                    
                    const questionKey = `le_easy2_${yellowCap}_${brownCap}_${yellowCount}_${brownCount}`;
                    if (generatedQuestions.has(questionKey)) continue;
                    generatedQuestions.add(questionKey);
                    
                    const names = ['Rahul', 'Priya', 'Arman'];
                    const name = names[randomInt(0, names.length - 1)];
                    
                    const question = `${name} has two types of boxes.\nYellow boxes can hold ${yellowCap} books each and Brown boxes can hold ${brownCap} books each. ${name === 'Priya' ? 'She' : 'He'} uses ${yellowCount} Yellow boxes and ${brownCount} Brown boxes.\nHow many books can ${name === 'Priya' ? 'she' : 'he'} pack in total?`;
                    
                    return { question, answer: total };
                }
                
            } else if (difficulty === 'medium 1') {
                // Cashier notes/coins problem - MCQ format
                // Valid Indian currency pairs: [smaller, larger]
                // Includes coins (₹1, ₹2, ₹5) for harder arithmetic (no trailing zeros)
                const currencyPairs = [
                    { values: [1, 2], labels: ['₹1 coins', '₹2 coins'] },
                    { values: [1, 5], labels: ['₹1 coins', '₹5 coins'] },
                    { values: [2, 5], labels: ['₹2 coins', '₹5 coins'] },
                    { values: [5, 10], labels: ['₹5 coins', '₹10 notes'] },
                    { values: [5, 20], labels: ['₹5 coins', '₹20 notes'] },
                    { values: [10, 20], labels: ['₹10 notes', '₹20 notes'] },
                    { values: [10, 50], labels: ['₹10 notes', '₹50 notes'] },
                    { values: [20, 50], labels: ['₹20 notes', '₹50 notes'] },
                    { values: [50, 100], labels: ['₹50 notes', '₹100 notes'] },
                    { values: [100, 500], labels: ['₹100 notes', '₹500 notes'] }
                ];
                const pair = currencyPairs[randomInt(0, currencyPairs.length - 1)];
                const note1 = pair.values[0];
                const note2 = pair.values[1];
                const label1 = pair.labels[0];
                const label2 = pair.labels[1];
                const totalNotes = randomInt(100, 200);
                const totalAmount = randomInt(note1 * 20, note2 * totalNotes);
                
                // x*note1 + y*note2 = totalAmount, x + y = totalNotes
                // x = (note2 * totalNotes - totalAmount) / (note2 - note1)
                
                const x_correct = (note2 * totalNotes - totalAmount) / (note2 - note1);
                const y_correct = totalNotes - x_correct;
                
                if (x_correct !== Math.floor(x_correct) || y_correct !== Math.floor(y_correct)) continue;
                if (x_correct <= 0 || y_correct <= 0) continue;
                
                const questionKey = `le_m1_${note1}_${note2}_${totalAmount}_${totalNotes}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `A cashier has ₹${totalAmount} in total. The money is only in ${label1} and ${label2}.\nThere are ${totalNotes} coins/notes altogether. How many ${label1} and ${label2} can she have from the following?`;
                
                // This is MCQ - need to return differently
                return { 
                    question, 
                    isMCQ: true,
                    correctAnswer: `${Math.floor(x_correct)} of ${label1} and ${Math.floor(y_correct)} of ${label2}`
                };
                
            } else if (difficulty === 'medium 2') {
                // Notebook and pen combination - MCQ format
                const notebookPrice = randomInt(50, 100);
                const penPrice = randomInt(20, 50);
                const totalAmount = randomInt(2000, 6000);
                
                // Generate a valid combination
                const notebooks = randomInt(20, 50);
                const pens = randomInt(20, 80);
                const calculatedTotal = notebooks * notebookPrice + pens * penPrice;
                
                if (calculatedTotal !== totalAmount) {
                    // Adjust to make it work
                    const adjustedTotal = calculatedTotal;
                    
                    const questionKey = `le_m2_${notebookPrice}_${penPrice}_${adjustedTotal}`;
                    if (generatedQuestions.has(questionKey)) continue;
                    generatedQuestions.add(questionKey);
                    
                    const question = `The price of one notebook is ₹${notebookPrice} and the price of one pen is ₹${penPrice}.\nWhich of the following combinations costs exactly ₹${adjustedTotal}?`;
                    
                    return {
                        question,
                        isMCQ: true,
                        correctAnswer: `${notebooks} notebooks and ${pens} pens`
                    };
                }
                
            } else if (difficulty === 'medium only') {
                // Randomly choose between Medium 1 and Medium 2
                const subType = randomInt(1, 2);
                
                if (subType === 1) {
                    // Cashier notes/coins problem - MCQ format
                    const currencyPairs = [
                        { values: [1, 2], labels: ['₹1 coins', '₹2 coins'] },
                        { values: [1, 5], labels: ['₹1 coins', '₹5 coins'] },
                        { values: [2, 5], labels: ['₹2 coins', '₹5 coins'] },
                        { values: [5, 10], labels: ['₹5 coins', '₹10 notes'] },
                        { values: [5, 20], labels: ['₹5 coins', '₹20 notes'] },
                        { values: [10, 20], labels: ['₹10 notes', '₹20 notes'] },
                        { values: [10, 50], labels: ['₹10 notes', '₹50 notes'] },
                        { values: [20, 50], labels: ['₹20 notes', '₹50 notes'] },
                        { values: [50, 100], labels: ['₹50 notes', '₹100 notes'] },
                        { values: [100, 500], labels: ['₹100 notes', '₹500 notes'] }
                    ];
                    const pair = currencyPairs[randomInt(0, currencyPairs.length - 1)];
                    const note1 = pair.values[0];
                    const note2 = pair.values[1];
                    const label1 = pair.labels[0];
                    const label2 = pair.labels[1];
                    const totalNotes = randomInt(100, 200);
                    const totalAmount = randomInt(note1 * 20, note2 * totalNotes);
                    
                    const x_correct = (note2 * totalNotes - totalAmount) / (note2 - note1);
                    const y_correct = totalNotes - x_correct;
                    
                    if (x_correct !== Math.floor(x_correct) || y_correct !== Math.floor(y_correct)) continue;
                    if (x_correct <= 0 || y_correct <= 0) continue;
                    
                    const questionKey = `le_m1_${note1}_${note2}_${totalAmount}_${totalNotes}`;
                    if (generatedQuestions.has(questionKey)) continue;
                    generatedQuestions.add(questionKey);
                    
                    const question = `A cashier has ₹${totalAmount} in total. The money is only in ${label1} and ${label2}.\nThere are ${totalNotes} coins/notes altogether. How many ${label1} and ${label2} can she have from the following?`;
                    
                    return { 
                        question, 
                        isMCQ: true,
                        correctAnswer: `${Math.floor(x_correct)} of ${label1} and ${Math.floor(y_correct)} of ${label2}`
                    };
                } else {
                    // Notebook and pen combination - MCQ format
                    const notebookPrice = randomInt(50, 100);
                    const penPrice = randomInt(20, 50);
                    
                    const notebooks = randomInt(20, 50);
                    const pens = randomInt(20, 80);
                    const totalAmount = notebooks * notebookPrice + pens * penPrice;
                    
                    const questionKey = `le_m2_${notebookPrice}_${penPrice}_${totalAmount}`;
                    if (generatedQuestions.has(questionKey)) continue;
                    generatedQuestions.add(questionKey);
                    
                    const question = `The price of one notebook is ₹${notebookPrice} and the price of one pen is ₹${penPrice}.\nWhich of the following combinations costs exactly ₹${totalAmount}?`;
                    
                    return {
                        question,
                        isMCQ: true,
                        correctAnswer: `${notebooks} notebooks and ${pens} pens`
                    };
                }
                
            } else if (difficulty === 'hard 1') {
                // Notes/coins with ratio
                const currencyPairs = [
                    { values: [1, 5], labels: ['₹1 coins', '₹5 coins'] },
                    { values: [2, 5], labels: ['₹2 coins', '₹5 coins'] },
                    { values: [1, 10], labels: ['₹1 coins', '₹10 notes'] },
                    { values: [2, 10], labels: ['₹2 coins', '₹10 notes'] },
                    { values: [5, 20], labels: ['₹5 coins', '₹20 notes'] },
                    { values: [5, 50], labels: ['₹5 coins', '₹50 notes'] },
                    { values: [10, 50], labels: ['₹10 notes', '₹50 notes'] },
                    { values: [10, 100], labels: ['₹10 notes', '₹100 notes'] },
                    { values: [20, 100], labels: ['₹20 notes', '₹100 notes'] },
                    { values: [50, 500], labels: ['₹50 notes', '₹500 notes'] },
                    { values: [100, 500], labels: ['₹100 notes', '₹500 notes'] }
                ];
                const pair = currencyPairs[randomInt(0, currencyPairs.length - 1)];
                const note1 = pair.values[0];
                const note2 = pair.values[1];
                const label1 = pair.labels[0];
                const label2 = pair.labels[1];
                const ratio = randomInt(2, 4); // note1 count is ratio times note2 count
                
                const note2Count = randomInt(5, 15);
                const note1Count = ratio * note2Count;
                const totalAmount = (note1Count * note1) + (note2Count * note2);
                
                const questionKey = `le_h1_${note1}_${note2}_${totalAmount}_${ratio}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const names = ['Bhumika', 'Priya', 'Sita'];
                const name = names[randomInt(0, names.length - 1)];
                
                const question = `${name} has ₹${totalAmount}. All her money is in ${label1} and ${label2}.\nThe number of ${label1} is ${ratio} times the number of ${label2}.\nHow many ${label2} does she have?`;
                
                return { question, answer: note2Count };
                
            } else if (difficulty === 'hard 2' || difficulty === 'hard only') {
                // Weight with ratio — realistic sack/bag weights
                // Each pair: [item1Name, item1Weight, item2Name, item2Weight]
                const sackPairs = [
                    { item1: 'rice',    w1: 25, item2: 'sugar',   w2: 50 },
                    { item1: 'rice',    w1: 50, item2: 'sugar',   w2: 25 },
                    { item1: 'rice',    w1: 25, item2: 'wheat',   w2: 50 },
                    { item1: 'wheat',   w1: 50, item2: 'sugar',   w2: 25 },
                    { item1: 'rice',    w1: 10, item2: 'sugar',   w2: 5  },
                    { item1: 'wheat',   w1: 10, item2: 'rice',    w2: 25 },
                    { item1: 'cement',  w1: 50, item2: 'sand',    w2: 25 },
                    { item1: 'rice',    w1: 5,  item2: 'flour',   w2: 10 },
                    { item1: 'flour',   w1: 5,  item2: 'sugar',   w2: 25 },
                    { item1: 'cement',  w1: 50, item2: 'gravel',  w2: 40 },
                    { item1: 'wheat',   w1: 25, item2: 'flour',   w2: 10 },
                    { item1: 'rice',    w1: 10, item2: 'lentils', w2: 5  }
                ];
                const pair = sackPairs[randomInt(0, sackPairs.length - 1)];
                const w1 = pair.w1;
                const w2 = pair.w2;
                const item1 = pair.item1;
                const item2 = pair.item2;
                const r1 = randomInt(2, 4); // item1 ratio
                const r2 = randomInt(2, 5); // item2 ratio
                
                const n = randomInt(50, 200);
                const totalWeight = (w1 * r1 * n) + (w2 * r2 * n);
                const item1Sacks = r1 * n;
                
                const questionKey = `le_h2_${item1}_${item2}_${w1}_${w2}_${r1}_${r2}_${totalWeight}`;
                if (generatedQuestions.has(questionKey)) continue;
                generatedQuestions.add(questionKey);
                
                const question = `The weight of one ${item1} sack is ${w1}kg, and the weight of one ${item2} sack is ${w2}kg. For every ${r1} ${item1} sacks, you have ${r2} ${item2} sacks.\n\n(Example: If there are ${r2} ${item2} sacks, then there are ${r1} ${item1} sacks. If there are ${r2 * 2} ${item2} sacks, then there are ${r1 * 2} ${item1} sacks, and so on.)\n\nThe total weight of all the sacks is ${totalWeight} kg. How many ${item1} sacks are there?`;
                
                return { question, answer: item1Sacks };
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

// ========================================
// MAIN GENERATION FUNCTION
// ========================================

function generateQuestions() {
    const school = document.getElementById('school').value;
    const concept = document.getElementById('concept').value;
    const difficulty = document.getElementById('difficulty').value;
    const count = parseInt(document.getElementById('count').value);

    if (!count || count < 1) {
        alert('Please enter a valid number of questions (minimum 1)');
        return;
    }

    // Look up the generator function from schoolConfig
    const conceptConfig = schoolConfig[school]?.concepts[concept];
    if (!conceptConfig) {
        alert('Invalid school/concept combination.');
        return;
    }

    const generatorFn = generatorMap[conceptConfig.generator];
    if (!generatorFn) {
        alert(`Generator "${conceptConfig.generator}" not found.`);
        return;
    }

    // Reset generated questions tracker
    generatedQuestions.clear();

    const questions = [];
    let attempts = 0;
    const maxAttempts = count * 50;

    while (questions.length < count && attempts < maxAttempts) {
        attempts++;
        const result = generatorFn(difficulty);

        if (result) {
            questions.push(result);
        }
    }

    if (questions.length === 0) {
        alert('Unable to generate questions. Please try different parameters.');
        return;
    }

    const schoolLabel = schoolConfig[school]?.label || school;
    displayQuestions(questions, concept, difficulty, schoolLabel);
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================

function displayQuestions(questions, concept, difficulty, schoolLabel) {
    const output = document.getElementById('output');
    const questionCount = document.getElementById('questionCount');
    
    questionCount.textContent = `${questions.length} Questions`;
    
    // Store the raw generated questions with their pre-computed options for later selection
    window.generatedQuestionsRaw = [];
    
    let html = '';
    const answerKey = [];
    const hasActivePaper = !!activePaperId;

    questions.forEach((q, index) => {
        const qNum = index + 1;
        
        // Pre-compute options so they are stable (stored for Add-to-Paper)
        let displayOptions = [];
        let correctLetter = '';

        if (q.isMCQ) {
            const options = generateMCQOptions(q.correctAnswer, concept);
            const shuffled = shuffleOptionsWithAnswer(options, q.correctAnswer);
            displayOptions = shuffled.options.map((opt, i) => {
                return { letter: String.fromCharCode(65 + i), text: opt };
            });
            correctLetter = shuffled.correctLetter;
        } else {
            const { options, correctLetter: cl } = createOptions(q.answer);
            correctLetter = cl;
            displayOptions = options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                let displayOpt = opt;
                if (q.type && opt === q.answer) {
                    displayOpt = `${q.type.charAt(0).toUpperCase() + q.type.slice(1)} of ₹${opt}`;
                } else if (q.type) {
                    const randType = Math.random() < 0.5 ? 'Profit' : 'Loss';
                    displayOpt = `${randType} of ₹${opt}`;
                }
                return { letter, text: displayOpt };
            });
        }

        // Save for later use when adding to paper
        window.generatedQuestionsRaw.push({
            ...q,
            concept,
            difficulty,
            school: document.getElementById('school').value,
            displayOptions,
            correctLetter
        });

        html += `<div class="question-block" data-index="${index}">`;
        html += `<div class="question-select-row">`;
        if (hasActivePaper) {
            html += `<input type="checkbox" class="question-checkbox" data-index="${index}" onchange="updateSelectedCount()">`;
        }
        html += `<div class="question-number">Question ${qNum}.</div>`;
        html += `</div>`;
        html += `<p>${q.question.replace(/\n/g, '<br>')}</p><br>`;

        displayOptions.forEach(opt => {
            html += `<div class="option">${opt.letter}) ${opt.text}</div>`;
        });

        answerKey.push(`${qNum}. ${correctLetter}`);
        html += `</div>`;
    });

    // Add answer key
    html += `<div class="answer-key">`;
    html += `<div class="answer-key-title">Answer Key</div>`;
    answerKey.forEach(answer => {
        html += `<div>${answer}</div>`;
    });
    html += `</div>`;

    output.innerHTML = html;
    document.getElementById('downloadBtn').disabled = false;

    // Show/hide select-all row and add-to-paper bar
    const selectAllRow = document.getElementById('selectAllRow');
    const addToPaperBar = document.getElementById('addToPaperBar');
    if (hasActivePaper) {
        selectAllRow.classList.add('visible');
        addToPaperBar.classList.add('visible');
        document.getElementById('selectAllCheckbox').checked = false;
        updateSelectedCount();
    } else {
        selectAllRow.classList.remove('visible');
        addToPaperBar.classList.remove('visible');
    }

    // Store for PDF generation (existing flow)
    window.currentQuestions = { questions, concept, difficulty, answerKey, schoolLabel };
}

function generateMCQOptions(correctAnswer, concept) {
    // Generate 3 plausible wrong answers for MCQ questions
    const options = [correctAnswer];
    
    // Parse the correct answer to generate variations
    const match = correctAnswer.match(/(\d+)[^\d]+(\d+)/);
    if (match) {
        const num1 = parseInt(match[1]);
        const num2 = parseInt(match[2]);
        
        // Create variations
        for (let i = 0; i < 3; i++) {
            let var1, var2;
            do {
                const offset = randomInt(5, 20);
                if (Math.random() < 0.5) {
                    var1 = num1 + offset;
                    var2 = num2 - offset;
                } else {
                    var1 = num1 - offset;
                    var2 = num2 + offset;
                }
            } while (var1 <= 0 || var2 <= 0);
            
            const newOption = correctAnswer.replace(/\d+/, var1).replace(/\d+/, var2);
            if (!options.includes(newOption)) {
                options.push(newOption);
            }
        }
    }
    
    // Fill remaining with random variations if needed
    while (options.length < 4) {
        options.push(correctAnswer + ' (variant)');
    }
    
    return options.slice(0, 4);
}

function shuffleOptionsWithAnswer(options, correctAnswer) {
    const shuffled = shuffle(options);
    const correctIndex = shuffled.indexOf(correctAnswer);
    const correctLetter = String.fromCharCode(65 + correctIndex);
    return { options: shuffled, correctLetter };
}

// ========================================
// PDF DOWNLOAD
// ========================================

function downloadPDF() {
    if (!window.currentQuestions) {
        alert('Please generate questions first');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const { questions, concept, difficulty, answerKey, schoolLabel } = window.currentQuestions;
    
    let y = 20;
    const lineHeight = 7;
    const pageHeight = 280;

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Question Generator - Admissions NG ST', 105, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`School: ${schoolLabel}`, 20, y);
    y += 7;
    doc.text(`Concept: ${concept}`, 20, y);
    y += 7;
    doc.text(`Difficulty: ${difficulty}`, 20, y);
    y += 15;

    // Questions
    questions.forEach((q, index) => {
        if (y > pageHeight) {
            doc.addPage();
            y = 20;
        }

        doc.setFont(undefined, 'bold');
        doc.text(`Question ${index + 1}.`, 20, y);
        y += lineHeight;

        doc.setFont(undefined, 'normal');
        const questionLines = doc.splitTextToSize(q.question, 170);
        questionLines.forEach(line => {
            if (y > pageHeight) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, 20, y);
            y += lineHeight;
        });

        y += 3;

        if (q.isMCQ) {
            const options = generateMCQOptions(q.correctAnswer, concept);
            const { options: shuffledOpts } = shuffleOptionsWithAnswer(options, q.correctAnswer);
            
            shuffledOpts.forEach((opt, i) => {
                if (y > pageHeight) {
                    doc.addPage();
                    y = 20;
                }
                const letter = String.fromCharCode(65 + i);
                doc.text(`${letter}) ${opt}`, 25, y);
                y += lineHeight;
            });
        } else {
            const { options } = createOptions(q.answer);
            
            options.forEach((opt, i) => {
                if (y > pageHeight) {
                    doc.addPage();
                    y = 20;
                }
                const letter = String.fromCharCode(65 + i);
                let displayOpt = opt;
                
                if (q.type && opt === q.answer) {
                    displayOpt = `${q.type.charAt(0).toUpperCase() + q.type.slice(1)} of ₹${opt}`;
                } else if (q.type) {
                    const randType = Math.random() < 0.5 ? 'Profit' : 'Loss';
                    displayOpt = `${randType} of ₹${opt}`;
                }
                
                doc.text(`${letter}) ${displayOpt}`, 25, y);
                y += lineHeight;
            });
        }

        y += 10;
    });

    // Answer Key
    if (y > pageHeight - 50) {
        doc.addPage();
        y = 20;
    }

    y += 10;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text('Answer Key', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    answerKey.forEach(answer => {
        if (y > pageHeight) {
            doc.addPage();
            y = 20;
        }
        doc.text(answer, 20, y);
        y += lineHeight;
    });

    doc.save('questions.pdf');
}

// ========================================
// QUESTION PAPER MANAGEMENT
// ========================================

// In-memory storage for all question papers
let questionPapers = {};
let activePaperId = null;

// Concept order per school (determines section order in the paper)
const conceptOrderBySchool = {
    'SOP': ['number patterns', 'percentages', 'work and time', 'linear equations in two variables'],
    'SOB': ['number patterns', 'percentages', 'profit and loss', 'simple interest'],
    'SOF': ['number patterns', 'percentages', 'profit and loss', 'simple interest'],
    'BCA': ['number patterns', 'percentages', 'work and time', 'linear equations in two variables']
};

// Concept explanation texts for the PDF (matching reference papers)
// Each concept has an array of paragraphs. Blank string '' = blank line in PDF.
const conceptExplanations = {
    'number patterns': [], // No explanation — questions start immediately after separator
    'percentages': [
        'A percentage helps us understand how much a part is of the whole.',
        'The word "percent" means "out of 100."',
        '',
        'For example, if a school has 50 students and 10 of them are unhealthy, then the percentage of unhealthy students will be:',
        '',
        'Percentage = (Part \u00F7 Total) \u00D7 100',
        '       = (10 \u00F7 50) \u00D7 100 = 20%',
        '',
        'Now answer the following questions.'
    ],
    'work and time': [
        'For the next questions, think in a practical way. For example, if you can plant 100 trees in 1 hour, then in 4 hours you can plant: 100 \u00D7 4 = 400 trees.',
        '',
        'This means the work done increases with time.',
        '',
        'Using the same idea, answer the following questions.'
    ],
    'linear equations in two variables': [
        'Think of these questions like real-life situations. Two values are unknown. Use letters like x and y to represent them. Then use the given information to write an equation.',
        '',
        'Example:',
        'If the total cost of apples and oranges is Rs.100, and apples cost Rs.3 each while oranges cost Rs.2 each, the equation can be written as:',
        '3x + 2y = 100',
        '',
        'Now answer the following questions.'
    ],
    'profit and loss': [
        'Profit and loss help us understand buying and selling things.',
        '',
        '   \u2022  Cost price (CP) is the price at which something is bought.',
        '   \u2022  Selling price (SP) is the price at which something is sold.',
        '',
        'If we sell something for more money than we bought it for, we get profit.',
        'If we sell it for less money than we bought it for, we get loss.',
        '',
        'Now answer the following questions.'
    ],
    'simple interest': [
        'Simple interest is the extra money paid or earned on a fixed amount for a fixed time at a fixed rate.',
        '',
        'Simple Interest = Principal \u00D7 Rate \u00D7 Time \u00F7 100',
        '',
        '   \u2022  Principal (P) is the amount of money we first take or invest.',
        '   \u2022  The Rate of interest (R) is the percentage of interest per year.',
        '   \u2022  Time (T) means how many years the money is taken/lent for.',
        '',
        'Now answer the following questions.'
    ]
};

// Concept display titles for the PDF
const conceptDisplayTitles = {
    'number patterns': 'Number Patterns',
    'percentages': 'Percentages',
    'work and time': 'Work and Time',
    'linear equations in two variables': 'Linear Equations in Two Variables',
    'profit and loss': 'Profit and Loss',
    'simple interest': 'Simple Interest'
};

// Full school names for the PDF header
const schoolFullNames = {
    'SOP': 'School Of Programming',
    'SOB': 'School Of Business',
    'SOF': 'School Of Finance',
    'BCA': 'BCA'
};

// ========================================
// TAB SWITCHING
// ========================================

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

    if (tabName === 'generate') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tab-generate').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tab-papers').classList.add('active');
        renderPaperList();
        renderActivePaper();
    }
}

// ========================================
// PAPER CRUD
// ========================================

function createPaper() {
    const schoolKey = document.getElementById('paperSchool').value;
    const setName = document.getElementById('paperSetName').value.trim();

    if (!setName) {
        alert('Please enter a set name (e.g. A, B, C)');
        return;
    }

    const paperId = `${schoolKey} ${setName}`;

    if (questionPapers[paperId]) {
        alert(`Paper "${paperId}" already exists.`);
        return;
    }

    questionPapers[paperId] = {
        school: schoolKey,
        setName: setName,
        questions: [] // Each entry: { concept, difficulty, question, answer, isMCQ, correctAnswer, type, displayOptions, correctLetter }
    };

    activePaperId = paperId;
    document.getElementById('paperSetName').value = '';

    renderPaperList();
    renderActivePaper();
    updateActivePaperLabelEverywhere();
}

function deletePaper(paperId) {
    if (!confirm(`Delete paper "${paperId}"?`)) return;
    delete questionPapers[paperId];
    if (activePaperId === paperId) {
        activePaperId = null;
    }
    renderPaperList();
    renderActivePaper();
    updateActivePaperLabelEverywhere();
}

function setActivePaper(paperId) {
    activePaperId = paperId;
    renderPaperList();
    renderActivePaper();
    updateActivePaperLabelEverywhere();
}

function updateActivePaperLabelEverywhere() {
    const label = document.getElementById('activePaperLabel');
    if (label) {
        label.textContent = activePaperId || 'None';
    }
    // Update the add-to-paper bar visibility if questions are displayed
    const addToPaperBar = document.getElementById('addToPaperBar');
    const selectAllRow = document.getElementById('selectAllRow');
    if (activePaperId && window.generatedQuestionsRaw && window.generatedQuestionsRaw.length > 0) {
        addToPaperBar.classList.add('visible');
        selectAllRow.classList.add('visible');
        // Add checkboxes to existing question blocks if missing
        document.querySelectorAll('.question-block').forEach(block => {
            const row = block.querySelector('.question-select-row');
            if (row && !row.querySelector('.question-checkbox')) {
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.className = 'question-checkbox';
                cb.dataset.index = block.dataset.index;
                cb.onchange = updateSelectedCount;
                row.insertBefore(cb, row.firstChild);
            }
        });
        updateSelectedCount();
    } else {
        addToPaperBar.classList.remove('visible');
        selectAllRow.classList.remove('visible');
    }
}

// ========================================
// PAPER LIST RENDERING
// ========================================

function renderPaperList() {
    const container = document.getElementById('paperList');
    if (!container) return;

    const ids = Object.keys(questionPapers);
    if (ids.length === 0) {
        container.innerHTML = '<span style="color:var(--text-secondary); font-style:italic; font-size:0.9rem;">No papers created yet.</span>';
        return;
    }

    let html = '';
    ids.forEach(id => {
        const isActive = id === activePaperId;
        const qCount = questionPapers[id].questions.length;
        html += `<div class="paper-chip ${isActive ? 'active' : ''}" onclick="setActivePaper('${id.replace(/'/g, "\\'")}')">`;
        html += `${id} (${qCount}Q)`;
        html += `<button class="delete-paper" onclick="event.stopPropagation(); deletePaper('${id.replace(/'/g, "\\'")}')">×</button>`;
        html += `</div>`;
    });
    container.innerHTML = html;
}

// ========================================
// ACTIVE PAPER RENDERING
// ========================================

function renderActivePaper() {
    const placeholder = document.getElementById('noPaperPlaceholder');
    const contents = document.getElementById('activePaperContents');

    if (!activePaperId || !questionPapers[activePaperId]) {
        placeholder.style.display = '';
        contents.style.display = 'none';
        return;
    }

    placeholder.style.display = 'none';
    contents.style.display = '';

    const paper = questionPapers[activePaperId];
    const schoolLabel = schoolConfig[paper.school]?.label || paper.school;

    document.getElementById('activePaperTitleDisplay').textContent = `${activePaperId} — ${schoolLabel}`;
    document.getElementById('activePaperStats').textContent = `${paper.questions.length} questions`;

    // Group questions by concept, maintaining the order they appear in conceptOrderBySchool
    const order = conceptOrderBySchool[paper.school] || [];
    const grouped = {};
    paper.questions.forEach(q => {
        if (!grouped[q.concept]) grouped[q.concept] = [];
        grouped[q.concept].push(q);
    });

    const container = document.getElementById('paperQuestionsContainer');
    let html = '';
    let globalNum = 1;

    order.forEach(conceptKey => {
        const qs = grouped[conceptKey];
        if (!qs || qs.length === 0) return;

        const conceptLabel = conceptDisplayTitles[conceptKey] || conceptKey;
        html += `<div class="paper-concept-section">`;
        html += `<div class="paper-concept-title">${conceptLabel} (${qs.length})</div>`;

        qs.forEach((q, idx) => {
            const diffLabel = q.difficulty;
            html += `<div class="paper-question-item">`;
            html += `<div class="pq-content">`;
            html += `<strong>Q${globalNum}.</strong> ${q.question.replace(/\n/g, '<br>')}`;
            html += `<div class="pq-meta">${diffLabel}</div>`;

            // Show options
            if (q.displayOptions && q.displayOptions.length > 0) {
                q.displayOptions.forEach(opt => {
                    html += `<div class="option">${opt.letter}) ${opt.text}</div>`;
                });
            }

            html += `</div>`;
            html += `<button class="remove-q-btn" onclick="removeQuestionFromPaper('${activePaperId.replace(/'/g, "\\'")}', ${paper.questions.indexOf(q)})">Remove</button>`;
            html += `</div>`;
            globalNum++;
        });

        html += `</div>`;
    });

    // Also show any questions whose concept is not in the order list (edge case)
    Object.keys(grouped).forEach(conceptKey => {
        if (order.includes(conceptKey)) return;
        const qs = grouped[conceptKey];
        const conceptLabel = conceptDisplayTitles[conceptKey] || conceptKey;
        html += `<div class="paper-concept-section">`;
        html += `<div class="paper-concept-title">${conceptLabel} (${qs.length})</div>`;
        qs.forEach(q => {
            html += `<div class="paper-question-item">`;
            html += `<div class="pq-content">`;
            html += `<strong>Q${globalNum}.</strong> ${q.question.replace(/\n/g, '<br>')}`;
            html += `<div class="pq-meta">${q.difficulty}</div>`;
            if (q.displayOptions && q.displayOptions.length > 0) {
                q.displayOptions.forEach(opt => {
                    html += `<div class="option">${opt.letter}) ${opt.text}</div>`;
                });
            }
            html += `</div>`;
            html += `<button class="remove-q-btn" onclick="removeQuestionFromPaper('${activePaperId.replace(/'/g, "\\'")}', ${paper.questions.indexOf(q)})">Remove</button>`;
            html += `</div>`;
            globalNum++;
        });
        html += `</div>`;
    });

    if (paper.questions.length === 0) {
        html = '<div class="no-paper-placeholder"><p>No questions added yet. Go to "Generate Questions" tab, generate questions, select the ones you want, and click "Add to Paper".</p></div>';
    }

    container.innerHTML = html;
}

function removeQuestionFromPaper(paperId, index) {
    if (!questionPapers[paperId]) return;
    questionPapers[paperId].questions.splice(index, 1);
    renderPaperList();
    renderActivePaper();
}

// ========================================
// CHECKBOX / SELECTION HELPERS
// ========================================

function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('#output .question-checkbox');
    const checked = document.querySelectorAll('#output .question-checkbox:checked');
    document.getElementById('selectedCount').textContent = checked.length;
}

function toggleSelectAll(masterCheckbox) {
    const checkboxes = document.querySelectorAll('#output .question-checkbox');
    checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
    updateSelectedCount();
}

function addSelectedToPaper() {
    if (!activePaperId || !questionPapers[activePaperId]) {
        alert('No active paper. Create or select a paper first.');
        return;
    }

    const checked = document.querySelectorAll('#output .question-checkbox:checked');
    if (checked.length === 0) {
        alert('No questions selected.');
        return;
    }

    const paper = questionPapers[activePaperId];

    checked.forEach(cb => {
        const idx = parseInt(cb.dataset.index);
        const q = window.generatedQuestionsRaw[idx];
        if (!q) return;

        // Add a copy to the paper
        paper.questions.push({
            concept: q.concept,
            difficulty: q.difficulty,
            question: q.question,
            answer: q.answer,
            isMCQ: q.isMCQ || false,
            correctAnswer: q.correctAnswer || null,
            type: q.type || null,
            displayOptions: q.displayOptions,
            correctLetter: q.correctLetter
        });
    });

    // Uncheck all
    document.querySelectorAll('#output .question-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('selectAllCheckbox').checked = false;
    updateSelectedCount();

    // Update paper list chip counts
    renderPaperList();

    alert(`${checked.length} question(s) added to "${activePaperId}".`);
}

// ========================================
// QUESTION PAPER PDF GENERATOR
// ========================================

function downloadQuestionPaperPDF() {
    if (!activePaperId || !questionPapers[activePaperId]) {
        alert('No active paper selected.');
        return;
    }

    const paper = questionPapers[activePaperId];
    if (paper.questions.length === 0) {
        alert('The paper has no questions. Add some first.');
        return;
    }

    // Helper: replace ₹ with Rs. for PDF (Helvetica doesn't support U+20B9)
    function pdfSafe(text) {
        if (text === null || text === undefined) return '';
        return String(text).replace(/\u20B9/g, 'Rs.');
    }

    const { jsPDF } = window.jspdf;
    // Letter size (612 x 792 pt ≈ 215.9 x 279.4 mm) to match reference PDFs
    const doc = new jsPDF({ format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();   // ~215.9
    const pageHeight = doc.internal.pageSize.getHeight();  // ~279.4
    const marginLeft = 25;
    const marginRight = 25;
    const marginBottom = 20;
    const contentWidth = pageWidth - marginLeft - marginRight;
    const lineHeight = 5.5;
    let y = 22;

    // ---- Pagination helper ----
    function checkPage(needed) {
        if (y + needed > pageHeight - marginBottom) {
            doc.addPage();
            y = 22;
        }
    }

    // ---- Separator line ----
    function drawSeparator() {
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.4);
        doc.line(marginLeft, y, pageWidth - marginRight, y);
        y += 5;
    }

    // ---- HEADER ----
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('NavGurukul \u2013 Screening Test', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(13);
    const schoolName = schoolFullNames[paper.school] || paper.school;
    doc.text(schoolName, pageWidth / 2, y, { align: 'center' });
    y += 9;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`${paper.school} - ${paper.setName}`, pageWidth / 2, y, { align: 'center' });
    y += 12;

    // ---- INSTRUCTIONS ----
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Instructions', marginLeft, y);
    y += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const instructions = [
        '\u2022  All questions are multiple-choice.',
        '\u2022  Choose only one correct answer for each question.',
        '\u2022  Mark the correct answer on the OMR sheet.'
    ];
    instructions.forEach(line => {
        doc.text(line, marginLeft, y);
        y += lineHeight + 0.5;
    });
    y += 4;

    // ---- QUESTIONS BY CONCEPT SECTION ----
    const order = conceptOrderBySchool[paper.school] || [];
    const grouped = {};
    paper.questions.forEach(q => {
        if (!grouped[q.concept]) grouped[q.concept] = [];
        grouped[q.concept].push(q);
    });

    let globalQNum = 1;

    // Collect all concepts in order (+ any extras)
    const allConcepts = [...order];
    Object.keys(grouped).forEach(c => {
        if (!allConcepts.includes(c)) allConcepts.push(c);
    });

    allConcepts.forEach(conceptKey => {
        const qs = grouped[conceptKey];
        if (!qs || qs.length === 0) return;

        // Separator before every concept section
        checkPage(20);
        drawSeparator();

        // Number patterns: NO concept title, NO explanation — questions start right away
        const isNumberPatterns = (conceptKey === 'number patterns');

        if (!isNumberPatterns) {
            // Concept title
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            const conceptTitle = conceptDisplayTitles[conceptKey] || conceptKey;
            doc.text(conceptTitle, marginLeft, y);
            y += 7;

            // Concept explanation (array of paragraphs)
            const paragraphs = conceptExplanations[conceptKey] || [];
            if (paragraphs.length > 0) {
                doc.setFontSize(9.5);
                doc.setFont(undefined, 'normal');
                paragraphs.forEach(para => {
                    if (para === '') {
                        // Blank line
                        y += lineHeight * 0.6;
                    } else {
                        const wrapped = doc.splitTextToSize(pdfSafe(para), contentWidth);
                        wrapped.forEach(line => {
                            checkPage(lineHeight);
                            doc.text(line, marginLeft, y);
                            y += lineHeight;
                        });
                    }
                });
                y += 3;
            }
        }

        // Questions
        qs.forEach(q => {
            // Estimate space: question + options ≈ 25
            checkPage(25);

            // Q number + question text on SAME line
            // "Q1    question text here..."
            doc.setFontSize(10.5);
            doc.setFont(undefined, 'bold');
            const qLabel = `Q${globalQNum}   `;
            const qLabelWidth = doc.getTextWidth(qLabel);

            doc.text(qLabel, marginLeft, y);

            doc.setFont(undefined, 'normal');
            const questionText = pdfSafe(q.question);
            const availWidth = contentWidth - qLabelWidth;
            const qLines = doc.splitTextToSize(questionText, availWidth);
            // First line on same row as Q label
            if (qLines.length > 0) {
                doc.text(qLines[0], marginLeft + qLabelWidth, y);
                y += lineHeight;
            }
            // Remaining lines indented to align with first line of text
            for (let i = 1; i < qLines.length; i++) {
                checkPage(lineHeight);
                doc.text(qLines[i], marginLeft + qLabelWidth, y);
                y += lineHeight;
            }
            y += 1.5;

            // Options — try all 4 on ONE line; fall back to 2-per-row if too wide
            if (q.displayOptions && q.displayOptions.length > 0) {
                const opts = q.displayOptions;
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');

                // Build option strings
                const optStrings = opts.map(o => `${o.letter}) ${pdfSafe(o.text)}`);

                // Measure total width if all on one line (with spacing between)
                const optGap = 8; // mm gap between options
                let totalWidth = 0;
                optStrings.forEach((s, i) => {
                    totalWidth += doc.getTextWidth(s);
                    if (i < optStrings.length - 1) totalWidth += optGap;
                });

                if (totalWidth <= contentWidth) {
                    // All 4 options on ONE line
                    checkPage(lineHeight);
                    let xPos = marginLeft;
                    const colWidth = contentWidth / opts.length;
                    optStrings.forEach((s, i) => {
                        doc.text(s, marginLeft + i * colWidth, y);
                    });
                    y += lineHeight;
                } else {
                    // Fall back to 2 per row
                    const halfWidth = contentWidth / 2;
                    for (let i = 0; i < opts.length; i += 2) {
                        checkPage(lineHeight);
                        doc.text(optStrings[i], marginLeft, y);
                        if (i + 1 < opts.length) {
                            doc.text(optStrings[i + 1], marginLeft + halfWidth, y);
                        }
                        y += lineHeight;
                    }
                }
            }

            y += 3;
            globalQNum++;
        });
    });

    // Final separator
    checkPage(10);
    drawSeparator();

    doc.save(`${activePaperId}.pdf`);
}

// ========================================
// ANSWER KEY PDF GENERATOR
// ========================================

function downloadAnswerKeyPDF() {
    if (!activePaperId || !questionPapers[activePaperId]) {
        alert('No active paper selected.');
        return;
    }

    const paper = questionPapers[activePaperId];
    if (paper.questions.length === 0) {
        alert('The paper has no questions.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const lineHeight = 7;
    let y = 20;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Answer Key \u2013 ${activePaperId}`, pageWidth / 2, y, { align: 'center' });
    y += 12;

    const order = conceptOrderBySchool[paper.school] || [];
    const grouped = {};
    paper.questions.forEach(q => {
        if (!grouped[q.concept]) grouped[q.concept] = [];
        grouped[q.concept].push(q);
    });

    let globalQNum = 1;
    const allConcepts = [...order];
    Object.keys(grouped).forEach(c => {
        if (!allConcepts.includes(c)) allConcepts.push(c);
    });

    allConcepts.forEach(conceptKey => {
        const qs = grouped[conceptKey];
        if (!qs || qs.length === 0) return;

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(conceptDisplayTitles[conceptKey] || conceptKey, 20, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        qs.forEach(q => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`Q${globalQNum}. ${q.correctLetter}`, 25, y);
            y += lineHeight;
            globalQNum++;
        });
        y += 4;
    });

    doc.save(`${activePaperId} - Answer Key.pdf`);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Build generator map (function name string → actual function reference)
    generatorMap = {
        'generateNumberPattern': generateNumberPattern,
        'generatePercentage': generatePercentage,
        'generatePercentageSOB': generatePercentageSOB,
        'generateWorkTime': generateWorkTime,
        'generateProfitLoss': generateProfitLoss,
        'generateSimpleInterest': generateSimpleInterest,
        'generateLinearEquation': generateLinearEquation
    };

    // Populate School dropdown from schoolConfig
    const schoolSelect = document.getElementById('school');
    Object.keys(schoolConfig).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = schoolConfig[key].label;
        schoolSelect.appendChild(option);
    });

    // Populate Papers-tab School dropdown
    const paperSchoolSelect = document.getElementById('paperSchool');
    if (paperSchoolSelect) {
        Object.keys(schoolConfig).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = schoolConfig[key].label;
            paperSchoolSelect.appendChild(option);
        });
    }

    // Cascade: school → concept → difficulty
    updateConceptDropdown();

    console.log('Question Generator Ready');
});
