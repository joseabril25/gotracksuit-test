import { useState } from "react";
import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps & {
  onInsightAdded?: () => void;
};

export const AddInsight = (props: AddInsightProps) => {
  const { onInsightAdded, ...modalProps } = props;
  const [brand, setBrand] = useState(BRANDS[0].id);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!text.trim()) {
      setError("Please enter an insight");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brand, text: text.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to create insight");
      }

      // Clear form and close modal
      setText("");
      setBrand(BRANDS[0].id);
      modalProps.onClose();
      
      // Notify parent to refresh the list
      onInsightAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal {...modalProps}>
      <h1 className={styles.heading}>Add a new insight</h1>
      <form className={styles.form} onSubmit={addInsight}>
        <label className={styles.field}>
          <select 
            className={styles["field-input"]}
            value={brand}
            onChange={(e) => setBrand(Number(e.target.value))}
            disabled={isSubmitting}
          >
            {BRANDS.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          Insight
          <textarea
            className={styles["field-input"]}
            rows={5}
            placeholder="Something insightful..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
          />
        </label>
        {error && (
          <div className={styles.error} style={{ color: "red", marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        <Button 
          className={styles.submit} 
          type="submit" 
          label={isSubmitting ? "Adding..." : "Add insight"}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
};
