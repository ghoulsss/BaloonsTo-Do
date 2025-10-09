import { useState } from "react";
import TaskItem from "../../service/ui/TaskItem/TaskItem";
import "./MainPage.css";
import type { Task, User } from "../../service/types/Types";
import AddTask from "../modals/addTask/AddTask";
import { useOutletContext } from "react-router-dom";
type ContextType = {
  tasks: Task[] | null;
  user: User | null;
  RefreshPage: () => void;
};
function MainPage() {
  const { tasks, user, RefreshPage } = useOutletContext<ContextType>();
  const [openModal, setOpenModal] = useState(false);
  const closeModal = async () => {
    setOpenModal(false);
  };

  return user ? (
    <div className="main-page">
      <div className="main-page__header">
        <span className="main-page__title">Все задачи</span>
        <button
          className="main-page__button"
          onClick={() => setOpenModal(true)}
        >
          + Добавить задачу
        </button>
      </div>
      <div className="main-page__search">
        <img src="../public/search.png" alt="icon" />
        <input
          className="main-page__input"
          placeholder="Поиск задач..."
        ></input>
      </div>

      <div className="main-page__active-tasks">
        <span className="main-page__tasks-title">Активные задачи</span>
        <div className="main-page_tasks-items">
          {tasks &&
            tasks
              ?.filter((el) => !el.completed)
              .map((el) => (
                <TaskItem
                  RefreshPage={RefreshPage}
                  data={el}
                  key={el.id}
                  userId={user?.id ?? null}
                />
              ))}
        </div>
      </div>
      <div className="main-page__completed-tasks">
        <span className="main-page__tasks-title">Выполненные задачи</span>
        <div className="main-page_tasks-items">
          {tasks &&
            tasks
              ?.filter((el) => el.completed)
              .map((el) => (
                <TaskItem
                  RefreshPage={RefreshPage}
                  data={el}
                  key={el.id}
                  userId={user?.id ?? null}
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
