"""
aibe_adapters.py : turns the differently-shaped writing batches into the one shape the generator reads.

Nothing is shortened or paraphrased here. Every sentence the author wrote is passed through; the adapters only
rename fields (key_points -> must_know, case_laws -> landmark_cases, ...), split a batch that covers two syllabus
subjects, and collect the "extras" (mapping tables, cheat sheets, glossaries) into rapid-revision blocks.

Canonical shape returned for each subject number:
    meta      {prepared_as_of, version, title}
    exam      {paper_format_note, indicative_distribution[], distribution_note, cards[{title, items[], trap?}]}
    sections  [{order, title, priority, expected_questions, articles, overview, must_know[], key_provisions[{ref,content}],
                landmark_cases[{case, year, held}], mnemonics[], exam_traps[], probable_questions[]}]
    dev       [{topic, date, summary, why_it_matters, likely_question?}]
    rr        {} or {blocks:[{id,title,icon,kind,...}]}      kinds: list | table | pairs | groups | qa
    mcq       [{id, question, options{A..}, answer, explanation}]

Register a file in _notes-data/aibe/registry.json as {"file": ..., "subjects": [..], "adapter": "<name>"}.
Files already in the canonical shape (Part 1, Part 2) need no adapter.
"""
import re

LETTERS = 'ABCDEFGH'


# ------------------------------------------------------------------ helpers
def _s(x):
    return '' if x is None else str(x).strip()


def pri(p):
    p = re.sub(r'\(.*?\)', '', _s(p)).strip().upper().replace(' - ', '-').replace('–', '-')
    p = re.sub(r'\s+', ' ', p)
    if p in ('VERY HIGH', 'HIGH', 'MEDIUM-HIGH', 'MEDIUM', 'LOW-MEDIUM', 'LOW'):
        return p
    return {'MEDIUM HIGH': 'MEDIUM-HIGH', 'LOW MEDIUM': 'LOW-MEDIUM'}.get(p, 'MEDIUM')


def eq(x, default='1'):
    nums = re.findall(r'\d+', _s(x))
    if not nums:
        return default
    if len(nums) == 1:
        return nums[0]
    return '%s to %s' % (nums[0], nums[1])


def split_year(name, year=None):
    """'Carlill v Carbolic Smoke Ball Co (1893)' -> ('Carlill v Carbolic Smoke Ball Co', '1893')"""
    name = _s(name)
    if year:
        return name, _s(year)
    m = re.search(r'\s*\((\d{4}[^)]*)\)\s*$', name)
    if m:
        return name[:m.start()].strip(), m.group(1)
    return name, ''


def cases(lst):
    out = []
    for c in lst or []:
        nm = c.get('case') or c.get('name') or ''
        held = c.get('held') or c.get('principle') or c.get('holding') or c.get('topic') or ''
        nm, yr = split_year(nm, c.get('year'))
        out.append({'case': nm, 'year': yr or '-', 'held': _s(held)})
    return out


def prov_rows(lst):
    out = []
    for p in lst or []:
        if isinstance(p, dict):
            out.append({'ref': _s(p.get('ref')), 'content': _s(p.get('note') or p.get('content'))})
    return out


def first_sentence(t, n=300):
    t = re.sub(r'\s+', ' ', _s(t))
    t = re.sub(r'\s*\[VERIFY[^\]]*\]', '', t)
    m = re.match(r'(.{40,%d}?[.;:])(\s|$)' % n, t)
    return (m.group(1) if m else t[:n]).rstrip(' ;:')


def mcq_one(q, i):
    opts = q['options']
    if isinstance(opts, dict):
        od = {k: _s(v) for k, v in opts.items()}
    else:
        od = {LETTERS[k]: _s(v) for k, v in enumerate(opts)}
    a = q.get('answer', q.get('answer_index'))
    if isinstance(a, int):
        a = LETTERS[a]
    return {'id': i, 'question': _s(q.get('q') or q.get('question')), 'options': od, 'answer': _s(a).upper(),
            'explanation': _s(q.get('explain') or q.get('explanation'))}


def mcqs(lst, start=1, seen=None):
    seen = seen if seen is not None else set()
    out = []
    for q in lst:
        key = re.sub(r'\W+', ' ', _s(q.get('q') or q.get('question')).lower())
        if key in seen:
            continue
        seen.add(key)
        out.append(mcq_one(q, start + len(out)))
    return out


