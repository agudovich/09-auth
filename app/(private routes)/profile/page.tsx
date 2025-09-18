// app/(private routes)/profile/page.tsx
import type { Metadata } from "next";
import css from "./page.module.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ssrGetMe } from "@/lib/api/serverApi";

export const metadata: Metadata = {
  title: "Profile",
  description: "User profile page",
};

export default async function ProfilePage() {
  const user = await ssrGetMe();
  if (!user) {
    redirect("/sign-in?from=/profile");
  }

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
          <img
            src={user.avatarURL || "/avatar-placeholder.png"}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        </div>
        <div className={css.profileInfo}>
          <p>Username: {user.username || "—"}</p>
          <p>Email: {user.email}</p>
        </div>
      </div>
    </main>
  );
}
