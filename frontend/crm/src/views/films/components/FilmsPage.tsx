"use client";

import { PERMISSIONS } from "@/shared/config";
import { RequirePermission } from "@/entities/viewer";
import { FilmsCatalog } from "@/views/films/components/FilmsCatalog";

export const FilmsPage = () => (
  <RequirePermission permission={PERMISSIONS.manageFilms}>
    <FilmsCatalog />
  </RequirePermission>
);
