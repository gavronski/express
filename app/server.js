const express = require('express');

const app = express();
const port = 8091;
const path = require('path');
const fs = require('fs');
app.set('view engine', 'hbs');

// jeżeli plik z danymi nie istnieje do wygeneruj pierwsze dane
if (!fs.existsSync('./result.json')) {
    getValues()
}
// wywołuje funkcję generateValues co dwie minuty czyli zapis do pliku co dwie minuty
generateValues = setInterval(generateValues, 120000)

function generateValues() {
    fs.readFile('./result.json', 'utf-8', (err, currentData) => {
        if (err) {
            throw err;
        }
        getValues(JSON.parse(currentData.toString()))
    });
}

function getValues(currentData) {
    result = []
   
    for (i = 15; i>0; i--) {
        temperature = getRandomIntInclusive(10, 60)
        humidity = getRandomIntInclusive(10, 60)
        date = new Date().toLocaleString()
        // tymczasowy słownik 
        tmp = {
            'temperature' : temperature,
            'humidity' : humidity,
            'time' : date
        }
        //dodanie słownika do tablicy
        result.push(tmp)
    }
    // połączenie dotychczaswoych wyników z wygenerowanymi
    result = result.concat(currentData)
    // pop usuwa ostatni element tablicy tutaj null
    result.pop()
    //konwertuje tablicę do jsona
    jsonData = JSON.stringify(result)
    
    // nadpisuje plik z danymi
    fs.writeFile('result.json', jsonData, (err) => {
        if (err) {
            throw err;
        }
        // informacja że dane zostały zapisane do pliku
        console.log("Dokonano zapisu.");
    });
}

// zwraca wartość z przedziału min, max
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

// obsługa przycisków 'Poprzedni' ii 'Następny'
function customPaginate(content, page) {
    // liczy ile stron będzie maksymalnie przy podzieleniu na 15
    parts = Math.ceil(content.length/15)
    
    // jeżeli adres localhost:8091 lub localhost:8091/1 to pobiera pierwsze 15 elementów z pliku 
    if (page == undefined || page == 1)
    {
        page = 1
        offset = (page - 1) * 15 
        content = content.slice(offset, 15)
        prev = 1
        next = 2
    }
    //jeżeli adres zawiera parametr page i jest on różny od 1 np. ocalhost:8091/2 to pobiera drugą pietnastkę z danych
    if (page != undefined && page != 1)
    {
        offset = (page - 1) * 15 
        limit = page * 15
        // zwraca fragment danych
        content = content.slice(offset, limit)
        prev = page - 1
        next = prev + 2
    }

    // jeżeli nr strony jest równy liczbie danych przez 15 to zablokuje możliwość przejścia do kolejnej strony 
    // np. w pliku jest 30 wpisów to next będzie usawtiony na maksymalnie 2 i ne będzie można przejść na trzecią stronę jeśli w results.json nie pojawi się kolejne 15 wpisów
    if (page == parts)
    {
        next = page
    }

    return {
        'data' : content,
        'page' : page,
        'prev' : prev,
        'next' : next
    }
}

// obsługa trasy z parametrem page znak "?" oznacza, że jest nie obligatoryjny czyli parametr nie musi zostać przekazany - localhost:8091
app.get('/:page?', function(req, res) {
    //czyta wpisy z pliku result.json i przypisuje je do parametru currentData
    fs.readFile('./result.json', 'utf-8', (err, currentData) => {
        if (err) {
            throw err;
        }
        // zwraca opwiednią część danych w zależności od strony np.
        // adres localhost:8091/3 zwraca elementy z przedziału od 30 do 45 adres strona localhost:8091/4 od 45 do 60
        // przekazuje dane do widoku linia 96 gdzie data to słownik data.next to parametr słownika
    
        res.render('index', {
            result: data.data,
            pagination: data.pagination,
            page: data.page,
            prev : data.prev,
            next : data.next,
        });
    });
   
  });

// uruchamia aplikację na podanym porcie
app.listen(port);
//zapis do konsoli przy starcie aplikacji ctr + myszka przechodzi do adresu
console.log('Server started at http://localhost:' + port);