def dev_item(date, text, why='', topic=None, likely=None):
    text = _s(text)
    summary = text
    if not topic:
        m = re.match(r'^([^:.]{12,110}):\s+(.*)$', text, re.S)
        if m:
            topic, summary = m.group(1).strip(), m.group(2).strip()
        else:
            topic = first_sentence(text, 110).rstrip('.')
            if len(topic) > 110:
                topic = topic[:107].rsplit(' ', 1)[0] + '...'
    d = {'topic': topic, 'date': _s(date), 'summary': summary, 'why_it_matters': _s(why) or 'A likely current-affairs question.'}
    if likely:
        d['likely_question'] = likely
    return d


def meta_of(m, title=None):
    return {'prepared_as_of': _s(m.get('prepared_as_of') or m.get('prepared_on')), 'version': _s(m.get('version') or '1.0'),
            'title': title or _s(m.get('title'))}


def fmt_pattern(p):
    if not isinstance(p, dict):
        return ''
    return 'About %s questions, %s mark each; %s; %s; %s.' % (
        p.get('questions', 100), p.get('marks_each', 1), 'no negative marking' if 'none' in _s(p.get('negative_marking')).lower() else _s(p.get('negative_marking')),
        _s(p.get('duration')) + ' to finish', _s(p.get('mode') or 'offline, open book').lower())


# rapid-revision block builders
def b_list(id_, title, icon, items, intro=''):
    items = [_s(x) for x in items if _s(x)]
    return {'id': id_, 'title': title, 'icon': icon, 'kind': 'list', 'items': items, 'intro': intro} if items else None


def b_table(id_, title, icon, cols, rows, filt=False, intro=''):
    rows = [[_s(c) for c in r] for r in rows if r]
    return {'id': id_, 'title': title, 'icon': icon, 'kind': 'table', 'cols': cols, 'rows': rows, 'filter': filt, 'intro': intro} if rows else None


def b_pairs(id_, title, icon, pairs, intro=''):
    pairs = [(_s(a), _s(b)) for a, b in pairs if _s(b)]
    return {'id': id_, 'title': title, 'icon': icon, 'kind': 'pairs', 'pairs': pairs, 'intro': intro} if pairs else None


def b_groups(id_, title, icon, groups, intro=''):
    groups = [(_s(a), [_s(x) for x in b]) for a, b in groups if b]
    return {'id': id_, 'title': title, 'icon': icon, 'kind': 'groups', 'groups': groups, 'intro': intro} if groups else None


def b_qa(id_, title, icon, items, intro=''):
    return {'id': id_, 'title': title, 'icon': icon, 'kind': 'qa', 'items': items, 'intro': intro} if items else None


def blocks(*bs):
    bs = [b for b in bs if b]
    return {'blocks': bs} if bs else {}


def human(k):
    return _s(k).replace('_', ' ').strip().capitalize()


def section_from_topic(t, order, subj_hint=''):
    """Part 5 / Part 6 topic -> canonical section."""
    title = _s(t['title'])
    m = re.search(r'\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*$', title)
    arts = m.group(1) if m else ''
    provs = prov_rows(t.get('provisions'))
    if not arts and provs:
        arts = '; '.join(p['ref'] for p in provs[:3])
    return {
        'order': order, 'title': title, 'priority': pri(t.get('priority')), 'expected_questions': eq(t.get('expected_weight')),
        'articles': arts, 'overview': _s(t.get('summary')), 'must_know': [_s(x) for x in t.get('key_points', [])],
        'key_provisions': provs, 'landmark_cases': cases(t.get('case_laws')), 'mnemonics': [_s(x) for x in t.get('memory_aids', [])],
        'exam_traps': [_s(x) for x in t.get('traps', [])], 'probable_questions': [_s(x) for x in t.get('likely_question_angles', [])]}


# ------------------------------------------------------------------ Part 4: IPC/BNS (2) + Company Law (11)
COMPANY_RX = re.compile(r'compan|insolvenc|\bIBC\b|NCLT|\bLLP\b|director|shareholder|corporate|share capital|winding|Companies Act', re.I)


