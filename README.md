# Анализатор сайтов

## Примечание

Это не полноценный модуль (экспорта нет), потому установить и использовать как зависимость или модуль npm не получится. 
Возможно доделаю в будущем

## Установка

Клонировать репозиторий, например:

    git clone git@github.com:RetroProgrammist/web-analyzer.git 

Запустить установку, командой:

    npm i
  
## Использовать

В папку **files** нужно положить **csv** с обязательной 1 строкой в которой будет имя колонки **url**
используемый **Delimiter**: **;**

### пример:

| name       | любые столбцы |        **url**     |
| ---------- |:-------------:|:------------------:|
| Google     |    что-то     | Google.com         |
| Yandex     |    что-то     | https://Yandex.com |

После можно запустить команду:

    npm start

Результаты будут в папке **results** в корне проекта. Имя файла совпадает с именем csv, формат json
