# Logical Reasoning: Detailed Notes for UGC NET Paper 1

## Chapter 1: Basics: Argument, Statement, Truth, Validity

### 1.1 What logic is

Logic is the study of the methods and principles used to distinguish correct reasoning from incorrect reasoning. It does not study how people actually think (that is psychology). It studies the **relationship between premises and conclusion**.

### 1.2 Statement (proposition)

A statement is a declarative sentence that is **either true or false**. Commands ("Close the door"), questions, requests and exclamations are not statements, so they have no truth value and cannot be premises or conclusions. The truth or falsity of a statement is called its **truth value**.

### 1.3 Argument

An argument is a group of statements in which one (the **conclusion**) is claimed to follow from the others (the **premises**). Every argument therefore has at least one premise and exactly one conclusion in the basic form.

- **Conclusion indicators:** therefore, hence, thus, so, consequently, it follows that, accordingly, which shows that.

- **Premise indicators:** because, since, for, as, given that, inasmuch as, the reason being.

- **Non-arguments:** mere description, report, explanation, command, question, simple conditional statement. An *explanation* tells why something happened (the fact is already accepted), while an *argument* tries to prove that something is true.

### 1.4 Truth, validity and soundness

These three words are the most tested distinction in the unit.

| Term                  | Applies to                | Meaning                                            |
|-----------------------|---------------------------|----------------------------------------------------|
| Truth / Falsity       | Statements (propositions) | Agreement or disagreement with fact                |
| Validity / Invalidity | Deductive arguments       | Conclusion follows necessarily from premises       |
| Soundness             | Deductive arguments       | Valid **and** all premises true                    |
| Strength / Weakness   | Inductive arguments       | How probable the conclusion is, given the premises |
| Cogency               | Inductive arguments       | Strong **and** all premises true                   |

Key facts to memorise:

- Validity depends only on **form**, not on the actual truth of the statements.

- A valid argument **can** have a false conclusion, but only if at least one premise is false.

- If the premises are true and the conclusion is false, the argument is **definitely invalid**.

- A valid argument with a false premise is valid but **unsound**.

- An invalid argument can have true premises and a true conclusion. Truth of the parts does not guarantee validity.

- Propositions are true or false; arguments are valid or invalid. Never say "a true argument" or "a valid statement".

### 1.5 Deductive and inductive reasoning

| Feature                  | Deduction                                                    | Induction                                                    |
|--------------------------|--------------------------------------------------------------|--------------------------------------------------------------|
| Direction (traditional)  | General to particular                                        | Particular to general                                        |
| Claim                    | Conclusion follows **necessarily**                           | Conclusion follows **probably**                              |
| Conclusion               | Contained in the premises (no new information)               | Goes beyond the premises (new information)                   |
| Evaluation               | Valid / invalid                                              | Strong / weak                                                |
| Effect of added premises | Valid argument stays valid                                   | Strength can increase or decrease                            |
| Example                  | All men are mortal; Socrates is a man; so Socrates is mortal | The sun has risen every day so far; so it will rise tomorrow |

**Caution:** the "general to particular" and "particular to general" rule is only a rough guide. Some deductive arguments move from general to general, and some inductive arguments move from particular to particular (analogy). The real test is **whether the conclusion is claimed to follow necessarily or only probably**.

**Types of induction:** perfect induction (complete enumeration of all cases, which is really deductive in force), imperfect induction (a sample is generalised, which is the usual inductive method), analogy, causal inference, statistical generalisation and hypothesis. Francis Bacon's *Novum Organum* championed the inductive method, and J. S. Mill systematised the canons of induction.

## Chapter 2: Categorical Propositions

### 2.1 Structure

A standard-form categorical proposition has four parts: **quantifier** (All / No / Some), **subject term (S)**, **copula** (is / are) and **predicate term (P)**. It states a relation between two classes.

### 2.2 The four forms (A, E, I, O)

The letters come from the Latin *AffIrmo* (I affirm) and *nEgO* (I deny).

| Form | Statement       | Quantity   | Quality     | Subject distributed? | Predicate distributed? |
|------|-----------------|------------|-------------|----------------------|------------------------|
| A    | All S is P      | Universal  | Affirmative | Yes                  | No                     |
| E    | No S is P       | Universal  | Negative    | Yes                  | Yes                    |
| I    | Some S is P     | Particular | Affirmative | No                   | No                     |
| O    | Some S is not P | Particular | Negative    | No                   | Yes                    |

**Memory rule for distribution:** *Universals distribute the subject; negatives distribute the predicate.* So A distributes S, E distributes both, I distributes neither, O distributes P.

A term is **distributed** when the proposition says something about *every member* of the class the term denotes.

### 2.3 The traditional Square of Opposition

The square arranges A, E, I, O at its corners (A top-left, E top-right, I bottom-left, O bottom-right).

| Relation       | Between                    | Rule                                                                                             |
|----------------|----------------------------|--------------------------------------------------------------------------------------------------|
| Contradictory  | A–O and E–I (diagonals)    | Cannot both be true and cannot both be false. Exactly one is true.                               |
| Contrary       | A–E (top)                  | Cannot both be true; **can both be false**                                                       |
| Subcontrary    | I–O (bottom)               | **Can both be true**; cannot both be false                                                       |
| Subalternation | A to I, and E to O (sides) | Truth passes **down** (universal to particular); falsity passes **up** (particular to universal) |

**Inference table (traditional view):**

| If this is... | A   | E   | I   | O   |
|---------------|-----|-----|-----|-----|
| A is true     | T   | F   | T   | F   |
| A is false    | F   | ?   | ?   | T   |
| E is true     | F   | T   | F   | T   |
| E is false    | ?   | F   | T   | ?   |
| I is true     | ?   | F   | T   | ?   |
| I is false    | F   | T   | F   | T   |
| O is true     | F   | ?   | ?   | T   |
| O is false    | T   | F   | T   | F   |

*(? means undetermined.)* The shortcut: contradictories always flip; contraries cannot both be true; subcontraries cannot both be false; "true travels down, false travels up".

### 2.4 Existential import

The traditional (Aristotelian) view assumes every class named in a proposition has at least one member, so universal propositions imply the existence of their subject. This makes subalternation, and the contrary and subcontrary relations, valid.

George **Boole** rejected this. On the **Boolean (modern) view**, universal propositions (A and E) make no existence claim, while particular propositions (I and O) do. Consequences: only the **contradictory** relation survives on the Boolean square; contrary, subcontrary and subalternation fail; and "All unicorns are white" does not imply "Some unicorns are white". The **existential fallacy** is committed when a syllogism with two universal premises draws a particular conclusion, which is valid only on the Aristotelian view.

### 2.5 Immediate inference

Immediate inference draws a conclusion from **one premise**. The three classical operations are conversion, obversion and contraposition.

**Conversion** (interchange S and P, keep quality):

| Original           | Converse    | Type                         |
|--------------------|-------------|------------------------------|
| A: All S is P      | Some P is S | By limitation (per accidens) |
| E: No S is P       | No P is S   | Simple                       |
| I: Some S is P     | Some P is S | Simple                       |
| O: Some S is not P | Not valid   | O cannot be converted        |

**Obversion** (change the quality, replace the predicate with its complement; valid for **all four**):

