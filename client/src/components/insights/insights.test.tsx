import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Insights } from "./insights.tsx";

const TEST_INSIGHTS = [
  {
    id: 1,
    brandId: 1,
    date: new Date(),
    text: "Test insight",
  },
  {
    id: 2,
    brandId: 2,
    date: new Date(),
    text: "Another test insight",
  },
];

describe("insights", () => {
  it("renders", () => {
    const mockOnDelete = () => {};
    const { getByText } = render(
      <Insights insights={TEST_INSIGHTS} onInsightDeleted={mockOnDelete} />
    );
    expect(getByText(TEST_INSIGHTS[0].text)).toBeTruthy();
  });
});
