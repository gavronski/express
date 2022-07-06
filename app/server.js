const express = require('express');

const app = express();
const port = 8091;
const path = require('path');
app.set('view engine', 'hbs');
app.use(express.static("images"));

const mongoClient = require('mongodb').MongoClient
const url = 'mongodb://127.0.0.1:27017'
const dbname = 'czujniki'

mongoClient.connect(url, {}, (error, client) => {
    if (error) {
        console.log("Błąd w połączeniu z bazą.")
    }
    const db = client.db(dbname)
    cities = ['Warszawa', 'Kraków', 'Łódź', 'Rzeszów']

   
    db.collection('pomiary').insertMany(
            [
                {
                    city: 'Warszawa',
                    temperature: 0,
                    humidity: 0,
                    time: 0,
                    weather: 0
                },
                {
                    city: 'Kraków',
                    temperature: 0,
                    humidity: 0,
                    time: 0,
                    weather: 0
                }, {
                    city: 'Łódź',
                    temperature: 0,
                    humidity: 0,
                    time: 0,
                    weather: 0
                },{
                    city: 'Rzeszów',
                    temperature: 0,
                    humidity: 0,
                    time: 0,
                    weather: 0
                }
            ]
        )
    
    updateValues = setInterval(function () {
        update(db)
    }, 120000)
    db.collection('pomiary').deleteMany( { weather : 0 } );

    db.collection('pomiary').find({}).toArray((error, results) => {
        app.get('/', function(req, res) {
                results.forEach(object => {
                    weather = object.weather
                    object.displaySun = false
                    object.displayRain = false
                    object.displayWind = false
                    object.displayCloud = false

                    if (weather == 'sun') object.displaySun = true
                    if (weather == 'rain') object.displayRain = true
                    if (weather == 'wind') object.displayWind = true
                    if (weather == 'clouds') object.displayCloud = true
                })
            
                 res.render('index', {
                    result: results,
                 });
               
          });
    })

    console.log("Połączenie powiodło się.")
})

function getValues() {
    temperature = getRandomIntInclusive(10, 60)
    humidity = getRandomIntInclusive(10, 60)
    date = new Date().toLocaleString()
    weatherConditions = ['sun', 'clouds', 'rain', 'wind']
    weather = weatherConditions[Math.floor(Math.random()*weatherConditions.length)]

    data = {
        'temperature' : temperature,
        'humidity' : humidity,
        'time' : date,
        'weather' : weather
    }
    return data
}

function update(db) {
    measurements = []
    for (i=0; i<cities.length; i++) {
        measurements[cities[i]] = getValues()
    }
    cities.forEach(city => {
        data = measurements[city]
        db.collection('pomiary').updateOne({
            city:city
        }, {
            $set: {
                temperature: data.temperature,
                humidity: data.humidity,
                time: data.time,
                weather: data.weather
            }
        })
    })
}
// zwraca wartość z przedziału min, max
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

// uruchamia aplikację na podanym porcie
app.listen(port);
//zapis do konsoli przy starcie aplikacji ctr + myszka przechodzi do adresu
console.log('Server started at http://localhost:' + port);