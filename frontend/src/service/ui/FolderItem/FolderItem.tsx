import type { Folder } from "../../types/Types";
import "./FolderItem.css";

type FolderItemProps = {
  data?: Folder;
  all?: boolean;
  count?: number;
  active?: boolean;
  onClick?: () => void;
};

function FolderItem({ data, all, count, onClick, active }: FolderItemProps) {
  return (
    <button type="button" className={`folder-item ${active ? "active" : ""}`} onClick={onClick} aria-pressed={!!active}>
      <div className="folder-item__content">
        <img src="/folder-48.png" alt="icon" />
        <span>{all ? "Все задачи" : data?.title}</span>
      </div>
      <span className="folder-item__counter">
        {count ?? data?.count_tasks ?? 0}
      </span>
    </button>
  );
}
export default FolderItem;
