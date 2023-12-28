const express = require('express');
const dotenv = require('dotenv').config;
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 8000;

app.get('/snowbird', async (req, res) => {
	const url = 'https://www.snowbird.com/lifts-trails/';

	try {
		// Make a GET request to the website
		const response = await axios.get(url);

		// Load the HTML content into Cheerio
		const $ = cheerio.load(response.data);

		// Select all div elements with the class "trailFilter"
		const trailFilters = $('.trailFilter');

		// Create an array to store the scraped data
		const trailData = [];

		// Get the current timestamp and format it to mm/dd/yy, 12 hour time
		const lastUpdated = new Date().toLocaleString('en-US', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false, // Use 24-hour format
		});

		// add the resort name to the json respone,
		const resortName = 'Snowbird';

		// Iterate over each "trailFilter" div
		trailFilters.each((index, element) => {
			const trailFilter = $(element);

			// Extract information from the sub divs
			const status = trailFilter.find('.status').first().text().trim();
			const name = trailFilter.find('.title').first().text().trim();
			const groomedElement = trailFilter.find('.title').last();
			let groomed = groomedElement.text().trim();

			// Check if groomed is empty or has length <= 0, set it to 'not groomed'
			if (!groomed || groomed.length <= 0) {
				groomed = 'not groomed';
			}

			const iconClass = trailFilter.find('.icon').attr('class');
			const iconSuffix = iconClass ? iconClass.substring(iconClass.indexOf(' ') + 1) : '';

			// Push the extracted data as an object to the array
			trailData.push({
				index,
				name,
				status,
				groomed,
				difficulty: iconSuffix,
				lastUpdated,
			});
		});

		// Create the final response object
		const responseObject = {
			resortname: resortName,
			trails: trailData,
		};

		// Send the scraped data as JSON response
		res.json(responseObject);
	} catch (error) {
		// Handle errors, e.g., send an error response
		console.error('Error fetching or scraping data from Snowbird:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
