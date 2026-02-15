// ============================================================================
// API ENDPOINT VERIFICATION SCRIPT
// ============================================================================
// Run with: node tests/testAPI.js  (server must be running on port 3000)
// ============================================================================

const http = require('http');

const BASE = process.env.API_BASE || 'http://localhost:3000';
const parsed = new URL(BASE);

function apiGet(path) {
    return new Promise((resolve, reject) => {
        http.get(BASE + path, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers }); }
                catch (e) { resolve({ status: res.statusCode, data: body, headers: res.headers }); }
            });
        }).on('error', reject);
    });
}

function apiPost(path, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = http.request({
            hostname: parsed.hostname, port: parsed.port, path, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers }); }
                catch (e) { resolve({ status: res.statusCode, data: body, headers: res.headers }); }
            });
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

    // ── Health check ────────────────────────────────────────────────────────
    console.log('\n=== 1. GET /api/health ===');
    const h = await apiGet('/api/health');
    check('Status 200', h.status === 200);
    check('status: ok', h.data.status === 'ok');
    check('Has version', typeof h.data.version === 'string');
    check('Has uptime', typeof h.data.uptime === 'string');
    check('Has rules count (28)', h.data.rules === 28);
    check('Has schools count (4)', h.data.schools === 4);
    check('Has timestamp', typeof h.data.timestamp === 'string');

    // ── Rules list ──────────────────────────────────────────────────────────
    console.log('\n=== 2. GET /api/rules ===');
    const r1 = await apiGet('/api/rules');
    check('Status 200', r1.status === 200);
    check('Returns 28 rules', r1.data.rules.length === 28);
    check('First rule has id', typeof r1.data.rules[0].id === 'string');
    check('First rule has concept', typeof r1.data.rules[0].concept === 'string');
    check('First rule has tags', Array.isArray(r1.data.rules[0].tags));

    // ── Single rule ─────────────────────────────────────────────────────────
    console.log('\n=== 3. GET /api/rules/:id ===');
    const r2 = await apiGet('/api/rules/constant_difference');
    check('Status 200', r2.status === 200);
    check('Correct id', r2.data.id === 'constant_difference');
    check('Has difficulties', r2.data.difficulties.length >= 1);

    console.log('\n=== 4. GET /api/rules/:id (404) ===');
    const r2b = await apiGet('/api/rules/nonexistent_rule');
    check('Status 404', r2b.status === 404);
    check('Error message', r2b.data.error.includes('not found'));

    // ── Input validation — bad rule ID format ───────────────────────────────
    console.log('\n=== 5. Input validation — bad rule ID ===');
    const r2c = await apiGet('/api/rules/DROP%20TABLE');
    check('SQL-like ID → 400', r2c.status === 400);
    check('Error says invalid format', r2c.data.error.includes('Invalid rule ID'));

    // ── Generate single ─────────────────────────────────────────────────────
    console.log('\n=== 6. POST /api/rules/:id/generate ===');
    const r3 = await apiPost('/api/rules/si_find_interest/generate', { difficulty: 'easy' });
    check('Status 200', r3.status === 200);
    check('Has ruleId', r3.data.ruleId === 'si_find_interest');
    check('Has answer', r3.data.question.answer !== undefined);
    check('Has formattedQuestion', typeof r3.data.question.formattedQuestion === 'string');

    console.log('\n=== 7. POST generate bad difficulty (400) ===');
    const r3b = await apiPost('/api/rules/constant_difference/generate', { difficulty: 'impossible' });
    check('Status 400', r3b.status === 400);
    check('Error message', r3b.data.error.includes('Unknown difficulty'));

    // ── Input validation — bad count ────────────────────────────────────────
    console.log('\n=== 8. Input validation — bad count ===');
    const r3c = await apiPost('/api/rules/constant_difference/generate-batch', { difficulty: 'easy', count: -5 });
    check('Negative count → 400', r3c.status === 400);
    check('Error says positive', r3c.data.error.includes('positive'));

    const r3d = await apiPost('/api/rules/constant_difference/generate-batch', { difficulty: 'easy', count: 999 });
    check('Count > 100 → 400', r3d.status === 400);
    check('Error says exceed', r3d.data.error.includes('exceed'));

    // ── Schools ─────────────────────────────────────────────────────────────
    console.log('\n=== 9. GET /api/schools ===');
    const r4 = await apiGet('/api/schools');
    check('Status 200', r4.status === 200);
    check('Returns 4 schools', r4.data.schools.length === 4);
    check('Schools are SOP,SOB,SOF,BCA', r4.data.schools.map(s => s.id).sort().join(',') === 'BCA,SOB,SOF,SOP');

    // ── School config ───────────────────────────────────────────────────────
    console.log('\n=== 10. GET /api/schools/:id/config ===');
    const r5 = await apiGet('/api/schools/SOP/config');
    check('Status 200', r5.status === 200);
    check('School is SOP', r5.data.school === 'SOP');
    check('Has 4 concepts', Object.keys(r5.data.concepts).length === 4);

    // ── Input validation — bad school ───────────────────────────────────────
    console.log('\n=== 11. Input validation — bad school ===');
    const r5b = await apiGet('/api/schools/FAKESCHOOL/config');
    check('Invalid school → 400', r5b.status === 400);
    check('Error lists valid schools', r5b.data.error.includes('Valid'));

    // ── School slots ────────────────────────────────────────────────────────
    console.log('\n=== 12. GET /api/schools/:id/slots ===');
    const r6 = await apiGet('/api/schools/SOB/slots');
    check('Status 200', r6.status === 200);
    check('16 slots', r6.data.totalSlots === 16);
    check('Slots array length', r6.data.slots.length === 16);

    // ── Display config ──────────────────────────────────────────────────────
    console.log('\n=== 13. GET /api/display-config ===');
    const r7 = await apiGet('/api/display-config');
    check('Status 200', r7.status === 200);
    check('Has conceptExplanations', typeof r7.data.conceptExplanations === 'object');
    check('Has conceptDisplayTitles', typeof r7.data.conceptDisplayTitles === 'object');
    check('Has schoolFullNames', typeof r7.data.schoolFullNames === 'object');
    check('6 concept titles', Object.keys(r7.data.conceptDisplayTitles).length === 6);

    // ── Paper generation (all 4 schools) ────────────────────────────────────
    console.log('\n=== 14. POST /api/papers/generate (all 4 schools) ===');
    for (const school of ['SOP', 'SOB', 'SOF', 'BCA']) {
        const r8 = await apiPost('/api/papers/generate', { school });
        check(school + ' — Status 200', r8.status === 200);
        check(school + ' — 16 questions', r8.data.totalQuestions === 16);
        check(school + ' — has conceptOrder', Array.isArray(r8.data.conceptOrder));
        check(school + ' — has allQuestions', r8.data.allQuestions.length === 16);
        check(school + ' — all have formattedQuestion', r8.data.allQuestions.every(q => typeof q.formattedQuestion === 'string'));
    }

    // ── Paper generation errors ─────────────────────────────────────────────
    console.log('\n=== 15. POST /api/papers/generate (errors) ===');
    const r8b = await apiPost('/api/papers/generate', {});
    check('Missing school → 400', r8b.status === 400);
    const r8c = await apiPost('/api/papers/generate', { school: 'INVALID' });
    check('Invalid school → 400', r8c.status === 400);
    check('Error lists valid schools', r8c.data.error.includes('Valid'));

    // ── Security headers ────────────────────────────────────────────────────
    console.log('\n=== 16. Security headers (helmet) ===');
    check('X-Content-Type-Options', h.headers['x-content-type-options'] === 'nosniff');
    check('X-Frame-Options present', typeof h.headers['x-frame-options'] === 'string');

    // ── Rate limit headers ──────────────────────────────────────────────────
    console.log('\n=== 17. Rate limit headers ===');
    check('RateLimit-Limit present', h.headers['ratelimit-limit'] != null);
    check('RateLimit-Remaining present', h.headers['ratelimit-remaining'] != null);

    // ── Unknown API endpoint ────────────────────────────────────────────────
    console.log('\n=== 18. Unknown API endpoint → 404 ===');
    const r9 = await apiGet('/api/nonexistent');
    check('Unknown endpoint → 404', r9.status === 404);
    check('Has error message', typeof r9.data.error === 'string');

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════');
    console.log('API RESULTS: ' + pass + '/' + (pass + fail) + ' checks passed');
    if (fail === 0) console.log('🎉 All API endpoints verified!');
    else console.log('⚠️ ' + fail + ' check(s) failed');
    console.log('═══════════════════════════════════════\n');

    process.exit(fail === 0 ? 0 : 1);
}

runAll().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
