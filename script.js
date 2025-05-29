const apiKey = '287800ea0e7065ec58e79e54654ece21';
const apiBase = 'https://api.themoviedb.org/3';

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const mainContainer = document.getElementById('mainContainer');
const loginForm = document.getElementById('loginForm');
const searchInput = document.getElementById('search');
const searchButton = document.getElementById('searchBtn');
const moviesContainer = document.getElementById('movies');
const reviewsContainer = document.getElementById('reviews');
const movieSuggestions = document.getElementById('movie-suggestions');
const goHomeBtn = document.getElementById('goHomeBtn');
const homePageLink = document.getElementById('homePageLink');
const modal = document.getElementById('movieModal');
const modalClose = document.querySelector('.close');
const logoutBtn = document.getElementById('logoutBtn');

// Modal elements
const modalMovieImage = document.getElementById('modalMovieImage');
const modalMovieTitle = document.getElementById('modalMovieTitle');
const modalMovieDescription = document.getElementById('modalMovieDescription');
const stars = document.querySelectorAll('.star-rating i');
const modalReview = document.getElementById('modalReview');
const submitModalReview = document.getElementById('submitModalReview');

let currentMovie = null;

// Local storage keys
const localStorageKey = 'movieReviews';
const ratingsKey = 'movieRatings';

// Login handling
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('isLoggedIn', 'true');
        showMainContainer();
    } else {
        alert('Please fill in all fields');
    }
});

// Check login status and show appropriate container
function checkLoginStatus() {
    if (sessionStorage.getItem('isLoggedIn')) {
        showMainContainer();
    } else {
        showLoginContainer();
    }
}

function showLoginContainer() {
    loginContainer.style.display = 'flex';
    mainContainer.style.display = 'none';
}

function showMainContainer() {
    loginContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    document.getElementById('userEmail').textContent = sessionStorage.getItem('userEmail');
    fetchPopularMovies(); // Load initial movies
}
document.getElementById('loginContainer').style.display = 'none';
document.getElementById('registerContainer').style.display = 'flex';
document.getElementById('registerContainer').style.display = 'none';
document.getElementById('loginContainer').style.display = 'flex';


// Fetch popular movies
async function fetchPopularMovies() {
    const url = `${apiBase}/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
}

// Fetch movie suggestions
async function fetchMovieSuggestions(query) {
    const url = `${apiBase}/search/movie?api_key=${apiKey}&query=${query}&language=en-US&page=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displaySuggestions(data.results);
    } catch (error) {
        console.error('Error fetching movie suggestions:', error);
    }
}

// Display suggestions in datalist
function displaySuggestions(movies) {
    movieSuggestions.innerHTML = '';
    movies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.title;
        movieSuggestions.appendChild(option);
    });
}

// Display movies
function displayMovies(movies) {
    moviesContainer.innerHTML = '';
    if (movies.length === 0) {
        moviesContainer.innerHTML = '<p>No movies found. Try another search.</p>';
        return;
    }
    
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        
        const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                alt="${movie.title}" 
                onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
            <div class="movie-info">
                <h3>${movie.title} (${releaseYear})</h3>
                <p class="rating">Rating: ⭐ ${movie.vote_average.toFixed(1)}</p>
            </div>
        `;
        
        movieElement.addEventListener('click', () => openMovieModal(movie));
        moviesContainer.appendChild(movieElement);
    });
}

// Load saved reviews and ratings
function loadSavedData() {
    return {
        reviews: JSON.parse(localStorage.getItem(localStorageKey) || '[]'),
        ratings: JSON.parse(localStorage.getItem(ratingsKey) || '{}')
    };
}

// Save and display review
function saveReview(review) {
    const savedReviews = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    savedReviews.push(review);
    localStorage.setItem(localStorageKey, JSON.stringify(savedReviews));
    displayReview(review);
}

// Display a single review
function displayReview(review) {
    const reviewElement = document.createElement('div');
    reviewElement.classList.add('review-item');
    const stars = '⭐'.repeat(review.rating);
    reviewElement.innerHTML = `
        <h4>${review.movieTitle}</h4>
        <p>${review.reviewText}</p>
        <p class="rating">${stars}</p>
        <p class="review-date">Posted by ${review.userEmail} on ${new Date(review.timestamp).toLocaleDateString()}</p>
    `;
    reviewsContainer.insertBefore(reviewElement, reviewsContainer.firstChild);
}

// Modal functions
function openMovieModal(movie) {
    currentMovie = movie;
    modalMovieImage.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    modalMovieImage.onerror = () => modalMovieImage.src = 'https://via.placeholder.com/300x450?text=No+Image';
    modalMovieTitle.textContent = movie.title;
    modalMovieDescription.textContent = movie.overview;
    
    // Load and display saved rating
    const ratings = JSON.parse(localStorage.getItem(ratingsKey) || '{}');
    const savedRating = ratings[movie.id] || 0;
    updateStarDisplay(savedRating);
    
    modal.style.display = 'block';
}

function closeMovieModal() {
    modal.style.display = 'none';
    currentMovie = null;
    modalReview.value = '';
    updateStarDisplay(0);
}

// Star rating functions
function updateStarDisplay(rating) {
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

// Search function
async function fetchMovies(query) {
    const url = `${apiBase}/search/movie?api_key=${apiKey}&query=${query}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Event Listeners
stars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = parseInt(star.getAttribute('data-rating'));
        updateStarDisplay(rating);
        
        if (currentMovie) {
            const ratings = JSON.parse(localStorage.getItem(ratingsKey) || '{}');
            ratings[currentMovie.id] = rating;
            localStorage.setItem(ratingsKey, JSON.stringify(ratings));
        }
    });
});

