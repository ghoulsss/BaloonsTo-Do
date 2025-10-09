import { useEffect, useState } from "react";
import "./AuthModal.css";
import { CreateUser, UserLogin } from "../../../service/actions/Users/Users";

type AuthModalProps = {
  onClose: () => void;
  RefreshUser: () => void;
};
function AuthModal({ onClose, RefreshUser }: AuthModalProps) {
  const [selectedAuth, setSelectedAuth] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (selectedAuth === 2) {
        const userData = {
          username: username,
          email: email,
          password_hash: password,
        };
        await CreateUser(userData);
        alert("Пользователь успешно зарегистрирован");
        onClose();
      } else {
        const userData = {
          username: username,
          password: password,
        };
        const data = await UserLogin(userData);
        localStorage.setItem("user", JSON.stringify(data.user));
        RefreshUser();
        onClose();
      }
    } catch {
      alert("Ошибка");
    }
  }
  useEffect(() => {
    setUsername("");
    setPassword("");
  }, [selectedAuth]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-auth" onClick={(e) => e.stopPropagation()}>
        <span className="modal-auth__title">Добро пожаловать</span>
        <div className="modal-auth_swap">
          <div
            onClick={() => setSelectedAuth(1)}
            className={`modal-auth_auth ${selectedAuth === 1 && "auth_active"}`}
          >
            Вход
          </div>
          <div
            onClick={() => setSelectedAuth(2)}
            className={`modal-auth_auth ${selectedAuth === 2 && "auth_active"}`}
          >
            Регистрация
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-auth__title-input">
            <div className="title-input__title">Логин</div>
            <input
              value={username}
              type="text"
              className="title-input__input"
              placeholder="Введите логин..."
              onChange={(e) => setUsername(e.target.value)}
            ></input>
          </div>
          <div className="modal-auth__title-input">
            <div className="title-input__title">Пароль</div>
            <input
              value={password}
              type="password"
              className="title-input__input"
              placeholder="Введите пароль..."
              onChange={(e) => setPassword(e.target.value)}
            ></input>
          </div>
          {selectedAuth == 2 && (
            <div className="modal-auth__title-input">
              <div className="title-input__title">Email</div>
              <input
                value={email}
                type="email"
                className="title-input__input"
                placeholder="Введите email..."
                onChange={(e) => setEmail(e.target.value)}
              ></input>
            </div>
          )}
          <div className="modal-auth__title-input">
            <div className="modal-auth__buttons">
              <button className="modal-auth__button" type="submit">
                {selectedAuth == 2 ? "Зарегистрироваться" : "Войти"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
export default AuthModal;
