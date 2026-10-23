import { Outlet } from "react-router-dom";
import "../css/index.css";
import FolderItem from "../service/ui/FolderItem/FolderItem";
import { useEffect, useState } from "react";
import type { Folder, Task, User } from "../service/types/Types";
import { getTasks } from "../service/actions/Tasks/Tasks";
import AuthModal from "../feature/modals/AuthModal/AuthModal";
import AddFolder from "../feature/modals/addFolder/AddFolder";
import { getFolders } from "../service/actions/Folder/Folder";

function Layout() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [allTask, setAllTask] = useState<Task[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [activeModal, setActiveModal] = useState(0);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [user, setUser] = useState<User | null>(readStoredUser);

  function readStoredUser(): User | null {
    try {
      const value = JSON.parse(localStorage.getItem("user") || "null");
      return value && Number.isInteger(value.id) && typeof value.username === "string"
        ? value : null;
    } catch {
      return null;
    }
  }

  const closeModal = () => setOpenModal(false);

  function RefreshUser() {
    setUser(readStoredUser());
    setFolders([]);
    setAllTask([]);
    setSelectedFolder(null);
    setError("");
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([getTasks({ user_id: user.id }), getFolders({ user_id: user.id })])
      .then(([tasks, folders]) => {
        if (cancelled) return;
        setAllTask(tasks);
        setFolders(folders);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить данные. Попробуйте ещё раз.");
      });
    return () => { cancelled = true; };
  }, [user, revision]);

  const tasks = selectedFolder === null
    ? allTask : allTask.filter(task => task.folder_id === selectedFolder);
  const selectedTitle = folders.find(folder => folder.id === selectedFolder)?.title || "Все задачи";
  function RefreshPage() {
    setRevision(value => value + 1);
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__header-icon-title">
          <img
            className="layout__header-icon"
            src="/to-do-list.png"
            alt="фото"
          />
          <span className="layout__header-title">ToDo Baloons</span>
        </div>
        {user ? (
          <div className="layout__account">
            <span>{`Здравствуйте, ${user.username}`}</span>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                RefreshUser();
              }}
              className="layout__header-button"
            >
              Выйти
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setActiveModal(1);
              setOpenModal(true);
            }}
            className="layout__header-button"
          >
            Войти
          </button>
        )}
      </header>
      <div className="layout__main">
        <aside className="layout__sidebar">
          <div className="sidebar__block-button">
            {user && (
              <button
                className="sidebar__button"
                onClick={() => {
                  setActiveModal(2);
                  setOpenModal(true);
                }}
              >
                + Добавить папку
              </button>
            )}
          </div>

          <div className="sidebar_folder-items">
            <FolderItem
              all
              count={allTask?.length}
              onClick={() => setSelectedFolder(null)}
              active={selectedFolder === null}
            />
            {folders?.map((el) => (
              <FolderItem
                key={el.id}
                data={el}
                active={selectedFolder === el.id}
                onClick={() => setSelectedFolder(el.id)}
              />
            ))}
          </div>
        </aside>
        <main className="layout__content">
          {error && <div role="alert">{error} <button onClick={RefreshPage}>Повторить</button></div>}
          <Outlet context={{ tasks, user, RefreshPage, selectedTitle }} />
        </main>
      </div>
      {openModal && activeModal === 1 && (
        <AuthModal onClose={closeModal} RefreshUser={RefreshUser} />
      )}
      {openModal && activeModal === 2 && (
        <AddFolder
          onClose={closeModal}
          RefreshPage={RefreshPage}
          id={user?.id ?? null}
        />
      )}
    </div>
  );
}

export default Layout;