| Original           | Obverse             |
|--------------------|---------------------|
| A: All S is P      | No S is non-P       |
| E: No S is P       | All S is non-P      |
| I: Some S is P     | Some S is not non-P |
| O: Some S is not P | Some S is non-P     |

**Contraposition** (replace S with non-P and P with non-S; equals obvert, convert, obvert):

| Original           | Contrapositive                          |
|--------------------|-----------------------------------------|
| A: All S is P      | All non-P is non-S                      |
| E: No S is P       | Some non-P is not non-S (by limitation) |
| I: Some S is P     | Not valid                               |
| O: Some S is not P | Some non-P is not non-S                 |

**Memory:** O cannot be converted; I cannot be contraposed; A and O are the only forms that contrapose simply; obversion works for everything.

## Chapter 3: The Categorical Syllogism

### 3.1 Structure

A categorical syllogism is a **mediate inference** with **three categorical propositions** (major premise, minor premise, conclusion) and **exactly three terms**, each appearing twice.

- **Major term (P):** predicate of the conclusion.

- **Minor term (S):** subject of the conclusion.

- **Middle term (M):** appears in both premises, never in the conclusion.

- **Major premise:** the premise containing the major term.

- **Minor premise:** the premise containing the minor term.

### 3.2 Mood and figure

**Mood** is determined by the *types* (A, E, I, O) of the three propositions in order (major premise, minor premise, conclusion). Since each of three propositions can be one of four forms, there are 4 × 4 × 4 = **64 possible moods**.

**Figure** is determined by the **position of the middle term** in the premises. There are **four figures**:

| Figure | Major premise | Minor premise | Middle term position                 |
|--------|---------------|---------------|--------------------------------------|
| 1      | M – P         | S – M         | Subject of major, predicate of minor |
| 2      | P – M         | S – M         | Predicate of both                    |
| 3      | M – P         | M – S         | Subject of both                      |
| 4      | P – M         | M – S         | Predicate of major, subject of minor |

With 64 moods and 4 figures there are **256 possible syllogistic forms**. Of these, **24 are valid** on the Aristotelian view. On the Boolean view only **15 are unconditionally valid** (the other 9 depend on existential import).

### 3.3 Valid moods and mnemonic names (memory heavy)

| Figure | Valid moods (unconditional)            | Mood letters       |
|--------|----------------------------------------|--------------------|
| 1      | **Barbara, Celarent, Darii, Ferio**    | AAA, EAE, AII, EIO |
| 2      | **Cesare, Camestres, Festino, Baroko** | EAE, AEE, EIO, AOO |
| 3      | **Disamis, Datisi, Bocardo, Ferison**  | IAI, AII, OAO, EIO |
| 4      | **Camenes, Dimaris, Fresison**         | AEE, IAI, EIO      |

Conditional (Aristotelian only, existential import needed): Barbari (AAI-1), Celaront (EAO-1), Cesaro (EAO-2), Camestrop (AEO-2), Darapti (AAI-3), Felapton (EAO-3), Bramantip (AAI-4), Camenop (AEO-4), Fesapo (EAO-4).

**Mnemonic reading:** the three vowels of each name give the mood. The **initial consonant** (B, C, D, F) shows the first-figure mood to which it is reduced. Letters inside the name tell the method of reduction: **s** (simple conversion), **p** (conversion by limitation), **m** (*mutare*, transpose the premises), **c** (reductio ad absurdum).

**Figure-wise features:**

- **Figure 1:** minor premise must be affirmative; major premise must be universal. It gives conclusions of all four kinds (A, E, I, O) and is called the perfect figure; the only one whose conclusion can be A.

- **Figure 2:** one premise must be negative; major premise must be universal; conclusion is **always negative** (E or O).

- **Figure 3:** minor premise must be affirmative; conclusion is **always particular** (I or O).

- **Figure 4:** the Galenic figure (named after Galen, though added later); if the major premise is affirmative then the major must be universal... (rarely asked in detail).

### 3.4 The rules of the syllogism and their fallacies

| \#  | Rule                                                                         | Fallacy if violated                                                                    |
|-----|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| 1   | Exactly three terms                                                          | Four terms (*quaternio terminorum*); equivocation of the middle term is a common cause |
| 2   | The middle term must be distributed at least once                            | **Undistributed middle**                                                               |
| 3   | A term distributed in the conclusion must be distributed in its premise      | **Illicit major** (major term) or **Illicit minor** (minor term)                       |
| 4   | No conclusion follows from two negative premises                             | Exclusive premises                                                                     |
| 5   | If one premise is negative, the conclusion must be negative (and vice versa) | Affirmative conclusion from a negative premise                                         |
| 6   | No conclusion follows from two particular premises                           | (Two particular premises)                                                              |
| 7   | If one premise is particular, the conclusion must be particular              | Existential or similar error                                                           |
| 8   | From two affirmative premises, the conclusion must be affirmative            | (Corollary of rule 5)                                                                  |

**Quick test procedure for a syllogism:** (1) put it in standard form and name S, P, M; (2) identify the mood and figure; (3) check each rule above in order; (4) the first rule broken names the fallacy.

**Worked example.** All dogs are mammals; no fish are mammals; therefore no fish are dogs. Terms: M = mammals, P = dogs, S = fish. Mood EAE? Arranging: major premise "All dogs are mammals" (A), minor premise "No fish are mammals" (E), conclusion "No fish are dogs" (E). Figure 2 (middle term is predicate of both). Mood AEE-2 is **Camestres**, which is valid.

## Chapter 4: Other Forms of Argument

### 4.1 Hypothetical (conditional) propositions and syllogisms

A hypothetical proposition has the form "If P then Q". P is the **antecedent**, Q is the **consequent**. It is false **only** when the antecedent is true and the consequent false.

| Form                                        | Pattern                                         | Status      |
|---------------------------------------------|-------------------------------------------------|-------------|
| **Modus ponens** (affirming the antecedent) | If P then Q; P; therefore Q                     | Valid       |
| **Modus tollens** (denying the consequent)  | If P then Q; not Q; therefore not P             | Valid       |
| Affirming the consequent                    | If P then Q; Q; therefore P                     | **Fallacy** |
| Denying the antecedent                      | If P then Q; not P; therefore not Q             | **Fallacy** |
| **Pure hypothetical syllogism**             | If P then Q; if Q then R; therefore if P then R | Valid       |

### 4.2 Disjunctive syllogism

"Either P or Q; not P; therefore Q." Valid. If the disjunction is *inclusive*, affirming one disjunct does not allow denying the other ("Either P or Q; P; therefore not Q" is a fallacy for inclusive disjunction but valid for exclusive disjunction).

### 4.3 Dilemma

A dilemma combines a hypothetical and a disjunctive argument. The major premise contains two conditionals (hypotheticals); the **minor premise is a disjunction**.

- **Constructive dilemma:** (P→Q) and (R→S); P or R; therefore Q or S.

- **Destructive dilemma:** (P→Q) and (R→S); not-Q or not-S; therefore not-P or not-R.

**Three ways to meet a dilemma:**

1.  **Escape between the horns:** reject the disjunctive premise by showing that other alternatives exist.

2.  **Grasp (take) it by the horns:** deny the truth of one of the conditional propositions.

3.  **Rebut it:** construct a counter-dilemma that proves the opposite conclusion.

### 4.4 Sorites and enthymeme

