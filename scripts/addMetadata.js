// Script to add metadata to all 28 rule files
// Run: node scripts/addMetadata.js

const fs = require('fs');

const meta = {
    'constant_difference':    { concept: 'number patterns', tags: ['arithmetic', 'sequence', 'pattern'], gradeLevel: '5-7', answerType: 'numeric' },
    'increasing_difference':  { concept: 'number patterns', tags: ['increasing', 'sequence', 'pattern'], gradeLevel: '5-7', answerType: 'numeric' },
    'perfect_squares':        { concept: 'number patterns', tags: ['squares', 'sequence', 'pattern'],    gradeLevel: '5-7', answerType: 'numeric' },
    'alternating_multiplier': { concept: 'number patterns', tags: ['alternating', 'multiply', 'pattern'], gradeLevel: '6-8', answerType: 'numeric' },

    'pct_not_fresh':          { concept: 'percentages', tags: ['percentage', 'subtraction', 'not fresh'], gradeLevel: '5-7', answerType: 'numeric' },
    'pct_after_addition':     { concept: 'percentages', tags: ['percentage', 'addition', 'flowers'],      gradeLevel: '6-8', answerType: 'numeric' },
    'pct_reverse_find_count': { concept: 'percentages', tags: ['percentage', 'reverse', 'find count'],    gradeLevel: '7-9', answerType: 'numeric' },
    'pct_part_of_whole':      { concept: 'percentages', tags: ['percentage', 'part', 'whole', 'absent'],  gradeLevel: '5-7', answerType: 'numeric' },
    'pct_discount_tax_amount':{ concept: 'percentages', tags: ['percentage', 'discount', 'tax'],          gradeLevel: '6-8', answerType: 'numeric' },
    'pct_marks_percentage':   { concept: 'percentages', tags: ['percentage', 'marks', 'exam'],            gradeLevel: '6-8', answerType: 'numeric' },
    'pct_population_change':  { concept: 'percentages', tags: ['percentage', 'population', 'change'],     gradeLevel: '7-9', answerType: 'numeric' },

    'wt_find_time':               { concept: 'work and time', tags: ['work', 'time', 'rate'],              gradeLevel: '5-7', answerType: 'numeric' },
    'wt_find_taps':               { concept: 'work and time', tags: ['work', 'taps', 'fill'],              gradeLevel: '6-8', answerType: 'numeric' },
    'wt_different_glasses_taps':  { concept: 'work and time', tags: ['work', 'glasses', 'taps', 'rate'],   gradeLevel: '7-9', answerType: 'numeric' },

    'pl_simple_cp_sp':    { concept: 'profit and loss', tags: ['profit', 'loss', 'cost price', 'selling price'], gradeLevel: '5-7', answerType: 'numeric' },
    'pl_target_profit_sp':{ concept: 'profit and loss', tags: ['profit', 'target', 'selling price'],             gradeLevel: '6-8', answerType: 'numeric' },
    'pl_bulk_buy':        { concept: 'profit and loss', tags: ['profit', 'bulk', 'wholesale', 'retail'],         gradeLevel: '6-8', answerType: 'numeric' },
    'pl_split_selling':   { concept: 'profit and loss', tags: ['profit', 'loss', 'split', 'partial selling'],    gradeLevel: '7-9', answerType: 'numeric' },

    'si_find_interest':  { concept: 'simple interest', tags: ['interest', 'principal', 'rate', 'time'],  gradeLevel: '6-8', answerType: 'numeric' },
    'si_find_principal': { concept: 'simple interest', tags: ['interest', 'principal', 'reverse'],       gradeLevel: '7-9', answerType: 'numeric' },
    'si_find_amount':    { concept: 'simple interest', tags: ['interest', 'amount', 'total'],            gradeLevel: '6-8', answerType: 'numeric' },
    'si_find_rate':      { concept: 'simple interest', tags: ['interest', 'rate', 'reverse'],            gradeLevel: '7-9', answerType: 'numeric' },

    'le_bus_capacity':       { concept: 'linear equations', tags: ['equation', 'bus', 'capacity'],        gradeLevel: '6-8', answerType: 'numeric' },
    'le_box_capacity':       { concept: 'linear equations', tags: ['equation', 'box', 'capacity'],        gradeLevel: '6-8', answerType: 'numeric' },
    'le_cashier_notes':      { concept: 'linear equations', tags: ['equation', 'cashier', 'notes', 'mcq'], gradeLevel: '7-9', answerType: 'mcq' },
    'le_notebook_pen_combo': { concept: 'linear equations', tags: ['equation', 'notebook', 'pen', 'mcq'], gradeLevel: '7-9', answerType: 'mcq' },
    'le_notes_with_ratio':   { concept: 'linear equations', tags: ['equation', 'notes', 'ratio'],         gradeLevel: '7-9', answerType: 'numeric' },
    'le_weight_with_ratio':  { concept: 'linear equations', tags: ['equation', 'weight', 'sack', 'ratio'], gradeLevel: '7-9', answerType: 'numeric' },
};

