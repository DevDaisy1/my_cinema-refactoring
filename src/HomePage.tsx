import React, { useState, useEffect } from "react";
import * as movieApi from "./api/movie";
import MovieCard from "./MovieCard";
import MovieDetailsPage from "./MovieDetailsPage";

export default function HomePage() {
  const [films, setFilms] = useState<movieApi.Film[]>([]);
  const [selectedFilm, setSelectedFilm] = useState<movieApi.Film | null>(null);

  useEffect(() => {
    movieApi.getFilms().then(setFilms).catch(console.error);
  }, []);

  if (selectedFilm) {
    return (
      <MovieDetailsPage
        movie={selectedFilm}
        onBack={() => setSelectedFilm(null)}
      />
    );
  }

  return (
    <div className="container py-5 d-flex flex-wrap gap-4 justify-content-center">
      {films.map((film) => (
        <MovieCard
          key={film.id}
          movie={film}
          onSelect={() => setSelectedFilm(film)}
        />
      ))}
    </div>
  );
}
