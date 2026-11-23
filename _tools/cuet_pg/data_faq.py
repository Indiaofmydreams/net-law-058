# FAQ for /cuet-pg/faq.html. Each answer opens with a direct 35 to 55 word reply (PAA / featured-snippet style).
# (group, question, answer_html, answer_plain)  -- plain text feeds the FAQPage schema.
F = []
def q(group, question, answer, extra=""):
    F.append((group, question, answer, extra))

G1 = "The exam"
q(G1, "What is CUET PG LLM?",
  "CUET PG LLM is the Law (LL.M.) paper of the Common University Entrance Test (Postgraduate), conducted by the National Testing Agency. Its score is accepted by participating central, state and private universities for admission to their LL.M. programmes. The paper code is COQP14.",
  "Each university sets its own cut-off, seats and merit list; NTA only conducts the test and issues the score.")
q(G1, "Who conducts CUET PG and what is the official website?",
  "The National Testing Agency (NTA) conducts CUET (PG). The official portal is exams.nta.nic.in/cuet-pg, where the Information Bulletin, application form, city intimation slip, admit card, answer key and scorecard are published. Counselling is run by each university, not by NTA.")
q(G1, "When is CUET PG 2027, and has registration opened?",
  "NTA's revised calendar (26 October 2026) has the CUET PG 2027 exam starting on 2 March 2027 and running for 17 days, with no buffer dates. Registration is expected in December 2026 but, as of 22 November 2026, had not opened. Dates are tentative until the bulletin is out.",
  "The Law paper's own date and shift will be in the subject-wise timetable, released later. Last cycle the LL.M. paper was held on 17 March 2026.")
q(G1, "What is the subject code for CUET PG LLM?",
  "The Law (LL.M.) paper is COQP14. The three-year LL.B. entry uses a different paper, COQP11, which is a general test. Select the correct code while filling the form; choosing the wrong one means you will not get a score usable for LL.M. admission.")
q(G1, "Is CUET PG LLM easy or tough?",
  "Candidates and coaching analyses rated the 2025 and 2026 LL.M. papers easy to moderate, with direct questions on basic subjects such as Constitutional Law, Contract, Torts and the IPC. The difficulty lies in the breadth of 30-plus subjects and the negative marking, not in deep case-based reasoning.")

G2 = "Pattern and marking"
q(G2, "How many questions are there in the CUET PG LLM paper?",
  "The paper has 75 compulsory multiple-choice questions, all from law. There is no General Awareness or language section in the LL.M. paper, and all questions carry equal marks. It is a computer-based test available in English and Hindi.")
q(G2, "What is the marking scheme and is there negative marking in CUET PG LLM?",
  "Each correct answer earns 4 marks and each wrong answer costs 1 mark, so the paper is out of 300. Unattempted questions carry no marks and no penalty. Four wrong answers wipe out the gain from one correct answer, so random guessing is not free.")
q(G2, "What is the duration of the CUET PG LLM exam?",
  "The 2026 LL.M. papers were 90 minutes long, which works out to 72 seconds per question. Some older articles still quote 105 minutes, which was the duration in earlier cycles. Treat the 2027 Information Bulletin as final.")
q(G2, "Is CUET PG LLM computer-based, and in which languages?",
  "Yes. It is a computer-based test conducted at NTA-allotted centres across Indian cities, and abroad for some centres. The paper is bilingual: every question appears in English and Hindi. Bring the admit card and a valid photo ID.")
q(G2, "How many questions should I attempt in CUET PG LLM?",
  "Attempt every question you can answer or narrow to two options, and skip the rest. With +4 and -1 marking, guessing between two options has a positive expected value, but a blind four-way guess is only just above break-even. Aim for 60 to 70 attempts at high accuracy.",
  "Use the score planner on the Paper analysis page to see how attempts and accuracy change your marks.")
q(G2, "What is a good score in CUET PG LLM?",
  "There is no single answer, because each university sets its own cut-off for its own seats, and LL.M. cut-offs are rarely published as clearly as LL.B. ones. As a working rule, a score above about 70 percent of 300 (210 and up) keeps most options open, but check the university's previous merit lists.")

G3 = "Eligibility and application"
q(G3, "What is the eligibility for CUET PG LLM?",
  "NTA asks for a bachelor's degree; for LL.M. admission the university will require an LL.B. (three-year or five-year integrated), usually with minimum marks such as 50 percent, relaxed for reserved categories. Final-year LL.B. students could apply last cycle. Always read the eligibility rules of each university you want.")
