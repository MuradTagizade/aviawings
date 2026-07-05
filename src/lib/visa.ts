import raw from "@/data/visa-matrix.json";

/**
 * Visa requirement lookup backed by the open passport-index dataset
 * (github.com/ilyankou/passport-index-dataset, MIT). Refresh the JSON a few
 * times a year — see scripts note in README. Informational only; travellers
 * must verify with official sources.
 */

export type VisaStatus =
  | "visa_free" // with or without a known day limit
  | "e_visa"
  | "visa_on_arrival"
  | "eta"
  | "visa_required"
  | "no_admission"
  | "self";

export interface VisaResult {
  status: VisaStatus;
  /** Max stay in days when the dataset specifies one */
  days?: number;
  updated: string;
}

const countries: string[] = raw.countries;
const index = new Map(countries.map((c, i) => [c, i]));
const rows = raw.rows as Record<string, string>;

export const VISA_COUNTRIES = [...countries].sort();

export interface VisaMapEntry {
  code: string;
  status: VisaStatus;
  days?: number;
}

/** Every destination's requirement for one passport — powers the "where can I go" view. */
export function lookupPassportMap(passport: string): VisaMapEntry[] | null {
  const row = rows[passport.toUpperCase()];
  if (!row) return null;
  const cells = row.split("|");
  const map: Record<string, VisaStatus> = {
    VF: "visa_free",
    EV: "e_visa",
    VOA: "visa_on_arrival",
    ETA: "eta",
    VR: "visa_required",
    NA: "no_admission",
    SELF: "self",
  };
  const out: VisaMapEntry[] = [];
  countries.forEach((code, i) => {
    const cell = cells[i];
    if (!cell || cell === "SELF") return;
    if (/^\d+$/.test(cell)) {
      out.push({ code, status: "visa_free", days: parseInt(cell) });
    } else if (map[cell]) {
      out.push({ code, status: map[cell] });
    }
  });
  return out;
}

export function lookupVisa(passport: string, destination: string): VisaResult | null {
  const p = passport.toUpperCase();
  const d = destination.toUpperCase();
  if (p === d) return { status: "self", updated: raw.updated };
  const row = rows[p];
  const di = index.get(d);
  if (!row || di === undefined) return null;
  const cell = row.split("|")[di];
  if (!cell) return null;

  if (/^\d+$/.test(cell)) {
    return { status: "visa_free", days: parseInt(cell), updated: raw.updated };
  }
  const map: Record<string, VisaStatus> = {
    VF: "visa_free",
    EV: "e_visa",
    VOA: "visa_on_arrival",
    ETA: "eta",
    VR: "visa_required",
    NA: "no_admission",
    SELF: "self",
  };
  const status = map[cell];
  return status ? { status, updated: raw.updated } : null;
}
