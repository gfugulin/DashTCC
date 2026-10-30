import fs from "fs";
import path from "path";
import { DashboardView } from "@/components/DashboardView";
import { OverviewData, AcademicUnit, FilterCubeItem } from "@/types/dashboard";

export default function Page() {
  const dataDir = path.join(process.cwd(), "public", "data");

  const overviewPath = path.join(dataDir, "overview.json");
  const unitsPath = path.join(dataDir, "academic-units.json");
  const filterCubePath = path.join(dataDir, "filter-cube.json");

  const overview: OverviewData = JSON.parse(
    fs.readFileSync(overviewPath, "utf-8")
  );
  const units: AcademicUnit[] = JSON.parse(
    fs.readFileSync(unitsPath, "utf-8")
  );
  const filterCube: FilterCubeItem[] = JSON.parse(
    fs.readFileSync(filterCubePath, "utf-8")
  );

  return (
    <DashboardView
      overview={overview}
      units={units}
      filterCube={filterCube}
    />
  );
}
