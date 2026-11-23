# Subject areas of the CUET (PG) Law (LL.M.) paper, code COQP14, with an editorial topic breakdown.
# tier: 1 = core, 2 = regular, 3 = occasional.  q = typical questions per 75-question paper (EDITORIAL ESTIMATE, not official).
# Topic text is HTML. Edit here, then run:  python3 _tools/cuet_pg/build.py
S = []
def sub(name, tier, q, groups): S.append(dict(name=name, tier=tier, q=q, groups=groups))

sub("Constitution of India", 1, "8 to 12", [
 ("Foundations", [
  "<b>Preamble and nature of the Constitution</b>: sources, federal features, secularism, socialism, Preamble as part of the Constitution (Kesavananda Bharati; Berubari)",
  "<b>Citizenship</b> (Arts 5 to 11) and the Citizenship Act 1955; <b>State</b> under Art 12 and <b>Art 13</b> (eclipse, severability, waiver, laws inconsistent with fundamental rights)"]),
 ("Fundamental rights and duties", [
  "<b>Equality (Arts 14 to 18)</b>: reasonable classification, arbitrariness (E.P. Royappa), reservations (Indra Sawhney, M. Nagaraj, EWS 103rd Amendment, sub-classification in Davinder Singh 2024), untouchability",
  "<b>Freedoms (Art 19)</b> and reasonable restrictions; <b>Arts 20 to 22</b>: ex post facto, double jeopardy, self-incrimination, arrest and preventive detention",
  "<b>Art 21 and its expansion</b>: Maneka Gandhi, privacy (K.S. Puttaswamy), right to education Art 21A, dignity, euthanasia (Common Cause); <b>Arts 23 to 30</b> (exploitation, religion, minorities, educational rights)",
  "<b>Constitutional remedies (Art 32)</b> and writs: habeas corpus, mandamus, certiorari, prohibition, quo warranto; Art 226 and its wider scope; <b>Fundamental duties</b> (Art 51A)",
  "<b>Directive Principles</b> (Part IV): classification, relation with fundamental rights (Champakam Dorairajan to Minerva Mills), uniform civil code (Art 44)"]),
 ("Government structure", [
  "<b>Union executive</b>: President (election, impeachment, ordinance power Art 123, pardon Art 72), Vice-President, Council of Ministers, Attorney General",
  "<b>Parliament</b>: composition, sessions, money and financial bills, privileges, anti-defection (Tenth Schedule; Kihoto Hollohan), Speaker's role; <b>State executive and legislature</b>: Governor's discretion (Nabam Rebia, S.R. Bommai)",
  "<b>Judiciary</b>: Supreme Court jurisdiction (original, appellate, advisory, review), appointment of judges (Second and Third Judges Cases, NJAC), judicial review, PIL, contempt of court",
  "<b>Federalism</b>: legislative, administrative and financial relations, Seventh Schedule, doctrine of pith and substance, repugnancy (Art 254), inter-State water disputes, GST Council"]),
 ("Amendment and emergency", [
  "<b>Amendment (Art 368)</b> and the Basic Structure doctrine: Shankari Prasad, Golak Nath, Kesavananda Bharati, Indira Gandhi v Raj Narain, Minerva Mills, I.R. Coelho; key amendments (42nd, 44th, 73rd, 74th, 101st, 103rd, 106th)",
  "<b>Emergency provisions</b> (Arts 352, 356, 360): grounds, judicial review, S.R. Bommai; special provisions for States and Union territories; Art 370 and the 2019 reorganisation"])])

sub("Contract: General Principles", 1, "4 to 6", [
 ("Formation", [
  "<b>Agreement and contract</b>: offer, acceptance, communication and revocation, invitation to treat, tenders, standard-form contracts (Carlill; Harvey v Facey; Lalman Shukla)",
  "<b>Consideration</b> (s.2(d), s.25): privity, past consideration, exceptions; <b>capacity to contract</b>: minors (Mohori Bibee), persons of unsound mind"]),
 ("Validity and performance", [
  "<b>Free consent</b>: coercion, undue influence, fraud, misrepresentation, mistake (ss.13 to 22); <b>legality of object</b>, void agreements (ss.23 to 30), wagering, restraint of trade",
  "<b>Contingent contracts</b>, <b>performance</b> and discharge by agreement, performance, breach, frustration (s.56: Taylor v Caldwell; Satyabrata Ghose), quasi-contracts (ss.68 to 72)",
  "<b>Remedies</b>: damages and remoteness (Hadley v Baxendale; s.73), liquidated damages and penalty (s.74), <b>Specific Relief Act 1963</b> as amended in 2018, government contracts (Art 299), electronic contracts (IT Act)"])])

