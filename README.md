# PROJEKT ZESPOŁOWY GRUPA 5

 JAKUB FALKIEWICZ

 KACPER GRINHOLC

 KRZYSZTOF KOŁODZIEJSKI

## Uruchamianie aplikacji

W katalogu frontend należy zawrzeć plik .env(Plik .env jest zawarty w katalogu z pracą) w którym trzeba umieścić zmienną środowiskową:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Jest to klucz z api google maps, bez niego nie będzie działała gra geozgadywacz

Potem wystarczy że uruchomimy compose komendą

```sh
docker compose up --build
```

Aplikacja będzie działała pod adresem localhost:3000

## Dane testowe

Podczas startu serwera, aplikacja sprawdza czy istnieje konto administratora.
Jeśli nie istnieje to znaczy że aplikacja została postawiona pierwszy raz, i wymagane jest utworzenie danych testowych.

Aplikacja tworzy konto administratora, trzy konta użytkowników przeznaczone do testów, sześć gier wbudowanych w serwis, 
dwudziestu użytkowników bazowych, i około osiemdziesiąt wyników gier.

Wyniki są rozdzielane pomiędzy cztery gry(wordle, hangman, tetris, geozgadywacz) i czterech użytkowników(trzech testowych i administrator)

### Dostęp do kont użytkowników

Hasło używane w każdym koncie testowym to: Guest123!

Username konta administratora: admin

Username kont testowych: PrisonMike, Humdinger, PlayerTwo

### Potencjalny błąd podczas uruchamiania aplikacji

Podczas dodawania wyników gier może nastąpić błąd przez który testowe wyniki gier nie zostaną dodane.

Należy wtedy zakomentować linie 147 do 151 w pliku index.js znajdującym się w katalogu backend.
Jest to wywołanie funkcji tworzącej wyniki, błąd może pojawić się w sytuacji gdy konta testowe i gry wbudowane nie zostaną dostatecznie szybko utworzone.

## Plik do przetestowania przesyłania gry do serwisu

W podkatalogu gradotestu w katalogu frontend, znajduje się gra którą można przetestować umieszczanie gry w serwisie.
Jest to zmodyfikowana wersja wisielca , wyświetlająca nam słowo, które należy odgadnąć.
Wystarczy umieścić plik testhangman.js w polu drag and drop. Grę trzeba nazwać testhangman, gdyż to właśnie taka nazwa jest ustawiona w funkcji wysyłającej wynik, zdefiniowanej w tym pliku z grą.
