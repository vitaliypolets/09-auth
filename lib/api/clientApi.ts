import type { AxiosResponse } from 'axios';
import { api } from './api';
import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';

export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateMeRequest {
  username: string;
}

export const fetchNotes = async ({
  page,
  perPage,
  search = '',
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const params = {
    page,
    perPage,
    ...(search.trim() !== '' && { search: search.trim() }),
    ...(tag && { tag }),
  };

  const response: AxiosResponse<FetchNotesResponse> =
    await api.get<FetchNotesResponse>('/notes', { params });

  return response.data;
};

export const fetchNoteById = async (noteId: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.get<Note>(
    `/notes/${noteId}`
  );

  return response.data;
};

export const createNote = async (
  newNote: CreateNotePayload
): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.post<Note>(
    '/notes',
    newNote
  );

  return response.data;
};

export const deleteNote = async (noteId: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.delete<Note>(
    `/notes/${noteId}`
  );

  return response.data;
};

export const register = async (
  credentials: RegisterRequest
): Promise<User> => {
  const response: AxiosResponse<User> = await api.post<User>(
    '/auth/register',
    credentials
  );

  return response.data;
};

export const login = async (credentials: LoginRequest): Promise<User> => {
  const response: AxiosResponse<User> = await api.post<User>(
    '/auth/login',
    credentials
  );

  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

interface CheckSessionResponse {
  success: boolean;
}

export const checkSession = async (): Promise<boolean> => {
  try {
    const response: AxiosResponse<CheckSessionResponse> =
      await api.get<CheckSessionResponse>('/auth/session');

    return response.data.success;
  } catch {
    return false;
  }
};

export const getMe = async (): Promise<User> => {
  const response: AxiosResponse<User> = await api.get<User>('/users/me');

  return response.data;
};

export const updateMe = async (
  payload: UpdateMeRequest
): Promise<User> => {
  const response: AxiosResponse<User> = await api.patch<User>(
    '/users/me',
    payload
  );

  return response.data;
};