sub("Law of Torts and Consumer Protection", 1, "3 to 5", [
 ("Principles", [
  "<b>Nature and general defences</b>: tort versus crime and contract, damnum sine injuria and injuria sine damno, volenti non fit injuria, necessity, private defence, inevitable accident",
  "<b>Negligence</b>: duty of care (Donoghue v Stevenson), breach, damage, res ipsa loquitur, contributory negligence; <b>nuisance</b>; <b>trespass</b>; <b>defamation</b> (libel, slander, defences)",
  "<b>Strict and absolute liability</b>: Rylands v Fletcher, M.C. Mehta (Oleum gas), Bhopal gas leak; <b>vicarious liability</b>, state liability (Kasturilal; Nilabati Behera)"]),
 ("Statutes", [
  "<b>Consumer Protection Act 2019</b>: definitions, consumer rights, three-tier commissions and pecuniary jurisdiction, product liability, unfair trade practices, Central Consumer Protection Authority",
  "<b>Motor Vehicles Act 1988</b> (no-fault liability, compensation) and the Public Liability Insurance Act 1991"])])

sub("Family Law I: Hindu Law", 1, "2 to 4", [
 ("Marriage and the family", [
  "<b>Sources and schools</b>: Mitakshara and Dayabhaga, Hindu Undivided Family, karta, coparcenary, partition; Hindu Succession (Amendment) Act 2005 and Vineeta Sharma (2020)",
  "<b>Hindu Marriage Act 1955</b>: conditions, void and voidable marriages, restitution of conjugal rights, judicial separation, divorce grounds, mutual consent, irretrievable breakdown (Shilpa Sailesh 2023), alimony"]),
 ("Succession, adoption, maintenance", [
  "<b>Hindu Succession Act 1956</b>: intestate succession of males and females, Class I and II heirs, stridhan, disqualifications; <b>wills</b>",
  "<b>Hindu Adoptions and Maintenance Act 1956</b>, <b>Hindu Minority and Guardianship Act 1956</b>, maintenance of wife, children and parents; welfare of the child"])])

sub("Criminal Law I: Substantive (IPC and BNS)", 1, "4 to 6", [
 ("General principles", [
  "<b>Crime and criminal liability</b>: actus reus, mens rea, stages of a crime, <b>general exceptions</b> (IPC ss.76 to 106; BNS ss.14 to 44), insanity, intoxication, private defence",
  "<b>Group liability and inchoate offences</b>: common intention (s.34, BNS s.3(5)), common object (s.149, BNS s.190), abetment, criminal conspiracy, attempt"]),
 ("Offences", [
  "<b>Offences against the State</b> and public tranquillity: sedition replaced by BNS s.152, unlawful assembly, rioting; <b>offences against the human body</b>: culpable homicide versus murder (IPC ss.299, 300; BNS ss.100, 101), hurt, grievous hurt",
  "<b>Sexual offences</b>, kidnapping and abduction; <b>property offences</b>: theft, extortion, robbery, dacoity, criminal breach of trust, cheating; <b>defamation</b>, criminal intimidation, offences against marriage (adultery struck down in Joseph Shine)",
  "<b>Know both numbering systems</b>: recent papers still use IPC terms, but the Bharatiya Nyaya Sanhita 2023 replaced the IPC from 1 July 2024; learn each key section with its BNS equivalent"])])

sub("Contract II: Specific Contracts", 2, "2 to 4", [
 ("Indian Contract Act 1872", [
  "<b>Indemnity and guarantee</b> (ss.124 to 147): continuing guarantee, rights and discharge of surety; <b>bailment and pledge</b> (ss.148 to 181): duties, lien, rights of pawnee",
  "<b>Agency</b> (ss.182 to 238): creation, authority, ratification, sub-agent, personal liability, termination"]),
 ("Allied statutes", [
  "<b>Sale of Goods Act 1930</b>: conditions and warranties, passing of property, unpaid seller's rights, caveat emptor",
  "<b>Partnership Act 1932</b> (nature, rights, dissolution, registration) and the <b>LLP Act 2008</b>"])])

