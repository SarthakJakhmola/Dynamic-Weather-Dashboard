const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');
const locationElement = document.getElementById('location');
const dateElement = document.getElementById('date');
const weatherIcon = document.getElementById('weather-icon');
const temperatureElement = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const windSpeedElement = document.getElementById('wind-speed');
const humidityElement = document.getElementById('humidity');
const pressureElement = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast');
const themeToggle = document.getElementById('theme-toggle');
const API_KEY = '07543e6ea864f92664ac29fdb4997c0f';

function init() {
  setCurrentDate();
  searchBtn.addEventListener('click', searchWeather);
  locationBtn.addEventListener('click', getLocationWeather);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
  });

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  getWeatherByCity('New York');
}

function setCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = now.toLocaleDateString('en-US', options);
}

function searchWeather() {
  const city = searchInput.value.trim();
  if (city) getWeatherByCity(city);
  else showError('Please enter a city name');
}

function getLocationWeather() {
  if (!navigator.geolocation) return showError('Geolocation not supported');
  loading.style.display = 'block';
  navigator.geolocation.getCurrentPosition(
    pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => { loading.style.display = 'none'; showError('Unable to retrieve location'); }
  );
}

function getWeatherByCity(city) {
  loading.style.display = 'block'; errorMessage.style.display = 'none';
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
    .then(r => { if (!r.ok) throw new Error('City not found'); return r.json(); })
    .then(data => { displayCurrentWeather(data); return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`); })
    .then(r => { if (!r.ok) throw new Error('Forecast unavailable'); return r.json(); })
    .then(data => { displayForecast(data); loading.style.display = 'none'; })
    .catch(e => { loading.style.display = 'none'; showError(e.message); });
}

function getWeatherByCoords(lat, lon) {
  loading.style.display = 'block'; errorMessage.style.display = 'none';
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(r => { if (!r.ok) throw new Error('Location not found'); return r.json(); })
    .then(data => { displayCurrentWeather(data); return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`); })
    .then(r => { if (!r.ok) throw new Error('Forecast unavailable'); return r.json(); })
    .then(data => { displayForecast(data); loading.style.display = 'none'; })
    .catch(e => { loading.style.display = 'none'; showError(e.message); });
}

function displayCurrentWeather(data) {
  locationElement.textContent = `${data.name}, ${data.sys.country}`;
  temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
  weatherDescription.textContent = data.weather[0].description;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  windSpeedElement.textContent = `${data.wind.speed} m/s`;
  humidityElement.textContent = `${data.main.humidity}%`;
  pressureElement.textContent = `${data.main.pressure} hPa`;
}

function displayForecast(data) {
  forecastContainer.innerHTML = '';
  const forecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
  forecasts.forEach(day => {
    const date = new Date(day.dt * 1000);
    const div = document.createElement('div');
    div.classList.add('forecast-day');
    div.innerHTML = `
      <h4 class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
      <img class="forecast-icon" src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
      <h5 class="forecast-temp">${Math.round(day.main.temp)}°C</h5>
      <p class="forecast-description">${day.weather[0].description}</p>`;
    forecastContainer.appendChild(div);
  });
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', init);
