"""CUET PG mock data: reads _tools/cuet_pg/mocks_src/CUET_PG_LLM_Mock_Test_N.json and writes
cuet-pg/cuet-mock-data-N.js (window.CUETMOCK) and cuet-pg/cuet-mock-meta.js (window.CUETMOCKS). Standard library only."""
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent.parent / "cuet-pg"
SRC = HERE / "mocks_src"
LET = "ABCD"
THEMES = {1: "Foundation level", 2: "Building up", 3: "Exam level", 4: "Stepping up", 5: "Hard-leaning", 6: "Advanced", 7: "Advanced, case-law heavy", 8: "The toughest paper"}

def build():
    metas = []
    for n in range(1, 9):
        d = json.loads((SRC / f"CUET_PG_LLM_Mock_Test_{n}.json").read_text(encoding="utf-8"))
        qs = d["questions"]
        assert d["duration_minutes"] == 90 and len(qs) == 75 and d["marking_scheme"] == {"correct": 4, "incorrect": -1, "unattempted": 0}
        for i, q in enumerate(qs, 1):
            assert q["id"] == i and sorted(q["options"]) == list("ABCD") and q["answer"] in LET
        dc = {k: sum(q["difficulty"] == k for q in qs) for k in ("Easy", "Medium", "Hard")}
        theme = THEMES[n]
        blurb = (f"A full-length paper in the CUET PG LL.M. pattern with {dc['Easy']} easy, {dc['Medium']} medium and {dc['Hard']} hard questions across "
                 f"constitutional law, jurisprudence, contract, torts, criminal and procedural law, evidence, international law and more. ")
        blurb += {1: "A good first paper to find your baseline.", 8: "Take it when your preparation is nearly done."}.get(n, "Fresh questions, same marking scheme.")
        subjects = sorted({q["subject"] for q in qs})
        meta = {"n": n, "title": f"Mock Test {n}", "theme": theme, "kind": "Full-length paper", "blurb": blurb, "q": 75, "minutes": 90, "marks": 300,
                "easy": dc["Easy"], "medium": dc["Medium"], "hard": dc["Hard"], "subjects": subjects}
        metas.append(meta)
        data = {k: meta[k] for k in ("n", "title", "theme", "kind", "blurb", "minutes")}
        data.update({"pos": 4, "neg": 1, "marks": 300,
                     "q": [{"s": q["subject"], "d": q["difficulty"], "q": q["question"], "o": [q["options"][k] for k in LET], "a": LET.index(q["answer"]), "e": q["explanation"]} for q in qs]})
        js = "window.CUETMOCK=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
        assert "</script" not in js.lower()
        (OUT / f"cuet-mock-data-{n}.js").write_text(js, encoding="utf-8")
    (OUT / "cuet-mock-meta.js").write_text("window.CUETMOCKS=" + json.dumps(metas, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    return metas

if __name__ == "__main__":
    print([m["theme"] for m in build()])
