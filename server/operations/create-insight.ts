import type { Insight } from "$models/insight.ts";
import type { HasDBClient } from "../shared.ts";
import type * as insightsTable from "$tables/insights.ts";

type Input = HasDBClient;

type CreateInsightData = {
  brand: number;
  text: string;
};

export default (
  { db, data }: { db: Input["db"]; data: CreateInsightData },
): Insight => {
  console.log("Create Insights");
  try {
    const createdAt = new Date().toISOString();
    const result = db.sql<insightsTable.Row>`
      INSERT INTO insights (brand, text, createdAt) 
      VALUES (${data.brand}, ${data.text}, ${createdAt}) 
      RETURNING *
    `;

    console.log("Created insight successfully: ", result);
    return {
      id: result[0].id,
      brand: result[0].brand,
      text: result[0].text,
      createdAt: new Date(result[0].createdAt),
    };
  } catch (error) {
    console.error("Error creating insight: ", error);
    throw error;
  }
};
