#!/usr/bin/env python3
"""Build clat-pg/clat-mock-data-N.js from the CLAT PG mock JSON sources.

Usage: python3 build_clat_mocks.py <source-dir> <out-dir>

 * Trims 150-question sources to the official 120-question pattern (20 passages x 6) by dropping the 5 passages
   from the most over-represented subjects. Dropped passages are written to <source-dir>/extra-passages-N.json
   (set TRIM=False below to keep all 150 questions).
 * Re-shuffles the options of every question so the correct answer lands on A/B/C/D evenly and without long streaks.
   Questions whose options depend on each other ("All of the above", "Statements 1 and 2", numbers...) keep their
   order, so they stay valid.
 * Seeded: the same input always gives the same output.
"""
import json, re, random, sys, os, collections

SRC, OUT = sys.argv[1], sys.argv[2]
TRIM = True
TARGET_Q = 120
SEED = 20261108

FILES = [
  (1, 'CLAT_PG_Mock_01.json', 'Mock Test 1', 'Core subjects', 'Full-length paper', 'A balanced full-length paper across the core CLAT PG subjects: constitutional law, jurisprudence, criminal law, contract, torts, property, IPR, family law and more.'),
  (2, 'CLAT_PG_Mock_02.json', 'Mock Test 2', 'Current affairs mix', 'Full-length paper', 'Core subjects with passages built on recent Supreme Court and High Court developments, from constitutional law to company, tax and competition law.'),
  (3, 'CLAT_PG_Mock_03.json', 'Mock Test 3', 'Environment, women’s rights and BNS', 'Themed paper', 'A themed paper on environmental law and sustainable development, women’s rights and the new criminal codes (BNS, BNSS, BSA), alongside the core subjects.'),
  (4, 'CLAT_PG_Mock_04.json', 'Mock Test 4', 'Contemporary developments', 'Full-length paper', 'Passages drawn from 2025-26 developments, such as online gaming regulation, data protection and GST, mixed with core constitutional law and jurisprudence.'),
  (5, 'CLAT_PG_Mock_05.json', 'Mock Test 5', 'Constitutional amendments special', 'Special paper', 'A constitutional-law heavy paper built around the major amendments to the Constitution, with the other core subjects for balance.'),
]

def primary(s):
    s = s.split('/')[0].strip()
    return {'Insolvency and Company Law': 'Insolvency and Company Law'}.get(s, s)

COMBO = re.compile(r'^(only\s+)?(statements?\s+)?(\(?(i{1,3}|iv|v|[1-5]|[a-d])\)?\s*(,|and|&|or)?\s*)+(\s+only)?(\s+(is|are)\s+(true|correct|false|incorrect))?\.?$', re.I)
STARTS = re.compile(r'^(both\s+(statements?|assertion|\(?[ivx\d]+\)?)|neither\s+(statement|assertion|\(?[ivx\d]+\)?)|only\s+(statement|assertion|\(?[ivx\d]+\)?)|statement\s*\(?[ivx\d]|assertion\s*\(?[a-z]|all\s+(of\s+)?the\s+(above|statements)|none\s+of\s+(the\s+)?(above|these|the\s+statements))', re.I)
NUMERIC = re.compile(r'^[\d\s,.₹%/\-–]+(years?|months?|days?|crore|lakh|per\s*cent)?\.?$', re.I)
DEPEND = re.compile(r'\b(all|none|neither|any)\s+of\s+(the\s+)?(above|these|them|the\s+foregoing)|\ball\s+(the\s+)?above|\bnone\s+of\s+the\s+above|\boptions?\s+\(?[A-D]\)?\b', re.I)

def fixed_order(opts):
    v = [o.strip() for o in opts]
    if any(DEPEND.search(o) for o in v): return True
    if sum(1 for o in v if COMBO.match(o) or STARTS.match(o)) >= 3: return True
    if all(NUMERIC.match(o) for o in v): return True
    return False

def load(n, fn):
    d = json.load(open(os.path.join(SRC, fn)))
    return d

def protected_ids(d):
    # passages the source flags as current-affairs / contemporary-development passages are never dropped
    keep = set()
    for k in ('current_affairs_passages', 'contemporary_developments_covered'):
        if k in d: keep |= set(re.findall(r'P\d{2}', json.dumps(d[k])))
    return keep

def trim(passages, protect=frozenset()):
    ps = list(passages)
    total = sum(len(p['questions']) for p in ps)
    dropped = []
    while TRIM and total > TARGET_Q:
        cnt = collections.Counter(primary(p['subject_area']) for p in ps)
        # drop from the most over-represented primary subject; among its passages drop the last one
        top = max(cnt.values())
        cands = [p for p in ps if cnt[primary(p['subject_area'])] == top and p['passage_id'] not in protect]
        if not cands:
            cands = [p for p in ps if p['passage_id'] not in protect]
            top2 = max(cnt[primary(p['subject_area'])] for p in cands)
            cands = [p for p in cands if cnt[primary(p['subject_area'])] == top2]
        victim = cands[-1]
        # prefer dropping a passage whose full subject is also composite (keeps pure-subject passages)
        ps.remove(victim); dropped.append(victim)
        total -= len(victim['questions'])
    return ps, dropped

