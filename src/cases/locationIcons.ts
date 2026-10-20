import type { SvgIconComponent } from "@mui/icons-material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BusinessIcon from "@mui/icons-material/Business";
import ChurchIcon from "@mui/icons-material/Church";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FactoryIcon from "@mui/icons-material/Factory";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ForestIcon from "@mui/icons-material/Forest";
import HomeIcon from "@mui/icons-material/Home";
import HotelIcon from "@mui/icons-material/Hotel";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import MuseumIcon from "@mui/icons-material/Museum";
import ParkIcon from "@mui/icons-material/Park";
import PlaceIcon from "@mui/icons-material/Place";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SchoolIcon from "@mui/icons-material/School";
import StoreIcon from "@mui/icons-material/Store";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import TrainIcon from "@mui/icons-material/Train";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import WaterIcon from "@mui/icons-material/Water";

interface LocationIconOption {
  key: string;
  label: string;
  Icon: SvgIconComponent;
}

export const LOCATION_ICONS = [
  { key: "place", label: "Place", Icon: PlaceIcon },
  { key: "home", label: "Home", Icon: HomeIcon },
  { key: "apartment", label: "Apartment", Icon: ApartmentIcon },
  { key: "hotel", label: "Hotel", Icon: HotelIcon },
  { key: "office", label: "Office", Icon: BusinessIcon },
  { key: "store", label: "Shop", Icon: StoreIcon },
  { key: "restaurant", label: "Restaurant", Icon: RestaurantIcon },
  { key: "cafe", label: "Café", Icon: LocalCafeIcon },
  { key: "bar", label: "Bar", Icon: LocalBarIcon },
  { key: "bank", label: "Bank", Icon: AccountBalanceIcon },
  { key: "police", label: "Police", Icon: LocalPoliceIcon },
  { key: "hospital", label: "Hospital", Icon: LocalHospitalIcon },
  { key: "school", label: "School", Icon: SchoolIcon },
  { key: "library", label: "Library", Icon: LocalLibraryIcon },
  { key: "church", label: "Church", Icon: ChurchIcon },
  { key: "museum", label: "Museum", Icon: MuseumIcon },
  { key: "theater", label: "Theater", Icon: TheaterComedyIcon },
  { key: "gym", label: "Gym", Icon: FitnessCenterIcon },
  { key: "park", label: "Park", Icon: ParkIcon },
  { key: "forest", label: "Woods", Icon: ForestIcon },
  { key: "water", label: "Water", Icon: WaterIcon },
  { key: "warehouse", label: "Warehouse", Icon: WarehouseIcon },
  { key: "factory", label: "Factory", Icon: FactoryIcon },
  { key: "parking", label: "Parking", Icon: LocalParkingIcon },
  { key: "car", label: "Car", Icon: DirectionsCarIcon },
  { key: "bus", label: "Bus", Icon: DirectionsBusIcon },
  { key: "train", label: "Train", Icon: TrainIcon },
  { key: "boat", label: "Boat", Icon: DirectionsBoatIcon },
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
