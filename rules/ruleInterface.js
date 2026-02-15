// ============================================================================
// RULE INTERFACE CONTRACT
// ============================================================================
//
// Every rule file in this folder must export an object that conforms to
// the structure documented below. This is the foundation of the
// Question Design Platform's rule engine.
//
// ============================================================================
//
// REQUIRED EXPORTS:
//
//   {
//     id:          String   — Unique identifier for this rule (snake_case).
//                              Example: 'constant_difference'
//
//     name:        String   — Human-readable name.
//                              Example: 'Constant Difference Pattern'
//
//     description: String   — A short explanation of what this rule generates.
//                              Example: 'Generates an arithmetic sequence where
//                                        consecutive terms differ by a fixed value.'
//
//     generate:    Function — Creates one question instance.
//
//         Signature:  generate(params) → { questionData, answer }
//
//         @param  {Object} params — Controls how the question is built.
//                 The exact keys depend on the rule. If `params` is omitted
//                 or empty, the rule SHOULD pick sensible random values
//                 internally (convenience mode for quick generation).
//
//         @returns {Object}
//           questionData  {Object} — All data needed to display the question.
//                                    Structure is rule-specific.
//                                    Example for a sequence rule:
//                                      { sequence: [3, 5, 7, 9], missingIndex: 4 }
//
//           answer        {*}      — The correct answer (number, string, etc.).
//                                    Example: 11
//
//     validate:    Function — Deterministically checks if an answer is correct
//                              for the given questionData.
//
//         Signature:  validate(questionData, answer) → Boolean
//
//         @param  {Object} questionData — The same object returned by generate().
//         @param  {*}      answer       — The answer to check.
//         @returns {Boolean} true if the answer is correct, false otherwise.
//
//         IMPORTANT:
//           - Must be pure (no side effects).
//           - Must be deterministic (same inputs → same output, always).
//           - Must NOT rely on randomness.
//
//     difficultyConfig: Object — Documents how difficulty levels map to
//                                  parameter ranges for this rule.
//
//         Structure (informational, used by the platform to auto-generate
//         params when a difficulty level is selected):
//
//         {
//           easy:   { start: { min, max }, difference: { min, max }, length: { min, max } },
//           medium: { start: { min, max }, difference: { min, max }, length: { min, max } },
//           hard:   { start: { min, max }, difference: { min, max }, length: { min, max } }
//         }
//
//         The keys and ranges are rule-specific. This object serves as
//         documentation AND as a machine-readable config that the platform
//         can use to auto-pick params for a given difficulty.
//
//     generateForDifficulty: Function (OPTIONAL but recommended)
//
//         Signature:  generateForDifficulty(difficultyKey) → { questionData, answer }
//
//         Convenience wrapper that picks random params within the ranges
//         defined in difficultyConfig and calls generate().
//         If not provided, the platform can build this automatically from
//         difficultyConfig.
//
//     formatQuestion: Function — Converts questionData into a human-readable
//                                question string for display or PDF output.
//
//         Signature:  formatQuestion(questionData) → String
//
//         @param  {Object} questionData — The same object returned by generate().
//         @returns {String} The complete question text, ready for display.
//                           May contain newlines (\n) for multi-line formatting.
//
//         IMPORTANT:
//           - Must be deterministic (same questionData → same string, always).
//           - Must NOT rely on randomness. Use questionData values to
//             deterministically pick name/context variants where needed.
//           - Must NOT depend on the browser, DOM, or any external state.
//           - Should match the exact wording that appears on the test paper.
//
//         Example (for constant_difference):
//           formatQuestion({ sequence: [3, 5, 7, 9], missingIndex: 5 })
//           → "What will be the next term in the pattern?\n3, 5, 7, 9, ___"
//
//   }
//
// ----------------------------------------------------------------------------
// METADATA FIELDS (added for SaaS / search / filter):
// ----------------------------------------------------------------------------
//
//     concept:     String   — The concept family this rule belongs to.
//                              Must match a key in schoolRuleMap concepts.
//                              Examples: 'number patterns', 'percentages',
//                              'work and time', 'profit and loss',
//                              'simple interest', 'linear equations'
//
//     tags:        String[] — Searchable keywords for the no-code builder.
//                              Examples: ['arithmetic', 'sequence', 'pattern']
//
//     gradeLevel:  String   — Target grade range.
//                              Examples: '5-7', '6-8', '7-9'
//
//     answerType:  String   — The format of the answer.
//                              'numeric' — single number
//                              'mcq'     — string-based multiple choice
//
// ============================================================================
//
// GUIDELINES FOR RULE AUTHORS:
//
//   1. One rule per file. File name should match the rule id.
//      Example: constantDifference.js → id: 'constant_difference'
//
//   2. All generated values must be whole numbers (no decimals) unless
//      the rule explicitly targets decimal arithmetic.
//
//   3. generate() must be able to produce many unique questions.
//      Avoid patterns that only yield a handful of possible outputs.
//
//   4. validate() must work independently of generate(). Given only
//      questionData and an answer, it must return true/false correctly.
//
//   5. Keep rules self-contained. No dependencies on the UI, DOM, or
//      browser APIs. Rules must run in Node.js for testing.
//
//   6. Add clear comments explaining the mathematical logic.
//
// ============================================================================
//
// This file contains NO executable code. It is documentation only.
// Do not import this file in production code.
//
// ============================================================================