submitModalReview.addEventListener('click', () => {
    if (currentMovie && modalReview.value.trim()) {
        const review = {
            movieId: currentMovie.id,
            movieTitle: currentMovie.title,
            reviewText: modalReview.value.trim(),
            rating: document.querySelectorAll('.star-rating i.active').length,
            timestamp: Date.now(),
            userEmail: sessionStorage.getItem('userEmail')
        };
        
        saveReview(review);
        closeMovieModal();
    }
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        fetchMovies(query);
        goHomeBtn.style.display = 'block';
    }
});

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (query) {
        fetchMovieSuggestions(query);
    }
});

modalClose.addEventListener('click', closeMovieModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeMovieModal();
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    showLoginContainer();
});

homePageLink.addEventListener('click', () => {
    fetchPopularMovies();
});

goHomeBtn.addEventListener('click', () => {
    fetchPopularMovies();
    goHomeBtn.style.display = 'none';
});

// Initialize Page
window.onload = () => {
    if (sessionStorage.getItem("isLoggedIn")) {
        const storedCategories = JSON.parse(sessionStorage.getItem("selectedCategories"));
        if (storedCategories) {
            loadMoviesByCategories(storedCategories);
        }
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("mainContainer").style.display = "block";
    } else {
        document.getElementById("loginContainer").style.display = "flex";
    }
};


  /////////////// REGISTER //////////////
  
// Show Register Page
document.getElementById('showRegisterLink').addEventListener('click', () => {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'block';
});

// Show Login Page
document.getElementById('showLoginLink').addEventListener('click', () => {
    document.getElementById('registerContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'block';
});
let selectedCategories = [];

// Handle Registration
document.getElementById("registerBtn").addEventListener("click", () => {
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    // Save user info temporarily (this can be replaced by API calls)
    sessionStorage.setItem("regUsername", username);
    sessionStorage.setItem("regEmail", email);

    // Navigate to category selection
    document.getElementById("registerContainer").style.display = "none";
    document.getElementById("interestContainer").style.display = "block";
});

document.addEventListener('DOMContentLoaded', function () {
    // Check if the user is logged in when the page loads
    if (sessionStorage.getItem("loggedIn") === "true") {
        // If logged in, check if interests were skipped
        if (sessionStorage.getItem("interestsSkipped") === "true") {
            // If interests skipped, show main content
            document.getElementById("loginContainer").style.display = "none";
            document.getElementById("interestContainer").style.display = "none";
            document.getElementById("mainContainer").style.display = "block";
        } else {
            // If interests were not skipped, show interest container
            document.getElementById("loginContainer").style.display = "none";
            document.getElementById("interestContainer").style.display = "block";
            document.getElementById("mainContainer").style.display = "none";
        }
    } else {
        // If not logged in, show login page
        document.getElementById("loginContainer").style.display = "block";
        document.getElementById("interestContainer").style.display = "none";
        document.getElementById("mainContainer").style.display = "none";
    }
});

// Handle login
document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill in all fields");
        return;
    }

    // Simulate login
    const storedEmail = sessionStorage.getItem("regEmail");
    if (email !== storedEmail) {
        alert("Invalid login credentials.");
        return;
    }

    // Save login state
    sessionStorage.setItem("isLoggedIn", "true");

    // Navigate to home page
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("mainContainer").style.display = "block";

    // Load movies based on categories
    loadMoviesByCategories(selectedCategories);
});
const genreMap = {
    "Action": 28,
    "Comedy": 35,
    "Drama": 18,
    "Romance": 10749,
    "Horror": 27,
    "Sci-Fi": 878,
    "Fantasy": 14,
    "Thriller": 53,
    "Animation": 16,
    "Documentary": 99,
    "Crime": 80,
    "Mystery": 9648,
    "Musical": 10402,
};

// Load Movies by Categories
async function loadMoviesByCategories(categories) {
    const movieContainer = document.getElementById("movies");
    movieContainer.innerHTML = `<p>Loading movies for categories: ${categories.join(", ")}...</p>`;
    
    const genreIds = categories.map(category => genreMap[category]).join(',');
    const url = `${apiBase}/discover/movie?api_key=${apiKey}&with_genres=${genreIds}&language=en-US`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results.length === 0) {
            movieContainer.innerHTML = `<p>No movies found for the selected categories.</p>`;
            return;
        }
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching movies by categories:', error);
        movieContainer.innerHTML = `<p>Error loading movies. Please try again later.</p>`;
    }
}
// Skip to main content
document.getElementById("skipInterestsLink").addEventListener("click", function (e) {
    e.preventDefault();

    // Skip interests and show main app container
    document.getElementById("interestContainer").style.display = "none";
    document.getElementById("mainContainer").style.display = "block";

    // Store that interests were skipped
    sessionStorage.setItem("interestsSkipped", "true");
});

// Handle submitting interests
document.getElementById("interestForm").addEventListener("submit", (e) => {
    e.preventDefault();

    // Gather selected categories
    const checkboxes = document.querySelectorAll('input[name="interest"]:checked');
    selectedCategories = Array.from(checkboxes).map(cb => cb.value);
    sessionStorage.setItem("selectedCategories", JSON.stringify(selectedCategories));

    // Show success message
    alert("Registration Successful! Please log in.");

    // Navigate to login page
    document.getElementById("interestContainer").style.display = "none";
    document.getElementById("loginContainer").style.display = "flex";
});

// Handle logout
document.getElementById("logoutBtn").addEventListener("click", function () {
    sessionStorage.clear(); // Clear session storage
    document.getElementById("mainContainer").style.display = "none";
    document.getElementById("interestContainer").style.display = "none";
    document.getElementById("loginContainer").style.display = "block";
});
