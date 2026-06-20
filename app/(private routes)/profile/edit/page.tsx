'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { getMe, updateMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import css from './page.module.css';

function EditProfilePage() {
  const router = useRouter();

  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);

  const [username, setUsername] = useState<string>(user?.username ?? '');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      if (user) {
        setUsername(user.username);
        return;
      }

      try {
        const currentUser = await getMe();
        setUser(currentUser);
        setUsername(currentUser.username);
      } catch {
        router.push('/sign-in');
      }
    };

    void loadUser();
  }, [user, setUser, router]);

  const currentUser = user;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setError('');

    try {
      const updatedUser = await updateMe({ username });
      setUser(updatedUser);
      router.push('/profile');
    } catch {
      setError('Failed to update profile.');
    }
  };

  const handleCancel = (): void => {
    router.push('/profile');
  };

  if (!currentUser) {
    return (
      <main className={css.mainContent}>
        <p>Loading, please wait...</p>
      </main>
    );
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={currentUser.avatar}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />

        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              className={css.input}
              value={username}
              onChange={event => setUsername(event.target.value)}
            />
          </div>

          <p>Email: {currentUser.email}</p>

          {error && <p className={css.error}>{error}</p>}

          <div className={css.actions}>
            <button type="submit" className={css.saveButton}>
              Save
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditProfilePage;