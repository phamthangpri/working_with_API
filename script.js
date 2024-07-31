/*************************************************************************************************************
 Author:            Victoria Thang Pham
 Description:       Get energy data from company.ia API
					
 Parameter(s):      apiKeyId (string) : API key id to connect to company.ia API 
                    MongoDB connection parameters

 **************************************************************************************************************
 SUMMARY OF CHANGES
 Date(yyyy-mm-dd)    Author              Comments
 ------------------- ------------------- ----------------------------------------------------------------------
 2024-06-27          Victoria Thang Pham       Init create script.
 *************************************************************************************************************/

 
const axios = require('axios');
const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');


/////////////////////////////// STEP 1 : GET LIST OF SITE IDS FROM API ////////////////////////////////////////
const getSiteIds = async (apiKeyId) => {
    try {
        const response = await axios.get(`https://myapi.xyz.com/sites/list?size=5&sortProperty=name&sortOrder=ASC&api_key=${apiKeyId}`);

        // Get all siteids for a given apiKeyId
        const siteArray = response.data.sites.site;
        const siteIds = siteArray.map(site => site.id);
        return siteIds
    } catch (error) {
        console.error('Error fetching site IDs:', error);
        throw error; 
    }
};

/////////////////////////////// STEP 2 : FETCH DAILY ENERGY ////////////////////////////////////////
const getDailyEnergy = async (apiKeyId, siteId, date) => {
    try {
        // Format date to datetime
        const dateTime = dayjs(date).format('YYYY-MM-DD HH:mm:ss');

        const apiUrl = `https://myapi.xyz.com/site/${siteId}/energyDetails?timeUnit=DAY&startTime=${encodeURIComponent(dateTime)}&endTime=${encodeURIComponent(dateTime)}&api_key=${apiKeyId}`;
      
        const response = await axios.get(apiUrl);
        // Debugging log
        console.log('getDailyEnergy_API Response:', JSON.stringify(response.data, null, 2));
        
       // Get the values from the response
       const extractEnergyValues = (data) => {
        const energyDetails = data.energyDetails;
        const meters = energyDetails.meters;
        const unit = energyDetails.unit;
        let dailyPurchased = 0;
        let dailyExport = 0;
        let dailyConsumption = 0;
        let dailyProduction = 0;
        let dailySelfConsumption = 0;
        

        meters.forEach(meter => {
            // Only one value in the result, so get the 1st one
            if (meter.type === 'Purchased') {
                if (meter.values.length > 0) {
                  dailyPurchased = meter.values[0].value;
                }
            
            } else if (meter.type === 'FeedIn') {
                if (meter.values.length > 0) {
                    dailyExport = meter.values[0].value;
                }
            } else if (meter.type === 'Production') {
                if (meter.values.length > 0) {
                    dailyProduction = meter.values[0].value;
                }
            } else if (meter.type === 'Consumption') {
                if (meter.values.length > 0) {
                    dailyConsumption = meter.values[0].value;
                }
            } else if (meter.type === 'SelfConsumption') {
                if (meter.values.length > 0) {
                    dailySelfConsumption = meter.values[0].value;
                }
            }
        });

        // Check if unit = watt-hours, convert data to kilowat-hours
        if (unit === 'Wh') {
            dailyPurchased /= 1000;
            dailyExport /= 1000;
            dailyConsumption /= 1000;
            dailyProduction /= 1000;
            dailySelfConsumption /= 1000;
          }
        return { dailyPurchased, dailyExport, dailyConsumption, dailyProduction, dailySelfConsumption };
        
    };

    // Get values
    const { dailyPurchased, dailyExport, dailyConsumption, dailyProduction, dailySelfConsumption  } = extractEnergyValues(response.data);
    
    return { dailyPurchased, dailyExport, dailyConsumption, dailyProduction, dailySelfConsumption  };


    } catch (error) {
        console.error('Error fetching daily_energy data:', error);
        throw error;
    }
};

/////////////////////////////// STEP 3 : FETCH LIFETIME ENERGY ////////////////////////////////////////

const getLifeTimeEnergy = async (apiKeyId, siteId, date) => {
    try {
        // Format the dateTime
        const dateTime = dayjs(date).format('YYYY-MM-DD HH:mm:ss');

        const apiUrl = `https://myapi.xyz.com/site/${siteId}/meters?timeUnit=DAY&startTime=${encodeURIComponent(dateTime)}&endTime=${encodeURIComponent(dateTime)}&api_key=${apiKeyId}`;
      
        const response = await axios.get(apiUrl);
        // Debugging log
        console.log('getLifeTimeEnergy_API Response:', JSON.stringify(response.data, null, 2));
        
        // Get the values from the response
       const extractLifetimeEnergyValues = (data) => {
        const meterEnergyDetails = data.meterEnergyDetails;
        const meters = meterEnergyDetails.meters;
        const unit = meterEnergyDetails.unit;

        // console.log('Meters:', meters); // Debugging log
        let lifeTimePurchased = 0;
        let lifeTimeExport = 0;
        let lifeTimeConsumption = 0;
        let lifeTimeProduction = 0;
        let lifeTimeSelfConsumption = 0;
        

        meters.forEach(meter => {
            // Only one value in the result, so get the 1st one
            if (meter.meterType === 'Purchased') {
                if (meter.values.length > 0) {
                    lifeTimePurchased = meter.values[0].value;
                }
           
            } else if (meter.meterType === 'FeedIn') {
                if (meter.values.length > 0) {
                    lifeTimeExport = meter.values[0].value;
                }
            
            } else if (meter.meterType === 'Consumption') {
                if (meter.values.length > 0) {
                    lifeTimeConsumption = meter.values[0].value;
                }
            } else if (meter.meterType === 'Production') {
                if (meter.values.length > 0) {
                    lifeTimeProduction = meter.values[0].value;
                }
            } else if (meter.meterType === 'SelfConsumption') {
                if (meter.values.length > 0) {
                    lifeTimeSelfConsumption = meter.values[0].value;
                }
            }
        });
        // Check if unit = watt-hours, convert data to kilowatt
        if (unit === 'Wh') {
            lifeTimePurchased /= 1000;
            lifeTimeExport /= 1000;
            lifeTimeConsumption /= 1000;
            lifeTimeProduction /= 1000;
            lifeTimeSelfConsumption /= 1000;
          }
        return { lifeTimePurchased, lifeTimeExport, lifeTimeConsumption, lifeTimeProduction, lifeTimeSelfConsumption};
            
        };
    
        // Get values
        const { lifeTimePurchased, lifeTimeExport, lifeTimeConsumption, lifeTimeProduction, lifeTimeSelfConsumption } = extractLifetimeEnergyValues(response.data);       
    
        return { lifeTimePurchased, lifeTimeExport, lifeTimeConsumption, lifeTimeProduction, lifeTimeSelfConsumption };
    } catch (error) {
        console.error('Error fetching lifetile_energy data:', error);
        throw error;
    }
};

