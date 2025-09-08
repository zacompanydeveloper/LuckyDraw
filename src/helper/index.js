import { useBreakpoints } from '@vueuse/core'
import en from "@/locale/en.json";
import mm from "@/locale/my.json";
import { useI18n } from "vue-i18n";

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

export const errorResponse = (error) => {
  console.log("error", error?.statusCode);
  if (error?.statusCode === 401) {
    errorUnauthorized();
  }
};

export const errorUnauthorized = (code) => {
  return navigateTo("/login");
};

export const cloneJson = (json) => {
  if (!json) {
    return json;
  }
  return JSON.parse(JSON.stringify(json));
};

export const spaceImageFix = (image) => {
  if (image && typeof image === "string") {
    // return image.includes(" ") ? image.replace(" ", "%20") : image;
    return image.includes(" ") ? image.replace(/ /g, "%20") : image;
  } else {
    return "https://shassets.sgp1.cdn.digitaloceanspaces.com/home_mall/svg/default_product_image.svg";
  }
};

export const findByKeyword = (list, key, value, lastIndex, consoleTrace) => {
  if (!key || !value) {
    consoleTraceForFindByKeyword(consoleTrace, [
      "Key or Value is invalid ",
      key,
      value,
    ]);
    return null;
  }

  if (typeof list != "array" && typeof list != "object") {
    consoleTraceForFindByKeyword(consoleTrace, [
      "list is not array nor object",
      list,
    ]);
    return null;
  }

  if (lastIndex) {
    list = list.reverse();
  }

  if (typeof list === "object") {
    const val = Object.values(list);

    if (typeof val == "undefined") return null;

    const result = val.find((item) => {
      return value.toString() === getNestedValue(key, item).toString();
    });

    if (!result) {
      consoleTraceForFindByKeyword(consoleTrace, [
        "Not Found ",
        value,
        " may be value is not correct",
      ]);
    }

    return result;
  }

  consoleTraceForFindByKeyword(consoleTrace, "nested value ", val);

  return list.find(
    (item) => getNestedValue(key, item).toString() === value.toString()
  );
};

const consoleTraceForFindByKeyword = (consoleTrace, message) => {
  if (consoleTrace) {
    console.error(...message);
  }
};

export const getNestedValue = (keys, list, defaultValue) => {
  // defaultValue = defaultValue || typeof defaultValue == 'boolean' ? defaultValue : undefined;

  if (!has(keys) || !has(list)) {
    return defaultValue;
  }

  keys = keys.split(".");

  let key = keys.shift();

  if (keys.length > 0) {
    return getNestedValue(keys.join("."), list[key], defaultValue);
  } else {
    return has(list[key]) ? list[key] : defaultValue;
  }
};

const has = (value) => {
  if (typeof value == "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value == "number") {
    return true;
  }

  return !!value;
};

export const checkKeywords = (value) => {
  var regex = new RegExp(
    /^[^!"`'#%&,:;<>={}~\$\*\+\/\\\?\[\]\^\|]+$/
    // /^[^!"`'#%&,:;<>={}~\$\(\)\*\+\/\\\?\[\]\^\|]+$/
    // /[ !“`‘#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/
  );
  if (!regex.test(value)) {
    return false;
  }
  return true;
};

export const formCheckValidate = (form) => {
  let test = Object.values(form);

  let result = test.every((i) => {
    if (Array.isArray(i)) {
      const iterator = i.values();
      for (const value of iterator) {
        // console.log(i, checkKeywords(value));
        return checkKeywords(value);
      }
    } else if (typeof i === "object") {
      for (const key in i) {
        // console.log(i, checkKeywords(i[key]));
        return checkKeywords(i[key]);
      }
    } else {
      // console.log('i',i);
      // console.log(i, checkKeywords(i));
      return i;
    }
  });
  console.log("result", result);
  return result;
};

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const localeIndex = (num, messageList) => {
  let numArr = String(num).split("");
  numArr = numArr.map((i) => {
    return getNestedValue(i, messageList, i);
  });
  return numArr.join("");
};

const currencyFormat = (value, decimal) => {
  if (!value) {
    return "0";
  }

  if (decimal) {
    value = parseFloat(value).toFixed(decimal);
  }

  return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1, ");
};

export const priceFormat = (num) => {
  const v18n = useI18n();
  let locale = v18n.locale.value === "mm" ? mm : en;
  return localeIndex(
    currencyFormat(num),
    //   i18n.global.messages[i18n.global.locale]['message']
    locale
  );
};

export function ucfirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

function updateCountdown(seconds) {
  const dayInSeconds = 86400; // 24 hours * 60 minutes * 60 seconds
  const hourInSeconds = 3600; // 60 minutes * 60 seconds
  const minuteInSeconds = 60; // 60 seconds

  const days = Math.floor(seconds / dayInSeconds);
  seconds %= dayInSeconds;

  const hours = Math.floor(seconds / hourInSeconds);
  seconds %= hourInSeconds;

  const minutes = Math.floor(seconds / minuteInSeconds);
  seconds %= minuteInSeconds;

  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
}

function formatCountdown(countdown) {
  let countdownText = "";
  if (countdown?.days > 0) {
    countdownText += `${countdown.days} d, `;
  }
  countdownText += `${countdown.hours} h, ${countdown.minutes} m, ${countdown.seconds} s`;
  return countdownText;
}

export function startCountdown(totalSeconds, ui) {
  if (!ui) return;
  const countdownElement = ui;

  function update() {
    if (totalSeconds <= 0 && timer) {
      clearInterval(timer);
      // countdownElement.innerHTML = "Countdown expired!";
      countdownElement.style.display = "none";
    } else {
      const countdown = updateCountdown(totalSeconds);
      const formattedCountdown = formatCountdown(countdown);
      countdownElement.innerHTML = formattedCountdown;
      totalSeconds--;
    }
  }

  update(); // Call update immediately to avoid 1-second delay at the start
  const timer = setInterval(update, 1000); // Update every second
}

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
  startCountdown,
};
