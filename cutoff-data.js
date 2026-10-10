/* cutoff-data.js: the ONLY file to edit when NTA publishes a new session's Law (058) cut-offs.
   Marks are out of 300 (Paper 1 = 100 + Paper 2 = 200). Each category holds [JRF, Assistant Professor, PhD only].
   Use null where a figure is not available or where published sources disagree (shown as a dash on the page).
   To add a session: copy the last block, change id/label/note, fill the five categories, set src, and put it at the END of the list.
   src: "nta" = checked against the NTA PDF; 2/3/4... = number of independent published compilations that match.
   The "expected range" and "safe target" on the page are calculated from the latest five sessions that have a PhD-only figure. */
window.NL_CUTOFF = {
  max: 300,
  nextSession: "December 2026",
  updated: "2026-10-10",
  cats: [
    { id: "UR",  name: "Unreserved" },
    { id: "OBC", name: "OBC (NCL)" },
    { id: "EWS", name: "EWS" },
    { id: "SC",  name: "SC" },
    { id: "ST",  name: "ST" }
  ],
  sessions: [
    { id: "d22", label: "Dec 2022", note: "", src: 2,
      UR: [236, 196, null], OBC: [214, 178, null], EWS: [214, 178, null], SC: [192, 164, null], ST: [184, 154, null] },
    { id: "j23", label: "Jun 2023", note: "OBC and EWS dashed: sources disagree, check the NTA PDF.", src: 2,
      UR: [204, 184, null], OBC: [null, null, null], EWS: [null, null, null], SC: [184, 160, null], ST: [178, 150, null] },
    { id: "d23", label: "Dec 2023", note: "", src: 3,
      UR: [200, 176, null], OBC: [190, 162, null], EWS: [190, 160, null], SC: [176, 152, null], ST: [166, 144, null] },
    { id: "j24", label: "Jun 2024", note: "Held as a re-examination (Aug to Sep 2024).", src: 4,
      UR: [216, 188, 166], OBC: [204, 174, 154], EWS: [206, 172, 148], SC: [188, 162, 144], ST: [184, 154, 138] },
    { id: "d24", label: "Dec 2024", note: "Examination held in January 2025.", src: 4,
      UR: [218, 194, 174], OBC: [202, 178, 158], EWS: [208, 180, 156], SC: [190, 166, 148], ST: [190, 156, 138] },
    { id: "j25", label: "Jun 2025", note: "", src: "nta",
      UR: [200, 178, 158], OBC: [190, 166, 146], EWS: [194, 164, 142], SC: [178, 156, 140], ST: [176, 150, 134] },
    { id: "d25", label: "Dec 2025", note: "Cut-offs released in February 2026.", src: 3,
      UR: [218, 188, 166], OBC: [202, 172, 154], EWS: [210, 174, 150], SC: [196, 162, 144], ST: [182, 156, 140] },
    { id: "j26", label: "Jun 2026", note: "Cut-offs released on 28 August 2026.", src: 6,
      UR: [204, 178, 160], OBC: [190, 164, 148], EWS: [194, 164, 144], SC: [180, 154, 138], ST: [174, 150, 134] }
  ],
  /* Unreserved candidates placed in each band, where counts matched across sources: [JRF, Assistant Professor, PhD only] */
  ur_counts: { j24: [64, 872, 1989], d24: [55, 661, 1399], j25: [73, 1057, 2421] }
};