sub("Company Law", 2, "2 to 3", [
 ("Companies Act 2013", [
  "<b>Incorporation and kinds of companies</b>: corporate personality (Salomon), lifting the veil, memorandum and articles, promoters, one-person and small companies, doctrine of ultra vires and constructive notice",
  "<b>Shares, debentures and charges</b>: prospectus, allotment, share capital, transfer; <b>directors</b> (appointment, duties, independent directors), meetings and resolutions"]),
 ("Regulation", [
  "<b>Oppression and mismanagement</b>, winding up, NCLT and NCLAT; <b>SEBI Act 1992</b> and the securities market; <b>FEMA 1999</b> basics; insolvency under the IBC 2016"])])

sub("Property Law", 2, "2 to 4", [
 ("Transfer of Property Act 1882", [
  "<b>Concept of property</b>, transfer and its operation, <b>doctrines</b>: lis pendens, part performance, election, feeding the grant by estoppel, benefit and burden, apportionment",
  "<b>Sale, mortgage, lease, gift, exchange</b>: kinds of mortgage, rights of mortgagor and mortgagee, redemption, foreclosure, actionable claims"]),
 ("Allied", [
  "<b>Indian Trusts Act 1882</b> (kinds of trust, trustee duties) and the <b>Easements Act 1882</b>; registration (Registration Act 1908)"])])

sub("Administrative Law", 2, "2 to 4", [
 ("Principles", [
  "<b>Nature, scope and rule of law</b> (Dicey), separation of powers, droit administratif; <b>delegated legislation</b>: need, limits, excessive delegation, control, sub-delegation",
  "<b>Natural justice</b>: audi alteram partem, nemo judex, reasoned decisions, bias, exceptions (Ridge v Baldwin; Maneka Gandhi); <b>administrative discretion</b> and its judicial control, Wednesbury unreasonableness, proportionality, legitimate expectation"]),
 ("Remedies and bodies", [
  "<b>Judicial review</b> and writs; <b>tribunals</b> (Art 323A/B, L. Chandra Kumar, Tribunals Reforms Act 2021); <b>liability of government</b>, promissory estoppel, Ombudsman, Lokpal and Lokayuktas, CVC"])])

sub("Family Law II: Muslim Law and Succession", 2, "2 to 3", [
 ("Muslim law", [
  "<b>Sources and schools</b>: Quran, Sunna, ijma, qiyas; Hanafi, Shafi'i, Maliki, Hanbali, Shia; <b>marriage</b> (nikah: kinds, mehr or dower, guardianship), divorce (talaq forms, khula, mubarat, Dissolution of Muslim Marriages Act 1939)",
  "<b>Triple talaq</b>: Shayara Bano (2017), Muslim Women (Protection of Rights on Marriage) Act 2019; <b>maintenance</b>: Shah Bano, Danial Latifi, Mohd Ahmed Khan; <b>gifts (hiba), wills (wasiyat), wakf</b>, pre-emption",
  "<b>Muslim inheritance</b>: Quranic sharers, residuaries, distant kindred, Shia versus Sunni rules, <b>guardianship and legitimacy</b>"]),
 ("Succession generally", [
  "<b>Indian Succession Act 1925</b>: testamentary and intestate succession, probate, letters of administration; Parsi and Christian succession; Special Marriage Act 1954"])])

sub("Environmental Law", 2, "2 to 3", [
 ("Framework", [
  "<b>Constitutional basis</b>: Arts 21, 48A, 51A(g); principles: polluter pays, precautionary principle, sustainable development, public trust (M.C. Mehta; Vellore Citizens)",
  "<b>Statutes</b>: Environment (Protection) Act 1986, Water Act 1974, Air Act 1981, Wildlife Protection Act 1972, Forest (Conservation) Act 1980, Biological Diversity Act 2002, NGT Act 2010",
  "<b>International</b>: Stockholm 1972, Rio 1992, Kyoto, Paris Agreement 2015, Basel, CITES, Ramsar; EIA and Coastal Regulation Zone; Public Liability Insurance Act"])])

