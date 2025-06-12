import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import type { Insight } from "$models/insight.ts";
import { withDB } from "../testing.ts";
import createInsight from "./create-insight.ts";

describe("creating insights in the database", () => {
  describe("creating a new insight", () => {
    withDB((fixture) => {
      let result: Insight;
      const testData = {
        brand: 1,
        text: "This is a test insight",
      };

      beforeAll(() => {
        result = createInsight({ db: fixture.db, data: testData });
      });

      it("returns the created insight with an id", () => {
        expect(result.id).toBeDefined();
        expect(typeof result.id).toBe("number");
      });

      it("returns the correct brand", () => {
        expect(result.brand).toBe(testData.brand);
      });

      it("returns the correct text", () => {
        expect(result.text).toBe(testData.text);
      });

      it("sets a createdAt date", () => {
        expect(result.createdAt).toBeInstanceOf(Date);
        // Check it's a recent date (within last minute)
        const now = new Date();
        const diff = now.getTime() - result.createdAt.getTime();
        expect(diff).toBeLessThan(60000); // Less than 1 minute
      });

      it("persists the insight in the database", () => {
        const insights = fixture.insights.selectAll();
        expect(insights.length).toBe(1);
        expect(insights[0].brand).toBe(testData.brand);
        expect(insights[0].text).toBe(testData.text);
      });
    });
  });

  describe("creating multiple insights", () => {
    withDB((fixture) => {
      let result1: Insight;
      let result2: Insight;

      beforeAll(() => {
        result1 = createInsight({
          db: fixture.db,
          data: { brand: 2, text: "First insight" },
        });
        result2 = createInsight({
          db: fixture.db,
          data: { brand: 3, text: "Second insight" },
        });
      });

      it("assigns unique ids", () => {
        expect(result1.id).not.toBe(result2.id);
      });

      it("stores both insights", () => {
        const insights = fixture.insights.selectAll();
        expect(insights.length).toBe(2);
      });
    });
  });

  describe("edge cases", () => {
    withDB((fixture) => {
      it("handles empty text", () => {
        const result = createInsight({
          db: fixture.db,
          data: { brand: 1, text: "" },
        });
        expect(result.text).toBe("");
      });

      it("handles very long text", () => {
        const longText = "a".repeat(1000);
        const result = createInsight({
          db: fixture.db,
          data: { brand: 1, text: longText },
        });
        expect(result.text).toBe(longText);
      });

      it("handles special characters in text", () => {
        const specialText = "Test with 'quotes' and \"double quotes\" and line\nbreaks";
        const result = createInsight({
          db: fixture.db,
          data: { brand: 1, text: specialText },
        });
        expect(result.text).toBe(specialText);
      });
    });
  });
});