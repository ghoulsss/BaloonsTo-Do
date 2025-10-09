import { useEffect, useState } from "react";
import "./AddTask.css";
import type { Folder } from "../../../service/types/Types";
import { getFolders } from "../../../service/actions/Folder/Folder";
import { CreateTasks } from "../../../service/actions/Tasks/Tasks";

type AddTaskProps = {
  onClose: () => void;
  id: number | null;
  RefreshPage: () => void;
};
function AddTask({ onClose, id, RefreshPage }: AddTaskProps) {
  const [folders, setFolders] = useState<Folder[] | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [folder, setFolder] = useState<number | null>(null);

  useEffect(() => {
    async function loadFolders() {
      const data = await getFolders({ user_id: id });
      setFolders(data);
    }
    loadFolders();
  }, []);

  const handelAdd = async () => {
    const newTask = {
      title: title,
      description: description,
      folder_id: folder,
      user_id: id,
    };
    await CreateTasks(newTask);
    onClose();
    RefreshPage();
  };
  console.log(folder);

  return (
    <div className="modal-overlay">
      <div className="modal-add-task">
        <span className="modal-add-task__title">Добавить новую задачу</span>
        <div className="modal-add-task__title-input">
          <div className="title-input__title">Название задачи</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input__input"
            placeholder="Что нужно сделать?"
          ></input>
        </div>
        <div className="modal-add-task__title-input">
          <div className="title-input__title">Описание (необязательно)</div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="title-input__input"
            placeholder="Добавьте детали..."
          ></input>
        </div>
        <div className="modal-add-task__title-input">
          <div className="title-input__title">Папка</div>
          <select
            className="modal-add-task__select"
            onChange={(e) => {
              const folder = folders?.find((el) => el.title === e.target.value);
              setFolder(folder ? folder.id : null);
            }}
          >
            <option value=""></option>
            {folders?.map((el) => (
              <option value={el.title}>{el.title}</option>
            ))}
          </select>
          <div className="modal-add-task__buttons">
            <button
              className="modal-add-task__button modal-add-task__button-cancel"
              onClick={onClose}
            >
              Отменить
            </button>
            <button onClick={handelAdd} className="modal-add-task__button">
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AddTask;
