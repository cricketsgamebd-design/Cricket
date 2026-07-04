import type { TournamentConfig } from "./types";

export const TOURNAMENTS: Record<string, TournamentConfig> = {
  odi_world_cup: {
    id: "odi_world_cup",
    name: "ICC Cricket World Cup",
    shortName: "50-Over World Cup",
    emoji: "🏆",
    format: "group-knockout",
    description:
      "12 nations, two groups of six, everyone plays every group rival once. Top 4 from each group reach the Quarter-Finals.",
    teamIds: [
      "bangladesh", "india", "pakistan", "sri_lanka", "afghanistan", "england",
      "australia", "new_zealand", "south_africa", "west_indies", "zimbabwe", "ireland",
    ],
    groups: [
      { id: "A", name: "Group A", teamIds: ["india", "pakistan", "australia", "south_africa", "afghanistan", "zimbabwe"] },
      { id: "B", name: "Group B", teamIds: ["bangladesh", "sri_lanka", "england", "new_zealand", "west_indies", "ireland"] },
    ],
    advancePerGroup: 4,
  },

  t20_world_cup: {
    id: "t20_world_cup",
    name: "ICC T20 World Cup",
    shortName: "T20 World Cup",
    emoji: "🌍",
    format: "group-knockout",
    description:
      "16 nations across two groups of eight. Top 4 from each group advance straight to the Quarter-Finals.",
    teamIds: [
      "india", "pakistan", "bangladesh", "ireland", "usa", "canada", "namibia", "nepal",
      "australia", "england", "new_zealand", "south_africa", "sri_lanka", "afghanistan", "west_indies", "netherlands",
    ],
    groups: [
      { id: "A", name: "Group A", teamIds: ["india", "pakistan", "bangladesh", "ireland", "usa", "canada", "namibia", "nepal"] },
      { id: "B", name: "Group B", teamIds: ["australia", "england", "new_zealand", "south_africa", "sri_lanka", "afghanistan", "west_indies", "netherlands"] },
    ],
    advancePerGroup: 4,
  },

  asia_cup: {
    id: "asia_cup",
    name: "Asia Cup",
    shortName: "Asia Cup (T20)",
    emoji: "🏆",
    format: "group-knockout",
    description:
      "8 Asian sides in two groups of four. Top 2 from each group go straight to the Semi-Finals.",
    teamIds: ["india", "pakistan", "bangladesh", "sri_lanka", "afghanistan", "uae", "nepal", "hong_kong"],
    groups: [
      { id: "A", name: "Group A", teamIds: ["india", "pakistan", "uae", "hong_kong"] },
      { id: "B", name: "Group B", teamIds: ["bangladesh", "sri_lanka", "afghanistan", "nepal"] },
    ],
    advancePerGroup: 2,
  },

  bpl: {
    id: "bpl",
    name: "Bangladesh Premier League",
    shortName: "BPL",
    emoji: "🇧🇩",
    format: "league-playoff",
    description: "8 franchises, home & away — every team plays every other team twice before the playoffs.",
    teamIds: [
      "fortune_barishal", "dhaka_capitals", "chittagong_kings", "rangpur_riders",
      "khulna_tigers", "sylhet_strikers", "rajshahi_royals", "comilla_victorians",
    ],
    homeAndAway: true,
  },

  ipl: {
    id: "ipl",
    name: "Indian Premier League",
    shortName: "IPL",
    emoji: "🇮🇳",
    format: "league-playoff",
    description: "10 franchises, home & away league phase, then the top 4 fight through the IPL-style playoffs.",
    teamIds: [
      "mumbai_indians", "chennai_super_kings", "royal_challengers", "kolkata_knight_riders", "delhi_capitals",
      "punjab_kings", "rajasthan_royals", "sunrisers_hyderabad", "gujarat_titans", "lucknow_super_giants",
    ],
    homeAndAway: true,
  },

  psl: {
    id: "psl",
    name: "Pakistan Super League",
    shortName: "PSL",
    emoji: "🇵🇰",
    format: "league-playoff",
    description: "6 franchises play a single league stage, then the top 4 advance into the playoffs.",
    teamIds: ["islamabad_united", "karachi_kings", "lahore_qalandars", "peshawar_zalmi", "quetta_gladiators", "multan_sultans"],
    homeAndAway: false,
  },

  lpl: {
    id: "lpl",
    name: "Lanka Premier League",
    shortName: "LPL",
    emoji: "🇱🇰",
    format: "league-playoff",
    description: "5 franchises play a single league stage, then the top 4 advance into the playoffs.",
    teamIds: ["colombo_strikers", "kandy_falcons", "galle_marvels", "jaffna_kings", "dambulla_aura"],
    homeAndAway: false,
  },
};

export const TOURNAMENT_LIST = Object.values(TOURNAMENTS);