- **Sorites:** a chain of syllogisms in which the conclusion of each becomes a premise of the next, and all intermediate conclusions are left unstated. Only the final conclusion is given.

- **Enthymeme:** a syllogism in which **one premise or the conclusion is suppressed** (understood but unstated). It is the form in which most everyday arguments occur.

- **Epicheirema:** a syllogism in which one or both premises are supported by a reason.

### 4.5 The Laws of Thought

| Law               | Statement                                                               | Symbolic          |
|-------------------|-------------------------------------------------------------------------|-------------------|
| Identity          | Whatever is, is; A is A                                                 | A is A            |
| Non-contradiction | Nothing can both be and not be at the same time and in the same respect | not (A and not-A) |
| Excluded middle   | Everything either is or is not; there is no third possibility           | A or not-A        |

A fourth, the **Law of Sufficient Reason**, was added by Leibniz. A statement "P and not-P" violates non-contradiction; "A is B or not B, and a middle option exists" violates excluded middle.

### 4.6 Basic truth-functional logic

| Connective              | Symbol | True when                                    |
|-------------------------|--------|----------------------------------------------|
| Negation                | ~P     | P is false                                   |
| Conjunction             | P ∧ Q  | Both true                                    |
| Disjunction (inclusive) | P ∨ Q  | At least one true (false only if both false) |
| Conditional             | P → Q  | False only when P true and Q false           |
| Biconditional           | P ↔ Q  | Both have the same truth value               |

- **Tautology:** true under every assignment of truth values (e.g., P ∨ ~P).

- **Contradiction (self-contradiction):** false under every assignment (e.g., P ∧ ~P).

- **Contingent statement:** true under some and false under others.

- **De Morgan's laws:** ~(P ∧ Q) ≡ ~P ∨ ~Q, and ~(P ∨ Q) ≡ ~P ∧ ~Q.

## Chapter 5: Fallacies

### 5.1 What a Fallacy Is: Formal and Informal

A **fallacy** is an error in reasoning that makes an argument unsound or invalid. Two broad classes exist.

- **Formal fallacies** arise from the **form (structure)** of the argument and can be detected without knowing the subject matter. Examples: undistributed middle, illicit major, illicit minor, exclusive premises, four terms, affirming the consequent, denying the antecedent, existential fallacy.

- **Informal fallacies** arise from the **content, language or context** of the argument. They are grouped as fallacies of relevance, ambiguity and presumption.

### 5.2 Fallacies of relevance (premises are irrelevant to the conclusion)

| Fallacy                      | Latin name              | Meaning                                                                    | Example                                    |
|------------------------------|-------------------------|----------------------------------------------------------------------------|--------------------------------------------|
| Appeal to force              | *Argumentum ad baculum* | Threat is used in place of proof                                           | Accept my view or lose your job            |
| Appeal to pity               | *Ad misericordiam*      | Sympathy replaces evidence                                                 | Pass me, I will lose my scholarship        |
| Appeal to the people         | *Ad populum*            | Popularity or crowd emotion is used                                        | Everyone believes it, so it is true        |
| Argument against the person  | *Ad hominem*            | Attacks the speaker, not the argument (abusive, circumstantial, tu quoque) | He is a liar, so his theory is wrong       |
| Appeal to improper authority | *Ad verecundiam*        | Cites an authority outside their field                                     | A film star's view on nuclear physics      |
| Appeal to ignorance          | *Ad ignorantiam*        | Claims truth because falsity is unproved (or vice versa)                   | No one has disproved ghosts, so they exist |
| Irrelevant conclusion        | *Ignoratio elenchi*     | Proves something other than the point at issue                             | Argues about crime to justify a tax        |
| Red herring                  |                         | Diverts attention with an irrelevant issue                                 |                                            |
| Straw man                    |                         | Misrepresents the opponent's view so it can be easily refuted              |                                            |
| Tu quoque                    |                         | "You do it too" (a form of ad hominem circumstantial)                      |                                            |
| Genetic fallacy              |                         | Judges a claim by its origin                                               | It came from a politician, so it is false  |

### 5.3 Fallacies of presumption (assume something unproved)

- **Begging the question (*petitio principii*):** the conclusion is assumed in the premises; circular reasoning.

- **Complex (loaded) question:** a question presupposing a point not yet granted ("Have you stopped cheating?").

- **False cause (_non causa pro causa_):** treating a non-cause as a cause. Its best-known type is **_post hoc ergo propter hoc_** (after this, therefore because of this).

- **Accident:** applying a general rule to a special case where it does not apply.

- **Converse accident (hasty generalisation):** moving from an exceptional or unrepresentative case to a general rule.

- **False dilemma:** presenting only two alternatives when more exist.

- **Slippery slope:** claiming one step will inevitably lead to a chain of bad consequences.

- **Naturalistic fallacy (G. E. Moore):** deriving "good" from a natural property such as "pleasant" or "natural".

### 5.4 Fallacies of ambiguity (language is used in shifting senses)

| Fallacy          | Cause                                                            |
|------------------|------------------------------------------------------------------|
| **Equivocation** | A word is used in two different senses in the same argument      |
| **Amphiboly**    | Ambiguity from loose or faulty grammar and sentence construction |
| **Accent**       | Shifting emphasis or stress changes the meaning                  |
| **Composition**  | What is true of the parts is inferred to be true of the whole    |
| **Division**     | What is true of the whole is inferred to be true of each part    |

**Trap:** composition and division are opposites. *"Each brick is light, so the wall is light"* is composition. *"The team is excellent, so each player is excellent"* is division.

## Chapter 6: Uses of Language, Terms, Connotation and Denotation, Definitions

### 6.1 Three basic uses (functions) of language

| Use             | Purpose                                                | Truth-valued?                                    | Example                        |
|-----------------|--------------------------------------------------------|--------------------------------------------------|--------------------------------|
| **Informative** | Conveys information; affirms or denies propositions    | Yes                                              | Water boils at 100°C           |
| **Expressive**  | Expresses or evokes feelings and attitudes             | No                                               | Ouch! What a beautiful sunset! |
| **Directive**   | Causes or prevents action (commands, requests, advice) | No (but can be right or wrong, effective or not) | Submit the form by Monday      |

Some writers add a fourth, **ceremonial or performative** use ("I now pronounce you..."). Most real sentences mix several uses.

**Disagreements:** a **verbal dispute** arises merely from different meanings given to a word; a **factual dispute** concerns an actual matter of fact. **Emotive meaning** is the feeling attached to a word ("slim" versus "skinny"); **cognitive meaning** is its informative content.

### 6.2 Connotation and denotation

- **Denotation (extension):** the class of objects to which a term applies. The denotation of "planet" is Mercury, Venus, Earth and so on.

- **Connotation (intension):** the set of attributes the term signifies. The connotation of "triangle" is closed plane figure with three sides.

- **Inverse relation (traditional view):** as connotation increases, denotation decreases, and vice versa. "Animal" has a wide denotation and small connotation; "Indian male Nobel laureate in physics" has a very large connotation and very small denotation.

- A term may have connotation but no denotation ("unicorn").

### 6.3 Kinds of terms

| Basis             | Kinds                                                              |
|-------------------|--------------------------------------------------------------------|
| Number of objects | Singular (Delhi), General (city), Collective (committee, army)     |
| Nature            | Concrete (table), Abstract (honesty)                               |
| Quality           | Positive (healthy), Negative (non-smoker), Privative (blind, deaf) |
| Relation          | Relative (father/son), Absolute                                    |

