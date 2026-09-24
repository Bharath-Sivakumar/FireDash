const STORAGE_KEY = 'mozilla-home-config-v1';
const THEME_KEY = 'mozilla-home-theme-v1';

const defaultConfig = {
  newsUrls: [],
  weatherCity: 'Toronto',
  newsLimit: 5,
  worldClocks: [
    { name: 'London', timezone: 'Europe/London' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo' }
  ]
};

function getWeatherLabel(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if ([45, 48].includes(code)) return 'Foggy';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Conditions';
}

function getWeatherIconSvg(code, isDay = true) {
  const baseClass = 'weather-svg';
  const sunMarkup = `
    <circle cx="12" cy="12" r="4.2" fill="currentColor" opacity="0.9"></circle>
    <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.9">
      <line x1="12" y1="1.5" x2="12" y2="3.8"></line>
      <line x1="12" y1="20.2" x2="12" y2="22.5"></line>
      <line x1="1.5" y1="12" x2="3.8" y2="12"></line>
      <line x1="20.2" y1="12" x2="22.5" y2="12"></line>
      <line x1="4.2" y1="4.2" x2="5.9" y2="5.9"></line>
      <line x1="18.1" y1="18.1" x2="19.8" y2="19.8"></line>
      <line x1="4.2" y1="19.8" x2="5.9" y2="18.1"></line>
      <line x1="18.1" y1="5.9" x2="19.8" y2="4.2"></line>
    </g>
  `;

  const cloudMarkup = `
    <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 18.5h9.5A3.5 3.5 0 0 0 13 12a4.5 4.5 0 0 0-8.5 1.5A3 3 0 0 0 7 18.5Z" fill="currentColor" opacity="0.18"></path>
      <path d="M7 18.5h9.5A3.5 3.5 0 0 0 13 12a4.5 4.5 0 0 0-8.5 1.5A3 3 0 0 0 7 18.5Z"></path>
    </g>
  `;

  const rainMarkup = `
    <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <path d="M7 18.5h9.5A3.5 3.5 0 0 0 13 12a4.5 4.5 0 0 0-8.5 1.5A3 3 0 0 0 7 18.5Z" fill="currentColor" opacity="0.18"></path>
      <path d="M8.5 18.5v2.5M12 18.5v2.5M15.5 18.5v2.5"></path>
    </g>
  `;

  const snowMarkup = `
    <g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
      <path d="M7 18.5h9.5A3.5 3.5 0 0 0 13 12a4.5 4.5 0 0 0-8.5 1.5A3 3 0 0 0 7 18.5Z" fill="currentColor" opacity="0.18"></path>
      <path d="M10 19v2M12 18.5v2.5M14 19v2M10.5 18l-1.2 1.2M13.5 18l1.2 1.2M10.5 20.5l-1.2-1.2M13.5 20.5l1.2-1.2"></path>
    </g>
  `;

  const fogMarkup = `
    <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <path d="M4 14.5h16M5.5 11.5h13M7 17.5h10"></path>
      <path d="M3.5 8.5c2.2-3.1 3.5-3.5 5.5-1.7 1.5 1.5 2.8 1.5 4.5.2 2.1-1.8 3.2-1.8 5.5.8" opacity="0.6"></path>
    </g>
  `;

  const thunderMarkup = `
    <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 18.5h9.5A3.5 3.5 0 0 0 13 12a4.5 4.5 0 0 0-8.5 1.5A3 3 0 0 0 7 18.5Z" fill="currentColor" opacity="0.18"></path>
      <path d="M12.5 18.5 10.5 12.5h3.5l-1.5-4 4 5.5h-3.5l1.5 4.5Z" fill="currentColor"></path>
    </g>
  `;

  const markup = code === 0
    ? sunMarkup
    : code <= 3
      ? (isDay ? `${sunMarkup}${cloudMarkup}` : cloudMarkup)
      : [45, 48].includes(code)
        ? fogMarkup
        : [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)
          ? rainMarkup
          : [71, 73, 75, 77, 85, 86].includes(code)
            ? snowMarkup
            : [95, 96, 99].includes(code)
              ? thunderMarkup
              : cloudMarkup;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', baseClass);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');

  const doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" class="${baseClass}" viewBox="0 0 24 24" aria-hidden="true">${markup}</svg>`, 'image/svg+xml');
  const parsedSvg = doc.documentElement;

  while (parsedSvg.firstChild) {
    svg.appendChild(parsedSvg.firstChild);
  }

  return svg;
}

function getConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultConfig, ...JSON.parse(raw) } : { ...defaultConfig };
  } catch (error) {
    return { ...defaultConfig };
  }
}

function getFaviconUrl(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./i, '');
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(`https://${hostname}`)}`;
  } catch {
    return 'https://www.google.com/s2/favicons?sz=64&domain_url=https://www.google.com';
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function normalizeConfig(config) {
  const source = config || {};
  const merged = { ...defaultConfig, ...source };

  const rawFeedUrls = Array.isArray(source.newsUrls)
    ? source.newsUrls
    : Array.isArray(source.newsUrl)
      ? source.newsUrl
      : typeof source.newsUrl === 'string'
        ? [source.newsUrl]
        : [];

  merged.newsUrls = rawFeedUrls
    .map((feed) => String(feed).trim())
    .filter((feed) => /^https?:\/\//i.test(feed))
    .slice(0, 10);

  merged.weatherCity = (merged.weatherCity || defaultConfig.weatherCity).trim() || defaultConfig.weatherCity;

  const rawClocks = Array.isArray(source.worldClocks) ? source.worldClocks : defaultConfig.worldClocks;
  merged.worldClocks = rawClocks
    .map((clock) => ({
      name: String(clock.name || '').trim() || 'Clock',
      timezone: String(clock.timezone || '').trim() || 'UTC'
    }))
    .filter((clock) => clock.timezone)
    .slice(0, 6);

  return merged;
}

function getBrowserBookmarks() {
  const bookmarksApi = (typeof browser !== 'undefined' && browser.bookmarks)
    ? browser.bookmarks
    : (typeof chrome !== 'undefined' && chrome.bookmarks ? chrome.bookmarks : null);

  if (!bookmarksApi) {
    return Promise.resolve([]);
  }

  const getTree = bookmarksApi.getTree.bind(bookmarksApi);

  if (getTree.length === 0) {
    return getTree().then((nodes) => {
      const items = [];
      const walk = (list) => {
        list.forEach((node) => {
          if (node.url && node.title) {
            items.push({
              name: node.title,
              url: node.url,
              icon: (node.title || 'B').slice(0, 2).toUpperCase()
            });
          }
          if (node.children) {
            walk(node.children);
          }
        });
      };
      walk(nodes);
      return items.slice(0, 8);
    }).catch(() => []);
  }

  return new Promise((resolve) => {
    getTree((nodes) => {
      const items = [];
      const walk = (list) => {
        list.forEach((node) => {
          if (node.url && node.title) {
            items.push({
              name: node.title,
              url: node.url,
              icon: (node.title || 'B').slice(0, 2).toUpperCase()
            });
          }
          if (node.children) {
            walk(node.children);
          }
        });
      };
      walk(nodes);
      resolve(items.slice(0, 8));
    });
  }).catch(() => []);
}

async function renderBookmarks() {
  const container = document.getElementById('bookmarks');
  if (!container) {
    return;
  }

  container.replaceChildren();

  const browserBookmarks = await getBrowserBookmarks();

  if (!browserBookmarks.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No browser bookmarks found.';
    container.appendChild(empty);
    return;
  }

  browserBookmarks.forEach((bookmark) => {
    const item = document.createElement('a');
    item.href = bookmark.url;
    item.target = '_blank';
    item.rel = 'noreferrer';
    item.className = 'bookmark-item';

    const icon = document.createElement('span');
    icon.className = 'bookmark-icon';

    const favicon = document.createElement('img');
    favicon.src = getFaviconUrl(bookmark.url);
    favicon.alt = '';
    favicon.loading = 'lazy';
    favicon.referrerPolicy = 'no-referrer';
    icon.appendChild(favicon);

    const label = document.createElement('span');
    label.className = 'bookmark-name';
    label.textContent = bookmark.name;

    item.append(icon, label);
    container.appendChild(item);
  });
}

function formatTimeForTimezone(timezone, includeDate = false) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: includeDate ? 'short' : undefined,
    month: includeDate ? 'short' : undefined,
    day: includeDate ? 'numeric' : undefined
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  const time = `${values.hour || '00'}:${values.minute || '00'}`;
  const date = includeDate ? `${values.weekday || ''} ${values.month || ''} ${values.day || ''}`.trim() : '';
  return { time, date };
}

function renderWorldClocks() {
  const config = getConfig();
  const clockContainer = document.getElementById('time-widget');
  const clocks = Array.isArray(config.worldClocks) && config.worldClocks.length ? config.worldClocks : defaultConfig.worldClocks;

  const localTime = formatTimeForTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone, true);

  clockContainer.replaceChildren();

  const localTimeEl = document.createElement('div');
  localTimeEl.className = 'time-local';
  localTimeEl.textContent = localTime.time;

  const dateEl = document.createElement('div');
  dateEl.className = 'time-date';
  dateEl.textContent = localTime.date;

  const listEl = document.createElement('div');
  listEl.className = 'time-list';

  clocks.forEach((clock) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'time-item';

    const nameEl = document.createElement('strong');
    nameEl.textContent = clock.name;

    const timeEl = document.createElement('span');
    timeEl.textContent = formatTimeForTimezone(clock.timezone, false).time;

    itemEl.append(nameEl, timeEl);
    listEl.appendChild(itemEl);
  });

  clockContainer.append(localTimeEl, dateEl, listEl);

  setTimeout(() => renderWorldClocks(), 60000);
}

function renderWeather() {
  const config = getConfig();
  const weatherEl = document.getElementById('weather');
  const cityEl = document.getElementById('weather-location-label');
  const cityName = config.weatherCity || 'Local weather';
  cityEl.textContent = cityName;

  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((locationData) => {
      const location = locationData.results && locationData.results[0];
      if (!location) {
        throw new Error('Location not found');
      }

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
      return fetch(weatherUrl)
        .then((weatherResponse) => weatherResponse.json());
    })
    .then((weatherData) => {
      const current = weatherData.current || {};
      const daily = weatherData.daily || {};
      const code = Number(current.weather_code ?? daily.weather_code?.[0] ?? 0);
      const label = getWeatherLabel(code);
      const isDay = Number(current.is_day ?? 1) === 1;

      const forecast = Array.isArray(daily.time) ? daily.time.map((time, index) => ({
        date: time,
        code: Number(daily.weather_code?.[index] ?? code),
        max: Number(daily.temperature_2m_max?.[index] ?? current.temperature_2m ?? 0),
        min: Number(daily.temperature_2m_min?.[index] ?? current.temperature_2m ?? 0)
      })).slice(1, 6) : [];

      weatherEl.replaceChildren();

      const topEl = document.createElement('div');
      topEl.className = 'weather-top';

      const tempWrap = document.createElement('div');
      const tempEl = document.createElement('div');
      tempEl.className = 'weather-temp';
      tempEl.textContent = `${Math.round(Number(current.temperature_2m ?? 0))}°C`;
      tempWrap.appendChild(tempEl);

      const iconWrap = document.createElement('div');
      iconWrap.className = 'weather-icon';
      iconWrap.setAttribute('aria-label', label);
      const iconNode = getWeatherIconSvg(code, isDay);
      if (iconNode) {
        iconWrap.appendChild(iconNode);
      }

      topEl.append(tempWrap, iconWrap);

      const summary = document.createElement('p');
      summary.className = 'weather-summary';
      summary.textContent = label;

      const forecastEl = document.createElement('div');
      forecastEl.className = 'weather-forecast';
      forecast.forEach((day) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'forecast-item';

        const dayEl = document.createElement('span');
        dayEl.className = 'forecast-day';
        dayEl.textContent = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' });

        const forecastIconEl = document.createElement('div');
        forecastIconEl.className = 'forecast-icon';
        const dayIcon = getWeatherIconSvg(day.code, true);
        if (dayIcon) {
          forecastIconEl.appendChild(dayIcon);
        }

        const tempRangeEl = document.createElement('span');
        tempRangeEl.className = 'forecast-temp';
        tempRangeEl.textContent = `${Math.round(day.max)}° / ${Math.round(day.min)}°`;

        itemEl.append(dayEl, forecastIconEl, tempRangeEl);
        forecastEl.appendChild(itemEl);
      });

      const creditEl = document.createElement('div');
      creditEl.className = 'weather-credit';
      creditEl.textContent = 'Weather data from ';

      const creditLink = document.createElement('a');
      creditLink.href = 'https://open-meteo.com/';
      creditLink.target = '_blank';
      creditLink.rel = 'noreferrer';
      creditLink.textContent = 'Open-Meteo';
      creditEl.appendChild(creditLink);

      weatherEl.append(topEl, summary, forecastEl, creditEl);
    })
    .catch(() => {
      weatherEl.replaceChildren();
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Weather unavailable right now.';
      weatherEl.appendChild(empty);
    });
}

function renderNews() {
  const config = getConfig();
  const container = document.getElementById('news-container');
  const sourceLabel = document.getElementById('news-source-label');
  const feedUrls = Array.isArray(config.newsUrls) && config.newsUrls.length ? config.newsUrls : [];

  if (!feedUrls.length) {
    sourceLabel.textContent = 'News';
    container.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Add one or more RSS feeds in Customize.';
    container.appendChild(empty);
    return;
  }

  sourceLabel.textContent = feedUrls.length > 1 ? 'Multiple feeds' : new URL(feedUrls[0]).hostname || 'News';

  Promise.all(
    feedUrls.map((feedUrl) =>
      fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
        .then((response) => response.json())
        .then((data) => Array.isArray(data.items) ? data.items : [])
        .catch(() => [])
    )
  )
    .then((feedResults) => {
      const mergedItems = feedResults.flat();
      const uniqueItems = [];
      const seen = new Set();

      mergedItems.forEach((item) => {
        const key = (item.link || item.title || '').toString();
        if (key && !seen.has(key)) {
          seen.add(key);
          uniqueItems.push(item);
        }
      });

      const limitedItems = uniqueItems.slice(0, Number(config.newsLimit) || 5);

      if (!limitedItems.length) {
        throw new Error('No items');
      }

      container.replaceChildren();
      limitedItems.forEach((article, index) => {
        const title = article.title || 'Untitled story';
        const link = article.link || '#';
        const date = article.pubDate ? new Date(article.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Story ${index + 1}`;

        const sourceName = article.source && article.source.trim()
          ? article.source
          : ((() => {
              const matchedUrl = feedUrls.find((url) => {
                try {
                  return new URL(link).hostname === new URL(url).hostname;
                } catch {
                  return false;
                }
              });
              return matchedUrl ? new URL(matchedUrl).hostname : 'Source';
            })());

        const itemEl = document.createElement('article');
        itemEl.className = 'news-item';

        const tagEl = document.createElement('div');
        tagEl.className = 'story-tag';
        tagEl.textContent = String(index + 1);

        const copyEl = document.createElement('div');
        copyEl.className = 'story-copy';

        const headingEl = document.createElement('h3');
        const headingLink = document.createElement('a');
        headingLink.href = link;
        headingLink.target = '_blank';
        headingLink.rel = 'noreferrer';
        headingLink.textContent = title;
        headingEl.appendChild(headingLink);

        const metaEl = document.createElement('div');
        metaEl.className = 'story-meta';
        metaEl.textContent = `${sourceName} • ${date}`;

        copyEl.append(headingEl, metaEl);

        const storyLink = document.createElement('a');
        storyLink.className = 'story-link';
        storyLink.href = link;
        storyLink.target = '_blank';
        storyLink.rel = 'noreferrer';
        storyLink.setAttribute('aria-label', 'Open story');
        storyLink.textContent = '→';

        itemEl.append(tagEl, copyEl, storyLink);
        container.appendChild(itemEl);
      });
    })
    .catch(() => {
      container.replaceChildren();
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Could not load the configured news feeds.';
      container.appendChild(empty);
    });
}

