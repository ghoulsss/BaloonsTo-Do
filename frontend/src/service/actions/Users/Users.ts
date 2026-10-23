import type { CreateUser, UserLogin } from "../../types/Types";

const apiUrl = (import.meta.env.VITE_API_URL || "/api/v1").replace(/\/$/, "");

export async function CreateUser(userData: CreateUser) {
  const response = await fetch(`${apiUrl}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) throw new Error("Ошибка при создании пользователя");
}

export async function UserLogin(userData: UserLogin) {
  const response = await fetch(`${apiUrl}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) throw new Error("Ошибка при авторизации");
  const data = await response.json();
  return data;
}