def part4(d):
    m = meta_of(d['meta'], 'Indian Penal Code / Bharatiya Nyaya Sanhita')
    ex = d['exam_insights']
    ei = d['meta']

    def sec(s, i):
        refs = s.get('refs') or {}
        arts = ''
        if refs:
            arts = 'BNS %s' % _s(refs.get('bns'))
            if _s(refs.get('ipc')):
                arts += ' (IPC %s)' % _s(refs.get('ipc'))
        kp = [_s(x) for x in s['key_points']]
        return {'order': i, 'title': _s(s['title']), 'priority': pri(s.get('priority')), 'expected_questions': eq(s.get('expected_questions')),
                'articles': arts, 'overview': (first_sentence(kp[0]) if kp else _s(s['title'])), 'must_know': kp, 'key_provisions': [],
                'landmark_cases': cases(s.get('case_laws')), 'mnemonics': [], 'exam_traps': [_s(x) for x in s.get('exam_traps', [])],
                'probable_questions': []}

    ipc_secs = [sec(s, i + 1) for i, s in enumerate(d['ipc_bns_sections'])]
    co_secs = [sec(s, i + 1) for i, s in enumerate(d['company_law']['sections'])]

    seen = set()
    mc_ipc, mc_co = [], []
    for grp, raw in (('ipc', d['ipc_bns_sections']), ('co', d['company_law']['sections'])):
        for s in raw:
            (mc_ipc if grp == 'ipc' else mc_co).extend(mcqs(s.get('mcqs', []), seen=seen))
    for q in d['mcq_bank']['questions']:
        tgt = mc_co if COMPANY_RX.search(_s(q.get('topic')) + ' ' + _s(q.get('q') or q.get('question'))) else mc_ipc
        tgt.extend(mcqs([q], seen=seen))
    for lst in (mc_ipc, mc_co):
        for i, q in enumerate(lst):
            q['id'] = i + 1

    dev_ipc, dev_co = [], []
    for it in d['recent_developments_digest']['items']:
        x = dev_item(it.get('year'), it.get('item'), it.get('exam_use'))
        (dev_co if COMPANY_RX.search(it.get('item', '')) else dev_ipc).append(x)

    bg = d['bns_at_a_glance']
    gl = d['glossary_and_maxims']
    lm = d['last_minute_revision']
    sp = d['study_plan']
    rr_ipc = blocks(
        b_pairs('glance', 'BNS at a glance', 'i', [('What changed', bg.get('summary'))] + [('Note', bg.get('chapter_map_note'))]),
        b_list('facts', 'Headline facts about the BNS', '#', bg.get('headline_facts_per_government_statement', [])),
        b_table('chapters', 'BNS chapter map', '§', ['Chapter', 'Sections', 'Heading'], [[c['chapter'], c['range'], c['heading']] for c in bg.get('chapter_map', [])]),
        b_table('mapping', d['mapping_table'].get('title') or 'IPC to BNS section mapping', '⇄', ['Offence', 'IPC', 'BNS'],
                [[r['offence'], r['ipc'], r['bns']] for r in d['mapping_table']['rows']], filt=True, intro=_s(d['mapping_table'].get('note'))),
        b_list('punishments', 'Punishment number sheet', '#', d['punishment_number_sheet']),
        b_table('cases', 'Landmark cases at a glance', '⚖', ['Case', 'Topic'], [[c['case'], c['topic']] for c in d['landmark_case_quick_table']], filt=True),
        b_table('mnemonics', 'Memory devices', '✎', ['Topic', 'Device'], [[x['topic'], x['device']] for x in d['mnemonics']]),
        b_table('maxims', 'Latin maxims you must know', '❝', ['Maxim', 'Meaning', 'Where it is used'], [[x['maxim'], x['meaning'], x['use']] for x in gl.get('maxims', [])]),
        b_table('terms', 'Key terms', '❝', ['Term', 'Meaning'], [[x.get('term') or x.get('word') or list(x.values())[0], x.get('meaning') or x.get('definition') or list(x.values())[-1]] for x in gl.get('terms', [])]),
        b_groups('special', 'Special criminal laws snapshot', '§', [(x['law'], x.get('key_points', [])) for x in d['special_laws_snapshot']]),
        b_qa('scenarios', 'Practice scenarios', '?', d['practice_scenarios']['items'], intro=_s(d['practice_scenarios'].get('note'))),
        b_table('expected', 'Patterns most likely to appear', '★', ['Topic', 'Likelihood', 'Approach'],
                [[x['topic'], x['likelihood'], x['approach']] for x in d['probable_questions']['items']], intro=_s(d['probable_questions'].get('note'))),
        b_list('checklist', 'Ten-minute checklist', '✓', lm.get('ten_minute_checklist', [])),
        b_table('confusions', 'Frequent confusions', '≠', ['Pair', 'The difference'], [[x['pair'], x['difference']] for x in lm.get('frequent_confusions', [])]),
        b_table('plan', 'Ten-day study plan', '☰', ['Day', 'Focus'], [[x['day'], x['focus']] for x in sp.get('ten_day_plan', [])]),
        b_list('answering', 'Using the open book well', '☰', d['answering_strategy'].get('open_book_use', [])),
        b_list('elimination', 'Elimination tactics for MCQs', '☰', d['answering_strategy'].get('elimination_tactics', [])))

    exam_ipc = {
        'paper_format_note': ' '.join(_s(x) for x in ex.get('paper_pattern', [])),
        'indicative_distribution': [], 'distribution_note': '',
        'cards': [
            {'title': 'What the examiner tests', 'items': ex.get('examiner_objectives', [])},
            {'title': 'Question types seen', 'items': ['%s. Example: %s Tip: %s' % (q['type'], q['example'], q['tip']) for q in ex.get('question_types_seen', [])]},
            {'title': 'Hot zones, 2024 to 2026', 'items': ex.get('hot_zones_2024_2026', [])},
            {'title': 'How to use these notes', 'items': ei.get('how_to_use', [])},
        ]}
    exam_co = {'paper_format_note': _s(d['company_law'].get('approach')), 'indicative_distribution': [], 'distribution_note': '', 'cards': []}
    out = {}
    out[2] = dict(meta=dict(m, title='Indian Penal Code / Bharatiya Nyaya Sanhita'), exam=exam_ipc, sections=ipc_secs, dev=dev_ipc, rr=rr_ipc, mcq=mc_ipc)
    out[11] = dict(meta=dict(m, title='Company Law'), exam=exam_co, sections=co_secs, dev=dev_co, rr={}, mcq=mc_co)
    return out


