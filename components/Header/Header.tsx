// components/Header/Header.tsx
import Link from "next/link";
import TagsMenu from "@/components/TagsMenu/TagsMenu";
import css from "./Header.module.css";
import AuthNavigation from "@/components/AuthNavigation/AuthNavigation";

export default function Header() {
  return (
    <header className={css.header}>
      <div className={css.inner}>
        <Link href="/" aria-label="home" className={css.logo}>
          NoteHub
        </Link>

        <nav className={css.nav} aria-label="Main Navigation">
          <ul className={css.navList}>
            <li>
              <Link href="/" className={css.navLink}>
                Home
              </Link>
            </li>
            <li className={css.menuSlot}>
              <TagsMenu />
            </li>
            <AuthNavigation />
          </ul>
        </nav>
      </div>
    </header>
  );
}
