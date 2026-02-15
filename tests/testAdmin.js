// ============================================================================
// ADMIN CRUD API TESTS
// ============================================================================

const http = require('http');

function req(method, path, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

        const request = http.request(options, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });
        request.on('error', reject);
        if (data) request.write(data);
        request.end();
    });
}

let ok = 0, fail = 0;
function t(name, cond) {
    if (cond) { ok++; console.log('  ✅', name); }
    else { fail++; console.log('  ❌ FAIL:', name); }
}

async function run() {
    console.log('=== Admin CRUD Tests ===\n');

    // 1. Refresh cache
    let r = await req('POST', '/api/admin/refresh');
    t('refresh → 200', r.status === 200);
    t('source is firestore', r.body.source === 'firestore');

    // 2. Health shows dataSource
    r = await req('GET', '/api/health');
    t('health has dataSource', r.body.dataSource && r.body.dataSource.source === 'firestore');

    // 3. Get admin school info
    r = await req('GET', '/api/admin/schools/SOP');
    t('admin GET SOP → 200', r.status === 200);
    t('SOP has 4 concepts', Object.keys(r.body.concepts).length === 4);
    t('SOP has label', r.body.label === 'School of Programming (SOP)');

    // 4. Create new school TEST
    r = await req('PUT', '/api/admin/schools/TEST', {
        label: 'Test School',
        fullName: 'Test School of Testing',
        concepts: {
            'number patterns': {
                displayLabel: 'Number Patterns',
                slots: [
                    { ruleId: 'constant_difference', difficulty: 'easy', label: 'Easy' }
                ]
            }
        }
    });
    t('create TEST → 200', r.status === 200);

    // 5. Verify new school in list
    r = await req('GET', '/api/schools');
    t('schools now has 5', r.body.schools.length === 5);
    const testSchool = r.body.schools.find(s => s.id === 'TEST');
    t('TEST in list', !!testSchool);
    t('TEST label correct', testSchool && testSchool.label === 'Test School');

    // 6. Can validate TEST as a school now
    r = await req('GET', '/api/schools/TEST/config');
    t('TEST config → 200', r.status === 200);
    t('TEST has 1 concept', Object.keys(r.body.concepts).length === 1);

    // 7. TEST slots
    r = await req('GET', '/api/schools/TEST/slots');
    t('TEST slots → 200', r.status === 200);
    t('TEST has 1 slot', r.body.totalSlots === 1);

    // 8. Generate paper for new school
    r = await req('POST', '/api/papers/generate', { school: 'TEST' });
    t('TEST paper → 200', r.status === 200);
    t('TEST paper has 1 question', r.body.totalQuestions === 1);
    t('TEST question has displayOptions', r.body.allQuestions[0].displayOptions.length === 4);

    // 9. Update TEST — add more slots
    r = await req('PUT', '/api/admin/schools/TEST', {
        label: 'Test School v2',
        fullName: 'Test School Updated',
        concepts: {
            'number patterns': {
                displayLabel: 'Number Patterns',
                slots: [
                    { ruleId: 'constant_difference', difficulty: 'easy', label: 'Easy' },
                    { ruleId: 'perfect_squares', difficulty: 'medium', label: 'Medium' }
                ]
            }
        }
    });
    t('update TEST → 200', r.status === 200);

    // 10. Verify updated
    r = await req('GET', '/api/schools/TEST/slots');
    t('TEST now has 2 slots', r.body.totalSlots === 2);

    r = await req('GET', '/api/schools');
    const updated = r.body.schools.find(s => s.id === 'TEST');
    t('TEST label updated', updated && updated.label === 'Test School v2');

    // 11. Delete TEST
    r = await req('DELETE', '/api/admin/schools/TEST');
    t('delete TEST → 200', r.status === 200);

    // 12. Verify deleted
    r = await req('GET', '/api/schools');
    t('schools back to 4', r.body.schools.length === 4);
    t('TEST gone', !r.body.schools.find(s => s.id === 'TEST'));

    // 13. Deleted school can't generate paper
    r = await req('POST', '/api/papers/generate', { school: 'TEST' });
    t('TEST paper → 400 after delete', r.status === 400);

    // 14. Admin GET deleted school → 404
    r = await req('GET', '/api/admin/schools/TEST');
    t('admin GET TEST → 404', r.status === 404);

    // === Validation tests ===

    console.log('\n=== Validation Tests ===\n');

    // 15. Bad school ID format
    r = await req('PUT', '/api/admin/schools/bad%20school!', { label: 'x' });
    t('bad ID → 400', r.status === 400);

    // 16. Missing label
    r = await req('PUT', '/api/admin/schools/VALID', {});
    t('missing label → 400', r.status === 400);

    // 17. Bad rule reference
    r = await req('PUT', '/api/admin/schools/VALID', {
        label: 'Valid',
        concepts: {
            'test': {
                displayLabel: 'Test',
                slots: [{ ruleId: 'nonexistent_rule_xyz', difficulty: 'easy' }]
            }
        }
    });
    t('unknown ruleId → 400', r.status === 400);

    // 18. Bad slot missing difficulty
    r = await req('PUT', '/api/admin/schools/VALID', {
        label: 'Valid',
        concepts: {
            'test': {
                displayLabel: 'Test',
                slots: [{ ruleId: 'constant_difference' }]
            }
        }
    });
    t('missing difficulty → 400', r.status === 400);

    // 19. Delete non-existent school
    r = await req('DELETE', '/api/admin/schools/NONEXISTENT');
    t('delete nonexistent → 404', r.status === 404);

    // 20. Display config update
    r = await req('PUT', '/api/admin/display-config', {
        schoolFullNames: { SOP: 'School Of Programming' }
    });
    t('display config update → 200', r.status === 200);

    // 21. Display config — no data
    r = await req('PUT', '/api/admin/display-config', {});
    t('empty display config → 400', r.status === 400);

    // 22. Concept labels update
    r = await req('PUT', '/api/admin/concept-labels', {
        labels: { 'number patterns': 'Number Patterns' }
    });
    t('concept labels → 200', r.status === 200);

    // 23. Concept labels — no data
    r = await req('PUT', '/api/admin/concept-labels', {});
    t('empty labels → 400', r.status === 400);

    // === Original 4 schools still work ===
    console.log('\n=== Regression — Original Schools ===\n');

    for (const school of ['SOP', 'SOB', 'SOF', 'BCA']) {
        r = await req('POST', '/api/papers/generate', { school });
        t(`${school} paper → 200 with 16 questions`, r.status === 200 && r.body.totalQuestions === 16);
    }

    // Summary
    console.log('\n' + '═'.repeat(45));
    console.log(`Admin CRUD: ${ok}/${ok + fail} passed`);
    if (fail > 0) {
        console.log('❌ Some tests failed!');
        process.exit(1);
    } else {
        console.log('🎉 All admin tests passed!');
    }
}

run().catch(e => { console.error(e); process.exit(1); });
