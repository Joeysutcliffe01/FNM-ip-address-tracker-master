document.addEventListener('DOMContentLoaded', async () => {
  const ipAddressElem = document.querySelector('.info_ip-address p');
  const locationElem = document.querySelector('.info_location p');
  const timezoneElem = document.querySelector('.info_timezone p');
  const ispElem = document.querySelector('.info_isp p');
  const inputField = document.querySelector('.input-wrapper input');
  const form = document.querySelector('.input-wrapper');

  let map;
  let marker;

  async function fetchUserIPAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error fetching user IP address:', error);
    }
  }

  async function getIPAddressData(url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

  async function initialize() {
    const userIP = await fetchUserIPAddress();
    inputField.value = userIP;

    if (userIP) {
      const apiURL = `https://geo.ipify.org/api/v2/country,city,vpn?apiKey=at_tzf6DvqrktF5rH3V0FXuCmqyhJTtu&ipAddress=${userIP}`;
      const data = await getIPAddressData(apiURL);

      if (data) {
        updateLocationData(data);
      } else {
        console.error('No location data available');
      }
    }
  }

  function initializeMap(lat, long) {
    map = L.map('map').setView([lat, long], 7);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  }

  function updateLocationData(data) {
    const { ip, isp, location: { lat, lng: long, region, timezone } } = data;

    ipAddressElem.textContent = ip ? ip : "No IP address Data";
    locationElem.textContent = region ? `${region}` : "No region Data";
    timezoneElem.textContent = timezone ? timezone : "No timezoneData";
    ispElem.textContent = isp ? isp : "No IPS Data";

    const customIcon = L.icon({
      iconUrl: 'images/icon-location.svg', // Path to your custom marker icon
      iconSize: [25, 41], // Size of the icon
      iconAnchor: [20, 41], // Point of the icon which will correspond to marker's location
      popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
      shadowSize: [41, 41] // Size of the shadow
    });

    if (!map) {
      initializeMap(lat, long);
    } else {
      map.setView([lat, long]);
    }

    if (marker) {
      marker.setLatLng([lat, long]);
      marker.setIcon(customIcon);
    } else {
      marker = L.marker([lat, long], { icon: customIcon }).addTo(map);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userInput = inputField.value;
    const apiURL = `https://geo.ipify.org/api/v2/country,city,vpn?apiKey=at_ViW6fGDC51XUGz2jiX5qCGeve15md&ipAddress=${userInput}`;
    const data = await getIPAddressData(apiURL);

    if (data) {
      updateLocationData(data);
    } else {
      console.error('No location data available');
    }
  });

  // Initialize with the user's current IP address
  initialize();
});
