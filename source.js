const timeZoneIds = [
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Sydney',
  'Australia/Darwin',
  'Australia/Perth'
];

const apiKey = 'LAYLO026ZUZ9';

const fetchTimeForTimeZone = async (fromTimeZone, timestamp, toTimeZone) => {
  console.log(fromTimeZone);
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
  console.log("Formated date =", formattedDate);
  const date = new Date(formattedDate * 1000);
  console.log(date);
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

const convertFutureDateTime = async () => {
  const futureDateTimeInput = document.getElementById('futureDateTime').value;

  if (!futureDateTimeInput) {
    alert('Please select a future date and time.');
    return;
  }

  // Convert input date and time to timestamp
  const dateObject = new Date(futureDateTimeInput);
  const timestamp = Math.floor(dateObject.getTime() / 1000); // Convert to seconds

  for (const timeZoneId of timeZoneIds) {
    try {
      await delay(1000); // Consider removing or adjusting delay based on API rate limits
      const responseData = await fetchTimeForTimeZone('Africa/Ouagadougou', timestamp, timeZoneId);
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
