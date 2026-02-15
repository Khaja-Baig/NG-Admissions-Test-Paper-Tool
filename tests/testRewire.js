// Quick API test for the rewired endpoints (batch generate + display options)
const http = require('http');

function get(p) {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:3000' + p, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        }).on('error', reject);
    });
}

function post(p, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost', port: 3000, path: p, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function run() {
    let ok = 0, fail = 0;
    function t(name, cond) {
        if (cond) { ok++; console.log('  ✅', name); }
        else { fail++; console.log('  ❌', name); }
    }

    console.log('=== API Rewire Tests ===\n');

    // Schools
    const s = await get('/api/schools');
    t('GET /api/schools returns 4 schools', s.body.schools.length === 4);

    // School config
    const cfg = await get('/api/schools/SOP/config');
    t('GET /api/schools/SOP/config has concepts', Object.keys(cfg.body.concepts).length > 0);

    // Slots
    const sl = await get('/api/schools/SOP/slots');
    t('GET /api/schools/SOP/slots has 16 slots', sl.body.totalSlots === 16);

    // Display config
    const dc = await get('/api/display-config');
    t('display-config has conceptDisplayTitles', Object.keys(dc.body.conceptDisplayTitles).length > 0);
    t('display-config has schoolFullNames', Object.keys(dc.body.schoolFullNames).length > 0);
    t('display-config has conceptExplanations', Object.keys(dc.body.conceptExplanations).length > 0);

    // Batch generate (numeric rule)
    const b1 = await post('/api/rules/constant_difference/generate-batch', { difficulty: 'easy', count: 5 });
    t('batch generate returns 5 questions', b1.body.generated === 5);
    t('batch question has displayOptions (4)', b1.body.questions[0].displayOptions.length === 4);
    t('batch question has correctLetter', 'ABCD'.includes(b1.body.questions[0].correctLetter));
    t('batch question has question text', b1.body.questions[0].question.length > 0);

    // Batch generate (MCQ rule)
    const b2 = await post('/api/rules/le_cashier_notes/generate-batch', { difficulty: 'medium', count: 3 });
    t('MCQ batch returns 3 questions', b2.body.generated === 3);
    t('MCQ batch has displayOptions (4)', b2.body.questions[0].displayOptions.length === 4);
    t('MCQ batch has correctLetter', 'ABCD'.includes(b2.body.questions[0].correctLetter));
    t('MCQ batch isMCQ=true', b2.body.questions[0].isMCQ === true);

    // Full paper generate with displayOptions
    const schools = ['SOP', 'SOB', 'SOF', 'BCA'];
    for (const school of schools) {
        const p = await post('/api/papers/generate', { school });
        t(`${school}: 16 questions`, p.body.totalQuestions === 16);
        t(`${school}: has displayOptions`, p.body.allQuestions[0].displayOptions.length === 4);
        t(`${school}: has correctLetter`, 'ABCD'.includes(p.body.allQuestions[0].correctLetter));
        t(`${school}: has question text`, p.body.allQuestions[0].question.length > 0);
        t(`${school}: has formattedQuestion`, p.body.allQuestions[0].formattedQuestion.length > 0);
    }

    console.log(`\nResults: ${ok}/${ok + fail} passed`);
    if (fail > 0) process.exit(1);
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
