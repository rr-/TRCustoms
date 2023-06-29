import styles from "./index.module.css";

interface FilePickerReorderTargetProps {
  position: number;
  reorderSourcePosition: number | null;
  reorderTargetPosition: number | null;
  setReorderSourcePosition: (position: number | null) => void;
  setReorderTargetPosition: (position: number | null) => void;
  onReorder: (position: number, targetPosition: number) => void;
}

const FilePickerReorderTarget = ({
  position,
  reorderSourcePosition,
  reorderTargetPosition,
  setReorderSourcePosition,
  setReorderTargetPosition,
  onReorder,
}: FilePickerReorderTargetProps) => {
  const ReorderEvents = {
    onDragEnter: (event: React.DragEvent) => {
      setReorderTargetPosition(position);
    },
    onDragLeave: (event: React.DragEvent) => {
      setReorderTargetPosition(null);
    },
    onDrop: (event: React.DragEvent) => {
      setReorderSourcePosition(null);
      setReorderTargetPosition(null);
      if (reorderSourcePosition !== null && reorderTargetPosition !== null) {
        const oldIndex = reorderSourcePosition;
        const newIndex =
          reorderTargetPosition > reorderSourcePosition
            ? reorderTargetPosition - 1
            : reorderTargetPosition;
        onReorder(oldIndex, newIndex);
      }
    },
  };

  return (
    <div
      className={`${styles.wrapper} ${
        reorderSourcePosition !== null ? styles.dropActive : ""
      } ${reorderTargetPosition === position ? styles.active : ""}`}
    >
      <div
        className={styles.zone}
        draggable={false}
        onDragStart={(event) => event.preventDefault()}
        onDragOver={(event) => event.preventDefault()}
        onDragEnter={(event) => ReorderEvents.onDragEnter(event)}
        onDragLeave={(event) => ReorderEvents.onDragLeave(event)}
        onDrop={(event) => ReorderEvents.onDrop(event)}
      >
        <div />
      </div>
    </div>
  );
};

export { FilePickerReorderTarget };
