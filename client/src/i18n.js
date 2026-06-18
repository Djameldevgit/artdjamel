import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 🔥 Import automático de todas las traducciones
function importAll(r) {
  const translations = {};
  r.keys().forEach((key) => {
    // key = './es/components/auth.json'
    const pathParts = key.replace("./", "").split("/");

    const lng = pathParts[0]; // idioma (es, en, fr, ar...)

    // Namespace = solo el nombre del archivo, ignorando carpetas intermedias
    const ns = pathParts[pathParts.length - 1].replace(".json", "");

    if (!translations[lng]) translations[lng] = {};
    translations[lng][ns] = r(key);
  });
  return translations;
}

// 🔹 require.context para todos los JSON dentro de locales y subcarpetas
const resources = importAll(
  require.context("./locales", true, /\.json$/)
);

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fr", // idioma por defecto
    fallbackLng: "en",
    supportedLngs: Object.keys(resources),
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