const paths = {
    'constant_difference':    'rules/constantDifference.js',
    'increasing_difference':  'rules/numberPatterns/increasingDifference.js',
    'perfect_squares':        'rules/numberPatterns/perfectSquares.js',
    'alternating_multiplier': 'rules/numberPatterns/alternatingMultiplier.js',
    'pct_not_fresh':          'rules/percentages/pctNotFresh.js',
    'pct_after_addition':     'rules/percentages/pctAfterAddition.js',
    'pct_reverse_find_count': 'rules/percentages/pctReverseFindCount.js',
    'pct_part_of_whole':      'rules/percentages/pctPartOfWhole.js',
    'pct_discount_tax_amount':'rules/percentages/pctDiscountTaxAmount.js',
    'pct_marks_percentage':   'rules/percentages/pctMarksPercentage.js',
    'pct_population_change':  'rules/percentages/pctPopulationChange.js',
    'wt_find_time':               'rules/workTime/wtFindTime.js',
    'wt_find_taps':               'rules/workTime/wtFindTaps.js',
    'wt_different_glasses_taps':  'rules/workTime/wtDifferentGlassesTaps.js',
    'pl_simple_cp_sp':    'rules/profitLoss/plSimpleCpSp.js',
    'pl_target_profit_sp':'rules/profitLoss/plTargetProfitSp.js',
    'pl_bulk_buy':        'rules/profitLoss/plBulkBuy.js',
    'pl_split_selling':   'rules/profitLoss/plSplitSelling.js',
    'si_find_interest':  'rules/simpleInterest/siFindInterest.js',
    'si_find_principal': 'rules/simpleInterest/siFindPrincipal.js',
    'si_find_amount':    'rules/simpleInterest/siFindAmount.js',
    'si_find_rate':      'rules/simpleInterest/siFindRate.js',
    'le_bus_capacity':       'rules/linearEquations/leBusCapacity.js',
    'le_box_capacity':       'rules/linearEquations/leBoxCapacity.js',
    'le_cashier_notes':      'rules/linearEquations/leCashierNotes.js',
    'le_notebook_pen_combo': 'rules/linearEquations/leNotebookPenCombo.js',
    'le_notes_with_ratio':   'rules/linearEquations/leNotesWithRatio.js',
    'le_weight_with_ratio':  'rules/linearEquations/leWeightWithRatio.js',
};

let updated = 0;
const errors = [];

Object.keys(meta).forEach(ruleId => {
    const filePath = paths[ruleId];
    if (!filePath) { errors.push('No path for ' + ruleId); return; }

    let src = fs.readFileSync(filePath, 'utf8');
    const m = meta[ruleId];

    // Check if metadata already exists
    if (src.includes("concept:") && src.includes("tags:")) {
        errors.push('Metadata already exists in ' + filePath);
        return;
    }

    // Build the metadata lines
    const tagsStr = JSON.stringify(m.tags);
    const metaBlock = [
        '',
        '    // --- Metadata (SaaS / search / filter) ---',
        `    concept:              '${m.concept}',`,
        `    tags:                 ${tagsStr},`,
        `    gradeLevel:           '${m.gradeLevel}',`,
        `    answerType:           '${m.answerType}'`,
    ].join('\n');

    // Find the last '};' in the file (closing module.exports)
    const lastBraceIdx = src.lastIndexOf('};');
    if (lastBraceIdx === -1) {
        errors.push('No closing }; found in ' + filePath);
        return;
    }

    // Ensure the line before ends with a comma
    const before = src.slice(0, lastBraceIdx);
    const after = src.slice(lastBraceIdx);
    const trimmed = before.trimEnd();

    let fixedBefore;
    if (trimmed.endsWith(',')) {
        fixedBefore = before;
    } else {
        // Add comma after the last non-whitespace char
        const lastCharPos = before.length - 1 - [...before].reverse().findIndex(c => c.trim() !== '');
        fixedBefore = before.slice(0, lastCharPos + 1) + ',' + before.slice(lastCharPos + 1);
    }

    src = fixedBefore + metaBlock + '\n' + after;

    fs.writeFileSync(filePath, src, 'utf8');
    updated++;
    console.log('✅ ' + ruleId + ' → ' + filePath);
});

console.log('\nUpdated: ' + updated + '/' + Object.keys(meta).length);
if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(e => console.log('  ❌ ' + e));
}