### 6.4 Definition

The term to be defined is the **definiendum**; the words that define it are the **definiens**.

**Kinds of definition by purpose:**

- **Stipulative:** assigns a new meaning for a particular purpose (cannot be true or false).

- **Lexical:** reports established dictionary usage (can be true or false).

- **Precising:** reduces vagueness of an existing meaning.

- **Theoretical:** gives a theoretical account of a subject ("heat is molecular motion").

- **Persuasive:** uses emotive language to influence attitudes.

**Kinds by method:**

- **Extensional (denotative):** lists members or points to examples (including ostensive definition).

- **Intensional (connotative):** gives the attributes, including **genus and differentia** ("Man is a rational animal": animal is the genus, rational is the differentia), synonym and operational definition.

**Rules of a good definition:** it should state the essential attributes; must not be circular; must not be too wide or too narrow; must not be obscure, figurative or ambiguous; and should not be negative where an affirmative one is possible.

### 6.5 The Five Predicables (Porphyry)

| Predicable          | Meaning                                                             | Example (man)                 |
|---------------------|---------------------------------------------------------------------|-------------------------------|
| Genus               | The wider class                                                     | Animal                        |
| Species             | The narrower class                                                  | Man (under animal)            |
| Differentia         | Essential quality that separates a species from others in the genus | Rational                      |
| Property (proprium) | Necessary but not essential quality                                 | Capable of laughter (risible) |
| Accident            | Non-essential, separable quality                                    | Being tall or fair            |

## Chapter 7: Induction and Analogy

### 7.1 Induction: kinds and character

Induction extends from observed to unobserved cases. The conclusion is only **probable**, and the argument is judged **strong or weak**. Perfect induction (complete enumeration) is deductive in force; imperfect induction rests on a sample. The inductive leap is justified by the **uniformity of nature** and the **law of causation**.

### 7.2 Mill's Experimental Methods (Canons of Induction)

| Method                                       | Principle                                                                                                                            | Key idea                         |
|----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|
| **Agreement**                                | If instances of a phenomenon have only one circumstance in common, that circumstance is the cause (or effect)                        | Look for what is *common*        |
| **Difference**                               | If an instance where the phenomenon occurs and one where it does not differ in only one circumstance, that circumstance is the cause | Look for the *single difference* |
| **Joint Method of Agreement and Difference** | Combines the two to reduce error                                                                                                     | Double check                     |
| **Residues**                                 | Subtract the part known to be caused by earlier antecedents; the remainder is caused by the remaining antecedent                     | Look at the *remainder*          |
| **Concomitant Variation**                    | Two phenomena that vary together in degree are causally connected                                                                    | Look at *variation in degree*    |

The method of difference is the most reliable (it is the basis of the controlled experiment); agreement is the weakest because common factors may be coincidental. Concomitant variation is used when the cause cannot be removed (the tides and the moon).

### 7.3 Argument from analogy

An analogy argues that because two or more things are alike in some known respects, they are likely alike in a further respect. It is an **inductive** argument; the conclusion is **probable**; it is judged **strong or weak**.

*Form:* A has properties a, b, c and d; B has properties a, b and c; therefore B probably has d.

**What strengthens an analogy:**

- A larger number of **relevant** similarities.

- A larger number and variety of cases compared.

- Greater **relevance** of the shared properties to the conclusion property.

- A **more modest (less ambitious) conclusion** relative to the premises.

**What weakens it:** relevant **dissimilarities**, irrelevant or superficial similarities (**false analogy**), and an over-ambitious conclusion.

**Related points:** Paley's watchmaker argument (design implies a designer) is a classic analogy. **Refutation by logical analogy** shows an argument is invalid by producing a parallel argument of identical form with obviously true premises and a false conclusion. In Indian logic the corresponding pramana is **upamana**.

**Verbal and number analogy items** ("Pen : Write :: Knife : Cut") test the **relationship**: part–whole, cause–effect, tool–function, genus–species, synonym, antonym, producer–product, degree, sequence. First find the relation between the first pair, then apply it to the second pair.

## Chapter 8: Venn Diagrams and Testing Validity

### 8.1 Basics

Venn diagrams (John **Venn**) represent classes as overlapping circles. They follow the **Boolean** interpretation. A two-circle diagram has **4 regions** (including outside); a three-circle diagram has **8 regions**.

- **Shading** an area means the area is **empty**.

- An **X** means the area has **at least one member**.

- An X on a boundary line means the member is in one of the two regions, but it is unknown which.

### 8.2 Diagramming the four propositions

| Proposition        | Diagram                           |
|--------------------|-----------------------------------|
| A: All S is P      | Shade the part of S **outside** P |
| E: No S is P       | Shade the **overlap** of S and P  |
| I: Some S is P     | Put an X in the **overlap**       |
| O: Some S is not P | Put an X in S **outside** P       |

### 8.3 Testing a syllogism

1.  Draw three overlapping circles labelled S, P and M.

2.  Diagram the **universal** premise first (shading), then the particular premise (X).

3.  **Do not diagram the conclusion.**

4.  Check whether the conclusion is already shown. If yes, the syllogism is **valid**; if not, it is **invalid**.

5.  When an X can fall in two regions, place it on the line; a conclusion needing the X in a definite region is then not established.

**Worked example.** All A are B; All B are C; therefore All A are C. Shade A outside B; shade B outside C. The part of A outside C is then fully shaded, so the conclusion is already shown. Valid (Barbara).

**Existential fallacy:** because Venn diagrams use the Boolean view, a syllogism needing existential import (for example AAI-1, universal premises with a particular conclusion) shows as **invalid** on the diagram.

### 8.4 Euler diagrams and everyday class relations

Euler diagrams show only the **actual** relationship between classes: one circle inside another (all S is P), separate circles (no S is P), overlapping circles (some S is P), identical circles (same members).

**Standard class-relation patterns (frequent in exams):**

- *Dog, Cat, Animal:* two separate circles inside a larger circle.

- *Mother, Sister, Woman:* two overlapping circles inside the Woman circle (a woman may be both).

- *Doctors, Women, Teachers:* the circles overlap each other as the data allow; test each stated relation.

- *Man, Woman, Human:* two separate circles inside the Human circle.

- *Tiger, Lion, Carnivore:* two separate circles inside the Carnivore circle.

## Chapter 9: Indian Logic: Means of Knowledge (Pramana Theory)

### 9.1 The four factors of knowledge (Nyaya)

Indian epistemology asks how valid knowledge arises. Nyaya names four factors:

| Term                       | Meaning                                   |
|----------------------------|-------------------------------------------|
| **Pramata**                | The knower (subject)                      |
| **Prameya**                | The object of knowledge                   |
| **Pramana**                | The means (instrument) of valid knowledge |
| **Prama** (or **Pramiti**) | Valid knowledge, the result               |

**Prama** is *yathartha anubhava*, true (right) experience (Tarkasamgraha). Cognition (*buddhi*) is divided into **smriti** (memory) and **anubhava** (experience). Anubhava is **prama** (valid) or **aprama** (invalid, covering *samshaya* doubt, *viparyaya* error and *tarka* hypothetical reasoning). **Smriti is not counted a pramana** because it only reproduces an earlier experience and is not a fresh cognition.

