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
    <div className={`folder-item ${active && "active"}`} onClick={onClick}>
      <div className="folder-item__content">
        <img src="../public/folder-48.png" alt="icon" />
        <span>{all ? "Все задачи" : data?.title}</span>
      </div>
      <span className="folder-item__counter">
        {count ? count : data?.count_tasks}
      </span>
    </div>
  );
}
export default FolderItem;
