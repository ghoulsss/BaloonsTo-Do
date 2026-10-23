import { useState } from "react";
import "./AddFolder.css";
import { CreateFolder } from "../../../service/actions/Folder/Folder";

type AddFolderProps = {
  onClose: () => void;
  id: number | null;
  RefreshPage: () => void;
};
function AddFolder({ onClose, id, RefreshPage }: AddFolderProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");

  const handelAdd = async () => {
    if (busy || !title.trim() || id === null) return;
    setBusy(true);
    setError("");
    try {
    const newFolder = {
      title: title.trim(),
      user_id: id,
    };
    await CreateFolder(newFolder);
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
        <span className="modal-add-task__title">Добавить новую папку</span>
        <div className="modal-add-task__title-input">
          <div className="title-input__title">Название папки</div>
          <input
            maxLength={25}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input__input"
            placeholder="Как назвать папку?"
          ></input>
        </div>
        <div className="modal-add-task__title-input">
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
export default AddFolder;
