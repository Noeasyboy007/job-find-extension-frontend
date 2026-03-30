import { useEffect, useState } from "react";

const COUNTRY_CODE_API_URL =
  import.meta.env.VITE_COUNTRY_CODE_API_URL ||
  "https://project-lawsikho-development.lawsikho.dev/api/v1/country-code";

export function useCountryCodes() {
  const [countryCodes, setCountryCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCountryCodes() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(COUNTRY_CODE_API_URL);
        const payload = await response.json();
        if (!response.ok || !payload?.data || !Array.isArray(payload.data)) {
          throw new Error("Could not load country code list");
        }
        const normalized = payload.data
          .map((item) => ({
            id: item.id,
            country_name: item.country_name,
            country_code: `+${String(item.country_code || "").replace(/^\+/, "")}`,
            iso_code: item.iso_code,
          }))
          .filter((item) => item.country_code !== "+");
        if (mounted) {
          setCountryCodes(normalized);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Country code API failed");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCountryCodes();

    return () => {
      mounted = false;
    };
  }, []);

  return { countryCodes, loading, error };
}

