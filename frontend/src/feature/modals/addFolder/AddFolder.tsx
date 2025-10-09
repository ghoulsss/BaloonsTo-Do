import { useState } from "react";
import "./AddFolder.css";
import { CreateFolder } from "../../../service/actions/Folder/Folder";

type AddFolderProps = {
  onClose: () => void;
  id: number | null;
  RefreshPage: () => void;
};
function AddFolder({ onClose, id, RefreshPage }: AddFolderProps) {
  const [title, setTitle] = useState("");

  const handelAdd = async () => {
    const newFolder = {
      title: title,
      user_id: id,
    };
    await CreateFolder(newFolder);
    onClose();
    RefreshPage();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-add-task">
        <span className="modal-add-task__title">Добавить новую папку</span>
        <div className="modal-add-task__title-input">
          <div className="title-input__title">Название папки</div>
          <input
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
            <button onClick={handelAdd} className="modal-add-task__button">
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AddFolder;
