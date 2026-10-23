import type { CreateTask, TaskUpdate } from "../../types/Types";

const apiUrl = (import.meta.env.VITE_API_URL || "/api/v1").replace(/\/$/, "");

export async function getTasks(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${apiUrl}/tasks/?${query}`);
  if (!response.ok) throw new Error("Не удалось загрузить задачи");
  const data = await response.json();
  return data;
}

export async function CreateTasks(taskData: CreateTask) {
  const response = await fetch(`${apiUrl}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) throw new Error("Ошибка при создании задачи");
  return response;
}

export async function UpdateTask(taskId: number, taskData: TaskUpdate) {
  const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) throw new Error("Ошибка при обновлении задачи");
  return response;
}

export async function DeleteTask(taskId: number) {
  const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Ошибка при удалении задачи");
  return response;
}