### 9.2 Number of pramanas accepted by each school (very high-yield)

| School                         | Number  | Pramanas accepted                                                                          |
|--------------------------------|---------|--------------------------------------------------------------------------------------------|
| **Charvaka**                   | 1       | Pratyaksha only                                                                            |
| **Vaisheshika**                | 2       | Pratyaksha, Anumana                                                                        |
| **Buddhism**                   | 2       | Pratyaksha, Anumana                                                                        |
| **Samkhya**                    | 3       | Pratyaksha, Anumana, Shabda                                                                |
| **Yoga**                       | 3       | Pratyaksha, Anumana, Shabda                                                                |
| **Jainism**                    | 2 broad | Pratyaksha and Paroksha (paroksha includes smriti, pratyabhijna, tarka, anumana and agama) |
| **Nyaya**                      | 4       | Pratyaksha, Anumana, Upamana, Shabda                                                       |
| **Prabhakara Mimamsa**         | 5       | The four of Nyaya + Arthapatti (no Anupalabdhi)                                            |
| **Bhatta Mimamsa**             | 6       | All six                                                                                    |
| **Advaita Vedanta**            | 6       | All six                                                                                    |
| **Vishishtadvaita (Ramanuja)** | 3       | Pratyaksha, Anumana, Shabda                                                                |
| **Dvaita (Madhva)**            | 3       | Pratyaksha, Anumana, Agama                                                                 |

**Memory aid:** *1-2-2-3-3-4-5-6-6.* Charvaka (1), Vaisheshika and Buddhism (2), Samkhya and Yoga (3), Nyaya (4), Prabhakara (5), Bhatta and Advaita (6).

### 9.3 Key texts and authors

| Work                                                                     | Author                                                                             |
|--------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| Nyaya Sutra                                                              | Gautama (Akshapada)                                                                |
| Nyaya Bhashya                                                            | Vatsyayana                                                                         |
| Nyayavartika                                                             | Uddyotakara                                                                        |
| Nyayamanjari                                                             | Jayanta Bhatta                                                                     |
| Nyayakusumanjali                                                         | Udayana                                                                            |
| Tattvachintamani (founder of Navya-Nyaya; four khandas, one per pramana) | Gangesha Upadhyaya                                                                 |
| Tarkasamgraha                                                            | Annambhatta                                                                        |
| Tarkabhasha                                                              | Keshava Mishra                                                                     |
| Vaisheshika Sutra                                                        | Kanada                                                                             |
| Padarthadharmasamgraha (Prashastapada Bhashya)                           | Prashastapada                                                                      |
| Mimamsa Sutra                                                            | Jaimini (commentary: Shabara; Shlokavartika: Kumarila Bhatta; Brihati: Prabhakara) |
| Samkhya Karika                                                           | Ishvarakrishna                                                                     |
| Pramanasamuccaya                                                         | Dignaga                                                                            |
| Nyayabindu                                                               | Dharmakirti                                                                        |
| Vedanta Paribhasha                                                       | Dharmaraja Adhvarindra                                                             |
| Brihaspati Sutra (Charvaka)                                              | Brihaspati                                                                         |

**Nyaya Sutra** lists **16 padarthas** (categories of discussion, from pramana to nigrahasthana) and **12 prameyas** (atman, sharira, indriya, artha, buddhi, manas, pravritti, dosha, pretyabhava, phala, duhkha, apavarga). Discussion types: **vada** (honest debate for truth), **jalpa** (wrangling to win) and **vitanda** (cavilling without a counter-thesis).

### 9.4 Validity of knowledge (pramanyavada)

- **Svatah pramanya:** knowledge is self-valid in origin and ascertainment (Mimamsa, held by Prabhakara and Bhatta; Advaita for the ascertainment of validity).

- **Paratah pramanya:** validity is established by something external (Nyaya, held for both origin and ascertainment; Buddhism partly).

## Chapter 10: Pratyaksha (Perception)

### 10.1 Definition

Nyaya Sutra: perception is knowledge produced by **contact of sense organ and object**, which is **avyapadeshya** (not dependent on verbal designation), **avyabhicari** (non-erroneous) and **vyavasayatmaka** (determinate). Buddhist logic differs: **Dignaga** defines it as **kalpanapodha** (free from conceptual construction); **Dharmakirti** adds **abhranta** (non-erroneous). For Buddhists the object of perception is **svalakshana** (unique particular) and the object of inference is **samanyalakshana** (universal). Samkhya defines it as the ascertainment of each object through contact with the senses.

### 10.2 Classification

**By nature:**

- **Nirvikalpaka (indeterminate):** first bare apprehension; grasps the object without qualifiers (just "something"). Buddhists accept only this as valid.

- **Savikalpaka (determinate):** grasps the object with qualifiers ("This is a cow"). Nyaya and Mimamsa accept both as valid.

- **Pratyabhijna (recognition):** "This is the same Devadatta I met earlier."

**By contact:**

- **Laukika (ordinary):** six kinds of sense-object contact (*sannikarsha*).

- **Alaukika (extraordinary):** three kinds.

### 10.3 The six ordinary contacts (high-yield)

| Contact                        | Meaning                                    | Example                                                           |
|--------------------------------|--------------------------------------------|-------------------------------------------------------------------|
| **Samyoga**                    | Conjunction                                | Eye with pot (substance)                                          |
| **Samyukta-samavaya**          | Inherence in what is in conjunction        | Eye perceiving the colour of the pot                              |
| **Samyukta-samaveta-samavaya** | Inherence in what inheres in the conjoined | Eye perceiving colour-ness (universal) in the colour              |
| **Samavaya**                   | Inherence                                  | Ear perceiving sound (sound inheres in akasha, which is the ear)  |
| **Samaveta-samavaya**          | Inherence in what inheres                  | Ear perceiving sound-ness (universal in sound)                    |
| **Visheshana-visheshya-bhava** | Relation of qualifier and qualified        | Perception of absence (*abhava*): "There is no pot on the ground" |

**Memory:** the first three go with the substance (pot) through the eye or skin; the next two go with sound through the ear; the last is for absence.

### 10.4 The three extraordinary (alaukika) contacts

1.  **Samanyalakshana:** perception of all members of a class through the universal (seeing one smoke-instance gives knowledge of smokeness, and thus of all smoke). It is the basis for Nyaya's account of the **universality of vyapti**.

2.  **Jnanalakshana:** a previous cognition acts as the contact (seeing sandalwood and perceiving "fragrant sandalwood"; seeing ice and "feeling" it cold).

3.  **Yogaja:** perception of past, future, subtle and distant objects by yogic power. It is of two kinds: **yukta** (those in constant meditation, perceiving all) and **yunjana** (those in the process of attaining power, who need support).

**Other points:** **Anuvyavasaya** is introspective awareness of a cognition ("I know that I know the pot"). Internal states (pleasure, pain) are perceived by **manas** (mind). The organs are constituted by elements: smell by earth, taste by water, sight by fire, touch by air, hearing by akasha (ether). In Samkhya the organs derive from **ahamkara**.

**Jain view of knowledge:** *Pratyaksha* includes **avadhi**, **manahparyaya** and **kevala**; *paroksha* (indirect) has five forms: **mati-based smriti, pratyabhijna, tarka, anumana and agama**. (The standard memory list is smriti, pratyabhijna, tarka, anumana, agama.)

