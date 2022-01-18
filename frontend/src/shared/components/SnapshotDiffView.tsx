import "./SnapshotDiffView.css";
import type { DiffItem } from "src/services/snapshot.service";
import type { Snapshot } from "src/services/snapshot.service";
import { SnapshotChangeType } from "src/services/snapshot.service";
import { DiffType } from "src/services/snapshot.service";

interface SnapshotDiffViewProps {
  snapshot: Snapshot;
}

const formatDiffType = (diffType: DiffType): string => {
  switch (diffType) {
    case DiffType.Added:
      return "Added";
    case DiffType.Deleted:
      return "Deleted";
    case DiffType.Updated:
      return "Updated";
  }
};

const formatDiff = (item: DiffItem): React.ReactNode | null => {
  if (item.path === null && item?.old === null) {
    return "Initial revision";
  }

  if (item.path?.[0] === "is_approved") {
    if (item.new === true) {
      return "Approved the level";
    }
    if (item.new === false) {
      return "Disapproved the level";
    }
  }

  for (let path of ["description", "text"]) {
    if (item.path?.[0] === path) {
      return `Updated the ${path}`;
    }
  }

  for (let path of ["name"]) {
    if (item.path?.[0] === path) {
      return `Updated the ${path} (${item.old} → ${item.new})`;
    }
  }

  if (item.path?.[0] === "authors") {
    if (item.diff_type === DiffType.Added) {
      return <>{`Added author ${item.new.username}`}</>;
    } else if (item.diff_type === DiffType.Deleted) {
      return <>{`Removed author ${item.old.username}`}</>;
    }
  }

  for (let path of ["genre", "tag"]) {
    if (item.path?.[0] === `${path}s`) {
      if (item.diff_type === DiffType.Added) {
        return <>{`Added ${path} ${item.new.name}`}</>;
      } else if (item.diff_type === DiffType.Deleted) {
        return <>{`Removed ${path} ${item.old.name}`}</>;
      }
    }
  }

  for (let path of ["engine", "difficulty", "duration", "level"]) {
    if (item.path?.[0] === path) {
      if (item.path?.[1] === "name") {
        return `Updated the ${path} (${item.old} → ${item.new})`;
      }
      return null;
    }
  }

  for (let path of ["author", "uploader"]) {
    if (item.path?.[0] === path) {
      if (item.path?.[1] === "username") {
        return `Updated the ${path} (${item.old} → ${item.new})`;
      }
      return null;
    }
  }

  let matches = item.path?.[0]?.match(/rating_(\w+)/);
  if (matches) {
    return `Updated the ${matches?.[1]} rating (${item.old} → ${item.new})`;
  }

  if (item.path?.[0] === "screenshots") {
    if (item.diff_type === DiffType.Updated && item.path?.[2] === "position") {
      return (
        <>
          Reordered screenshots ({JSON.stringify(item.old)} →{" "}
          {JSON.stringify(item.new)})
        </>
      );
    } else if (item.diff_type === DiffType.Added) {
      return <>Added screenshot {item.new?.position}</>;
    } else if (item.diff_type === DiffType.Deleted) {
      return <>Removed screenshot {item.old?.position}</>;
    }
  }

  if (item.path?.[0] === "last_file") {
    // handled by files
    return null;
  }

  if (item.path?.[0] === "files") {
    if (item.diff_type === DiffType.Added) {
      return <>Uploaded a new level file</>;
    }
    if (item.diff_type === DiffType.Deleted) {
      return <>Removed a level file</>;
    }
  }

  return (
    <>
      {formatDiffType(item.diff_type)} {item.path.join(" ")} (
      {JSON.stringify(item.old)} → {JSON.stringify(item.new)})
    </>
  );
};

const SnapshotDiffView = ({ snapshot }: SnapshotDiffViewProps) => {
  return (
    <ul className="SnapshotDiffView--list">
      {snapshot.change_type === SnapshotChangeType.Delete ? (
        <li className="SnapshotDiffView--listItem">Deleted</li>
      ) : (
        snapshot.diff.map((item, i) => {
          const formatted = formatDiff(item);
          return formatted ? (
            <li key={i} className="SnapshotDiffView--listItem">
              {formatted}
            </li>
          ) : null;
        })
      )}
    </ul>
  );
};

export { SnapshotDiffView };