sub("Labour Law", 3, "1 to 3", [
 ("Industrial relations", [
  "<b>Industrial Disputes Act 1947</b>: industry, workman, strike, lock-out, lay-off, retrenchment, closure; <b>Trade Unions Act 1926</b>; Industrial Employment (Standing Orders) Act",
  "<b>Wages and welfare</b>: Minimum Wages, Payment of Wages, Bonus, Gratuity, Employees' Compensation, ESI, EPF; <b>the four Labour Codes</b> (Wages, Industrial Relations, Social Security, Occupational Safety), which consolidate many of these Acts: check their current commencement status"])])

sub("Criminal Law II: Procedure (CrPC and BNSS)", 2, "3 to 5", [
 ("Process", [
  "<b>Structure of criminal courts</b>, arrest and bail (bailable and non-bailable, anticipatory bail s.438 CrPC / s.482 BNSS, default bail), search and seizure, FIR (s.154; BNSS s.173 with zero FIR and e-FIR)",
  "<b>Investigation and cognizance</b>, charge, kinds of trial (sessions, warrant, summons, summary), plea bargaining, compounding, <b>appeals, reference, revision, inherent powers</b> (s.482 CrPC / s.528 BNSS)",
  "<b>Maintenance under s.125 CrPC / s.144 BNSS</b>; limitation for taking cognizance; <b>Juvenile Justice (Care and Protection of Children) Act 2015</b>; Probation of Offenders Act 1958"])])

sub("Jurisprudence", 1, "4 to 6", [
 ("Schools and theories", [
  "<b>Natural law</b> (Aquinas, Grotius, Fuller, Finnis), <b>analytical positivism</b> (Bentham, Austin: command theory, Kelsen: pure theory, Hart: rules and the rule of recognition)",
  "<b>Historical school</b> (Savigny, Maine), <b>sociological school</b> (Ehrlich, Duguit, Pound: social engineering), <b>legal realism</b> (American and Scandinavian), Critical Legal Studies, feminist jurisprudence",
  "<b>Indian jurisprudence</b>: dharma, Manu, Kautilya, Gandhi, Ambedkar; the Constitution as a social document"]),
 ("Concepts", [
  "<b>Sources of law</b>: custom, legislation, precedent (stare decisis, ratio and obiter, per incuriam), juristic writings; <b>nature of law</b>, justice (Rawls, Nozick, Sen, Bentham's utility)",
  "<b>Rights and duties</b> (Hohfeld's jural correlatives), <b>legal personality</b> (corporations, idols, rivers: Mohd Salim; animals), <b>ownership, possession, title, liability, obligations</b>"])])

sub("Professional Ethics", 3, "1 to 2", [
 ("Advocates Act 1961", [
  "<b>Bar Council of India and State Bar Councils</b>, enrolment, right to practise, <b>professional misconduct</b>, disciplinary committees, appeal to the BCI and Supreme Court (ss.35 to 38)",
  "<b>Bar Council of India Rules</b> (duties to court, client, opponent, colleagues), <b>contempt of court</b> (Contempt of Courts Act 1971), accountancy for lawyers; leading cases: Re Vinay Chandra Mishra, Mahipal Singh Rana, Bar Council of Maharashtra v M.V. Dabholkar"])])

sub("Public International Law", 2, "2 to 4", [
 ("Foundations", [
  "<b>Nature and sources</b> (Art 38 ICJ Statute): treaties, custom, general principles, judicial decisions, jus cogens; <b>relationship with municipal law</b> (monism and dualism)",
  "<b>Subjects</b>: states, recognition, state succession, individuals, international organisations; <b>jurisdiction</b>, immunities, extradition and asylum"]),
 ("Practice", [
  "<b>Law of treaties</b> (Vienna Convention 1969), <b>law of the sea</b> (UNCLOS: territorial sea, EEZ, continental shelf), <b>United Nations</b> organs, <b>ICJ</b> jurisdiction and leading judgments, use of force and self-defence",
  "<b>International humanitarian law</b>: Geneva Conventions, war crimes, ICC and the Rome Statute; <b>diplomatic and consular relations</b>"])])

