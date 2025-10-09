import { useState } from "react";
import type { Task } from "../../types/Types";
import "./TaskItem.css";
import { DeleteTask, UpdateTask } from "../../actions/Tasks/Tasks";
type TaskItemProps = {
  data: Task;
  RefreshPage: () => void;
  userId: number | null;
};

function TaskItem({ data, RefreshPage, userId }: TaskItemProps) {
  const date = new Date(data.created_at);
  const formattedDate = date.toLocaleDateString("ru-RU");
  const [checked, setChecked] = useState(data.completed);

  async function handelChange() {
    const taskId = data.id;
    const taskData = {
      completed: !data.completed,
      user_id: userId,
    };
    await UpdateTask(taskId, taskData);
    RefreshPage();
    setChecked(!checked);
  }

  return (
    <div className="task-item">
      <div className="task-item__check-title">
        <div className="task-item_checkbox">
          <input checked={checked} type="checkbox" onChange={handelChange} />
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
      <img
        className="main-page__delete-img"
        src="../public/delete.png"
        alt="фото"
        onClick={async () => {
          await DeleteTask(data.id);
          RefreshPage();
        }}
      />
    </div>
  );
}
export default TaskItem;
