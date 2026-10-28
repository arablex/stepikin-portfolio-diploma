/**
 * Настройки сайта. Здесь лежат ключи внешних сервисов и параметры API.
 * Значения вида [[...]] — плейсхолдеры: пока они не заменены, сайт работает
 * в безопасном режиме (форма показывает понятное сообщение вместо отправки).
 *
 * Публичный ключ EmailJS не является секретом (он рассчитан на браузер),
 * но удобнее держать его отдельно от основного кода.
 */
window.APP_CONFIG = {
  emailjs: {
    publicKey: '[[EMAILJS_PUBLIC_KEY]]',   // Account → General → Public Key
    serviceId: '[[EMAILJS_SERVICE_ID]]',   // Email Services → Service ID
    templateId: '[[EMAILJS_TEMPLATE_ID]]'  // Email Templates → Template ID
  },
  // Пользователь GitHub для секции «Открытый API»
  github: {
    username: 'arablex'
  },
  // Город для виджета погоды (Open-Meteo, ключ не нужен)
  city: {
    name: 'Алматы',
    lat: 43.25,
    lon: 76.95,
    timeZone: 'Asia/Almaty'
  },
  // Почта для запасного варианта (mailto), если EmailJS ещё не настроен
  fallbackEmail: 'aleksey.stepikin@gmail.com'
};
