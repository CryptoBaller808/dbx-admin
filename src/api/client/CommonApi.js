const API_BASE_URL = process.env.REACT_APP_API_URL  ; 


const client = async ({
    body,
    url,
    method,
    headers = {},
}) => { 
    const token = localStorage.getItem("access_token");

    // Merge default headers with any provided headers
    const requestHeaders = {
        ...headers,
        "ngrok-skip-browser-warning": "true",
    };

    // Add authorization token if available
    if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
    }

    // Conditionally set Content-Type for POST method
    if (
        (method === "POST" || method === "PATCH" || method === "DELETE") &&
        body &&
        !(body instanceof FormData)
    ) {
        requestHeaders["Content-Type"] = "application/json";
    }

    try {
        const response = await fetch(API_BASE_URL + url, {
            method,
            headers: requestHeaders,
            body: body
                ? body instanceof FormData
                    ? body
                    : JSON.stringify(body)
                : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || "An error occurred");
        }

        return await response.json();
    } catch (error) {
        console.log("Error:", error);
        throw error;
    }
};

export const httpClient = {
    get: async (url, body, headers = {}) => client({ url, method: "GET", body, headers }),
    post: async (url, body, headers = {}) => client({ url, method: "POST", body, headers }),
    patch: async (url, body, headers = {}) => client({ url, method: "PATCH", body, headers }),
    delete: async (url, body, headers = {}) => client({ url, method: "DELETE", body, headers }),
};
