import { Trash2Icon } from "lucide-react";
import { cx } from "../../lib/cx.ts";
import styles from "./insights.module.css";
import type { Insight } from "../../schemas/insight.ts";
import { BRANDS } from "../../lib/consts.ts";

type InsightsProps = {
  insights: Insight[];
  className?: string;
  onInsightDeleted: () => void;
};

export const Insights = ({ insights, className, onInsightDeleted }: InsightsProps) => {
  const deleteInsight = (id: number) => {
    fetch(`/api/insights/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          onInsightDeleted();
        }
      })
      .catch((error) => {
        console.error("Error deleting insight:", error);
      });
  };

  return (
    <div className={cx(className)}>
      <h1 className={styles.heading}>Insights</h1>
      <div className={styles.list}>
        {insights?.length
          ? (
            insights.map((insight: Insight) => {
              const brand = BRANDS.find(b => b.id === insight.brand);
              return (
                <div className={styles.insight} key={insight.id}>
                  <div className={styles["insight-meta"]}>
                    <span>{brand?.name || `Brand ${insight.brand}`}</span>
                    <div className={styles["insight-meta-details"]}>
                      <span>{insight.createdAt.toLocaleDateString()}</span>
                      <Trash2Icon
                        className={styles["insight-delete"]}
                        onClick={() => deleteInsight(insight.id)}
                      />
                    </div>
                  </div>
                  <p className={styles["insight-content"]}>{insight.text}</p>
                </div>
              );
            })
          )
          : <p>We have no insight!</p>}
      </div>
    </div>
  );
};
