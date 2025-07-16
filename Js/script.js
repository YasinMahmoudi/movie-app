'use strict';

///////////////////////////////////////////////
// API's URL
const API_URL =
  'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query="';

///////////////////////////////////////////////
// ELEMENTS

const searchForm = document.querySelector('.form');
const searchInput = document.querySelector('.search');
const movieContainer = document.querySelector('.movie-container');
const loading = document.querySelector('.loading');
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.modal');
const btnScroll = document.querySelector('.btn--scroll');

// Scroll Functionality
btnScroll.addEventListener('click', () => movieContainer.scrollIntoView({ behavior: 'smooth' }));

// Render Error Function
const renderError = function (message) {
  movieContainer.innerHTML = '';

  const el = document.createElement('div');
  el.classList.add('error');
  el.innerHTML = `
    <strong> ${message}</strong>

  `;

  movieContainer.append(el);
};

// Render Moview Function
const renderMovies = function (movies) {
  let html = '';
  movieContainer.innerHTML = '';

  movies.forEach((movie) => {
    const { original_title: name, poster_path, backdrop_path, overview, vote_average, vote_count } = movie;

    const newOverView = overview.replaceAll("'", ' ');
    const formattedAverage = vote_average.toFixed(2);

    const details = JSON.stringify({ name, backdrop_path, newOverView, formattedAverage, vote_count });

    html += `
        <div class="card">
          <div class="card__img">
            <img class="movie" src=${IMG_PATH}/${poster_path} alt="${name}" data-details='${details}'>
          </div>
        </div>
      `;
  });

  movieContainer.insertAdjacentHTML('beforeend', html);
};

// Initila Fetch
(async function () {
  try {
    // Add Loading state
    loading.classList.remove('loading--hidden');

    const res = await fetch(`${API_URL}`);

    if (!res.ok) throw new Error('Something wrong ! please try again later');

    const data = await res.json();

    // console.log(data.results[0]);

    renderMovies(data.results);
  } catch (error) {
    renderError(error.message);
  }

  // Remove Loading state
  loading.classList.add('loading--hidden');
})();

//Search Movie
const searchMovie = async function (name) {
  try {
    // Add Loading state
    loading.classList.remove('loading--hidden');

    const res = await fetch(`${SEARCH_API}${name}`);

    if (!res.ok) throw new Error('Something wrong with getting search results ! please try again later');

    const movies = await res.json();

    if (movies.total_results === 0) throw new Error('Movie does not extst !');

    renderMovies(movies.results);
  } catch (error) {
    renderError(error.message);
  }

  // Remove Loading state
  loading.classList.add('loading--hidden');
};

// Render Movie Details ( Modal )

const renderMovieDetails = async function (movie) {
  modal.innerHTML = '';

  const { name, backdrop_path, newOverView, formattedAverage, vote_count } = movie;

  const html = `

        <button class="modal__close"> x </button>

        <img
        src="${IMG_PATH}/${backdrop_path}"
        alt="${name}"
      />

      <div class="modal__header">
        <h3 class="heading--2"> ${name} </h3>

        <div class="vote">
          <b class="vote__average"> ${formattedAverage} </b>
          /
          <span class="vote__count"> ${vote_count}  </span>
        </div>
      </div>

      <div class="modal__body">
        <span> ${newOverView} </span>
      </div>
  
  `;

  modal.insertAdjacentHTML('afterbegin', html);

  // Add Event Listener for close btn modal
  document.querySelector('.modal__close').addEventListener('click', function () {
    overlay.classList.add('overlay--hidden');
    modal.classList.add('modal--hidden');
  });
};

// Event Handler
searchForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const value = searchInput.value;

  searchMovie(value);
});

// Show modal

movieContainer.addEventListener('click', function (e) {
  const movie = e.target.closest('.movie');

  if (!movie) return;

  const movieDetails = JSON.parse(movie.dataset.details);

  renderMovieDetails(movieDetails);

  // Show modal
  overlay.classList.remove('overlay--hidden');
  modal.classList.remove('modal--hidden');
});

// Hide modal
overlay.addEventListener('click', function () {
  overlay.classList.add('overlay--hidden');
  modal.classList.add('modal--hidden');
});