sub("Human Rights Law", 2, "2 to 3", [
 ("International and Indian", [
  "<b>UDHR 1948, ICCPR and ICESCR</b>, generations of rights, <b>Optional Protocols</b>; conventions on women (CEDAW), children (CRC), torture (CAT), racial discrimination (CERD), disabilities (CRPD)",
  "<b>Protection of Human Rights Act 1993</b> (as amended 2019): NHRC, SHRCs, Human Rights Courts; <b>vulnerable groups</b>: women, children, minorities, refugees, persons with disabilities (RPwD Act 2016), transgender persons (NALSA 2014)"])])

sub("Public Interest Litigation", 3, "1 to 2", [
 ("Concept and practice", [
  "<b>Origin and evolution</b>: relaxation of locus standi (S.P. Gupta, Hussainara Khatoon, Bandhua Mukti Morcha), epistolary jurisdiction, <b>guidelines and misuse</b>, costs, continuing mandamus, amicus curiae"])])

sub("Right to Information", 3, "1 to 2", [
 ("RTI Act 2005", [
  "<b>Right and obligations</b>: public authority, PIO and appellate authority, time limits, <b>exemptions</b> (s.8) and second schedule agencies, third-party information",
  "<b>Information Commissions</b>: CIC and SICs, appointment and removal, penalties (s.20), amendments of 2019 and the DPDP Act 2023 changes to s.8(1)(j); key cases: Raj Narain, S.P. Gupta, Namit Sharma, CBSE v Aditya Bandopadhyay"])])

sub("Banking Law", 3, "1 to 2", [
 ("Banking and negotiable instruments", [
  "<b>Banker and customer</b>: relationship, duties, <b>Banking Regulation Act 1949</b>, RBI Act 1934, SARFAESI Act 2002, DRT and recovery",
  "<b>Negotiable Instruments Act 1881</b>: promissory note, bill, cheque, holder in due course, dishonour (s.138), crossing and endorsement"])])

sub("Insurance Law", 3, "1 to 2", [
 ("Contracts of insurance", [
  "<b>Principles</b>: insurable interest, utmost good faith, indemnity, subrogation, contribution, proximate cause; <b>life, fire, marine and motor insurance</b>",
  "<b>Insurance Act 1938</b>, IRDA Act 1999 and the IRDAI; Marine Insurance Act 1963; claims and the insurance ombudsman"])])

sub("Alternative Dispute Resolution", 3, "1 to 2", [
 ("Arbitration and others", [
  "<b>Arbitration and Conciliation Act 1996</b>: arbitration agreement, tribunal, interim measures (s.9), challenge to awards (s.34), enforcement, <b>foreign awards</b> (New York and Geneva Conventions), 2015, 2019 and 2021 amendments",
  "<b>Conciliation, mediation and negotiation</b>, Mediation Act 2023, Lok Adalats (Legal Services Authorities Act 1987), Section 89 CPC, family courts"])])

sub("Civil Procedure Code", 2, "2 to 3", [
 ("Suits and appeals", [
  "<b>Jurisdiction</b> (subject-matter, pecuniary, territorial), res sub judice (s.10), res judicata (s.11), place of suing, institution of suits, <b>parties, pleadings, summons, written statement, set-off, counter-claim</b>",
  "<b>Interim orders</b> (injunction, receiver, attachment before judgment), <b>execution</b>, <b>appeal, review, revision, reference</b>, inherent powers (s.151), commercial courts and summary suits (Order 37), limitation basics"])])

sub("Intellectual Property Rights I: Patents, Trademarks, GI", 2, "2 to 3", [
 ("Patents, trademarks, GI", [
  "<b>Patents Act 1970</b>: patentable subject matter, s.3(d), novelty, inventive step, compulsory licensing, revocation (Novartis, Bayer, Natco); <b>Trade Marks Act 1999</b>: registration, well-known marks, passing off, infringement",
  "<b>Geographical Indications Act 1999</b>, <b>Designs Act 2000</b>, cyber-IPR issues: domain names, database protection, IT Act overlap"])])