# ------------------------------------------------------------------ Part 5 / Part 6: two subjects, each a section with topics
def _two_subject_file(d, nos, which):
    m = meta_of(d['meta'])
    ei = d['exam_intelligence']
    out = {}
    for idx, (no, sec) in enumerate(zip(nos, d['sections'])):
        secs = [section_from_topic(t, i + 1) for i, t in enumerate(sec['topics'])]
        bg = sec.get('background') or {}
        rr_blocks = []
        rr_blocks.append(b_pairs('background', 'Background and transition', 'i', [(human(k), v) for k, v in bg.items() if isinstance(v, str)]))
        for k, v in bg.items():
            if isinstance(v, list) and v and isinstance(v[0], str):
                rr_blocks.append(b_list('bg-' + k, human(k), 'i', v))
            elif isinstance(v, dict):
                rr_blocks.append(b_pairs('bg-' + k, human(k), 'i', list(v.items())))
        if sec.get('iea_vs_bsa_changes'):
            rr_blocks.append(b_table('changes', 'Evidence Act to BSA: what changed', '⇄', ['Topic', 'Indian Evidence Act', 'Bharatiya Sakshya Adhiniyam', 'Note'],
                                     [[x.get('topic'), x.get('iea'), x.get('bsa'), x.get('note')] for x in sec['iea_vs_bsa_changes']], filt=True))
        if which == 6 and idx == 0:
            nc = d.get('numbers_cheat_sheet') or {}
            rr_blocks.append(b_pairs('numbers', 'Numbers cheat sheet', '#', [(human(k), v) for k, v in nc.items() if isinstance(v, str)]))
            for k, v in nc.items():
                if isinstance(v, dict):
                    rr_blocks.append(b_pairs('num-' + k, human(k), '#', list(v.items())))
            pl = d.get('personal_law_comparison') or []
            rr_blocks.append(b_table('comparison', 'Personal laws compared', '⇄', ['Point', 'Hindu', 'Muslim', 'Christian', 'Parsi', 'Special Marriage Act'],
                                     [[x.get('point'), x.get('hindu'), x.get('muslim'), x.get('christian'), x.get('parsi'), x.get('sma')] for x in pl], filt=True))
        rr_blocks.append(b_list('oneliners', 'Rapid-fire one-liners', '⚡', sec.get('rapid_fire_one_liners', [])))
        if idx == 0:
            rp = d.get('revision_plan') or {}
            for k, v in rp.items():
                rr_blocks.append(b_list('plan-' + k, human(k), '☰', v if isinstance(v, list) else [v]))
        if idx == len(d['sections']) - 1 and d.get('sources_and_verification'):
            rr_blocks.append(b_list('sources', 'Sources and verification', '✓', d['sources_and_verification']))
        pat = ei.get('pattern') or {}
        key = [k for k in ei if k.startswith('priority_order')]
        pri_key = key[idx] if idx < len(key) else None
        cards = [{'title': 'What the examiner tests', 'items': ei.get('examiner_view', [])}]
        if pri_key:
            cards.append({'title': 'Study in this order', 'items': ei[pri_key]})
        cards.append({'title': 'Exam tips', 'items': [_s(ei.get('no_negative_marking_tip')), _s(ei.get('open_book_tip'))]})
        if which and ei.get('latest_exam'):
            cards.append({'title': 'The latest paper', 'items': [ei['latest_exam']]})
        exam = {'paper_format_note': fmt_pattern(pat), 'indicative_distribution': [], 'distribution_note': '', 'cards': cards}
        dev = [dev_item(x.get('date'), x.get('item'), x.get('why_it_matters')) for x in sec.get('recent_developments', [])]
        out[no] = dict(meta=dict(m, title=_s(sec['title'])), exam=exam, sections=secs, dev=dev, rr=blocks(*rr_blocks),
                       mcq=mcqs(sec.get('mcqs', [])))
    return out


