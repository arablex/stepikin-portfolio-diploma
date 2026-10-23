/**
 * Данные проектов портфолио.
 * Из этого массива main.js строит карточки, фильтр по категориям
 * и содержимое модального окна.
 *
 * Плейсхолдеры: [[GITHUB]] — ссылка на репозиторий, [[LIVE]] — ссылка на
 * живую версию. Их нужно заменить на реальные адреса (см. README).
 */

// Категории фильтра: id → подпись на кнопке
const CATEGORIES = {
  sites: 'Веб-сайты',
  apps: 'Веб-приложения',
  '3d': '3D/интерактив',
  mobile: 'Мобильные'
};

const PROJECTS = [
  {
    id: 'vizi',
    liveShort: 'Сайт',
    title: 'VIZI',
    categories: ['apps'],
    year: 2026,
    role: 'Владелец продукта, руководитель дизайна',
    short: 'Клубная платформа: визитка, рейтинг, события и ИИ-ассистент.',
    description:
      'Социальная платформа профессиональной репутации: личная визитка, рейтинг из реальных действий, клубы, события и ИИ-ассистент Вера. ' +
      'Я вёл продукт и дизайн, довёл дизайн-систему v2 с двумя равноправными темами. ' +
      'За 4 месяца платформа выросла до 1 400+ профилей.',
    tech: ['Next.js 14', 'React 18', 'PostgreSQL', 'PostgREST', 'Telegram-вход', 'Leaflet'],
    cover: 'images/vizi-cover.svg',
    screens: ['images/vizi-screen1.svg', 'images/vizi-screen2.svg'],
    live: 'https://vizi.club',
    liveLabel: 'Открыть сайт',
    github: '[[GITHUB]]'
  },
  {
    id: 'vigilo',
    liveShort: 'Сайт',
    title: 'Vigilo',
    categories: ['apps', 'mobile'],
    year: 2026,
    role: 'Продуктовый дизайн, UX-тексты, дизайн-система',
    short: 'Новости о 239 странах в одном понятном индексе риска.',
    description:
      'Приложение превращает новости о 239 странах в один индекс риска по пятиуровневой шкале: от «Спокойно» до «Критично». ' +
      'Спроектировал 35 экранов в двух темах для iOS, Android и веба, 12 состояний (пустые, ошибки, офлайн) и экран SOS. ' +
      'Цвет используется только как сигнал, а рядом с каждым фактом показан источник.',
    tech: ['Figma', 'Дизайн-система', 'Токены тем', 'iOS', 'Android', 'Web'],
    cover: 'images/vigilo-cover.svg',
    screens: ['images/vigilo-screen1.svg', 'images/vigilo-screen2.svg'],
    live: 'https://vigilo.cc',
    liveLabel: 'Открыть сайт',
    github: '[[GITHUB]]'
  },
  {
    id: 'engiboard',
    liveShort: 'Кейс',
    title: 'EngiBoard',
    categories: ['apps'],
    year: 2026,
    role: 'Основатель, дизайнер и разработчик',
    short: 'Трекер задач и отчётов «до/после» для инженеров.',
    description:
      'Десктопное приложение: глобальная горячая клавиша открывает оверлей, скриншот размечается шестью инструментами и сразу попадает на доску задач. ' +
      'Комментарии привязываются к пикселю изображения, а слайдер сравнения показывает «до» и «после». ' +
      'Первая рабочая версия собрана за 6 дней, релизы выходят установщиками для Mac и Windows.',
    tech: ['Tauri 2', 'Rust', 'Next.js', 'React', 'Supabase', 'GitHub Actions'],
    cover: 'images/engiboard-cover.svg',
    screens: ['images/engiboard-screen1.svg', 'images/engiboard-screen2.svg'],
    live: 'https://stepikin.com/cases/engiboard/',
    liveLabel: 'Читать кейс',
    github: '[[GITHUB]]'
  },
  {
    id: 'driftpaint',
    liveShort: 'Сайт',
    title: 'Driftpaint',
    categories: ['3d', 'sites'],
    year: 2026,
    role: 'Идея, дизайн и разработка',
    short: 'Сайт «живопись светом»: классические картины оживают.',
    description:
      'Экспериментальный сайт о живописи светом: галерея «Столицы мира» из десяти классических картин, абстракция «Разлив» и сцены-таймлапсы, ' +
      'где вечерняя картина превращается в сутки. Всё рисуется в браузере средствами three.js и процедурной графики, без видео.',
    tech: ['three.js', 'WebGL', 'JavaScript', 'HTML/CSS'],
    cover: 'images/driftpaint-cover.svg',
    screens: ['images/driftpaint-screen1.svg', 'images/driftpaint-screen2.svg'],
    live: '[[LIVE]]',
    liveLabel: 'Открыть сайт',
    github: '[[GITHUB]]'
  },
  {
    id: 'sacred',
    liveShort: 'Сайт',
    title: 'Sacred Spaces 3D',
    categories: ['3d', 'sites'],
    year: 2026,
    role: 'Дизайн, 3D-пайплайн, фронтенд',
    short: '3D-сайт о религиях: хаб, сцены и аккуратный подход к образам.',
    description:
      'Сайт о мировых религиях: горизонтальный хаб с прокруткой ведёт в отдельные 3D-сцены, в конце — страница пожертвований. ' +
      'Модели генерируются в Tripo и сжимаются через gltf-transform; для ислама соблюдён аниконичный подход. ' +
      'Сейчас в работе сцены буддизма.',
    tech: ['three.js', 'Blender', 'glTF', 'JavaScript', 'CSS'],
    cover: 'images/sacred-cover.svg',
    screens: ['images/sacred-screen1.svg', 'images/sacred-screen2.svg'],
    live: '[[LIVE]]',
    liveLabel: 'Открыть сайт',
    github: '[[GITHUB]]'
  },
  {
    id: 'stepikin',
    liveShort: 'Сайт',
    title: 'stepikin.com',
    categories: ['sites', '3d'],
    year: 2026,
    role: 'Дизайн и разработка',
    short: 'Мой сайт-студия: статичный HTML и 3D поверх него.',
    description:
      'Сайт студии, который продаёт AI-продукты за 4 недели. Весь текст — статичный HTML, а WebGL, стекло и движение добавлены как прогрессивное улучшение. ' +
      'Герой с 3D-объектами на three.js, галерея кейсов, UI-кит с общими токенами и единый шаблон кейса. ' +
      'Проверялся скриншотами в обеих темах и на телефоне.',
    tech: ['HTML', 'CSS', 'JavaScript', 'three.js', 'Netlify'],
    cover: 'images/stepikin-cover.svg',
    screens: ['images/stepikin-screen1.svg', 'images/stepikin-screen2.svg'],
    live: 'https://stepikin.com',
    liveLabel: 'Открыть сайт',
    github: '[[GITHUB]]'
  },
  {
    id: 'miroset',
    liveShort: 'Сайт',
    title: 'Miroset',
    categories: ['sites'],
    year: 2026,
    role: 'Дизайн, вёрстка, инфраструктура',
    short: 'Редактируемый лендинг курорта в Сочи.',
    description:
      'Лендинг премиального курорта-отеля на склоне Мацесты по новому бренд-гайду. Все тексты и блоки лежат в content.json, ' +
      'а владелец правит их сам в админ-панели без разработчика. ' +
      'Когда хостинг истёк, перенёс сайт на новый сервер и восстановил 89 файлов вместе с SSL.',
    tech: ['PHP', 'JSON', 'HTML/CSS', 'Vanilla JS', 'Let’s Encrypt'],
    cover: 'images/miroset-cover.svg',
    screens: ['images/miroset-screen1.svg', 'images/miroset-screen2.svg'],
    live: 'https://miroset.ru',
    liveLabel: 'Открыть сайт',
    github: '[[GITHUB]]'
  },
  {
    id: 'solia',
    liveShort: 'Лендинг',
    title: 'Solia',
    categories: ['3d', 'mobile'],
    year: 2026,
    role: 'Исследование, дизайн, прототип',
    short: 'Концепт ИИ-спутника для ментального здоровья.',
    description:
      'Собственный концепт платформы для ментального здоровья: эмоциональный паспорт, ИИ-ассистент на основе КПТ-протоколов и цифровой двойник. ' +
      'Исследовал три визуальных направления и выбрал тёплое, собрал 3D-лендинг с дыхательным интро и кликабельный прототип приложения. ' +
      'Проект на стадии дизайна.',
    tech: ['three.js', 'WebGL', 'React Native (Expo)', 'Дизайн-система'],
    cover: 'images/solia-cover.svg',
    screens: ['images/solia-screen1.svg', 'images/solia-screen2.svg'],
    live: 'https://stepikin.com/solia/',
    liveLabel: 'Открыть лендинг',
    github: '[[GITHUB]]'
  },
  {
    id: 'vdrive',
    liveShort: 'Демо',
    title: 'Vdrive',
    categories: ['mobile'],
    year: 2026,
    role: 'Дизайн и разработка',
    short: 'Мобильное приложение для водителей с картой камер.',
    description:
      'Приложение для водителей: карта на MapLibre показывает камеры контроля, данные берутся из OpenStreetMap через Overpass API. ' +
      'Написано на React Native (Expo), карта работает внутри WebView.',
    tech: ['React Native', 'Expo', 'MapLibre', 'Overpass API', 'WebView'],
    cover: 'images/vdrive-cover.svg',
    screens: ['images/vdrive-screen1.svg', 'images/vdrive-screen2.svg'],
    live: '[[LIVE]]',
    liveLabel: 'Открыть приложение',
    github: '[[GITHUB]]'
  }
];

// Отзывы для слайдера
const TESTIMONIALS = [
  {
    text: 'Алексей показал глубокую экспертизу в пользовательском дизайне: его решения улучшили удобство и эстетику продукта в огромном масштабе.',
    name: 'Илья',
    role: 'Head of Design, Tango.me · платформа 500M+ пользователей'
  },
  {
    text: 'Как Head of Design Алексей провёл большую работу над брендом, веб-приложением, мобильной версией и дизайн-системой. Наше сотрудничество продолжает двигать рост.',
    name: 'Павел',
    role: 'Head of Product, ИИ-стартап в стоматологии · 1000+ клиник'
  },
  {
    text: 'Алексей пришёл в VIZI в самом начале и за 4 месяца довёл продукт с нуля до 1 400 пользователей. Он сам проектирует и собирает интерфейс, поэтому идеи доходят до людей за дни, а не за месяцы.',
    name: 'Роман',
    role: 'CEO, VIZI · социальная платформа'
  },
  {
    text: 'Вклад Алексея был решающим: он поднял наш бренд и продукт на новый международный уровень.',
    name: 'LanBo',
    role: 'CEO, 1440 LLC · Китай'
  }
];
