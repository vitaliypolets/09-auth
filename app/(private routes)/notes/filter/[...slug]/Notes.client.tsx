'use client';

import Link from 'next/link';
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { fetchNotes } from '@/lib/api/clientApi';
import type { NoteTag } from '@/types/note';
import NoteList from '@/components/NoteList/NoteList';
import Pagination from '@/components/Pagination/Pagination';
import SearchBox from '@/components/SearchBox/SearchBox';
import css from './Notes.module.css';

const PER_PAGE = 12;

interface NotesClientProps {
  tag?: NoteTag;
}

function NotesClient({ tag }: NotesClientProps) {
  const [page, setPage] = useState<number>(1);
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tagKey = tag ?? 'all';

  const debouncedSearch = useDebouncedCallback((value: string): void => {
    setPage(1);
    setSearchQuery(value);
  }, 500);

  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: ['notes', page, searchQuery, tagKey],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        search: searchQuery,
        tag,
      }),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleSearchChange = (value: string): void => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handlePageChange = (selectedPage: number): void => {
    setPage(selectedPage);
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchValue} onSearch={handleSearchChange} />

        {totalPages > 1 && (
          <Pagination
            pageCount={totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        )}

        <Link className={css.button} href="/notes/action/create">
          Create note +
        </Link>
      </header>

      {isLoading && <p className={css.status}>Loading, please wait...</p>}

      {isError && (
        <p className={css.error}>Something went wrong. Please try again.</p>
      )}

      {!isLoading && !isError && notes.length > 0 && <NoteList notes={notes} />}

      {!isLoading && !isError && notes.length === 0 && (
        <p className={css.status}>No notes found.</p>
      )}

      {isFetching && !isLoading && (
        <p className={css.fetching}>Updating notes...</p>
      )}
    </div>
  );
}

export default NotesClient;