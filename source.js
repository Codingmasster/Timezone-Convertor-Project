const timeZoneIds = [
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Sydney',
  'Australia/Darwin',
  'Australia/Perth'
];

const apiKey = 'LAYLO026ZUZ9'; // Replace 'YOUR_API_KEY' with your actual API key

const fetchTimeForTimeZone = async (fromTimeZone, timestamp, toTimeZone) => {
  const apiUrl = `https://api.timezonedb.com/v2.1/convert-time-zone?key=${apiKey}&format=xml&from=${encodeURIComponent(fromTimeZone)}&to=${encodeURIComponent(toTimeZone)}&time=${timestamp}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching time: ${response.statusText}`);
    }
    const parsedResponse = await response.text();
    const xmlDoc = new DOMParser().parseFromString(parsedResponse, 'text/xml');
    const status = xmlDoc.getElementsByTagName('status')[0].textContent;
    if (status !== 'OK') {
      throw new Error(xmlDoc.getElementsByTagName('message')[0].textContent);
    }
    const toTimestamp = xmlDoc.getElementsByTagName('toTimestamp')[0].textContent;
    return { convertedDateTime: toTimestamp };
  } catch (error) {
    console.error('Error fetching time:', error);
    throw error;
  }
};

const displayTime = (timeZoneIndex, formattedTime, formattedDate) => {
  const date = new Date(formattedDate * 1000);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const timeZoneElement = document.getElementById(`timeZone${timeZoneIndex + 1}`);
  timeZoneElement.innerHTML = `<h2>${timeZoneIds[timeZoneIndex]}</h2><p>${time}</p><p>${date.toLocaleDateString()}</p>`;
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch time zone options and populate dropdown
async function populateTimeZoneDropdown() {
  const apiUrl = `https://api.timezonedb.com/v2.1/list-time-zone?key=${apiKey}&format=json`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching time zones: ${response.statusText}`);
    }
    const data = await response.json();
    const selectElement = document.getElementById('fromTimeZoneSelect');
    data.zones.forEach(zone => {
      const option = document.createElement('option');
      option.value = zone.zoneName;
      option.textContent = `${zone.countryName} (${zone.zoneName})`;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching time zones:', error);
    alert('Error fetching time zones. Please try again later.');
  }
}

// Call the function to populate dropdown when the page loads
window.addEventListener('load', populateTimeZoneDropdown);

// Modify convertFutureDateTime to use selected fromTimeZone
const convertFutureDateTime = async () => {
  const futureDateTimeInput = document.getElementById('futureDateTime').value;
  const fromTimeZone = document.getElementById('fromTimeZoneSelect').value; // Get selected fromTimeZone

  if (!futureDateTimeInput) {
    alert('Please select a future date and time.');
    return;
  }

  const dateObject = new Date(futureDateTimeInput);
  const timestamp = Math.floor(dateObject.getTime() / 1000);

  for (const timeZoneId of timeZoneIds) {
    try {
      await delay(1000);
      const responseData = await fetchTimeForTimeZone(fromTimeZone, timestamp, timeZoneId);
      const formattedTime = responseData.convertedDateTime.slice(11, 16);
      const formattedDate = responseData.convertedDateTime.slice(0, 10);
      displayTime(timeZoneIds.indexOf(timeZoneId), formattedTime, formattedDate);
    } catch (error) {
      console.error('Error fetching time:', error);
      alert('Error fetching time. Please try again later.');
    }
  }
};

const convertButton = document.getElementById('convertButton');
convertButton.addEventListener('click', convertFutureDateTime);
