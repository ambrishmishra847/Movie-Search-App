import React, { useState} from 'react';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const TMDB_API_KEY = 'cd11ac9041d53906dfad864b6c96485f';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  const searchMovies = async () => {
    if (!searchTerm.trim()) {
      setMovies([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMovies(data.results);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to fetch movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieDetails = async (movieId) => {
    setLoading(true);
    setError(null);

    try {
      const detailsResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
      if (!detailsResponse.ok) {
        throw new Error(`HTTP error! status: ${detailsResponse.status}`);
      }
      const detailsData = await detailsResponse.json();
      setSelectedMovie(detailsData);

      const videosResponse = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`);
      if (!videosResponse.ok) {
        throw new Error(`HTTP error! status: ${videosResponse.status}`);
      }
      const videosData = await videosResponse.json();

      const trailer = videosData.results.find(
        (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
      );
      setTrailerKey(trailer ? trailer.key : null);
    } catch (err) {
      console.error("Error fetching movie details or trailers:", err);
      setError("Failed to fetch movie details. Please ensure the API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchMovies();
  };

  const handleMovieClick = (movie) => {
    fetchMovieDetails(movie.id);
  };

  const closeMovieDetails = () => {
    setSelectedMovie(null);
    setTrailerKey(null);
  };

  return (
    <div className="text-white min-vh-100 py-5">
      <div className="container">
        <header className="text-center mb-5 animate__animated animate__fadeInDown">
          <h1 className="display-3 fw-bolder mb-3" style={{ color: '#BD8FEA' }}>
            🎥 Movie Explorer
          </h1>
          <p className="lead text-light-emphasis" style={{ color: '#DCDCDC' }}>Discover films, ratings, and watch trailers instantly!</p>
        </header>

        <form onSubmit={handleSearchSubmit} className="mx-auto mb-5 d-flex justify-content-center align-items-center animate__animated animate__fadeIn" style={{ maxWidth: '800px' }}>
          <div className="input-group input-group-lg flex-grow-1 me-3">
            <input
              type="text"
              placeholder="Search for a movie title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-control text-white border-0 custom-placeholder-color"
              style={{ padding: '0.75rem 1.25rem', fontSize: '1.25rem', backgroundColor: '#3D3F51', borderRadius: '0.7rem' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-lg shadow-lg text-uppercase fw-bold"
            style={{ minWidth: '120px', backgroundColor: '#6D5CDE', border: 'none', borderRadius: '0.7rem' }}
          >
            <i className="bi bi-search me-2"></i> Search
          </button>
        </form>

        {loading && (
          <div className="text-center text-info fs-3 mt-4 animate__animated animate__flash infinite">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Loading movies...
          </div>
        )}
        {error && (
          <div className="text-center text-danger fs-3 mt-4 animate__animated animate__shakeX">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4 mt-4">
          {movies.map((movie) => (
            <div key={movie.id} className="col animate__animated animate__fadeInUp">
              <div
                className="card text-white h-100 shadow-xl border-0 transform-hover"
                onClick={() => handleMovieClick(movie)}
                style={{ borderRadius: '15px', overflow: 'hidden', cursor: 'pointer', backgroundColor: '#3D3F51' }}
              >
                <img
                  src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : `https://placehold.co/500x750/374151/ffffff?text=No+Poster`}
                  alt={movie.title}
                  className="card-img-top object-fit-cover"
                  style={{ height: '350px', objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/500x750/374151/ffffff?text=No+Poster`; }}
                />
                <div className="card-body d-flex flex-column justify-content-between p-3">
                  <h5 className="card-title fw-bold mb-2 text-truncate" style={{ color: '#BD8FEA' }}>{movie.title}</h5>
                  <p className="card-text text-sm" style={{ color: '#DCDCDC' }}>
                    {movie.release_date ? `Release: ${new Date(movie.release_date).getFullYear()}` : 'N/A'}
                  </p>
                  <p className="card-text text-warning mt-auto">
                    <i className="bi bi-star-fill me-1"></i> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {movies.length === 0 && searchTerm.trim() && !loading && !error && (
            <p className="text-center text-muted col-12 mt-5 fs-5">
              No movies found for "{searchTerm}". Please check your spelling or try another title!
            </p>
          )}
        </div>

        {selectedMovie && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content text-white shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#282A36' }}>
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title visually-hidden">{selectedMovie.title} Details</h5>
                  <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={closeMovieDetails}></button>
                </div>
                <div className="modal-body p-4 p-md-5">
                  <div className="row">
                    <div className="col-md-4 mb-4 mb-md-0 d-flex justify-content-center align-items-center">
                      <img
                        src={selectedMovie.poster_path ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}` : `https://placehold.co/500x750/374151/ffffff?text=No+Poster`}
                        alt={selectedMovie.title}
                        className="img-fluid rounded-lg shadow-lg"
                        style={{ maxHeight: '500px', objectFit: 'cover', borderRadius: '15px' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/500x750/374151/ffffff?text=No+Poster`; }}
                      />
                    </div>
                    <div className="col-md-8">
                      <h2 className="display-4 fw-bolder mb-2" style={{ color: '#BD8FEA' }}>
                        {selectedMovie.title}
                      </h2>
                      <p className="lead mb-3" style={{ color: '#DCDCDC' }}>{selectedMovie.tagline}</p>
                      <p className="fs-5 mb-4" style={{ color: '#DCDCDC' }}>{selectedMovie.overview}</p>
                      <hr className="my-4" style={{ borderColor: '#4C4F62' }}/>
                      <div className="row g-3 mb-4">
                        <div className="col-sm-6">
                          <p className="mb-0"><strong style={{ color: '#BD8FEA' }}>{'Release Date:'}</strong>{' '}
                            {selectedMovie.release_date || 'N/A'}
                          </p>
                        </div>
                        <div className="col-sm-6">
                          <p className="mb-0"><strong style={{ color: '#BD8FEA' }}>{'Rating:'}</strong>{' '}
                            {selectedMovie.vote_average ? `${selectedMovie.vote_average.toFixed(1)}/10` : 'N/A'} (
                            {selectedMovie.vote_count} votes)
                          </p>
                        </div>
                        <div className="col-sm-6">
                          <p className="mb-0"><strong style={{ color: '#BD8FEA' }}>{'Runtime:'}</strong>{' '}
                            {selectedMovie.runtime ? `${selectedMovie.runtime} minutes` : 'N/A'}
                          </p>
                        </div>
                        <div className="col-sm-6">
                          <p className="mb-0"><strong style={{ color: '#BD8FEA' }}>{'Genres:'}</strong>{' '}
                            {selectedMovie.genres && selectedMovie.genres.length > 0
                              ? selectedMovie.genres.map((g) => <span key={g.id} className="badge" style={{ backgroundColor: '#6D5CDE', marginRight: '0.25rem' }}>{g.name}</span>)
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="col-12">
                            <p className="mb-0"><strong style={{ color: '#BD8FEA' }}>{'Popularity:'}</strong>{' '}
                                {selectedMovie.popularity ? selectedMovie.popularity.toFixed(2) : 'N/A'}
                            </p>
                        </div>
                      </div>

                      {trailerKey ? (
                        <div className="mt-5">
                          <h3 className="fs-3 fw-bold mb-3" style={{ color: '#BD8FEA' }}>Official Trailer</h3>
                          <div className="ratio ratio-16x9 rounded-lg shadow-md">
                            <iframe
                              src={`https://www.youtube.com/embed/${trailerKey}`}
                              title="Movie Trailer"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-5 fs-5" style={{ color: '#DCDCDC' }}>No trailer available for this movie.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
