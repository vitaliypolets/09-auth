'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '@/lib/api/clientApi';
import { initialDraft, type NoteDraft, useNoteStore } from '@/lib/store/noteStore';
import { NOTE_TAGS, type NoteTag } from '@/types/note';
import css from './NoteForm.module.css';

type DraftFieldName = keyof NoteDraft;

const isDraftFieldName = (name: string): name is DraftFieldName => {
  return name === 'title' || name === 'content' || name === 'tag';
};

const isNoteTag = (value: string): value is NoteTag => {
  return NOTE_TAGS.includes(value as NoteTag);
};

function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const draft = useNoteStore(state => state.draft);
  const setDraft = useNoteStore(state => state.setDraft);
  const clearDraft = useNoteStore(state => state.clearDraft);

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      clearDraft();
      router.back();
    },
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = event.target;

    if (!isDraftFieldName(name)) {
      return;
    }

    if (name === 'tag') {
      if (isNoteTag(value)) {
        setDraft({ tag: value });
      }

      return;
    }

    setDraft({ [name]: value });
  };

  const handleSubmit = async (formData: FormData): Promise<void> => {
    const title = String(formData.get('title') ?? '').trim();
    const content = String(formData.get('content') ?? '').trim();
    const tagValue = String(formData.get('tag') ?? initialDraft.tag);

    if (!isNoteTag(tagValue)) {
      return;
    }

    await createNoteMutation.mutateAsync({
      title,
      content,
      tag: tagValue,
    });
  };

  const handleCancel = (): void => {
    router.back();
  };

  return (
    <form className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className={css.input}
          value={draft.title}
          onChange={handleChange}
          minLength={3}
          maxLength={50}
          required
        />
        <span className={css.error} />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          value={draft.content}
          onChange={handleChange}
          maxLength={500}
        />
        <span className={css.error} />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={draft.tag}
          onChange={handleChange}
          required
        >
          {NOTE_TAGS.map(tag => (
            <option value={tag} key={tag}>
              {tag}
            </option>
          ))}
        </select>
        <span className={css.error} />
      </div>

      {createNoteMutation.isError && (
        <p className={css.errorMessage}>Failed to create note. Please try again.</p>
      )}

      <div className={css.actions}>
        <button type="button" className={css.cancelButton} onClick={handleCancel}>
          Cancel
        </button>

        <button
          type="submit"
          className={css.submitButton}
          formAction={handleSubmit}
          disabled={createNoteMutation.isPending}
        >
          {createNoteMutation.isPending ? 'Creating...' : 'Create note'}
        </button>
      </div>
    </form>
  );
}

export default NoteForm;