"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { fetchNotes, type FetchNotesResponse } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import type { SelectedTag } from "@/types/note";
import css from "./page.module.css";

type HttpError = {
  response?: { status?: number };
  status?: number;
  message?: string;
};

export interface NotesClientProps {
  initialPage: number;
  perPage: number;
  initialQuery: string;
  tag: SelectedTag;
}

export default function NotesClient({
  initialPage,
  perPage,
  initialQuery,
  tag,
}: NotesClientProps) {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch] = useDebounce(search, 400);
  const router = useRouter();
  const pathname = usePathname();

  // в API не шлём "All"
  const apiTag = tag === "All" ? undefined : tag;

  const { data, isError, error } = useQuery<FetchNotesResponse, HttpError>({
    queryKey: ["notes", page, perPage, debouncedSearch, apiTag],
    queryFn: () =>
      fetchNotes({ page, perPage, search: debouncedSearch, tag: apiTag }),
    // держим предыдущие данные при смене параметров
    placeholderData: (prev) => prev,
    retry: (count, err) => {
      const status = err?.response?.status ?? err?.status;
      if (status === 401) return false;
      return count < 0;
    },
  });

  useEffect(() => {
    if (!isError) return;
    const status = error?.response?.status ?? error?.status;
    if (status === 401) {
      const from = pathname;
      router.replace(`/sign-in?from=${encodeURIComponent(from)}`);
    }
  }, [isError, error, pathname, router]);

  const totalPages = data?.totalPages ?? 1;
  const notes = data?.notes ?? [];

  return (
    <main>
      <div className={css.toolbar}>
        <SearchBox
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
        />
        {totalPages > 1 && (
          <Pagination
            pageCount={totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </div>

      <NoteList notes={notes} />
    </main>
  );
}