## Chapter 11: Anumana (Inference)

### 11.1 Meaning and process

**Anumana** means "knowledge that follows other knowledge" (*anu* = after, *mana* = knowing). Nyaya Sutra calls it **tatpurvaka** (preceded by perception). It rests on **vyapti** (invariable concomitance).

**Technical terms:**

| Term                      | Meaning                                                   | Western equivalent |
|---------------------------|-----------------------------------------------------------|--------------------|
| **Paksha** (Dharmi)       | Minor term; locus where the sadhya is to be proved (hill) | Minor term         |
| **Sadhya** (Dharma)       | Major term; what is to be proved (fire)                   | Major term         |
| **Hetu** (Linga, Sadhana) | Reason or middle term (smoke)                             | Middle term        |
| **Sapaksha**              | Locus where sadhya is certainly present (kitchen)         |                    |
| **Vipaksha**              | Locus where sadhya is certainly absent (lake)             |                    |
| **Vyapya**                | That which is pervaded (smoke)                            |                    |
| **Vyapaka**               | That which pervades (fire)                                |                    |
| **Pakshadharmata**        | Presence of the hetu in the paksha                        |                    |
| **Anumiti**               | Inferential conclusion (the result)                       | Conclusion         |
| **Anumana**               | The instrument (karana)                                   |                    |

**Steps (Navya-Nyaya):** (1) perception of hetu in paksha; (2) recall of **vyaptijnana** (knowledge of vyapti); (3) **paramarsha** or **lingaparamarsha** ("this hill has smoke pervaded by fire": the intermediate operation, or *vyapara*); (4) **anumiti**. In Tarkasamgraha, **lingaparamarsha is the karana (instrumental cause)** of anumana.

### 11.2 Kinds of inference

**(a) Gautama's threefold classification:**

| Kind                 | Basis                                              | Example                                                                                   |
|----------------------|----------------------------------------------------|-------------------------------------------------------------------------------------------|
| **Purvavat**         | Cause to effect                                    | Inferring rain from dark clouds                                                           |
| **Sheshavat**        | Effect to cause                                    | Inferring rain from a swollen river; fire from smoke                                      |
| **Samanyatodrishta** | Neither cause nor effect, from general observation | Inferring the existence of the self (atman), or the sun's motion from changes of position |

**(b) Purpose-based:**

- **Svartha:** inference **for oneself** (needs no formal statement; a psychological process).

- **Parartha:** inference **for others** (formally stated in five members to convince another).

**(c) Based on vyapti (Annambhatta, Navya-Nyaya):**

| Kind                | Features                                                         | Example                                                |
|---------------------|------------------------------------------------------------------|--------------------------------------------------------|
| **Kevalanvayi**     | Only positive concomitance; sadhya is universal; **no vipaksha** | The pot is nameable because it is knowable             |
| **Kevalavyatireki** | Only negative concomitance; **no sapaksha**                      | Earth differs from other elements because it has smell |
| **Anvayavyatireki** | Both positive and negative                                       | The hill has fire because it has smoke                 |

Other schools: Vaisheshika (Prashastapada) divides anumana into **drishta** and **samanyatodrishta**; Buddhists into **svartha** and **parartha** (Dignaga).

### 11.3 The five-membered syllogism (Nyaya, parartha anumana)

| Member (Avayava) | Function                                  | Example                                                |
|------------------|-------------------------------------------|--------------------------------------------------------|
| **1. Pratijna**  | Thesis or proposition                     | The hill has fire                                      |
| **2. Hetu**      | Reason                                    | Because it has smoke                                   |
| **3. Udaharana** | General rule with example (states vyapti) | Wherever there is smoke there is fire, as in a kitchen |
| **4. Upanaya**   | Application to the paksha (paramarsha)    | This hill has smoke pervaded by fire                   |
| **5. Nigamana**  | Conclusion                                | Therefore the hill has fire                            |

**Features:** it begins with the **thesis**, unlike the Aristotelian syllogism which begins with the major premise. It combines **deduction and induction**, because the example (udaharana) shows induction while the application and conclusion are deductive. The member that corresponds to the major premise is **udaharana**; to the minor premise, **upanaya**; to the conclusion, **nigamana**.

**Other schools:** Mimamsa and Vedanta accept **three members**; Buddhists accept **three** (Dignaga: pratijna, hetu, drishtanta); Bhadrabahu (Jaina) listed **ten**, though Jains regard **pratijna and hetu** as the essential minimum.

## Chapter 12: Vyapti (Invariable Relation)

### 12.1 Definition

**Vyapti** is the invariable concomitance (*sahacharya-niyama*) between hetu and sadhya: wherever the hetu is, the sadhya is. It is the **ground of inference**. Navya-Nyaya defines it, among other ways, as **"absence of the hetu in the loci of the absence of the sadhya"**.

### 12.2 Kinds

- **Anvaya-vyapti (positive):** wherever there is smoke there is fire.

- **Vyatireka-vyapti (negative):** where there is no fire there is no smoke.

- **Samavyapti (equal extension):** hetu and sadhya co-extensive (nameable and knowable).

- **Vishamavyapti (unequal extension):** hetu is less extensive than sadhya (smoke and fire); the relation is one-way only.

### 12.3 How vyapti is established (Nyaya)

1.  **Bhuyodarshana:** repeated observation of co-presence (anvaya-sahachara).

2.  **Vyabhichara-agraha:** non-observation of any counter-instance (the hetu without the sadhya).

3.  **Tarka:** hypothetical reasoning that removes doubts about possible exceptions ("if smoke were without fire it would be without a cause").

4.  **Absence of upadhi:** no conditioning factor.

5.  **Samanyalakshana pratyaksha:** explains how a universal relation is grasped from a few cases.

A single observation is not enough, and mere repeated observation alone cannot guarantee universality, because a future exception cannot be ruled out by observation alone. That is why tarka and the absence of upadhi are added.

### 12.4 Upadhi

**Upadhi** is a condition that is **pervasive (co-extensive) of the sadhya but not pervasive of the hetu**. Example: the inference "the hill has smoke because it has fire" fails because of the upadhi **wet fuel** (*ardrendhana*), present wherever smoke is, but not wherever fire is. "Violence is sinful because it is violence" has the upadhi **prohibition by scripture (nishiddhatva)**. An upadhi shows that the vyapti is **conditional**, not unconditional.

### 12.5 Other schools on vyapti

| School              | View                                                                                                                                                    |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Charvaka**        | Vyapti cannot be established with certainty; perception cannot reach all cases, and inference to establish it leads to **infinite regress (anavastha)** |
| **Nyaya**           | Observation of agreement + no contrary instance + tarka + no upadhi                                                                                     |
| **Buddhism**        | Based on **tadatmya** (identity of nature: "This is a tree because it is a simshapa") and **tadutpatti** (causal origin: fire and smoke)                |
| **Jainism**         | **Avinabhava** (inseparable relation), known by **tarka (uha)**; the one mark of a valid hetu is **anyathanupapannatva**                                |
| **Mimamsa/Vedanta** | Established by repeated observation and absence of contrary instance (without the Nyaya stress on tarka)                                                |

## Chapter 13: Hetvabhasas (Fallacies of Inference)

### 13.1 Meaning and the conditions of a valid hetu

A **hetvabhasa** is a "pseudo-reason": a hetu that appears valid but is not. Nyaya lays down **five conditions (lakshanas)** of a valid hetu. A fallacy occurs when one is violated.

