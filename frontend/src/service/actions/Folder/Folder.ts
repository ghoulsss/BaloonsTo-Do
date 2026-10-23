import type { CreateFolder } from "../../types/Types";

const apiUrl = (import.meta.env.VITE_API_URL || "/api/v1").replace(/\/$/, "");
export async function getFolders(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${apiUrl}/folders/?${query}`);
  if (!response.ok) throw new Error("Не удалось загрузить папки");
  const data = response.json();
  return data;
}

export async function CreateFolder(folderData: CreateFolder) {
  const response = await fetch(`${apiUrl}/folders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(folderData),
  });

  if (!response.ok) throw new Error("Ошибка при создании папки");
  return response;
}
