import { ensureDataLoaded, getAllPriceEntries, calculateGlobalSummary } from "@/data/priceData";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  await ensureDataLoaded();

  const allEntries = getAllPriceEntries();
  const summary = calculateGlobalSummary();

  return <HomeClient entries={allEntries} summary={summary} />;
}
