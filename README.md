# Energy Data Aggregation Script
## Overview
This project contains a script that fetches energy data from the company.ia API and aggregates it into a MongoDB database. The script handles fetching daily and lifetime energy data for a list of site IDs, verifies data correctness, and updates or inserts the data into MongoDB as needed.

## Author
Victoria Thang Pham

## Description
The script performs the following steps:

+ Fetches a list of site IDs from the API.
+ Fetches daily energy data for each site.
+ Fetches lifetime energy data for each site.
+ Verifies the correctness of the fetched data against existing data in MongoDB.
+ Aggregates the data and inserts or updates it in MongoDB.

## Getting Started
### Prerequisites
+ Node.js
+ MongoDB
+ npm (Node Package Manager)

### Installation
1. Clone the repository:
```
git clone https://github.com/yourusername/energy-data-aggregation.git
cd energy-data-aggregation
```
2. Install the required npm packages:
```
npm install
```
3. Configure the MongoDB connection and API key in the script.

### Usage
1. Update the MongoDB connection URI and the API key in the script:
```
const uri = 'mongodb://localhost:27017'; // Update with your MongoDB URI
const dbName = 'energy_data'; // Update with your database name
const apiKeyId = 'PUT_YOUR_API_KEY_HERE'; // Update with your API key
```
2. Run the script:
```
node your_script_name.js
```
## Functions
### 1. getSiteIds
Fetches the list of site IDs from the API.

#### Parameters:
apiKeyId (string): API key ID to connect to company.ia API.

#### Returns:
An array of site IDs.

### 2. getDailyEnergy
Fetches daily energy data for a given site.

#### Parameters:
+ apiKeyId (string): API key ID to connect to company.ia API.
+ siteId (string): ID of the site.
+ date (Date): Date for which to fetch the data.

#### Returns:
An object containing daily energy data.

### 3. getLifeTimeEnergy
Fetches lifetime energy data for a given site.

#### Parameters:

+ apiKeyId (string): API key ID to connect to company.ia API.
+ siteId (string): ID of the site.
+ date (Date): Date for which to fetch the data.

#### Returns:
An object containing lifetime energy data.

#### 4. verifyData
Verifies the correctness of the fetched data against existing data in MongoDB.

#### Parameters:
+ storedData (object): Existing data in MongoDB.
+ newData (object): New data fetched from the API.

#### Returns:
Boolean indicating whether the data is correct.

### 5. getEnergy
Aggregates the energy data and updates or inserts it into MongoDB.

#### Parameters:

+ project (object): Project information including API key ID.
+ db (object): MongoDB database instance.
+ date (Date): Date for which to fetch and aggregate the data.

#### Returns:
Aggregated data.

## Running Tests
You can run the script in a test mode by modifying the run function at the bottom of the script:

```
const run = async () => {
  const { MongoClient } = require('mongodb');
  const uri = 'mongodb://localhost:27017'; // Update with your MongoDB URI
  const dbName = 'energy_data'; // Update with your database name

  // Create a new MongoClient
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const project = {
    _id: '123',
    apiKeyId: 'PUT_YOUR_API_KEY_HERE' // Update with your API key
  };
  const date = dayjs().subtract(1, 'day'); // get the previous date

  try {
    const energyData = await getEnergy({ project, db, date });
    console.log('Energy Data:', energyData);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
};

run();
```
