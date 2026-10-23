import { useState } from "react";
import type { Task } from "../../types/Types";
import "./TaskItem.css";
import { DeleteTask, UpdateTask } from "../../actions/Tasks/Tasks";
type TaskItemProps = {
  data: Task;
  RefreshPage: () => void;
};

function TaskItem({ data, RefreshPage }: TaskItemProps) {
  const date = new Date(data.created_at);
  const formattedDate = date.toLocaleDateString("ru-RU");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const checked = data.completed;

  async function mutate(remove = false) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (remove) await DeleteTask(data.id);
      else await UpdateTask(data.id, { completed: !data.completed });
      RefreshPage();
    } catch {
      setError("Не удалось изменить задачу. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="task-item" data-completed={data.completed}>
      <div className="task-item__check-title">
        <div className="task-item_checkbox">
          <input checked={checked} type="checkbox" disabled={busy} onChange={() => mutate()} />
        </div>
        <div className="task-item_content">
          <span
            className="content__title"
            style={{ textDecoration: checked ? "line-through" : "none" }}
          >
            {data.title}
          </span>
          <span className="content__description">{data.description}</span>
          <div className="content_tag-date">
            {data.folder && (
              <div className="content__tag">{data.folder?.title}</div>
            )}
            <span className="content__date">{formattedDate}</span>
          </div>
        </div>
      </div>
      {error && <span role="alert">{error}</span>}
      <button type="button" disabled={busy} aria-label="Удалить задачу" onClick={() => mutate(true)}>
      <img
        className="main-page__delete-img"
        src="/delete.png"
        alt="фото"
      />
      </button>
    </div>
  );
}
export default TaskItem;
