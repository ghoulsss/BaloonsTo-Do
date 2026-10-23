export type Task = {
  title: string;
  description: string | null;
  folder: {
    title: string;
  } | null;
  id: number;
  folder_id: number | null;
  completed: boolean;
  created_at: string;
};

export type Folder = {
  title: string;
  id: number;
  count_tasks: number | null;
};

export type CreateTask = {
  title: string;
  description: string | null;
  folder_id: number | null;
  user_id: number | null;
};

export type CreateUser = {
  username: string;
  email: string | null;
  password_hash: string;
};

export type UserLogin = {
  username: string;
  password: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
};

export type TaskUpdate = {
  title?: string | null;
  description?: string | null;
  folder_id?: number | null;
  user_id?: number | null;
  completed?: boolean | null;
};
export type CreateFolder = {
  title: string;
  user_id: number | null;
};