def part5(d):
    return _two_subject_file(d, (5, 12), 5)


def part6(d):
    return _two_subject_file(d, (7, 13), 6)


# ------------------------------------------------------------------ Part 7: Contract...NI (17) + Land Acquisition (18)
LAND_RX = re.compile(r'RFCTLARR|LA Act 1894|Land Acquisition', re.I)


def part7(d):
    m = meta_of(d['meta'])
    ec = d['exam_context']
    fm = ec['format']
    fmt_note = '%s questions, %s; %s; negative marking: %s; open book: %s' % (
        fm.get('total_questions'), _s(fm.get('type')), _s(fm.get('duration')), _s(fm.get('negative_marking')).lower(), _s(fm.get('open_book')))
    split = ec['part_7_weightage']['split_estimate']

    def sec(s, i):
        provs = [_s(x) for x in s.get('key_provisions', [])]
        return {'order': i, 'title': _s(s['title']), 'priority': pri(s.get('priority')), 'expected_questions': eq(s.get('expected_questions') or s.get('estimated_questions'), '1'),
                'articles': '; '.join(provs), 'overview': _s(s.get('summary')), 'must_know': [_s(x) for x in s.get('key_points', [])],
                'key_provisions': [], 'landmark_cases': cases(s.get('landmark_cases')), 'mnemonics': [_s(x) for x in s.get('memory_aids', [])],
                'exam_traps': [_s(x) for x in s.get('common_traps', [])], 'probable_questions': [_s(x) for x in s.get('likely_questions', [])]}

    mods = d['modules']
    contract_secs, land_secs = [], []
    for mod in mods:
        for s in mod['sections']:
            x = sec(s, 0)
            if mod['module_id'] == 2 and 'Specific Relief' not in x['title']:
                x['title'] = 'Specific Relief Act: ' + x['title']
            if mod['module_id'] == 3 and 'Act' not in x['title'] and 'TPA' not in x['title']:
                x['title'] = 'Transfer of Property Act: ' + x['title']
            if mod['module_id'] == 5:
                x['expected_questions'] = eq(s.get('expected_questions') or mod.get('estimated_questions'))
                land_secs.append(x)
            else:
                if not s.get('expected_questions'):
                    x['expected_questions'] = '1'
                contract_secs.append(x)
    for lst in (contract_secs, land_secs):
        for i, x in enumerate(lst):
            x['order'] = i + 1

    cs = d['cheat_sheet']
    num_c = [r for r in cs['numbers_and_periods'] if not LAND_RX.search(' '.join(r))]
    num_l = [r for r in cs['numbers_and_periods'] if LAND_RX.search(' '.join(r))]
    find_l = [r for r in cs['section_finder'] if LAND_RX.search(' '.join(r))]
    find_c = [r for r in cs['section_finder'] if r not in find_l]

    mc_c, mc_l = [], []
    for q in d['practice_mcqs']:
        (mc_l if q.get('topic') == 'Land Acquisition' else mc_c).append(q)
    mc_c, mc_l = mcqs(mc_c), mcqs(mc_l)

    dev_c, dev_l = [], []
    for x in d['latest_developments']:
        it = dev_item(x.get('date'), x.get('detail'), x.get('exam_use'), topic=x.get('topic'))
        (dev_l if LAND_RX.search(x.get('topic', '') + x.get('detail', '')) else dev_c).append(it)

    rr_c = blocks(
        b_table('numbers', 'Numbers and periods', '#', ['Item', 'Rule'], num_c, filt=True),
        b_table('finder', 'Section finder', '§', ['Topic', 'Where to look'], find_c, filt=True),
        b_pairs('distinctions', 'Pairs the examiner likes', '≠', [(x['pair'], x['points']) for x in cs['distinctions']]),
        b_list('checklist', 'Final revision checklist', '✓', d['final_revision_checklist']),
        b_list('plan', 'Seven-day study plan', '☰', ec.get('study_plan_7_days', [])))
    rr_l = blocks(b_table('numbers', 'Numbers and periods', '#', ['Item', 'Rule'], num_l, filt=True),
                  b_table('finder', 'Section finder', '§', ['Topic', 'Where to look'], find_l, filt=True))

    def dist(rows):
        return [{'cluster': r['area'], 'expected_questions': eq(r['approx_questions']), 'comment': 'Priority: %s.' % r['priority']} for r in rows]

    cards = [{'title': 'What the examiner tests', 'items': ec.get('examiner_lens', [])}, {'title': 'How to use these notes', 'items': d.get('how_to_use_these_notes', [])}]
    exam_c = {'paper_format_note': fmt_note, 'indicative_distribution': dist(split[:4]), 'distribution_note': _s(ec['part_7_weightage'].get('note')), 'cards': cards}
    exam_l = {'paper_format_note': fmt_note, 'indicative_distribution': dist(split[4:]), 'distribution_note': '', 'cards': cards[:1]}
    return {17: dict(meta=dict(m, title='Contract, Specific Relief, Property and Negotiable Instruments'), exam=exam_c, sections=contract_secs, dev=dev_c, rr=rr_c, mcq=mc_c),
            18: dict(meta=dict(m, title='Land Acquisition'), exam=exam_l, sections=land_secs, dev=dev_l, rr=rr_l, mcq=mc_l)}


