# a.vilmovskaya — портфолио

Vite + React + TypeScript + React Three Fiber (+ drei).

## Запуск на Mac

1. Установи Node.js (LTS, версия 18 или новее) с https://nodejs.org.
2. Открой Терминал и перейди в папку проекта:
   ```
   cd ~/Downloads/portfolio
   ```
3. Установи зависимости (один раз):
   ```
   npm install
   ```
4. Запусти:
   ```
   npm run dev
   ```
   Открой адрес из Терминала (обычно http://localhost:5173).

Остановить сервер: `Ctrl + C`.

- `npm run build` — собрать сайт для хостинга в папку `dist`
- `npm run preview` — посмотреть собранную версию
- `npm run typecheck` — проверить типы TypeScript

Если сайт будет лежать в подпапке (например, GitHub Pages), поменяй `base` в `vite.config.ts` на `"/имя-репозитория/"`.

## Структура

```
public/images/              большие картинки проектов (.webp)
public/images/thumbs/       маленькие картинки для иконок на «компьютере»
public/videos/              видео проектов (.webm + .mp4 с одинаковым именем)

src/
  content/                  ← ТЕКСТЫ И КОНТЕНТ, правишь чаще всего
    contact.ts              почта, Instagram, Behance, Telegram
    projects.ts             проекты: название, категории, описание, картинки
    site.ts                 бегущая строка, услуги, плашки цветов, about.txt, бейдж, тексты визитки

  styles/
    tokens.css              цвета, шрифты, отступы, текстуры (и тёмная тема)
    base.css                сетка, общие стили, заголовки секций, анимации

  components/               общие компоненты (ProjectMediaView: картинка или видео проекта)
  layout/                   шапка, подвал, зерно, линии сетки, заголовок секции
  sections/                 секции страницы (у каждой свой .css рядом)
    hero/                   первый экран
    work/                   секция Work
      computer/             корпус компьютера и клавиши
      desktop/              «операционка»: иконки, окна, логика окон
    marquee/                бегущая строка
    about/                  About: стикеры, услуги
    contact/                Contact: ссылки, соцсети
    case-study/             полноэкранный кейс проекта

  three/                    3D
    background/             хром и стекло поверх страницы
      placements.ts         где какие объекты стоят
      objectCatalog.ts      формы + материалы
      materials.ts          хром, перламутр, стекло
      ChromeBlob.tsx        жидкая хромовая капля на первом экране
      shaders/              шейдер стекла
    card/                   голографическая 3D-визитка
      shaders/              шейдер фольги

  state/                    общее состояние (открытый кейс, прогресс прокрутки)
  hooks/                    звук клавиш, reduced motion, видимость на экране
  lib/                      пути к картинкам, id элементов, математика, формы
  App.tsx                   порядок секций на странице
```

## Частые правки

- **Контакты** → `src/content/contact.ts`
- **Добавить проект** → положи `name.webp` в `public/images` и `public/images/thumbs`, добавь объект в `src/content/projects.ts` с `cover: "name"` и `media: [image("name")]`
- **Добавить видео в проект** → положи `clip.webm` и `clip.mp4` в `public/videos`, первый кадр как `clip-poster.webp` в `public/images`, и добавь `video("clip")` в `media` проекта. Видео играет без звука и по кругу
- **Тексты визитки, бейджа, услуг** → `src/content/site.ts`
- **Цвета** → `src/styles/tokens.css`
- **Передвинуть 3D-объекты** → `src/three/background/placements.ts`
- **Переставить секции** → `src/App.tsx`

Импорты внутри `src` пишутся через алиас `@/` (например, `@/content/projects`).