function populateConfigForm() {
  const config = getConfig();
  document.getElementById('news-urls').value = (config.newsUrls || []).join('\n');
  document.getElementById('weather-city').value = config.weatherCity;
  document.getElementById('world-clocks').value = (config.worldClocks || defaultConfig.worldClocks)
    .map((clock) => `${clock.name},${clock.timezone}`)
    .join('\n');
}

function handleConfigSave(event) {
  event.preventDefault();

  const feedText = document.getElementById('news-urls').value;
  const parsedFeeds = (feedText || '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((value) => /^https?:\/\//i.test(value));

  const worldClockText = document.getElementById('world-clocks').value;
  const parsedWorldClocks = (worldClockText || '')
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, timezone] = line.split(',').map((part) => part.trim());
      return { name: name || 'Clock', timezone: timezone || 'UTC' };
    })
    .filter((clock) => clock.timezone);

  const nextConfig = normalizeConfig({
    newsUrls: parsedFeeds,
    weatherCity: document.getElementById('weather-city').value.trim(),
    worldClocks: parsedWorldClocks
  });

  saveConfig(nextConfig);
  populateConfigForm();
  renderBookmarks();
  renderWeather();
  renderNews();
  renderWorldClocks();
  document.getElementById('config-panel').classList.add('hidden');
}

