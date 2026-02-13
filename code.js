function generateQuestions(count, difficulty) {
  // Allowed final percentages (whole numbers only)
  const allowedPercentages = [20, 25, 28, 34, 38, 40, 45, 50];
  
  // Store generated questions to avoid duplicates
  const generatedQuestions = new Set();
  const questions = [];
  
  // Helper function to check if a number has trailing zeros
  function hasTrailingZeros(num) {
    return num % 10 === 0;
  }
  
  // Helper function to generate random number without trailing zeros
  function randomNoTrailingZeros(min, max) {
    let num;
    do {
      num = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (hasTrailingZeros(num));
    return num;
  }
  
  // Helper function to shuffle array
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Generate distractor options (realistic wrong answers)
  function generateDistractors(correctAnswer, count = 3) {
    const distractors = new Set();
    const range = Math.max(10, Math.floor(correctAnswer * 0.3)); // 30% range
    
    while (distractors.size < count) {
      let distractor;
      const offset = Math.floor(Math.random() * range) + 1;
      
      if (Math.random() < 0.5) {
        distractor = correctAnswer + offset;
      } else {
        distractor = Math.max(1, correctAnswer - offset);
      }
      
      // Ensure distractor is different from correct answer and other distractors
      if (distractor !== correctAnswer && !distractors.has(distractor)) {
        distractors.add(distractor);
      }
    }
    
    return Array.from(distractors);
  }
  
  // Generate EASY question
  function generateEasyQuestion() {
    let X, Y, notFresh, percentage;
    let attempts = 0;
    const maxAttempts = 1000;
    
    do {
      attempts++;
      if (attempts > maxAttempts) return null;
      
      // Pick a target percentage first
      percentage = allowedPercentages[Math.floor(Math.random() * allowedPercentages.length)];
      
      // X should be divisible by 100 for clean percentage calculation
      // Find X such that (percentage * X) / 100 is a whole number
      const multipliers = [4, 5, 8, 10, 20, 25, 50]; // Common divisors of 100
      const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
      X = randomNoTrailingZeros(multiplier * 2, multiplier * 20);
      
      // Calculate not fresh apples based on target percentage
      notFresh = (percentage * X) / 100;
      
      // Y = fresh apples = X - notFresh
      Y = X - notFresh;
      
      // Validate: no decimals, X > Y, Y > 0
    } while (
      notFresh !== Math.floor(notFresh) ||
      Y !== Math.floor(Y) ||
      Y <= 0 ||
      Y >= X ||
      hasTrailingZeros(X) ||
      hasTrailingZeros(Y)
    );
    
    const key = `easy-${X}-${Y}`;
    if (generatedQuestions.has(key)) return null;
    generatedQuestions.add(key);
    
    return {
      question: `I bought ${X} apples, out of which ${Y} were fresh. What percentage of apples which are not fresh?`,
      correctAnswer: percentage,
      X, Y
    };
  }
  
  // Generate MEDIUM question
  function generateMediumQuestion() {
    let X, Y, Z, finalRoses, finalTotal, percentage;
    let attempts = 0;
    const maxAttempts = 1000;
    
    do {
      attempts++;
      if (attempts > maxAttempts) return null;
      
      // Pick a target percentage first
      percentage = allowedPercentages[Math.floor(Math.random() * allowedPercentages.length)];
      
      // Generate X (initial total flowers)
      X = randomNoTrailingZeros(15, 99);
      
      // Generate Z (extra roses to buy)
      Z = randomNoTrailingZeros(5, 50);
      
      // Calculate final total
      finalTotal = X + Z;
      
      // Calculate final roses needed for target percentage
      finalRoses = (percentage * finalTotal) / 100;
      
      // Calculate Y (initial roses)
      Y = finalRoses - Z;
      
      // Validate: no decimals, Y > 0, Y < X
    } while (
      finalRoses !== Math.floor(finalRoses) ||
      Y !== Math.floor(Y) ||
      Y <= 0 ||
      Y >= X ||
      hasTrailingZeros(X) ||
      hasTrailingZeros(Y) ||
      hasTrailingZeros(Z)
    );
    
    const key = `medium-${X}-${Y}-${Z}`;
    if (generatedQuestions.has(key)) return null;
    generatedQuestions.add(key);
    
    const names = ["Ravi", "Sara", "Mike", "Emma", "John", "Lisa", "David", "Maya"];
    const name = names[Math.floor(Math.random() * names.length)];
    const pronoun = ["Ravi", "Mike", "John", "David"].includes(name) ? "he" : "she";
    
    return {
      question: `${name} bought ${X} flowers, out of which ${Y} are roses. If ${pronoun} bought ${Z} more roses, then what is the percentage of roses?`,
      correctAnswer: percentage,
      X, Y, Z
    };
  }
  
  // Generate HARD question
  function generateHardQuestion() {
    let X, Y, P, B;
    let attempts = 0;
    const maxAttempts = 1000;
    
    do {
      attempts++;
      if (attempts > maxAttempts) return null;
      
      // Pick a target percentage
      P = allowedPercentages[Math.floor(Math.random() * allowedPercentages.length)];
      
      // Generate X (red ribbons)
      X = randomNoTrailingZeros(10, 80);
      
      // Generate Y (initial blue ribbons)
      Y = randomNoTrailingZeros(5, 50);
      
      // Calculate B (extra blue ribbons needed)
      // Formula: (Y + B) / (X + Y + B) = P / 100
      // Solving for B: (Y + B) = P/100 * (X + Y + B)
      // 100(Y + B) = P(X + Y + B)
      // 100Y + 100B = PX + PY + PB
      // 100B - PB = PX + PY - 100Y
      // B(100 - P) = PX + PY - 100Y
      // B = (PX + PY - 100Y) / (100 - P)
      
      const numerator = P * X + P * Y - 100 * Y;
      const denominator = 100 - P;
      B = numerator / denominator;
      
      // Validate: B must be positive whole number
    } while (
      B !== Math.floor(B) ||
      B <= 0 ||
      hasTrailingZeros(X) ||
      hasTrailingZeros(Y) ||
      hasTrailingZeros(B)
    );
    
    const key = `hard-${X}-${Y}-${P}`;
    if (generatedQuestions.has(key)) return null;
    generatedQuestions.add(key);
    
    return {
      question: `Arman has ${X} red ribbons and ${Y} blue ribbons. How many blue ribbons should he buy so that the percentage of blue ribbons becomes ${P}%?`,
      correctAnswer: B,
      X, Y, P
    };
  }
  
  // Generate questions based on difficulty
  let questionGenerator;
  if (difficulty === "easy") {
    questionGenerator = generateEasyQuestion;
  } else if (difficulty === "medium") {
    questionGenerator = generateMediumQuestion;
  } else if (difficulty === "hard") {
    questionGenerator = generateHardQuestion;
  } else {
    console.log("Invalid difficulty level. Use 'easy', 'medium', or 'hard'.");
    return;
  }
  
  // Generate required number of questions
  let retries = 0;
  const maxRetries = count * 100;
  
  while (questions.length < count && retries < maxRetries) {
    retries++;
    const q = questionGenerator();
    if (q) {
      questions.push(q);
    }
  }
  
  if (questions.length < count) {
    console.log(`Warning: Could only generate ${questions.length} unique questions.`);
  }
  
  // Print formatted output
  console.log(`\n${"=".repeat(70)}`);
  console.log(`PERCENTAGE MCQ QUESTIONS - ${difficulty.toUpperCase()} LEVEL`);
  console.log(`${"=".repeat(70)}\n`);
  
  questions.forEach((q, index) => {
    console.log(`Question ${index + 1}:`);
    console.log(q.question);
    console.log();
    
    // Generate options with distractors
    const distractors = generateDistractors(q.correctAnswer);
    const allOptions = [q.correctAnswer, ...distractors];
    const shuffledOptions = shuffleArray(allOptions);
    
    // Find which letter is the correct answer
    const correctLetter = String.fromCharCode(65 + shuffledOptions.indexOf(q.correctAnswer));
    
    // Print options
    shuffledOptions.forEach((option, i) => {
      const letter = String.fromCharCode(65 + i); // A, B, C, D
      if (difficulty === "hard") {
        console.log(`${letter}. ${option} ribbons`);
      } else {
        console.log(`${letter}. ${option}%`);
      }
    });
    
    console.log();
    console.log(`Correct Answer: ${correctLetter}`);
    console.log(`${"-".repeat(70)}\n`);
  });
}

// Test the function with different difficulty levels
generateQuestions(5, "easy");
generateQuestions(5, "medium");
generateQuestions(5, "hard");