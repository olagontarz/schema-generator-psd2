# Schema Generator


## Generowanie pliku JSON schema

JSON schema to sposób definiowania formatów i walidowania przechodzących przez system eventów (obiektów JSON).

Program *schema-generator.js* służy do automatycznego wygenerowania odpowiedniego pliku z JSON schema na podstawie informacji znajdujących się w pliku konfiguracyjnym *config.js*.

Założenia, na których opiera się generator:
* wszystkie eventy zawierają pewną wspólną część pól (wspólna sekcja *security*)
* zawartość pola "eventType" definiuje typ przychodzącego eventu
* różne typy eventów zawierają różne dodatkowe pola (różne sekcje *business*)
* w każdym evencie muszą wystąpić wszystkie zdefiniowane dla niego pola oraz nie mogą pojawić się w nim żadne nadmiarowe pola

Plik *config.js* zawiera konfigurację do generatora zdefiniowaną w następujący sposób:
* "common" - wartość tego pola wskazuje na plik JSON z definicjami pól wspólnych (poza polem "eventType", które dodawane jest automatycznie) dla wszystkich typów eventów:
```
"common" : "./common.json"
```
* "eventType" - to słownik wartości eventType - ścieżka do pliku JSON z definicjami dodatkowych pól charakterystycznych dla danego typu eventu:
```
"eventTypes": {
    'domestic-transfer': './events/domestic-transfer.json',
    'international-transfer': './events/international-transfer.json',
    ...
}
```

Ścieżki do plików z opisami pól są względem plików *schema-generator.js* oraz *parser-generator.js*. 

Pliki z definicjalmi typów eventów znajdują się w folderze *events*. Są to obiekty JSON z wypisanymi właściwościami i ich ograniczeniami takimi jak np. zbiór dopuszczalnych wartości, format daty itp. Więcej informacji na temat dopuszczalnych typów i restrykcji znajduje się [tutaj](https://cswr.github.io/JsonSchema/spec/basic_types/). Kolejność definicji pól nie ma znaczenia.

Na przykład, fragment pliku "common.json":
```
{
    ...
    "channel": {
        "type": "string",
        "enum": ["INTERNET", "MOBILE"]
    },
    "ipAddress": {
        "type": "string",
        "format": "ipv4"
    },
    "browser": {
        "type": "string"
    },
   ...
}
```

Aby wygenerować plik JSON schema na podstawie zdefiniowanej w *config.js* konfiguracji oraz plików z opisami pól należy:
* zainstalować Node JS
* pobrać pliki źrodłowe z tego repozytorium
* z konsoli przejść do katalogu z kodem źródłowym
* wykonać komendę ```node schema-generator.js```

Wygnerowana schema pojawi się w pliku *schema.json* i może być zastosowana do walidacji eventów przychodzących do [serwisu SOC](https://github.com/olagontarz/soc-service).



## Generowanie parsera ArcSight

Dodatkowo, na podstawie tego samego pliku konfiguracyjnego *config.js*, za pomocą programu *parser-generator.js* można wygenerować szkielet parsera interpretującego przychodzące eventy w programie ArcSight. 

Do wygenerowanego szkieletu parsera należy dodać jedynie odpowiednie mapowanie pól dla tej części parametrów, które są zmienne w zależności od typu eventu.


Aby wygenerować plik z parserem, na podstawie zdefiniowanej w *config.js* konfiguracji oraz plików z opisami pól należy (analogicznie):
* zainstalować Node JS
* pobrać pliki źrodłowe z tego repozytorium
* z konsoli przejść do katalogu z kodem źródłowym
* wykonać komendę ```node parser-generator.js```

Wygnerowana schema pojawi się w pliku *json_parser.properties*.