# ------------------------------------------------------------------ Part 8: Torts/MV/Consumer (15) + Administrative (9) + IP (19)
ADMIN_RX = re.compile(r'delegated|legitimate expectation|prohibition vs|certiorari|Sec 80 CPC|\bRTI\b|Lokpal|Art 311|Art 299|Art 300|natural justice|Government contracts|suit against Government|writ', re.I)
IP_RX = re.compile(r'copyright|patent|trade ?mark|\bTM\b|\bdesign\b|\bGI\b|PPVFR|passing off|broadcast|performer|compulsory licen|pre-grant|post-grant|personality rights|generative AI', re.I)


def _bucket8(text):
    if IP_RX.search(text):
        return 19
    if ADMIN_RX.search(text):
        return 9
    return 15


def part8(d):
    m = meta_of(d['meta'])
    ec = d['exam_context']
    fm = ec['format']
    fmt_note = '%s questions, %s; %s; negative marking: %s; open book: %s' % (
        fm.get('total_questions'), _s(fm.get('type')), _s(fm.get('duration')), _s(fm.get('negative_marking')).lower(), _s(fm.get('open_book')))
    split = {r['area']: r for r in ec['part_8_weightage']['split_estimate']}
    secs = {15: [], 9: [], 19: []}
    extra_tables = []
    for mod in d['modules']:
        no = {1: 15, 2: 15, 3: 15, 4: 9, 5: 19}[mod['module_id']]
        for s in mod['sections']:
            provs = [_s(x) for x in s.get('key_provisions', [])]
            title = _s(s['title'])
            if mod['module_id'] == 2 and 'Motor Vehicles' not in title:
                title = 'Motor Vehicles Act: ' + title
            if mod['module_id'] == 3 and 'Consumer Protection Act' not in title and 'Consumer Disputes' not in title and 'Central Consumer' not in title:
                title = 'Consumer Protection Act: ' + title
            secs[no].append({'order': len(secs[no]) + 1, 'title': title, 'priority': pri(s.get('priority')),
                             'expected_questions': eq(s.get('expected_questions') or mod.get('estimated_questions'), '1'),
                             'articles': '; '.join(provs), 'overview': _s(s.get('summary')), 'must_know': [_s(x) for x in s.get('key_points', [])],
                             'key_provisions': [], 'landmark_cases': cases(s.get('landmark_cases')), 'mnemonics': [_s(x) for x in s.get('memory_aids', [])],
                             'exam_traps': [_s(x) for x in s.get('common_traps', [])], 'probable_questions': [_s(x) for x in s.get('likely_questions', [])]})
            for t in s.get('comparison_tables', []):
                extra_tables.append((no, t))
    cs = d['cheat_sheet']
    rows_n = {15: [], 9: [], 19: []}
    rows_f = {15: [], 9: [], 19: []}
    pairs = {15: [], 9: [], 19: []}
    for r in cs['numbers_and_periods']:
        rows_n[_bucket8(' '.join(r))].append(r)
    for r in cs['section_finder']:
        rows_f[_bucket8(' '.join(r))].append(r)
    for x in cs['distinctions']:
        pairs[_bucket8(x['pair'])].append((x['pair'], x['points']))
    mcq_by = {15: [], 9: [], 19: []}
    for q in d['practice_mcqs']:
        mcq_by[{'Administrative Law': 9, 'Intellectual Property': 19}.get(q.get('topic'), 15)].append(q)
    dev_by = {15: [], 9: [], 19: []}
    for x in d['latest_developments']:
        txt = x.get('topic', '')
        no = 19 if re.search(r'copyright|AI', txt) else 9 if re.search(r'Bulldozer|Tribunal|RTI', txt) else 15
        dev_by[no].append(dev_item(x.get('date'), x.get('detail'), x.get('exam_use'), topic=x.get('topic')))
    lens = ec.get('examiner_lens', [])
    howto = d.get('how_to_use_these_notes', [])
    dist = {
        15: [{'cluster': k, 'expected_questions': eq(split[k]['approx_questions']), 'comment': 'Priority: %s.' % split[k]['priority']} for k in split if k.startswith(('Law of Torts', 'Motor', 'Consumer'))],
        9: [{'cluster': k, 'expected_questions': eq(split[k]['approx_questions']), 'comment': 'Priority: %s.' % split[k]['priority']} for k in split if k.startswith('Administrative')],
        19: [{'cluster': k, 'expected_questions': eq(split[k]['approx_questions']), 'comment': 'Priority: %s.' % split[k]['priority']} for k in split if k.startswith('Intellectual')]}
    names = {15: 'Torts, Motor Vehicles Act and Consumer Protection', 9: 'Administrative Law', 19: 'Intellectual Property Laws'}
    out = {}
    for no in (15, 9, 19):
        bl = [b_table('numbers', 'Numbers and periods', '#', ['Item', 'Rule'], rows_n[no], filt=True),
              b_table('finder', 'Section finder', '§', ['Topic', 'Where to look'], rows_f[no], filt=True),
              b_pairs('distinctions', 'Pairs the examiner likes', '≠', pairs[no])]
        for i, (tno, t) in enumerate(extra_tables):
            if tno == no:
                bl.append(b_table('cmp-%d' % i, _s(t.get('topic')) or 'Comparison', '⇄', t.get('columns', []), t.get('rows', []), filt=False))
        bl.append(b_list('checklist', 'Final revision checklist', '✓', d.get('final_revision_checklist', [])))
        if no == 15:
            bl.append(b_list('plan', 'Seven-day study plan', '☰', ['Day %s: %s' % (x.get('day'), x.get('focus')) for x in ec.get('study_plan_7_days', [])]))
        cards = [{'title': 'What the examiner tests', 'items': lens}, {'title': 'How to use these notes', 'items': howto}]
        out[no] = dict(meta=dict(m, title=names[no]),
                       exam={'paper_format_note': fmt_note, 'indicative_distribution': dist[no],
                             'distribution_note': _s(ec['part_8_weightage'].get('note')) if no == 15 else '', 'cards': cards if no == 15 else cards[:1]},
                       sections=secs[no], dev=dev_by[no], rr=blocks(*bl), mcq=mcqs(mcq_by[no]))
    return out


