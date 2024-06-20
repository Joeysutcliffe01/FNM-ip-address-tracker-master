// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', async () => {
  // Select elements for displaying IP address, location, timezone, and ISP information
  const ipAddressElem = document.querySelector('.info_ip-address p');
  const locationElem = document.querySelector('.info_location p');
  const timezoneElem = document.querySelector('.info_timezone p');
  const ispElem = document.querySelector('.info_isp p');
  const inputField = document.querySelector('.input-wrapper input');
  const form = document.querySelector('.input-wrapper');

  // Declare variables for the map and marker
  let map;
  let marker;

  // Function to fetch the user's IP address
  async function fetchUserIPAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error fetching user IP address:', error);
    }
  }

  // Function to get IP address data from the API
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

  // Function to initialize the application
  async function initialize() {
    const userIP = await fetchUserIPAddress(); // Fetch the user's IP address
    inputField.value = userIP; // Set the input field value to the fetched IP address

    if (userIP) {
      const apiURL = `https://geo.ipify.org/api/v2/country,city,vpn?apiKey=at_tzf6DvqrktF5rH3V0FXuCmqyhJTtu&ipAddress=${userIP}`;
      const data = await getIPAddressData(apiURL); // Fetch location data using the IP address

      if (data) {
        updateLocationData(data); // Update the location data on the page
      } else {
        console.error('No location data available');
      }
    }
  }

  // Function to initialize the map
  function initializeMap(lat, long) {
    map = L.map('map').setView([lat, long], 13); // Set the initial view of the map

    // Add OpenStreetMap tile layer to the map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  }

  // Function to update location data on the page and map
  function updateLocationData(data) {
    const { ip, isp, location: { lat, lng: long, region, timezone } } = data;

    // Update text content of elements with fetched data
    ipAddressElem.textContent = ip ? ip : "No IP address Data";
    locationElem.textContent = region ? `${region}` : "No region Data";
    timezoneElem.textContent = timezone ? timezone : "No timezone Data";
    ispElem.textContent = isp ? isp : "No ISP Data";

    // Define a custom icon for the map marker
    const customIcon = L.icon({
      iconUrl: 'images/icon-location.svg', // Path to your custom marker icon
      iconSize: [25, 41], // Size of the icon
      iconAnchor: [20, 41], // Point of the icon which will correspond to marker's location
      popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
      shadowSize: [41, 41] // Size of the shadow
    });

    // Initialize or update the map and marker
    if (!map) {
      initializeMap(lat, long); // Initialize the map if it doesn't exist
    } else {
      map.setView([lat, long]); // Update the map view
    }

    if (marker) {
      marker.setLatLng([lat, long]); // Update the marker position
      marker.setIcon(customIcon); // Update the marker icon
    } else {
      marker = L.marker([lat, long], { icon: customIcon }).addTo(map); // Add a new marker to the map
    }
  }

  // Event listener for the form submission
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    const userInput = inputField.value; // Get the user input value
    const apiURL = `https://geo.ipify.org/api/v2/country,city,vpn?apiKey=at_9hkj7HOehcPj8HEppC1VeHq3hfIav&ipAddress=${userInput}`;
    const data = await getIPAddressData(apiURL); // Fetch location data using the user input

    if (data) {
      updateLocationData(data); // Update the location data on the page
    } else {
      console.error('No location data available');
    }
  });

  // Initialize with the user's current IP address
  initialize();
});
