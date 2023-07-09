import express from "express";
import https from "https";
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import {config} from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
});

app.post('/',(req, res)=>{
    const query = req.body.cityName;
    const apiKey = config.API_KEY;
    const units = "metric";
    const queryURL = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${apiKey}`
    https.get(queryURL, (resp) => {
        resp.on('data', (queryData)=>{
            const queryResult = JSON.parse(queryData);
            const lat = queryResult[0].lat;
            const lon = queryResult[0].lon;

            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
            https.get(url,(response) => {
              console.log(response.statusCode);
        
              response.on('data', (data)=>{
                const weatherData = JSON.parse(data);
                const temp = weatherData.main.temp;
                const desc = weatherData.weather[0].description;
                const icon = weatherData.weather[0].icon;
                const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
                const text = `
                <h1>The temperature in ${query} is: ${temp}°C</h1>
                <p>We can look forward to: ${desc}</p>
                <img src=${iconURL} alt=${desc}>
                `
                res.send(text) 
              })
            });
        })
    });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