# ------------------------------------------------------------------ Part 10: Labour (14) + Taxation (16)  (sections already canonical, tagged by "block")
TAX_RX = re.compile(r'\btax|income[- ]tax|\bGST|\bITC\b|customs|stamp|TDS|assessment|\bITAT|CIT\(A\)|Art 265|Art 276|Art 279A|246A|Vodafone|McDowell|Azadi|Mohit|Safari|Dilip|Ganpati|Binoy|Ashish|Rajeev|residen|heads of income|slab|capital gains|reassessment|faceless|MADA|Mineral Area|royalty|Entry 82|Entry 46|\bCGST|\bIGST', re.I)


def part10(d):
    m = meta_of(d['meta'])
    ei = d['exam_intelligence']
    secs = {14: [], 16: []}
    for s in d['sections']:
        no = 16 if s.get('block') == 'Taxation' else 14
        x = dict(s)
        x.pop('block', None)
        x.pop('id', None)
        x['order'] = len(secs[no]) + 1
        x['priority'] = pri(x.get('priority'))
        secs[no].append(x)

    LAB_RX = re.compile(r'labour|worker|strike|lock-out|gratuity|bonus|wages?\b|retrench|IR Code|Labour Codes?|industry|maternity|\bEPF|\bESI|standing orders|Codes\b', re.I)

    def split(lst, key=lambda x: _s(x)):
        # an item that mentions both labour and tax words is kept in both subjects
        a, b = [], []
        for x in lst:
            t, l = bool(TAX_RX.search(key(x))), bool(LAB_RX.search(key(x)))
            if t:
                b.append(x)
            if l or not t:
                a.append(x)
        return {14: a, 16: b}

    dist_l = ei['indicative_distribution'][:3]
    dist_t = ei['indicative_distribution'][3:]
    pats = split(ei.get('question_patterns', []))
    hy = split(ei.get('high_yield_topics', []))
    tr = split(ei.get('common_traps', []))
    ts = ei.get('time_strategy', [])
    howto = d.get('how_to_use', [])
    kn = split(d.get('key_numbers', []), key=lambda r: r['item'] + ' ' + r['value'])
    ol = split(d['rapid_revision'].get('one_liner_cases', []))
    mn = split(d['rapid_revision'].get('mnemonics', []))
    con = d.get('old_to_new_concordance', {})
    mc = {14: [q for q in d['mcq_bank'] if q['id'] <= 37], 16: [q for q in d['mcq_bank'] if q['id'] > 37]}
    devs = split(d['latest_developments'], key=lambda x: x.get('topic', ''))
    rel = [(x['topic'], x['link']) for x in d.get('related_topics', [])]
    out = {}
    for no, title in ((14, 'Labour and Industrial Law'), (16, 'Taxation')):
        cards = [{'title': 'Question patterns', 'items': pats[no]}, {'title': 'High-yield topics', 'items': hy[no]},
                 {'title': 'Time strategy', 'items': ts if no == 14 else ts[-1:]}, {'title': 'How to use these notes', 'items': howto if no == 14 else howto[:0]}]
        cards = [c for c in cards if c['items']]
        trap = tr[no]
        if trap:
            cards.append({'title': 'Common traps', 'items': trap})
        bl = []
        if no == 14:
            bl.append(b_table('concordance', 'Old Acts to the four Codes', '⇄', ['Old law', 'Now in', 'Topic', 'Note'],
                              [[x['old'], x['new'], x['topic'], x.get('note', '')] for x in con.get('labour_acts_to_codes', [])], filt=True))
            bl.append(b_table('changes', 'What changed under the Codes', '⇄', ['Old position', 'New position', 'Topic', 'Note'],
                              [[x['old'], x['new'], x['topic'], x.get('note', '')] for x in con.get('concept_changes', [])], filt=True))
        else:
            bl.append(b_table('concordance', 'Old tax laws to the new', '⇄', ['Old law', 'Now', 'Topic', 'Note'],
                              [[x['old'], x['new'], x['topic'], x.get('note', '')] for x in con.get('tax_statutes', [])], filt=True))
        bl.append(b_table('numbers', 'Key numbers', '#', ['Item', 'Rule'], [[r['item'], r['value']] for r in kn[no]], filt=True))
        bl.append(b_list('oneliners', 'One-line case revision', '⚡', ol[no]))
        bl.append(b_list('mnemonics', 'Mnemonics', '✦', mn[no]))
        bl.append(b_pairs('related', 'Links to other subjects', '↔', rel))
        out[no] = dict(meta=dict(m, title=title),
                       exam={'paper_format_note': _s(ei.get('paper_format_note')), 'indicative_distribution': dist_l if no == 14 else dist_t,
                             'distribution_note': _s(ei.get('distribution_note')), 'cards': cards},
                       sections=secs[no], dev=devs[no], rr=blocks(*bl), mcq=mcqs(mc[no]))
    return out


ADAPTERS = {'part4': part4, 'part5': part5, 'part6': part6, 'part7': part7, 'part8': part8, 'part10': part10}