| Condition                             | Meaning                                              | Violation gives                  |
|---------------------------------------|------------------------------------------------------|----------------------------------|
| **1. Paksha-sattva (pakshadharmata)** | Hetu is present in the paksha                        | **Asiddha**                      |
| **2. Sapaksha-sattva**                | Hetu is present in sapaksha                          | (Viruddha)                       |
| **3. Vipaksha-asattva**               | Hetu is absent from vipaksha                         | **Savyabhichara** (and Viruddha) |
| **4. Abadhitavishayatva**             | The sadhya is not contradicted by a stronger pramana | **Badhita**                      |
| **5. Asatpratipakshatva**             | No counter-hetu of equal strength                    | **Satpratipaksha**               |

### 13.2 The five hetvabhasas of Nyaya (Tarkasamgraha order)

| \#  | Fallacy            | Other name                   | Defect                                                                            | Example                                                                                |
|-----|--------------------|------------------------------|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| 1   | **Savyabhichara**  | Anaikantika (erratic)        | Hetu present in both sapaksha and vipaksha                                        | The hill has fire because it is knowable; sound is eternal because it is knowable      |
| 2   | **Viruddha**       | Contradictory                | Hetu proves the **opposite** of the sadhya; hetu is pervaded by absence of sadhya | Sound is eternal because it is produced; the hill is fireless because it has smoke     |
| 3   | **Satpratipaksha** | Prakaranasama                | A counter-reason of **equal strength** exists                                     | Sound is eternal because it is audible vs. sound is non-eternal because it is produced |
| 4   | **Asiddha**        | Sadhyasama                   | Hetu is **not established** in the paksha                                         | The sky-lotus is fragrant because it is a lotus                                        |
| 5   | **Badhita**        | Kalatita / Kalatyayapadishta | Sadhya is **contradicted by stronger evidence**                                   | Fire is cold because it is a substance; water is hot because it is a substance         |

**Memory order (S-V-S-A-B):** *Savyabhichara, Viruddha, Satpratipaksha, Asiddha, Badhita.*

### 13.3 Varieties (Tarkasamgraha)

**Savyabhichara (3 types):**

- **Sadharana:** hetu present in both sapaksha and vipaksha ("knowable").

- **Asadharana:** hetu present **only in the paksha**, absent from both sapaksha and vipaksha ("Sound is eternal because it is sound").

- **Anupasamhari:** the paksha includes everything, so no sapaksha or vipaksha exists ("All things are non-eternal because they are knowable").

**Asiddha (3 types):**

- **Ashrayasiddha:** the locus (paksha) itself is unreal ("The sky-lotus is fragrant because it is a lotus").

- **Svarupasiddha:** the hetu is absent from the paksha ("The lake has fire because it has smoke"; "Sound is non-eternal because it is visible").

- **Vyapyatvasiddha (Sopadhika):** the vyapti is conditioned by an upadhi ("The hill has smoke because it has fire").

### 13.4 Other lists

- **Dignaga** recognises **three** (Asiddha, Viruddha, Anaikantika); **Manikyanandi (Jaina)** adds **Akinchitkara** to these.

- **Gautama's Nyaya Sutra** names five: **Savyabhichara, Viruddha, Prakaranasama, Sadhyasama, Kalatita** (equal to Savyabhichara, Viruddha, Satpratipaksha, Asiddha, Badhita).

- **Dignaga's Hetucakra** (wheel of reasons) lists **nine** possible relations of hetu to sapaksha and vipaksha; only **two** are valid.

- Buddhist **trairupya** (three characteristics): *pakshadharmata, sapaksha-sattva, vipaksha-vyavritti.* **Dharmakirti's three hetus:** svabhava, karya, anupalabdhi.

## Chapter 14: Upamana (Comparison)

### 14.1 Definition and Steps

**Definition:** the means of knowing the relation between a **name and the thing it denotes** through **similarity** (*sadrishya*). Example: a forest-dweller says, "A gavaya is like a cow." The traveller later sees an animal resembling a cow and recognises it as a gavaya.

**Steps:** (1) hear the **atidesha-vakya** (the statement of similarity); (2) perceive the similar animal; (3) recall the statement; (4) knowledge: "This is a gavaya."

### 14.2 Views of the Schools

| School                              | Position                                                                                                                          |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| **Nyaya**                           | Independent pramana (knowledge of the relation between a word and its meaning)                                                    |
| **Bhatta Mimamsa and Advaita**      | Independent pramana, but it gives knowledge of the **similarity of the remembered object (cow) to the perceived object (gavaya)** |
| **Prabhakara Mimamsa**              | Accepts it, in a slightly different manner                                                                                        |
| **Vaisheshika, Buddhism, Charvaka** | Reject it (Vaisheshika reduces it to anumana)                                                                                     |
| **Samkhya**                         | Rejects it as an independent pramana                                                                                              |
| **Jainism**                         | Includes it in **pratyabhijna** (recognition)                                                                                     |

## Chapter 15: Shabda (Verbal Testimony)

### 15.1 Definition and Kinds

**Definition:** knowledge from the statement of a **reliable person (apta)**, one who knows the truth and speaks it faithfully. Words are meaningful only if understood.

**Kinds:**

- **Laukika** (ordinary reliable speech) and **Vaidika** (Vedic).

- **Drishtartha** (conveys perceptible matters) and **Adrishtartha** (conveys imperceptible matters such as heaven).

### 15.2 Conditions for Understanding a Sentence

| Condition             | Meaning                                                                              |
|-----------------------|--------------------------------------------------------------------------------------|
| **Akanksha**          | Mutual expectancy of words                                                           |
| **Yogyata**           | Compatibility; absence of contradiction in meaning ("He wets with fire" violates it) |
| **Sannidhi (asatti)** | Proximity/continuity of words in time                                                |
| **Tatparya**          | The speaker's intention or purport                                                   |

### 15.3 Vrittis and Theories of Word-Meaning

**Vrittis (powers of a word):** **Abhidha** (primary meaning), **Lakshana** (indicative or secondary meaning; "*Gangayam ghoshah*", "the hamlet on the Ganga" means on the bank) and **Vyanjana** (suggested meaning).

**Theories:** **Anvitabhidhanavada** (Prabhakara: words denote meanings already related) versus **Abhihitanvayavada** (Bhatta: words first convey their own meanings, then these are related). **Sphota** theory (Bhartrihari, grammarian). **Apoha** theory (Buddhists, Dignaga): word-meaning arises by **exclusion of others**.

### 15.4 Position of the Schools

**Schools:** Nyaya, Mimamsa, Samkhya, Yoga and Vedanta accept it. Charvaka rejects it; **Buddhists and Vaisheshikas reduce it to anumana.** Mimamsakas hold the Vedas are **apaurusheya** (not of human origin) and sound is **eternal**; Nyaya holds the Vedas are authored by **Ishvara** and sound is non-eternal. Six lingas (marks) help determine the purport of a Vedic text.

## Chapter 16: Arthapatti (Postulation or Implication)

### 16.1 Definition and Classic Example

**Definition:** presumption of a fact to explain another fact that would otherwise be inexplicable. The governing principle is **anyathanupapatti** (otherwise inexplicability).

