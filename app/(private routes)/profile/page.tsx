import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import css from './page.module.css';

// Temporary local getMe implementation — replace with the actual server API call.
async function getMe() {
  // Replace this stub with your real serverApi call, e.g.:
  // return await fetchServerSideCurrentUser();
  return {
    username: 'Unknown',
    email: 'unknown@example.com',
    avatar: 'https://ac.goit.global/fullstack/react/avatar-default.jpg',
  };
}

export const dynamic = 'force-dynamic';

const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

export const metadata: Metadata = {
  title: 'Profile | NoteHub',
  description: 'User profile page in NoteHub.',
  openGraph: {
    title: 'Profile | NoteHub',
    description: 'User profile page in NoteHub.',
    url: 'https://notehub.app/profile',
    images: [{ url: OG_IMAGE }],
  },
};

async function ProfilePage() {
  const user = await getMe();

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href="/profile/edit" className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>

        <div className={css.avatarWrapper}>
          <Image
            src={user.avatar}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        </div>

        <div className={css.profileInfo}>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;