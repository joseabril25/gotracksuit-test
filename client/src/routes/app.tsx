import { useEffect, useState } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import styles from "./app.module.css";
import type { Insight } from "../schemas/insight.ts";


export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);

  const fetchInsights = async () => {
    try {
      const res = await fetch(`/api/insights`);
      if (res.ok) {
        const data = await res.json();
        // Transform server data to match client schema
        const transformedData = data.map((item: Insight) => ({
          id: item.id,
          brand: item.brand,
          createdAt: new Date(item.createdAt),
          text: item.text,
        }));
        setInsights(transformedData);
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } 
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <main className={styles.main}>
      <Header onInsightAdded={fetchInsights} />
      <Insights className={styles.insights} insights={insights} onInsightDeleted={fetchInsights} />
    </main>
  );
};
