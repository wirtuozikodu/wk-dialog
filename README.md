# WkDialogs (Twig)
Uniwersalne, interaktywne okna dialogowe w formie komponentów Twig, oparte o czysty JavaScript

<h2 id="spis-tresci">Spis tresci</h2>

 1. [Informacje podstawowe](#informacje)
 2. [Stosowanie](#stosowanie)
 3. [Właściwości](#wlasciwosci)
 4. [Bloki treści](#bloki)
 5. [Dostępne metody](#metody)
 6. [Otwieranie/zamykanie okien](#otwieranie-zamykanie)
 7. [Zdarzenia](#zdarzenia)
 8. [Domyślne klasy przycisków](#klasy-przyciskow)

<h2 id="informacje">1. Informacje podstawowe</h2>

[Powrót do spisu treści](#spis-tresci)

 1. Komponent `wk-dialog.twig` korzysta z uniwersalnej klasy `WkDialog` zapewniającej działanie i enkapsulację właściwości i metod dla każdego z dodanych dialogów.
 2. Wszystkie dialogi oraz właściwości pomocnicze dodawane są do globalnie dostępnego obiektu `wkDialogs` umieszczonym w obiekcie `window`.
 3. Właściwości pomocnicze obiektu `wkDialogs`:
	- `activeDialogs` - tablica zawierająca id aktywnych (otwartych) dialogów w kolejności ich otwierania,

<h2 id="stosowanie">2. Stosowanie</h2>

[Powrót do spisu treści](#spis-tresci)

 1. Aby skorzystać z komponentu `wk-dialog.twig`, należy **UPRZEDNIO** (najlepiej w sekcji `<head>`) zaimportować skrypt `wk-dialogs.js`.
 2. Każdy z dołączanych komponentów inicjalizuje się po stronie JS automatycznie i nie wymaga podejmowania żadnych dodatkowych akcji.
 4. Każdy z dołączanych komponentów **MUSI** posiadać unikatowe `id` przekazywane we właściwościach komponentu. Będzie to jego identyfikator w obiekcie `wkDialogs`.
 5. Stosując komponent `wk-dialog.twig` należy skorzystać z funkcji `{% embed %}` i za jej pomocą przekazać obiekt właściwości - `with {} only` oraz bloki treści - `{% block %}`, przykładowo:
 ```twig
{% embed 'components/wk-dialog.twig' with {
    id: 'dialog_alpha',
    maxWidth: 700,
    hideCloseButton: false,
    hideModal: true,
    isPersistent: true,
    noClickAnimation: false,
    value: true,
    allowBodyScroll: false
} only %}
    {% block title %}
        Tytuł okna dialogowego
    {% endblock %}
    {% block content %}
        Treść okna dialogowego
    {% endblock %}
    {% block footer %}
        Stopka okna dialogowego
    {% endblock %}
{% endembed %}
```
5. Informacje o dostępnych właściwościach, blokach treści, dostępnych metodach etc. znajdują się poniżej.

<h2 id="wlasciwosci">3. Właściwości</h2>

[Powrót do spisu treści](#spis-tresci)

 - `id` **(string: null)** - **unikalny** identyfikator okna dialogowego, pod jego treścią komponent dodawany jest do globalnego obiektu `wkDialogs`,
 - `value` **(boolean: false)** - początkowy stan okna dialogowego (true - otwarte, false - zamknięte),
 - `maxWidth` **(int/string: '100%')** - maksymalna szerokość okna dialogowego. Po podaniu wyłącznie wartości liczbowej (int/string) zostanie ona ustawiona w pikselach. Po podaniu wartości z jednostką (string) - jednostka zostanie uwzględniona.
 - `hideCloseButton` **(boolean: false)** - umożliwia ukrycie przycisku **x** zamykającego dialog (UWAGA: przycisk będzie niewidoczny, jeśli nie zostanie przekazana zawartość bloku `title`),
 - `hideModal` **(boolean: false)** - umożliwia ukrycie modala (ciemnego tła) za oknem dialogowym. **Nie** usuwa go jednak ze struktury komponentu (dzięki temu wciąż możliwe jest np. zamknięcie okna po kliknięciu w obszar poza nim),
 - `isPersistent` **(boolean: false)** - określa, czy okno dialogowe ma pozostać otwarte, kiedy wciśnięty zostanie klawisz **ESC** lub użytkownik kliknie na obszar poza oknem,
 - `noClickAnimation` **(boolean: false)** - umożliwia wyłącznie animacji sugerującej brak możliwości zamknięcia okna (ta występuje wówczas, kiedy `isPersistent` jest ustawione na `true`),
 - `allowBodyScroll` **(boolean: false)** - umożliwia pozostawienie użytkownikowi możliwości przewijania strony po otwarciu okna dialogowego (niezalecane w przypadku okien o sporej zawartości bloku `content`).
 
 <h2 id="bloki">4. Bloki treści</h2>
 
[Powrót do spisu treści](#spis-tresci)
 
 - `title` - pozwala na przekazanie kodu HTML do umieszczenia w nagłówku okna dialogowego - treść jest domyślnie ograniczona do jednej linii z `text-overflow: ellipsis`. Zmiana tego stanu rzeczy nie jest zalecana.
 - `content` - pozwala na przekazanie kodu HTML do umieszczenia w treści okna dialogowego - wysokość treści nie jest ograniczona; kiedy zawartość wykracza poza wysokość okna, automatycznie pojawia się możliwość jego przewijania.
 - `footer` - pozwala na przekazanie kodu HTML do umieszczenia w stopce okna dialogowego (np. przyciski "Zatwierdź" czy "Anuluj".

 <h2 id="metody">5. Dostępne metody</h2>
 
[Powrót do spisu treści](#spis-tresci)

Każdy z komponentów udostępnia własny zestaw metod możliwych do wywołania za pomocą:
```javascript
wkDialogs.id_dialogu.metoda();
```
Lista dostępnych metod znajduje się poniżej:

 - `getValue()` - pozwala na pobranie stanu otwarcia okna dialogowego,
 - `setValue(boolean)` - pozwala na programistyczne ustawienie stanu otwarcia okna dialogowego,
 - `getMaxWidth()` - pozwala na pobranie maksymalnej szerokości okna dialogowego,
 - `getMaxWidth(string/int)` - pozwala na programistyczne ustawienie maksymalnej szerokości okna dialogowego,
 - `getHideCloseButton()` - pozwala na pobranie stanu ukrycia przycisku **x**,
 - `setHideCloseButton(boolean)` - pozwala na programistyczne ustawienie stanu ukrycia przycisku **x**,
 - `getHideModal()` - pozwala na pobranie stanu ukrycia modala (zaciemnionego tła),
 - `setHideModal(boolean)` - pozwala na programistyczne ustawienie stanu ukrycia modala (zaciemnionego tła); UWAGA: zmiany zostaną zastosowane dopiero po ponownym otwarciu okna dialogowego,
 - `getPersistent()` - pozwala na pobranie stanu funkcji blokującej zamknięcie okna poprzez kliknięcie obszaru poza nim lub wciśnięciu przycisku **ESC**,
 - `setPersistent(boolean)` - pozwala na programistyczne ustawienie stanu funkcji blokującej zamknięcie okna poprzez kliknięcie obszaru poza nim lub wciśnięciu przycisku **ESC**,
 - `getNoClickAnimation()` - pozwala na pobranie stanu wyłączenia animacji sugerującej brak możliwości zamknięcia okna dialogowego,
 - `setNoClickAnimation(boolean)` - pozwala na programistyczne ustawienie stanu wyłączenia animacji sugerującej brak możliwości zamknięcia okna dialogowego,
 - `getAllowBodyScroll()` - pozwala na pobranie stanu funkcji umożliwiającej przewijanie strony po otwarciu okna dialogowego,
 - `setAllowBodyScroll(boolean)` - pozwala na programistyczne ustawienie stanu funkcji umożliwiającej przewijanie strony po otwarciu okna dialogowego,

 <h2 id="otwieranie-zamykanie">6. Otwieranie/zamykanie okien</h2>

[Powrót do spisu treści](#spis-tresci)

 1. Skrypt `wk-dialogs.js` w sposób automatyczny dodaje globalną funkcję wyszukującą elementy o przypisanych atrybutach typu `data-` umożliwiających otwieranie i zamykanie poszczególnych okien dialogowych.
 2. Aby **otworzyć** okno dialogowe po kliknięciu w dany element strony, należy przekazać mu atrybut `data-open-dialog` i umieścić w nim `id` pożądanego okna, np.:
```html
<button data-open-dialog="dialog_alpha">
   Otwórz okno Alpha
</button>
```
3. Aby **zamknąć** okno dialogowe po kliknięciu w dany element strony, należy przekazać mu atrybut `data-close-dialog` i umieścić w nim `id` pożądanego okna, np.:
```html
<button data-close-dialog="dialog_alpha">
   Zamknij okno Alpha
</button>
```
4. W przypadku, kiedy element zamykający okno znajduje się w **nim samym** (na przykład "Anuluj" w stopce dialogu), zalecanym rozwiązaniem jest użycie składni:
```html
<button data-close-dialog="{{ id }}">
   Zamknij TO okno
</button>
```
Pozwoli to na uniknięcie błędów przy ewentualnej zmianie atybutu `id`.

5. Podczas każego otwarcia okna, przenoszone jest ono na koniec sekcji `<body>`. Pozwala to na wyświetlenie go bezwzględnie nad pozostałymi elementami.
6. Ponadto po otwarciu, dialog otrzymuje wartość `z-index` większą o 1 od najwyższej wartości `z-index` wśród elementów strony. Po zamknięciu, celem uniknięcia nieskończonej inkrementacji owej wartości, dialog otrzymuje `z-index: 0`.

 <h2 id="zdarzenia">7. Zdarzenia</h2>

[Powrót do spisu treści](#spis-tresci)

Każdy z dodanych komponentów rozgłasza własne zdarzenia. Ich nasłuchiwanie jest możliwe poprzez następującą składnię:
```javascript
    // Nasłuchiwanie KAŻDEGO zdarzenia określonego typu
wkDialogs.id_dialogu.on(zdarzenie, funkcja);

    // Nasłuchiwanie PIERWSZEGO zdarzenia określonego typu
wkDialogs.id_dialogu.once(zdarzenie, funkcja);

    // USUNIĘCIE handlera zdarzenia określonego za pomocą .on() lub .once()
wkDialogs.id_dialogu.off(zdarzenie, funkcja);
```
Rozgłaszane zdarzenia to:
 - `open` - wywoływane podczas otwarcia okna dialogowego,
 - `close` - wywoływane podczas zamknięcia okna dialogowego,
 - `cancel` - wywoływane podczas próby zamknięcia okna (zablokowanej właściwością `isPersistent`,

Ponadto domyślny obiekt przekazywany funkcji obsługującej zdarzenie zawiera następujące właściwości:
 - `.dialog` - obiekt okna dialogowego rozgłaszającego zdarzenie. Udostępnia wszystkie funkcjonalności dane dialogu, między innymi wywoływanie metod czy dodawanie kolejnych zdarzeń.
 - `.actionNode` - element odpowiedzialny za wywołanie zdarzenia (np. `<button>` z określonym atrybutem `data-open-dialog`); UWAGA: tylko w przypadku `'open'` oraz `'close'`.

Przykład handlera dla zdarzenia:
```javascript
wkDialogs.dialog_alpha.on('open', function(e) {

    console.log('To ja otworzyłem dialog:');
    console.log(e.actionNode);
    
    e.dialog.setHideModal(true);
    
});
```
handler naturalnie może być również funkcją strzałkową.

<h2 id="klasy-przyciskow">8. Domyślne klasy przycisków</h2>

[Powrót do spisu treści](#spis-tresci)

Plik `_wk-dialog.scss` oprócz domyślnego stylowania okna dialogowego, zawiera również uniwersalne style przycisków. Są to kolejno:

 - `.wk-dialog-actions` - uniwersalny wrapper dla przycisków (domyślnie odwraca ich kolejność i umieszcza je z prawej strony np. stopki),
 - `.wk-dialog-button` - uniwersalny przycisk akcji (domyślnie otrzymuje kolor ze zmiennej $PRIMARY),
 - `.wk-dialog-button--text` - uniwersalny przycisk tekstowy (domyślnie otrzymuje biały kolor),

Użycie powyższych klas jest możliwe, lecz nie wymagane.