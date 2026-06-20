import type { Metadata } from 'next';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { fetchNotes } from '@/lib/api/serverApi';
import { NOTE_TAGS, type NoteTag } from '@/types/note';
import NotesClient from './Notes.client';

const PER_PAGE = 12;
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

interface FilteredNotesPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

const resolveTag = (slug: string[]): NoteTag | undefined => {
  if (slug.length !== 1) {
    notFound();
  }

  const selectedTag = slug[0];

  if (selectedTag === 'all') {
    return undefined;
  }

  if (NOTE_TAGS.includes(selectedTag as NoteTag)) {
    return selectedTag as NoteTag;
  }

  notFound();
};

export async function generateMetadata({
  params,
}: FilteredNotesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = resolveTag(slug);
  const tagLabel = tag ?? 'All';
  const filterPath = tag ?? 'all';

  const title = `${tagLabel} notes | NoteHub`;
  const description = `Browse ${tagLabel.toLowerCase()} notes in NoteHub.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://notehub.app/notes/filter/${filterPath}`,
      images: [{ url: OG_IMAGE }],
    },
  };
}

async function FilteredNotesPage({ params }: FilteredNotesPageProps) {
  const { slug } = await params;
  const tag = resolveTag(slug);
  const tagKey = tag ?? 'all';

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['notes', 1, '', tagKey],
    queryFn: () =>
      fetchNotes({
        page: 1,
        perPage: PER_PAGE,
        search: '',
        tag,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient key={tagKey} tag={tag} />
    </HydrationBoundary>
  );
}

export default FilteredNotesPage;