sub("Intellectual Property Rights II: Copyright and Treaties", 3, "1 to 2", [
 ("Copyright and international regime", [
  "<b>Copyright Act 1957</b>: works, authorship and ownership, assignment and licensing, moral rights, fair dealing, infringement, 2012 amendment; Indian Performing Right Society cases",
  "<b>Biodiversity and plant varieties</b>: PPV&amp;FR Act 2001, Biological Diversity Act 2002; <b>treaties</b>: TRIPS, Paris, Berne, PCT, WIPO, Rome Convention, Budapest Treaty"])])

sub("Penology and Victimology", 3, "0 to 2", [
 ("Theories and practice", [
  "<b>Theories of punishment</b> (deterrent, retributive, preventive, reformative), capital punishment (Bachan Singh, rarest of rare), prison reforms, parole, probation, open prisons",
  "<b>Victimology</b>: types and rights of victims, compensation (s.357 CrPC; s.395 BNSS), victim impact; the 2015 Juvenile Justice Act perspective"])])

sub("Interpretation of Statutes", 2, "1 to 3", [
 ("Rules and aids", [
  "<b>Literal, golden, mischief and purposive rules</b> (Heydon's case; Maxwell, Craies), harmonious construction, ejusdem generis, noscitur a sociis, expressio unius, <b>presumptions</b> (e.g. against retrospective operation)",
  "<b>Internal and external aids</b>: preamble, headings, marginal notes, provisos, explanations, Statement of Objects and Reasons, parliamentary debates; <b>General Clauses Act 1897</b>"])])

sub("Competition Law", 3, "1 to 2", [
 ("Competition Act 2002", [
  "<b>Anti-competitive agreements</b> (s.3: horizontal, vertical, cartels), <b>abuse of dominance</b> (s.4), <b>combinations</b> (ss.5 and 6), CCI powers and duties, appeal to NCLAT; the 2023 amendment (deal-value threshold, leniency plus, settlements)"])])

sub("Law of Evidence (IEA and BSA)", 2, "2 to 3", [
 ("Core rules", [
  "<b>Relevancy and admissibility</b>: facts in issue, res gestae, admissions, <b>confessions</b> (ss.24 to 30 IEA; BSA 2023 ss.22 to 24), dying declaration, expert opinion, electronic records (s.65B IEA; BSA s.63)",
  "<b>Burden and standard of proof</b>, presumptions, estoppel, <b>witnesses</b>: competence, privilege, examination in chief, cross, re-examination, hostile witness, <b>documentary evidence</b>; the Bharatiya Sakshya Adhiniyam 2023 in force from 1 July 2024"])])

sub("Taxation", 3, "1 to 2", [
 ("Direct and indirect", [
  "<b>Income-tax Act 1961</b>: previous year and assessment year, residence, heads of income, exemptions, <b>GST</b> (CGST, SGST, IGST: supply, input tax credit, GST Council), customs and central excise basics; the Income-tax Act 2025 comes into force from 1 April 2026"])])

sub("White Collar Crimes", 3, "0 to 2", [
 ("Concepts and statutes", [
  "<b>Concept</b> (Sutherland), causes and classification: corporate crime, bribery, tax evasion, money laundering, cyber and financial fraud",
  "<b>Prevention of Corruption Act 1988</b> (2018 amendment), PMLA 2002, Companies Act fraud provisions, SEBI insider trading, Lokpal; Santhanam Committee"])])

sub("Women and Criminal Law", 3, "0 to 2", [
 ("Protection laws", [
  "<b>Sexual offences</b> and the Criminal Law (Amendment) Acts of 2013 and 2018 (Nirbhaya, Kathua), BNS chapter on offences against women; <b>dowry</b> (ss.304B, 498A IPC; BNS ss.80, 85), <b>Protection of Women from Domestic Violence Act 2005</b>",
  "<b>POSH Act 2013</b> (Vishaka), <b>POCSO Act 2012</b>, Immoral Traffic (Prevention) Act, Maternity Benefit Act, Equal Remuneration; social legislation affecting women"])])

sub("International Trade Law", 3, "0 to 2", [
 ("WTO and trade", [
  "<b>GATT and the WTO</b>: MFN, national treatment, tariffs, dispute settlement understanding, anti-dumping, subsidies, safeguards, TRIPS and GATS",
  "<b>International contracts</b> (CISG, Incoterms, UNCITRAL), foreign investment (FDI policy, BITs), Foreign Trade (Development and Regulation) Act 1992"])])
