const BASE_URL = import.meta.env.VITE_BACKEND_URL

export const fetchData = async (apiPath) => {
    try {
        console.log(`${BASE_URL}${apiPath}`)
        const response = await fetch(`${BASE_URL}${apiPath}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};