def balanced_targets(n_free, fixed_counts, total, rng):
    # fixed_counts: Counter of letters already used by fixed-order questions
    want = {l: total / 4 for l in 'ABCD'}
    pool = []
    base = {l: max(0, int(round(want[l] - fixed_counts[l]))) for l in 'ABCD'}
    s = sum(base.values())
    letters = list('ABCD')
    while s < n_free:
        l = min(letters, key=lambda x: base[x] + rng.random()*.1); base[l] += 1; s += 1
    while s > n_free:
        l = max(letters, key=lambda x: base[x] + rng.random()*.1); base[l] -= 1; s -= 1
    for l in letters: pool += [l] * base[l]
    return pool

def streak_ok(seq, maxrun=3):
    run = 1
    for i in range(1, len(seq)):
        run = run + 1 if seq[i] == seq[i-1] else 1
        if run > maxrun: return False
    return True

def no_pattern(seq):
    # reject obvious cycles such as ABCDABCD or AABBCCDD
    s = ''.join(seq)
    return not re.search(r'(ABCD|BCDA|CDAB|DABC|DCBA|CBAD|BADC|ADCB){2}', s) and not re.search(r'(AABB|BBCC|CCDD|DDAA|BBAA|CCBB|DDCC|AADD){2}', s)

def build(n, fn, title, theme, kind, blurb):
    rng = random.Random(SEED + n)
    d = load(n, fn)
    kept, dropped = trim(d['passages'], protected_ids(d))
    if dropped:
        print('  Mock %d dropped: %s' % (n, ', '.join('%s %s' % (p['passage_id'], p['subject_area']) for p in dropped)))
        json.dump({'mock': n, 'note': 'Passages removed from the live paper to match the official 120-question pattern.', 'passages': dropped},
                  open(os.path.join(SRC, f'extra-passages-{n}.json'), 'w'), indent=1, ensure_ascii=False)
    # flatten
    items = []
    for pi, p in enumerate(kept):
        for q in p['questions']:
            opts = [q['options'][k] for k in 'ABCD']
            items.append(dict(pi=pi, q=q['question'], opts=opts, a='ABCD'.index(q['correct_option']), e=q.get('explanation', ''), d=q.get('difficulty', 'Moderate'), fixed=fixed_order(opts)))
    total = len(items)
    free_idx = [i for i, it in enumerate(items) if not it['fixed']]
    fc = collections.Counter('ABCD'[it['a']] for it in items if it['fixed'])
    for attempt in range(5000):
        pool = balanced_targets(len(free_idx), fc, total, rng)
        rng.shuffle(pool)
        full = [None] * total
        for i, it in enumerate(items):
            if it['fixed']: full[i] = 'ABCD'[it['a']]
        for i, l in zip(free_idx, pool): full[i] = l
        if streak_ok(full, 3) and no_pattern(full): break
    else:
        raise SystemExit('could not find a balanced layout')
    for i, it in enumerate(items):
        if it['fixed']: continue
        correct = it['opts'][it['a']]
        others = [o for k, o in enumerate(it['opts']) if k != it['a']]
        rng.shuffle(others)
        pos = 'ABCD'.index(full[i])
        new = others[:pos] + [correct] + others[pos:]
        it['opts'], it['a'] = new, pos
    # rebuild passages
    P = []; qi = 0
    for pi, p in enumerate(kept):
        qs = []
        for it in [x for x in items if x['pi'] == pi]:
            qs.append({'q': it['q'], 'o': it['opts'], 'a': it['a'], 'e': it['e'], 'd': it['d']}); qi += 1
        P.append({'id': 'P%02d' % (pi + 1), 's': primary(p['subject_area']), 'sf': p['subject_area'], 't': p['title'], 'x': p['passage'], 'q': qs})
    data = {'n': n, 'title': title, 'theme': theme, 'kind': kind, 'blurb': blurb, 'minutes': 120, 'neg': 0.25, 'p': P}
    js = 'window.CLATMOCK=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(os.path.join(OUT, f'clat-mock-data-{n}.js'), 'w', encoding='utf-8').write(js)
    seq = ''.join('ABCD'[it['a']] for it in items)
    runs = max(len(m.group()) for m in re.finditer(r'(.)\1*', seq))
    print(f'Mock {n}: {total} Q, {len(P)} passages, dropped {len(dropped)}, fixed-order {sum(it["fixed"] for it in items)}, dist {dict(sorted(collections.Counter(seq).items()))}, max run {runs}, subjects {len(set(p["s"] for p in P))}')
    return data

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    meta = []
    for f in FILES:
        d = build(*f)
        meta.append({'n': d['n'], 'title': d['title'], 'theme': d['theme'], 'kind': d['kind'], 'blurb': d['blurb'],
                     'q': sum(len(p['q']) for p in d['p']), 'minutes': d['minutes'],
                     'subjects': sorted(set(p['s'] for p in d['p'])),
                     'diff': dict(collections.Counter(q['d'] for p in d['p'] for q in p['q']))})
    open(os.path.join(OUT, 'clat-mock-meta.js'), 'w', encoding='utf-8').write('window.CLATMOCKS=' + json.dumps(meta, ensure_ascii=False, separators=(',', ':')) + ';\n')
