import { cookies } from 'next/headers';
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

interface CheckSessionResponse {
  success: boolean;
}

const getCookieHeader = async (): Promise<string> => {
  const cookieStore = await cookies();
  return cookieStore.toString();
};

export const fetchNotes = async ({
  page,
  perPage,
  search = '',
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const cookieHeader = await getCookieHeader();

  const params = {
    page,
    perPage,
    ...(search.trim() !== '' && { search: search.trim() }),
    ...(tag && { tag }),
  };

  const response: AxiosResponse<FetchNotesResponse> =
    await api.get<FetchNotesResponse>('/notes', {
      params,
      headers: {
        Cookie: cookieHeader,
      },
    });

  return response.data;
};

export const fetchNoteById = async (noteId: string): Promise<Note> => {
  const cookieHeader = await getCookieHeader();

  const response: AxiosResponse<Note> = await api.get<Note>(
    `/notes/${noteId}`,
    {
      headers: {
        Cookie: cookieHeader,
      },
    }
  );

  return response.data;
};

export const checkSession = async (): Promise<boolean> => {
  try {
    const cookieHeader = await getCookieHeader();

    const response: AxiosResponse<CheckSessionResponse> =
      await api.get<CheckSessionResponse>('/auth/session', {
        headers: {
          Cookie: cookieHeader,
        },
      });

    return response.data.success;
  } catch {
    return false;
  }
};

export const getMe = async (): Promise<User> => {
  const cookieHeader = await getCookieHeader();

  const response: AxiosResponse<User> = await api.get<User>('/users/me', {
    headers: {
      Cookie: cookieHeader,
    },
  });

  return response.data;
};