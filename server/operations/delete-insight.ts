import type { HasDBClient } from "../shared.ts";
import type * as insightsTable from "$tables/insights.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): { msg: string } | undefined => {
  console.log(`Deleting insight for id=${input.id}`);

  try {
    const result = input.db.sql<insightsTable.Row>`
      DELETE FROM insights WHERE id = ${input.id} RETURNING *
    `;

    if (result.length > 0) {
      const deletedInsight = { msg: "Insight deleted successfully" };
      console.log("Insight deleted successfully:", deletedInsight);
      return deletedInsight;
    } else {
      console.log("No insight found with the given id");
      return undefined;
    }
  } catch (error) {
    console.error("Error deleting insight: ", error);
    throw error;
  }
};
