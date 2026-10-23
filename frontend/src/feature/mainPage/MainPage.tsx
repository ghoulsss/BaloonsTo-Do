import { useState } from "react";
import TaskItem from "../../service/ui/TaskItem/TaskItem";
import "./MainPage.css";
import type { Task, User } from "../../service/types/Types";
import AddTask from "../modals/addTask/AddTask";
import { useOutletContext } from "react-router-dom";
type ContextType = {
  tasks: Task[] | null;
  selectedTitle: string;
  user: User | null;
  RefreshPage: () => void;
};
function MainPage() {
  const { tasks, user, RefreshPage, selectedTitle } = useOutletContext<ContextType>();
  const [search, setSearch] = useState("");
  const filteredTasks = tasks?.filter(task => `${task.title} ${task.description ?? ""}`.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim()));
  const [openModal, setOpenModal] = useState(false);
  const closeModal = async () => {
    setOpenModal(false);
  };

  return user ? (
    <div className="main-page">
      <div className="main-page__header">
        <span className="main-page__title">{selectedTitle}</span>
        <button
          className="main-page__button"
          onClick={() => setOpenModal(true)}
        >
          + Добавить задачу
        </button>
      </div>
      <div className="main-page__search">
        <img src="/search.png" alt="icon" />
        <input
          className="main-page__input"
          placeholder="Поиск задач..."
          value={search}
          onChange={event => setSearch(event.target.value)}
        ></input>
      </div>

      <div className="main-page__active-tasks">
        <span className="main-page__tasks-title">Активные задачи</span>
        <div className="main-page_tasks-items">
          {tasks &&
            filteredTasks
              ?.filter((el) => !el.completed)
              .map((el) => (
                <TaskItem
                  RefreshPage={RefreshPage}
                  data={el}
                  key={el.id}
                />
              ))}
        </div>
      </div>
      <div className="main-page__completed-tasks">
        <span className="main-page__tasks-title">Выполненные задачи</span>
        <div className="main-page_tasks-items">
          {tasks &&
            filteredTasks
              ?.filter((el) => el.completed)
              .map((el) => (
                <TaskItem
                  RefreshPage={RefreshPage}
                  data={el}
                  key={el.id}
                />
              ))}
        </div>
      </div>
      {openModal && (
        <AddTask
          onClose={closeModal}
          id={user?.id ?? null}
          RefreshPage={RefreshPage}
        />
      )}
    </div>
  ) : (
    <div className="main-page__welcom">
      <span>Добро пожаловать в To-Do Baloons</span>
    </div>
  );
}

export default MainPage;
