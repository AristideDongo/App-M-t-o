const apikey = "4da1138609d5cf815bd1e8c6b1f4db4e";
const weatherDataEl = document.getElementById("weather-data");
const cityInputEl = document.getElementById("city-input");
const formEl = document.querySelector("form");
const forecastDataEl = document.getElementById("forecast-data"); // Élément HTML où afficher les prévisions

// Écouteur d'événements pour la soumission du formulaire
formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const cityValue = cityInputEl.value;
  getWeatherData(cityValue);
  getWeatherForecast(cityValue); // Appel de la fonction pour les prévisions
});

// Fonction pour obtenir les données météorologiques actuelles
async function getWeatherData(cityValue) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&appid=${apikey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP! Statut: ${response.status}`);
    }

    const data = await response.json();

    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const details = [
      `Ressenti: ${Math.round(data.main.feels_like)}`,
      `Humidité: ${data.main.humidity}%`,
      `Vitesse du vent: ${data.wind.speed} m/s`,
    ];

    updateWeatherDisplay(temperature, description, icon, details);
  } catch (error) {
    console.error("Erreur lors de la récupération des données météorologiques:", error);
    handleWeatherError();
  }
}

// Fonction pour obtenir les prévisions météorologiques pour une semaine
async function getWeatherForecast(cityValue) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityValue}&appid=${apikey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP! Statut: ${response.status}`);
    }

    const data = await response.json();

    // Filtrer les prévisions pour les prochains 7 jours
    const weeklyForecast = data.list.filter((forecast) => {
      // On prend une seule prévision par jour, par exemple à midi
      return forecast.dt_txt.includes('00:00:00');
    }).map((forecast) => {
      return {
        date: new Date(forecast.dt * 1000), // Convertir la timestamp UNIX en objet Date
        temperature: Math.round(forecast.main.temp),
        description: forecast.weather[0].description,
        icon: forecast.weather[0].icon
      };
    });

    // Afficher les prévisions pour la semaine
    displayWeeklyForecast(weeklyForecast);
  } catch (error) {
    console.error("Erreur lors de la récupération des prévisions météorologiques:", error);
    // Gérer l'erreur de récupération des prévisions
    forecastDataEl.innerHTML = "<p>Impossible de récupérer les prévisions météorologiques.</p>";
  }
}

// Fonction pour afficher les prévisions météorologiques pour une semaine
function displayWeeklyForecast(forecast) {
  // Générer le HTML pour afficher chaque jour de la semaine
  const forecastHTML = forecast.map(day => {
    return `
      <div class="forecast-item">
        <div>${day.date.toLocaleDateString('fr-FR', { weekday: 'long' })}</div>
        <div><img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}"></div>
        <div>${day.temperature}°C</div>
        <div>${day.description}</div>
      </div>
    `;
  }).join("");

  // Afficher les prévisions dans l'élément HTML correspondant
  forecastDataEl.innerHTML = forecastHTML;
}

// Fonction pour mettre à jour l'affichage des données météorologiques actuelles
function updateWeatherDisplay(temperature, description, icon, details) {
  weatherDataEl.querySelector(".icon").innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}.png" alt="Icone météo">`;
  weatherDataEl.querySelector(".temperature").textContent = `${temperature}°C`;
  weatherDataEl.querySelector(".description").textContent = description;
  weatherDataEl.querySelector(".details").innerHTML = details
    .map((detail) => `<div>${detail}</div>`)
    .join("");
}

// Fonction pour gérer les erreurs lors de la récupération des données météorologiques actuelles
function handleWeatherError() {
  weatherDataEl.querySelector(".icon").innerHTML = "";
  weatherDataEl.querySelector(".temperature").textContent = "";
  weatherDataEl.querySelector(".description").textContent =
    "Une erreur est survenue, veuillez réessayer plus tard";
  weatherDataEl.querySelector(".details").innerHTML = "";
}
