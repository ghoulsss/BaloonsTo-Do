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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [folder, setFolder] = useState<number | null>(null);

  useEffect(() => {
    if (id === null) return;
    let cancelled = false;
    getFolders({ user_id: id }).then(data => {
      if (!cancelled) setFolders(data);
    }).catch(() => {
      if (!cancelled) setError("Не удалось загрузить папки");
    });
    return () => { cancelled = true; };
  }, [id]);

  const handelAdd = async () => {
    if (busy || !title.trim() || id === null) return;
    setBusy(true);
    setError("");
    try {
    const newTask = {
      title: title.trim(),
      description: description,
      folder_id: folder,
      user_id: id,
    };
    await CreateTasks(newTask);
    onClose();
    RefreshPage();
    } catch {
      setError("Не удалось сохранить. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-add-task">
        {error && <p role="alert">{error}</p>}
        <span className="modal-add-task__title">Добавить новую задачу</span>
        <div className="modal-add-task__title-input">
          <div className="title-input__title">Название задачи</div>
          <input
            maxLength={25}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input__input"
            placeholder="Что нужно сделать?"
          ></input>
        </div>
        <div className="modal-add-task__title-input">
          <div className="title-input__title">Описание (необязательно)</div>
          <input
            maxLength={150}
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
            value={folder ?? ""}
            onChange={e => setFolder(e.target.value ? Number(e.target.value) : null)}
          >
            <option value=""></option>
            {folders?.map((el) => (
              <option key={el.id} value={el.id}>{el.title}</option>
            ))}
          </select>
          <div className="modal-add-task__buttons">
            <button
              className="modal-add-task__button modal-add-task__button-cancel"
              onClick={onClose}
            >
              Отменить
            </button>
            <button disabled={busy || !title.trim() || id === null} onClick={handelAdd} className="modal-add-task__button">
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AddTask;
