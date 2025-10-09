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
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [folders, setFolders] = useState<Folder[] | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [allTask, setAllTask] = useState<Task[] | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [activeModal, setActiveModal] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  const closeModal = async () => {
    setOpenModal(false);
  };

  function RefreshUser() {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      setUser(user);
    } else {
      setUser(null);
      setFolders(null);
      setTasks(null);
      setAllTask(null);
      setSelectedFolder(null);
    }
  }

  useEffect(() => {
    RefreshUser();
  }, []);

  useEffect(() => {
    async function loadFolders() {
      const data = await getFolders({ user_id: user?.id });

      setFolders(data);
    }
    if (user) {
      loadFolders();
    }
  }, [user]);

  useEffect(() => {
    async function loadTasks() {
      const data = await getTasks({ user_id: user?.id });
      setTasks(data);
      setAllTask(data);
    }
    if (user) {
      loadTasks();
    }
  }, [user]);

  async function loadTasks() {
    const params = selectedFolder
      ? { folder_id: selectedFolder, user_id: user?.id }
      : { user_id: user?.id };
    const data = await getTasks(params);
    setTasks(data);
  }

  useEffect(() => {
    if (selectedFolder) {
      loadTasks();
    } else {
      setTasks(allTask);
    }
  }, [selectedFolder]);

  async function loadFolders() {
    const data = await getFolders({ user_id: user?.id });

    setFolders(data);
  }

  function RefreshPage() {
    async function loadAllTasks() {
      const data = await getTasks({
        user_id: user?.id,
      });
      setAllTask(data);
    }
    loadAllTasks();
    loadTasks();
    loadFolders();
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__header-icon-title">
          <img
            className="layout__header-icon"
            src="../public/to-do-list.png"
            alt="фото"
          />
          <span className="layout__header-title">ToDo Baloons</span>
        </div>
        {user ? (
          <div>
            <span
              style={{ marginRight: "30px" }}
            >{`Здравствуйте, ${user.username}`}</span>
            <button
              onClick={() => {
                localStorage.clear();
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
          <Outlet context={{ tasks, user, RefreshPage }} />
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