q(G3, "Is there an age limit for CUET PG?",
  "No. NTA's bulletin for the 2026 cycle states there is no age limit for appearing in CUET (PG). Individual universities may set their own age or eligibility conditions for admission, so check each prospectus before you apply.")
q(G3, "Can final-year LL.B. students apply for CUET PG LLM?",
  "Yes. Candidates in the final year of their bachelor's degree were eligible to apply in 2026 and the same is expected in 2027. You must complete the degree and meet the university's marks criterion by the time of admission, with proof as the university requires.")
q(G3, "What is the CUET PG application fee?",
  "In the 2026 cycle the fee for up to two test papers was Rs 1,400 for General, Rs 1,200 for Gen-EWS and OBC-NCL, Rs 1,100 for SC, ST and Third Gender, and Rs 1,000 for PwBD, with Rs 600 to Rs 700 for each additional paper. The 2027 fee will be in the new bulletin.")
q(G3, "Can I appear for CUET PG LLM and another subject together?",
  "Yes. The fee covers up to two test papers, and extra papers cost more. A candidate cannot choose two papers that fall in the same slot, so check the timetable. LL.M. aspirants rarely need a second paper unless they also want an LL.B. or other PG seat.")
q(G3, "Is CUET PG LLM the same as CUET PG LLB?",
  "No. LL.M. uses the Law paper COQP14 (75 law questions on the subject), while the three-year LL.B. uses COQP11, a general test of language, general awareness, reasoning and quantitative skills. They are separate papers with different syllabi and different participating seats.")

G4 = "Syllabus and preparation"
q(G4, "What is the syllabus of CUET PG LLM?",
  "The syllabus covers about 30 law subjects, led by Constitutional Law, Contract, Torts, Criminal Law, Jurisprudence and Family Law, and extending to Property, Company, Administrative, Environmental, Labour, International, Human Rights, IPR, Evidence, CPC and Taxation. See the full topic-wise syllabus and tracker.")
q(G4, "Which subjects are most important in CUET PG LLM?",
  "Constitutional Law is consistently the largest block, followed by Criminal Law (IPC and BNS, with procedure), Contract, Torts, Jurisprudence and Family Law. These core areas supply roughly half the paper in most editorial analyses. Treat the numbers as estimates, since NTA publishes no weightage.")
q(G4, "Are the new criminal laws (BNS, BNSS, BSA) in the CUET PG LLM syllabus?",
  "Recent papers still used IPC, CrPC and Evidence Act terms, but the Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita and Bharatiya Sakshya Adhiniyam replaced them from 1 July 2024. Learn the key sections of both, because a 2027 question may use either numbering.")
q(G4, "How should I prepare for CUET PG LLM in 3 months?",
  "Spend month one on the core subjects (Constitution, Criminal Law, Contract, Torts, Jurisprudence, Family Law), month two on regular subjects and bare acts, and month three on mocks, previous papers and revision. Keep a case and section notebook and review every wrong answer weekly.")
q(G4, "Do I need coaching for CUET PG LLM?",
  "Not necessarily. The paper tests standard LL.B. knowledge, so your college notes, bare acts, good textbooks and regular timed practice are enough for many candidates. Coaching helps mainly with structure and discipline. The decisive factor is how many full papers you solve and how well you review them.")

G5 = "Universities and admission"
q(G5, "Which universities accept CUET PG LLM scores?",
  "Participating universities include the University of Delhi, Banaras Hindu University, Babasaheb Bhimrao Ambedkar University, several central universities such as South Bihar, Haryana, Punjab and Kashmir, Tripura University, Pondicherry University and a number of private universities. The list changes every year, so confirm on each university's page.")
q(G5, "Is there centralised counselling for CUET PG LLM?",
  "No. NTA publishes the scorecard only. Each university runs its own application, merit list and counselling, so you must apply separately on every university's portal after the result and watch their dates. Delhi University, for example, uses its own CSAS PG portal.")
q(G5, "Does NLU Delhi or any NLU take LL.M. admission through CUET PG?",
  "No. The National Law Universities admit to LL.M. through CLAT PG, and NLU Delhi through AILET. They do not use the CUET PG score, so a student aiming at NLUs must prepare for those separate exams as well.")
q(G5, "CUET PG LLM or CLAT PG: which one should I take?",
  "Take both if you can. CUET PG LLM is a 75-question, subject-knowledge paper that opens central and many state universities; CLAT PG is a 120-question, passage-based paper for NLUs. The two overlap in subjects, but CLAT PG demands more reading and application.")
