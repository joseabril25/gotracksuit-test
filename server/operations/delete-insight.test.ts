import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { withDB } from "../testing.ts";
import deleteInsight from "./delete-insight.ts";

describe("deleting insights from the database", () => {
  describe("deleting an existing insight", () => {
    withDB((fixture) => {
      let result: { msg: string } | undefined;

      beforeAll(() => {
        // Insert test data
        fixture.insights.insert([
          { brand: 1, createdAt: new Date().toISOString(), text: "Test insight 1" },
          { brand: 2, createdAt: new Date().toISOString(), text: "Test insight 2" },
        ]);

        // Delete the first insight
        result = deleteInsight({ db: fixture.db, id: 1 });
      });

      it("returns success message", () => {
        expect(result).toBeDefined();
        expect(result?.msg).toBe("Insight deleted successfully");
      });

      it("removes the insight from the database", () => {
        const insights = fixture.insights.selectAll();
        expect(insights.length).toBe(1);
        expect(insights[0].id).toBe(2);
      });

      it("does not affect other insights", () => {
        const insights = fixture.insights.selectAll();
        expect(insights[0].text).toBe("Test insight 2");
      });
    });
  });

  describe("deleting a non-existent insight", () => {
    withDB((fixture) => {
      let result: { msg: string } | undefined;

      beforeAll(() => {
        // Try to delete an insight that doesn't exist
        result = deleteInsight({ db: fixture.db, id: 999 });
      });

      it("returns undefined", () => {
        expect(result).toBeUndefined();
      });

      it("does not affect the database", () => {
        const insights = fixture.insights.selectAll();
        expect(insights.length).toBe(0);
      });
    });
  });

  describe("deleting from populated database", () => {
    withDB((fixture) => {
      beforeAll(() => {
        // Insert multiple test insights
        fixture.insights.insert([
          { brand: 1, createdAt: new Date().toISOString(), text: "Insight 1" },
          { brand: 2, createdAt: new Date().toISOString(), text: "Insight 2" },
          { brand: 3, createdAt: new Date().toISOString(), text: "Insight 3" },
        ]);
      });

      it("deletes only the specified insight", () => {
        deleteInsight({ db: fixture.db, id: 2 });
        
        const insights = fixture.insights.selectAll();
        expect(insights.length).toBe(2);
        
        const ids = insights.map(i => i.id);
        expect(ids).toContain(1);
        expect(ids).toContain(3);
        expect(ids).not.toContain(2);
      });

      it("can delete multiple insights sequentially", () => {
        deleteInsight({ db: fixture.db, id: 1 });
        deleteInsight({ db: fixture.db, id: 3 });
        
        const insights = fixture.insights.selectAll();
        expect(insights.length).toBe(0);
      });
    });
  });

  describe("edge cases", () => {
    withDB((fixture) => {
      it("handles string id that looks like a number", () => {
        // SQLite will coerce string to number
        const result = deleteInsight({ db: fixture.db, id: "999" as any });
        expect(result).toBeUndefined(); // No insight with id 999
      });

      it("handles negative id", () => {
        const result = deleteInsight({ db: fixture.db, id: -1 });
        expect(result).toBeUndefined(); // No insight with negative id
      });

      it("handles zero id", () => {
        const result = deleteInsight({ db: fixture.db, id: 0 });
        expect(result).toBeUndefined(); // No insight with id 0
      });
    });
  });
});