/////////////////////////////// STEP 4 : VERIFY DATA CORRECTNESS ////////////////////////////////////////
const verifyData = (storedData, newData) => {
    for (const key in newData) {
      if (newData.hasOwnProperty(key) && storedData.hasOwnProperty(key)) {
        if (storedData[key] !== newData[key]) {
          return false;
        }
      }
    }
    return true;
  };

/////////////////////////////// STEP 5 : AGGREGATE DATA ////////////////////////////////////////
const getEnergy = async ({ project, db, date }) => {
    const apiKeyId = project.apiKeyId;

    // Get site Ids
    const siteIds = await getSiteIds(apiKeyId);

    const defaultValues = {
      dailyPurchased: 0,
      dailyExport: 0,
      dailyConsumption: 0,
      dailyProduction: 0,
      dailySelfConsumption: 0,
      lifeTimePurchased: 0,
      lifeTimeExport: 0,
      lifeTimeConsumption: 0,
      lifeTimeProduction: 0,
      lifeTimeSelfConsumption: 0
    };
  
    // Aggregate data
    const aggregatedData = {
      ...defaultValues,
      date: date.format('YYYY-MM-DD')
    };
    
    for (const siteId of siteIds) {
      const dailyEnergy = await getDailyEnergy(apiKeyId, siteId, date);
      const lifeTimeEnergy = await getLifeTimeEnergy(apiKeyId, siteId, date);
  
      aggregatedData.dailyPurchased += dailyEnergy.dailyPurchased;
      aggregatedData.dailyExport += dailyEnergy.dailyExport;
      aggregatedData.dailyConsumption += dailyEnergy.dailyConsumption;
      aggregatedData.dailyProduction += dailyEnergy.dailyProduction;
      aggregatedData.dailySelfConsumption += dailyEnergy.dailySelfConsumption;

      aggregatedData.lifeTimePurchased += lifeTimeEnergy.lifeTimePurchased;
      aggregatedData.lifeTimeExport += lifeTimeEnergy.lifeTimeExport;
      aggregatedData.lifeTimeConsumption += lifeTimeEnergy.lifeTimeConsumption;
      aggregatedData.lifeTimeProduction += lifeTimeEnergy.lifeTimeProduction;
      aggregatedData.lifeTimeSelfConsumption += lifeTimeEnergy.lifeTimeSelfConsumption;
    }
    console.log('Aggregate Data:', aggregatedData);

    // Verify data correctness
    console.log('VERIFY DATA CORRECTNESS STEP');

    const existingData = await db.collection('carbonEnergyData').findOne({ date: aggregatedData.date });
    if (existingData) {
        const isDataCorrect = verifyData(existingData, aggregatedData);
        console.log("isDataCorrect ?: ", isDataCorrect)

        if (!isDataCorrect) {
        // Handle data discrepancy (log and update it)
        console.log('Data discrepancy found:', { existingData, aggregatedData });
        await db.collection('carbonEnergyData').updateOne({ _id: existingData._id }, { $set: aggregatedData });
        console.log('Updated with new values');
        
        } else {
        console.log('Data already exists in MongoDB');
        }

    } else {
        // Insert aggregated data into MongoDB if it doesn't exist
        await db.collection('carbonEnergyData').insertOne(aggregatedData);
        console.log('Data does not exist in MongoDB, Insert aggregated data');
    }

    return aggregatedData;
  };
  
  module.exports = {
    getEnergy
  };


  /////////////////////////////// TEST CODE ////////////////////////////////////////
  const run = async () => {
    const { MongoClient } = require('mongodb');
    const uri = 'mongodb://localhost:27017'; ////////// TO CHANGE
    const dbName = 'energy_data';            

    // Create a new MongoClient
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const project = {
      _id: '123',
      apiKeyId: 'PUT_YOUR_API_KEY_HERE' // ////////// TO CHANGE 
    };
    const date = dayjs().subtract(1, 'day'); // get the previous date
  
    try {
      const energyData = await getEnergy({ project, db, date });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      await client.close();
    }
  };
  
  run();
