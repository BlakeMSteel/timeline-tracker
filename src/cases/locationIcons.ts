import type { IconType } from "react-icons";
import {
  GiAncientRuins,
  GiAnchor,
  GiAnvil,
  GiBarn,
  GiBed,
  GiBeerStein,
  GiBookshelf,
  GiBubblingFlask,
  GiCampfire,
  GiCastle,
  GiCauldron,
  GiCaveEntrance,
  GiChest,
  GiCrossedSwords,
  GiCrystalBall,
  GiDungeonGate,
  GiForest,
  GiGreekTemple,
  GiHealthPotion,
  GiHut,
  GiMagicPortal,
  GiMining,
  GiMountains,
  GiObelisk,
  GiPalisade,
  GiPositionMarker,
  GiPrisoner,
  GiShintoShrine,
  GiShop,
  GiSpikedDragonHead,
  GiStoneBridge,
  GiStoneThrone,
  GiStoneTower,
  GiSwamp,
  GiTombstone,
  GiTreehouse,
  GiVillage,
  GiWatchtower,
  GiWaveCrest,
  GiWell,
  GiWindmill,
  GiWoodCabin,
} from "react-icons/gi";

interface LocationIconOption {
  key: string;
  label: string;
  Icon: IconType;
}

export const LOCATION_ICONS = [
  { key: "place", label: "Place", Icon: GiPositionMarker },
  { key: "castle", label: "Castle", Icon: GiCastle },
  { key: "tower", label: "Tower", Icon: GiStoneTower },
  { key: "fort", label: "Fort", Icon: GiPalisade },
  { key: "watchtower", label: "Watchtower", Icon: GiWatchtower },
  { key: "ruins", label: "Ruins", Icon: GiAncientRuins },
  { key: "home", label: "Cottage", Icon: GiWoodCabin },
  { key: "hut", label: "Hut", Icon: GiHut },
  { key: "village", label: "Village", Icon: GiVillage },
  { key: "treehouse", label: "Treehouse", Icon: GiTreehouse },
  { key: "bar", label: "Tavern", Icon: GiBeerStein },
  { key: "inn", label: "Inn", Icon: GiBed },
  { key: "store", label: "Market", Icon: GiShop },
  { key: "blacksmith", label: "Blacksmith", Icon: GiAnvil },
  { key: "alchemist", label: "Alchemist", Icon: GiBubblingFlask },
  { key: "hospital", label: "Healer", Icon: GiHealthPotion },
  { key: "witch", label: "Witch's hut", Icon: GiCauldron },
  { key: "seer", label: "Seer", Icon: GiCrystalBall },
  { key: "church", label: "Temple", Icon: GiGreekTemple },
  { key: "shrine", label: "Shrine", Icon: GiShintoShrine },
  { key: "library", label: "Library", Icon: GiBookshelf },
  { key: "bank", label: "Treasury", Icon: GiChest },
  { key: "barracks", label: "Barracks", Icon: GiCrossedSwords },
  { key: "throne", label: "Throne room", Icon: GiStoneThrone },
  { key: "prison", label: "Prison", Icon: GiPrisoner },
  { key: "graveyard", label: "Graveyard", Icon: GiTombstone },
  { key: "dungeon", label: "Dungeon", Icon: GiDungeonGate },
  { key: "cave", label: "Cave", Icon: GiCaveEntrance },
  { key: "mine", label: "Mine", Icon: GiMining },
  { key: "lair", label: "Dragon's lair", Icon: GiSpikedDragonHead },
  { key: "portal", label: "Portal", Icon: GiMagicPortal },
  { key: "monument", label: "Monument", Icon: GiObelisk },
  { key: "forest", label: "Forest", Icon: GiForest },
  { key: "mountain", label: "Mountains", Icon: GiMountains },
  { key: "swamp", label: "Swamp", Icon: GiSwamp },
  { key: "water", label: "Lake", Icon: GiWaveCrest },
  { key: "well", label: "Well", Icon: GiWell },
  { key: "camp", label: "Camp", Icon: GiCampfire },
  { key: "farm", label: "Farm", Icon: GiBarn },
  { key: "mill", label: "Windmill", Icon: GiWindmill },
  { key: "bridge", label: "Bridge", Icon: GiStoneBridge },
  { key: "boat", label: "Docks", Icon: GiAnchor },
] as const satisfies readonly LocationIconOption[];

export type LocationIconKey = (typeof LOCATION_ICONS)[number]["key"];

export const DEFAULT_LOCATION_ICON: LocationIconKey = "place";

export function locationIconOrDefault(
  key: LocationIconKey | undefined,
): LocationIconOption {
  return (
    LOCATION_ICONS.find((o) => o.key === key) ??
    LOCATION_ICONS.find((o) => o.key === DEFAULT_LOCATION_ICON)!
  );
}
