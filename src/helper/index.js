import { useBreakpoints } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import enLocale from "@/locale/en.json";
import mmLocale from "@/locale/mm.json";

// ---------- Mobile check ----------
export function isMobile() {
  const breakpoints = useBreakpoints({
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    widescreen: 1216,
    fullhd: 1408
  })
  return breakpoints.smaller('tablet')
}

// ---------- Error handling ----------
export const errorResponse = (error) => {
  console.log("error", error?.statusCode);
  if (error?.statusCode === 401) {
    errorUnauthorized();
  }
};

export const errorUnauthorized = () => {
  return navigateTo("/login");
};

// ---------- Utilities ----------
export const cloneJson = (json) => json ? JSON.parse(JSON.stringify(json)) : json;

export const spaceImageFix = (image) => {
  if (image && typeof image === "string") {
    return image.includes(" ") ? image.replace(/ /g, "%20") : image;
  } else {
    return "https://shassets.sgp1.cdn.digitaloceanspaces.com/home_mall/svg/default_product_image.svg";
  }
};

// ---------- Find by keyword ----------
export const findByKeyword = (list, key, value, lastIndex = false, consoleTrace = false) => {
  if (!key || !value) {
    consoleTraceForFindByKeyword(consoleTrace, ["Key or Value is invalid ", key, value]);
    return null;
  }

  if (!Array.isArray(list) && typeof list !== "object") {
    consoleTraceForFindByKeyword(consoleTrace, ["list is not array nor object", list]);
    return null;
  }

  if (lastIndex && Array.isArray(list)) list = [...list].reverse();

  const val = typeof list === "object" ? Object.values(list) : list;

  const result = val.find(item => value.toString() === getNestedValue(key, item)?.toString());

  if (!result && consoleTrace) {
    console.error("Not Found", value, "may be value is not correct");
  }

  return result;
};

const consoleTraceForFindByKeyword = (consoleTrace, message) => {
  if (consoleTrace) console.error(...message);
};

// ---------- Nested value ----------
export const getNestedValue = (keys, obj, defaultValue) => {
  if (!has(keys) || !has(obj)) return defaultValue;

  keys = keys.split(".");
  const key = keys.shift();

  if (keys.length > 0) {
    return getNestedValue(keys.join("."), obj[key], defaultValue);
  } else {
    return has(obj[key]) ? obj[key] : defaultValue;
  }
};

const has = (value) => {
  if (typeof value === "boolean" || typeof value === "number") return true;
  if (Array.isArray(value)) return value.length > 0;
  return !!value;
};

// ---------- Input validation ----------
export const checkKeywords = (value) => {
  const regex = /^[^!"`'#%&,:;<>={}~\$\*\+\/\\\?\[\]\^\|]+$/;
  return regex.test(value);
};

export const formCheckValidate = (form) => {
  return Object.values(form).every((i) => {
    if (Array.isArray(i)) return i.every(v => checkKeywords(v));
    if (typeof i === "object") return Object.values(i).every(v => checkKeywords(v));
    return checkKeywords(i);
  });
};

// ---------- Number formatting ----------
export const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// ---------- Myanmar / English number conversion ----------
const enDigits = ['0','1','2','3','4','5','6','7','8','9'];
const mmDigits = ['၀','၁','၂','၃','၄','၅','၆','၇','၈','၉'];

const localeIndex = (str, localeDigits) => 
  str.toString().split('').map(ch => enDigits.includes(ch) ? localeDigits[enDigits.indexOf(ch)] : ch).join('');

const currencyFormat = (num) => new Intl.NumberFormat('en-US').format(num);

export const en2mm = (num) => localeIndex(num, mmDigits);

export const priceFormat = (num) => {
  const { locale } = useI18n();
  const digits = locale.value === 'mm' ? mmDigits : enDigits;
  return localeIndex(currencyFormat(num), digits);
};

// ---------- String & Array utils ----------
export function ucfirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    res.push(arr.slice(i, i + chunkSize));
  }
  return res;
}

// ---------- Countdown ----------
function updateCountdown(seconds) {
  const dayInSeconds = 86400, hourInSeconds = 3600, minuteInSeconds = 60;
  const days = Math.floor(seconds / dayInSeconds);
  seconds %= dayInSeconds;
  const hours = Math.floor(seconds / hourInSeconds);
  seconds %= hourInSeconds;
  const minutes = Math.floor(seconds / minuteInSeconds);
  seconds %= minuteInSeconds;
  return { days, hours, minutes, seconds };
}

function formatCountdown(countdown) {
  let text = countdown.days > 0 ? `${countdown.days} d, ` : '';
  return text + `${countdown.hours} h, ${countdown.minutes} m, ${countdown.seconds} s`;
}

export function startCountdown(totalSeconds, ui) {
  if (!ui) return;
  const countdownElement = ui;
  function update() {
    if (totalSeconds <= 0 && timer) {
      clearInterval(timer);
      countdownElement.style.display = "none";
    } else {
      const countdown = updateCountdown(totalSeconds);
      countdownElement.innerHTML = formatCountdown(countdown);
      totalSeconds--;
    }
  }
  update();
  const timer = setInterval(update, 1000);
}

// ---------- Auth ----------
export function authUser() {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
}

// ---------- Export ----------
export default {
  isMobile,
  errorUnauthorized,
  errorResponse,
  cloneJson,
  getNestedValue,
  has,
  ucfirst,
  sliceIntoChunks,
  consoleTraceForFindByKeyword,
  findByKeyword,
  formCheckValidate,
  checkKeywords,
  numberWithCommas,
  spaceImageFix,
  priceFormat,
  en2mm,
  startCountdown,
  authUser
};