**Classic example:** Devadatta is fat but does not eat during the day; hence he eats at night. The fact to be explained is the **upapadya**; the postulate is the **upapadaka**.

### 16.2 Kinds of Arthapatti

- **Drishtarthapatti:** based on a perceived fact (the fat Devadatta; a wet road implies rain).

- **Shrutarthapatti:** based on a heard statement ("Devadatta is alive and not at home" implies he is elsewhere).

Mimamsakas postulate **apurva** to explain how a sacrifice yields its fruit later.

### 16.3 Schools and Comparison with Anumana

**Position of schools:** accepted as independent by **Prabhakara, Bhatta Mimamsa and Advaita Vedanta**. **Nyaya, Vaisheshika and Buddhism** reduce it to **anumana** (specifically to a kevalavyatireki inference). Charvaka rejects it.

**Arthapatti versus anumana:** anumana rests on **vyapti**; arthapatti rests on the inconsistency of a known fact unless something is assumed.

## Chapter 17: Anupalabdhi (Non-apprehension)

### 17.1 Definition

**Definition:** the pramana for knowing **abhava** (non-existence); the cognition of absence by the non-perception of what would be perceived if it were present (**yogya anupalabdhi**, "fit non-perception").

### 17.2 Four Kinds of Abhava

| Kind                | Meaning                               | Example                           |
|---------------------|---------------------------------------|-----------------------------------|
| **Pragabhava**      | Prior non-existence                   | The pot in clay before it is made |
| **Pradhvamsabhava** | Posterior non-existence (destruction) | The pot after it is broken        |
| **Atyantabhava**    | Absolute (constant) non-existence     | The horn of a hare                |
| **Anyonyabhava**    | Mutual non-existence (difference)     | A pot is not a cloth              |

### 17.3 Position of the Schools

**Schools:** **Bhatta Mimamsa (Kumarila)** and **Advaita Vedanta** accept it as an independent pramana. **Prabhakara** explains absence as mere perception of the locus. **Nyaya** explains it as **perception** (through visheshana-visheshya-bhava contact). Buddhists treat **anupalabdhi as a type of hetu** (Dharmakirti) rather than a separate pramana.

## Chapter 18: Theories of Error (Khyativada)

### 18.1 The Six Theories of Error

These explain illusion, for example mistaking a shell for silver.

| Theory                  | School                     | Explanation                                                                                                |
|-------------------------|----------------------------|------------------------------------------------------------------------------------------------------------|
| **Anyathakhyati**       | Nyaya (and Vaisheshika)    | Perceiving a thing as something other than it is; real silver elsewhere is wrongly attributed to the shell |
| **Akhyati**             | Prabhakara Mimamsa         | Non-apprehension of the distinction between two cognitions (perception and memory)                         |
| **Atmakhyati**          | Yogacara Buddhism          | Projection of an idea of consciousness onto the external object                                            |
| **Asatkhyati**          | Madhyamika Buddhism        | The perception of a non-existent object                                                                    |
| **Anirvachaniyakhyati** | Advaita Vedanta            | The silver is **indescribable (anirvachaniya)** as real or unreal; produced by avidya                      |
| **Satkhyati**           | Ramanuja (Vishishtadvaita) | Everything perceived is real (partial real elements exist in the object)                                   |

### 18.2 Jaina Doctrines Frequently Asked

**Jaina doctrines frequently asked:** **Anekantavada** (many-sidedness of reality); **Nayavada** (partial standpoints); **Syadvada / Saptabhangi** (seven modes of predication: *syad asti*, *syad nasti*, and so on).

## Chapter 19: Quick Revision and Exam Strategy

### 19.1 One-Page Memory Sheet

- **Argument:** premises + one conclusion; **valid/invalid** for deduction; **strong/weak** for induction; **true/false** for statements; **sound** = valid + true premises.

- **A E I O:** A distributes S; E both; I neither; O only P.

- **Square:** Contradictories A–O, E–I; Contraries A–E (both can be false); Subcontraries I–O (both can be true); Subalternation A→I, E→O.

- **Conversion:** A to I (limitation); E to E; I to I; O no. **Obversion:** all. **Contraposition:** A, O (and E by limitation); not I.

- **Syllogism:** 3 terms, 64 moods, 4 figures, 256 forms, 24 valid, 15 unconditional (Boolean). Middle term distributed at least once; no two negative premises; no two particular premises; negative premise gives negative conclusion.

- **Figures:** F1 Barbara, Celarent, Darii, Ferio; F2 Cesare, Camestres, Festino, Baroko (conclusion always negative); F3 Disamis, Datisi, Bocardo, Ferison (conclusion always particular); F4 Camenes, Dimaris, Fresison.

- **Formal fallacies:** undistributed middle, illicit major/minor, exclusive premises, four terms, affirming the consequent, denying the antecedent.

- **Informal:** relevance (ad hominem, baculum, misericordiam, populum, verecundiam, ignorantiam, ignoratio elenchi); presumption (petitio, complex question, false cause, accident, converse accident); ambiguity (equivocation, amphiboly, accent, composition, division).

- **Language:** informative, expressive, directive. **Connotation** = intension; **denotation** = extension; inverse relation.

- **Mill:** Agreement, Difference, Joint, Residues, Concomitant Variation.

- **Venn:** shade = empty; X = at least one; test by diagramming premises only.

- **Pramana count:** 1 Charvaka; 2 Vaisheshika, Buddhism; 3 Samkhya, Yoga; 4 Nyaya; 5 Prabhakara; 6 Bhatta, Advaita.

- **Sannikarsha:** 6 laukika + 3 alaukika (samanyalakshana, jnanalakshana, yogaja).

- **Anumana:** purvavat, sheshavat, samanyatodrishta; svartha/parartha; kevalanvayi, kevalavyatireki, anvayavyatireki. **5 members:** Pratijna, Hetu, Udaharana, Upanaya, Nigamana.

- **Hetvabhasa:** Savyabhichara, Viruddha, Satpratipaksha, Asiddha, Badhita.

- **Upamana:** gavaya example; **Shabda:** akanksha, yogyata, sannidhi (+ tatparya); **Arthapatti:** anyathanupapatti, fat Devadatta; **Anupalabdhi:** four abhavas.

### 19.2 Exam Strategy by Question Type

1.  **For memory questions:** learn the tables (school-pramana count, authors, mnemonic names, contacts, hetvabhasa order). Questions often use a one-word answer pulled directly from these.

2.  **For concept questions:** always first classify the item (premise or conclusion, formal or informal, deductive or inductive, which hetvabhasa condition fails) and then apply the rule.

3.  **For analysis questions:** use elimination. In syllogism and Venn items, check distribution first. In assertion–reason items, decide whether each statement is true separately, then whether the reason explains the assertion. In matching items, anchor on the pair you are surest of.

### 19.3 Common Traps and Revision Plan

4.  **Common traps:** validity versus truth; contrary versus subcontrary; composition versus division; affirming the consequent versus modus ponens; savyabhichara versus viruddha (savyabhichara = hetu in both, viruddha = hetu only in vipaksha, proving the opposite); Prabhakara (5 pramanas) versus Bhatta (6); nirvikalpaka versus savikalpaka; kevalanvayi (no vipaksha) versus kevalavyatireki (no sapaksha).

5.  **Revision plan:** read each part once, then rewrite the tables from memory, then attempt the topic-wise MCQs and return to the matching section for every error.