function resetConfiguration() {
  saveConfig({ ...defaultConfig });
  populateConfigForm();
  renderBookmarks();
  renderWeather();
  renderNews();
}

function getThemeMode() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function applyTheme(mode) {
  const actualMode = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;

  document.documentElement.setAttribute('data-theme', actualMode);
  document.documentElement.setAttribute('data-theme-mode', mode);

  const button = document.getElementById('toggle-theme');
  if (button) {
    button.textContent = `Theme: ${mode === 'system' ? 'System' : mode.charAt(0).toUpperCase() + mode.slice(1)}`;
  }
}

function cycleTheme() {
  const current = getThemeMode();
  const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

function searchWithUserProvider(query) {
  const trimmed = String(query || '').trim();
  if (!trimmed) {
    return;
  }

  const firefoxSearch = typeof browser !== 'undefined' && browser.search && browser.search.search;
  if (firefoxSearch) {
    firefoxSearch({ query: trimmed });
    return;
  }

  const chromeSearch = typeof chrome !== 'undefined' && chrome.search && chrome.search.query;
  if (chromeSearch) {
    chromeSearch({ text: trimmed });
    return;
  }

  window.open(`https://www.google.com/search?q=${encodeURIComponent(trimmed)}`, '_blank', 'noopener,noreferrer');
}

function handleSearchSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('search-input');
  if (!input) {
    return;
  }

  searchWithUserProvider(input.value);
  input.value = '';
}

function initControls() {
  document.getElementById('toggle-config').addEventListener('click', () => {
    document.getElementById('config-panel').classList.toggle('hidden');
  });

  document.getElementById('close-config').addEventListener('click', () => {
    document.getElementById('config-panel').classList.add('hidden');
  });

  document.getElementById('toggle-theme').addEventListener('click', cycleTheme);
  document.getElementById('config-form').addEventListener('submit', handleConfigSave);
  document.getElementById('reset-config').addEventListener('click', resetConfiguration);
  document.getElementById('search-form').addEventListener('submit', handleSearchSubmit);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemeMode() === 'system') {
      applyTheme('system');
    }
  });
}

function init() {
  const initialConfig = normalizeConfig(getConfig());
  const initialTheme = getThemeMode();

  saveConfig(initialConfig);
  populateConfigForm();
  renderBookmarks();
  renderWeather();
  renderNews();
  renderWorldClocks();
  applyTheme(initialTheme);
  document.getElementById('config-panel').classList.add('hidden');
  initControls();
}

init();
