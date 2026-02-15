// ============================================================================
// API ENDPOINT VERIFICATION SCRIPT
// ============================================================================
// Run with: node tests/testAPI.js  (server must be running on port 3000)
// ============================================================================

const http = require('http');

function apiGet(path) {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:3000' + path, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
        }).on('error', reject);
    });
}

function apiPost(path, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = http.request({
            hostname: 'localhost', port: 3000, path, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

let pass = 0, fail = 0;
function check(label, condition) {
    if (condition) { console.log('  ✅', label); pass++; }
    else { console.log('  ❌', label); fail++; }
}

async function runAll() {
    console.log('\n=== 1. GET /api/rules ===');
    const r1 = await apiGet('/api/rules');
    check('Status 200', r1.status === 200);
    check('Returns 28 rules', r1.data.rules.length === 28);
    check('First rule has id', typeof r1.data.rules[0].id === 'string');
    check('First rule has concept', typeof r1.data.rules[0].concept === 'string');
    check('First rule has tags', Array.isArray(r1.data.rules[0].tags));

    console.log('\n=== 2. GET /api/rules/:id ===');
    const r2 = await apiGet('/api/rules/constant_difference');
    check('Status 200', r2.status === 200);
    check('Correct id', r2.data.id === 'constant_difference');
    check('Has difficulties', r2.data.difficulties.length >= 1);

    console.log('\n=== 3. GET /api/rules/:id (404) ===');
    const r2b = await apiGet('/api/rules/nonexistent');
    check('Status 404', r2b.status === 404);
    check('Error message', r2b.data.error.includes('not found'));

    console.log('\n=== 4. POST /api/rules/:id/generate ===');
    const r3 = await apiPost('/api/rules/si_find_interest/generate', { difficulty: 'easy' });
    check('Status 200', r3.status === 200);
    check('Has ruleId', r3.data.ruleId === 'si_find_interest');
    check('Has answer', r3.data.question.answer !== undefined);
    check('Has formattedQuestion', typeof r3.data.question.formattedQuestion === 'string');

    console.log('\n=== 5. POST generate bad difficulty (400) ===');
    const r3b = await apiPost('/api/rules/constant_difference/generate', { difficulty: 'impossible' });
    check('Status 400', r3b.status === 400);
    check('Error message', r3b.data.error.includes('Unknown difficulty'));

    console.log('\n=== 6. GET /api/schools ===');
    const r4 = await apiGet('/api/schools');
    check('Status 200', r4.status === 200);
    check('Returns 4 schools', r4.data.schools.length === 4);
    check('Schools are SOP,SOB,SOF,BCA', r4.data.schools.map(s => s.id).sort().join(',') === 'BCA,SOB,SOF,SOP');

    console.log('\n=== 7. GET /api/schools/:id/config ===');
    const r5 = await apiGet('/api/schools/SOP/config');
    check('Status 200', r5.status === 200);
    check('School is SOP', r5.data.school === 'SOP');
    check('Has 4 concepts', Object.keys(r5.data.concepts).length === 4);

    console.log('\n=== 8. GET /api/schools/:id/slots ===');
    const r6 = await apiGet('/api/schools/SOB/slots');
    check('Status 200', r6.status === 200);
    check('16 slots', r6.data.totalSlots === 16);
    check('Slots array length', r6.data.slots.length === 16);

    console.log('\n=== 9. GET /api/display-config ===');
    const r7 = await apiGet('/api/display-config');
    check('Status 200', r7.status === 200);
    check('Has conceptExplanations', typeof r7.data.conceptExplanations === 'object');
    check('Has conceptDisplayTitles', typeof r7.data.conceptDisplayTitles === 'object');
    check('Has schoolFullNames', typeof r7.data.schoolFullNames === 'object');
    check('6 concept titles', Object.keys(r7.data.conceptDisplayTitles).length === 6);

    console.log('\n=== 10. POST /api/papers/generate (all 4 schools) ===');
    for (const school of ['SOP', 'SOB', 'SOF', 'BCA']) {
        const r8 = await apiPost('/api/papers/generate', { school });
        check(school + ' — Status 200', r8.status === 200);
        check(school + ' — 16 questions', r8.data.totalQuestions === 16);
        check(school + ' — has conceptOrder', Array.isArray(r8.data.conceptOrder));
        check(school + ' — has allQuestions', r8.data.allQuestions.length === 16);
        check(school + ' — all have formattedQuestion', r8.data.allQuestions.every(q => typeof q.formattedQuestion === 'string'));
    }

    console.log('\n=== 11. POST /api/papers/generate (errors) ===');
    const r8b = await apiPost('/api/papers/generate', {});
    check('Missing school → 400', r8b.status === 400);
    const r8c = await apiPost('/api/papers/generate', { school: 'INVALID' });
    check('Invalid school → 404', r8c.status === 404);

    console.log('\n═══════════════════════════════════════');
    console.log('API RESULTS: ' + pass + '/' + (pass + fail) + ' checks passed');
    if (fail === 0) console.log('🎉 All API endpoints verified!');
    else console.log('⚠️ ' + fail + ' check(s) failed');
    console.log('═══════════════════════════════════════\n');

    process.exit(fail === 0 ? 0 : 1);
}

runAll().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
