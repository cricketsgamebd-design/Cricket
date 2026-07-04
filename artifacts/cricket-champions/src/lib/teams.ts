import type { Team } from "./types";

export const TEAMS: Record<string, Team> = {
  bangladesh: { id: "bangladesh", name: "Bangladesh", short: "BAN", flag: "🇧🇩", rating: 76, batting: 74, bowling: 77, color: "#006a4e" },
  india: { id: "india", name: "India", short: "IND", flag: "🇮🇳", rating: 92, batting: 93, bowling: 90, color: "#1a4fa0" },
  pakistan: { id: "pakistan", name: "Pakistan", short: "PAK", flag: "🇵🇰", rating: 85, batting: 83, bowling: 87, color: "#01411c" },
  sri_lanka: { id: "sri_lanka", name: "Sri Lanka", short: "SL", flag: "🇱🇰", rating: 80, batting: 79, bowling: 80, color: "#003a70" },
  afghanistan: { id: "afghanistan", name: "Afghanistan", short: "AFG", flag: "🇦🇫", rating: 79, batting: 76, bowling: 83, color: "#0e7e3d" },
  england: { id: "england", name: "England", short: "ENG", flag: "🏴", rating: 88, batting: 89, bowling: 87, color: "#0a2b5c" },
  australia: { id: "australia", name: "Australia", short: "AUS", flag: "🇦🇺", rating: 91, batting: 90, bowling: 91, color: "#e8b100" },
  new_zealand: { id: "new_zealand", name: "New Zealand", short: "NZ", flag: "🇳🇿", rating: 87, batting: 85, bowling: 88, color: "#111111" },
  south_africa: { id: "south_africa", name: "South Africa", short: "SA", flag: "🇿🇦", rating: 86, batting: 86, bowling: 86, color: "#007847" },
  west_indies: { id: "west_indies", name: "West Indies", short: "WI", flag: "🏴‍☠️", rating: 78, batting: 80, bowling: 74, color: "#7b0d1e" },
  zimbabwe: { id: "zimbabwe", name: "Zimbabwe", short: "ZIM", flag: "🇿🇼", rating: 65, batting: 63, bowling: 66, color: "#d40000" },
  ireland: { id: "ireland", name: "Ireland", short: "IRE", flag: "🇮🇪", rating: 66, batting: 65, bowling: 66, color: "#169b62" },
  usa: { id: "usa", name: "USA", short: "USA", flag: "🇺🇸", rating: 63, batting: 62, bowling: 64, color: "#b22234" },
  canada: { id: "canada", name: "Canada", short: "CAN", flag: "🇨🇦", rating: 58, batting: 57, bowling: 58, color: "#d80621" },
  namibia: { id: "namibia", name: "Namibia", short: "NAM", flag: "🇳🇦", rating: 60, batting: 59, bowling: 61, color: "#003580" },
  nepal: { id: "nepal", name: "Nepal", short: "NEP", flag: "🇳🇵", rating: 62, batting: 62, bowling: 61, color: "#dc143c" },
  netherlands: { id: "netherlands", name: "Netherlands", short: "NED", flag: "🇳🇱", rating: 70, batting: 70, bowling: 69, color: "#ae1c28" },
  uae: { id: "uae", name: "UAE", short: "UAE", flag: "🇦🇪", rating: 59, batting: 58, bowling: 60, color: "#00732f" },
  hong_kong: { id: "hong_kong", name: "Hong Kong", short: "HK", flag: "🇭🇰", rating: 55, batting: 54, bowling: 56, color: "#de2910" },

  fortune_barishal: { id: "fortune_barishal", name: "Fortune Barishal", short: "BAR", flag: "🟢", rating: 79, batting: 78, bowling: 79, color: "#0f6b3a" },
  dhaka_capitals: { id: "dhaka_capitals", name: "Dhaka Capitals", short: "DHK", flag: "🔵", rating: 77, batting: 77, bowling: 76, color: "#1447a3" },
  chittagong_kings: { id: "chittagong_kings", name: "Chittagong Kings", short: "CTG", flag: "🟠", rating: 75, batting: 74, bowling: 75, color: "#d4640a" },
  rangpur_riders: { id: "rangpur_riders", name: "Rangpur Riders", short: "RAN", flag: "🟣", rating: 80, batting: 81, bowling: 78, color: "#6a1b9a" },
  khulna_tigers: { id: "khulna_tigers", name: "Khulna Tigers", short: "KHU", flag: "🟡", rating: 74, batting: 73, bowling: 75, color: "#c9a227" },
  sylhet_strikers: { id: "sylhet_strikers", name: "Sylhet Strikers", short: "SYL", flag: "🔴", rating: 73, batting: 72, bowling: 73, color: "#a3122f" },
  rajshahi_royals: { id: "rajshahi_royals", name: "Rajshahi Royals", short: "RAJ", flag: "🟤", rating: 72, batting: 71, bowling: 72, color: "#5a3a22" },
  comilla_victorians: { id: "comilla_victorians", name: "Comilla Victorians", short: "COM", flag: "⚫", rating: 78, batting: 77, bowling: 78, color: "#1a1a1a" },

  mumbai_indians: { id: "mumbai_indians", name: "Mumbai Indians", short: "MI", flag: "🔵", rating: 86, batting: 86, bowling: 85, color: "#004ba0" },
  chennai_super_kings: { id: "chennai_super_kings", name: "Chennai Super Kings", short: "CSK", flag: "🟡", rating: 87, batting: 86, bowling: 87, color: "#f9cd05" },
  royal_challengers: { id: "royal_challengers", name: "Royal Challengers Bengaluru", short: "RCB", flag: "🔴", rating: 84, batting: 88, bowling: 79, color: "#d11d2c" },
  kolkata_knight_riders: { id: "kolkata_knight_riders", name: "Kolkata Knight Riders", short: "KKR", flag: "🟣", rating: 85, batting: 84, bowling: 86, color: "#3a225d" },
  delhi_capitals: { id: "delhi_capitals", name: "Delhi Capitals", short: "DC", flag: "🔷", rating: 80, batting: 79, bowling: 80, color: "#17479e" },
  punjab_kings: { id: "punjab_kings", name: "Punjab Kings", short: "PBKS", flag: "🔴", rating: 78, batting: 79, bowling: 76, color: "#a71930" },
  rajasthan_royals: { id: "rajasthan_royals", name: "Rajasthan Royals", short: "RR", flag: "🩷", rating: 82, batting: 83, bowling: 80, color: "#254aa5" },
  sunrisers_hyderabad: { id: "sunrisers_hyderabad", name: "Sunrisers Hyderabad", short: "SRH", flag: "🟠", rating: 81, batting: 84, bowling: 78, color: "#f26522" },
  gujarat_titans: { id: "gujarat_titans", name: "Gujarat Titans", short: "GT", flag: "🔷", rating: 83, batting: 82, bowling: 84, color: "#1c1c3a" },
  lucknow_super_giants: { id: "lucknow_super_giants", name: "Lucknow Super Giants", short: "LSG", flag: "🟢", rating: 79, batting: 78, bowling: 79, color: "#0057a6" },

  islamabad_united: { id: "islamabad_united", name: "Islamabad United", short: "ISL", flag: "🔴", rating: 80, batting: 79, bowling: 81, color: "#a71930" },
  karachi_kings: { id: "karachi_kings", name: "Karachi Kings", short: "KAR", flag: "🟢", rating: 76, batting: 76, bowling: 76, color: "#00694e" },
  lahore_qalandars: { id: "lahore_qalandars", name: "Lahore Qalandars", short: "LAH", flag: "🟩", rating: 83, batting: 82, bowling: 84, color: "#046a38" },
  peshawar_zalmi: { id: "peshawar_zalmi", name: "Peshawar Zalmi", short: "PES", flag: "🟡", rating: 77, batting: 77, bowling: 76, color: "#f9d616" },
  quetta_gladiators: { id: "quetta_gladiators", name: "Quetta Gladiators", short: "QUE", flag: "🟣", rating: 78, batting: 78, bowling: 78, color: "#5b2a86" },
  multan_sultans: { id: "multan_sultans", name: "Multan Sultans", short: "MUL", flag: "🔷", rating: 81, batting: 80, bowling: 82, color: "#1a3c8f" },

  colombo_strikers: { id: "colombo_strikers", name: "Colombo Strikers", short: "CST", flag: "🟨", rating: 76, batting: 76, bowling: 75, color: "#f2b91a" },
  kandy_falcons: { id: "kandy_falcons", name: "Kandy Falcons", short: "KFA", flag: "🟩", rating: 74, batting: 73, bowling: 75, color: "#1e7a3c" },
  galle_marvels: { id: "galle_marvels", name: "Galle Marvels", short: "GMV", flag: "🟦", rating: 73, batting: 72, bowling: 74, color: "#1a5aa6" },
  jaffna_kings: { id: "jaffna_kings", name: "Jaffna Kings", short: "JKS", flag: "🟥", rating: 79, batting: 78, bowling: 79, color: "#b0202e" },
  dambulla_aura: { id: "dambulla_aura", name: "Dambulla Aura", short: "DAU", flag: "🟪", rating: 72, batting: 71, bowling: 73, color: "#5c2d82" },
};

export function getTeam(id: string | null | undefined): Team | null {
  if (!id) return null;
  return TEAMS[id] ?? null;
}
