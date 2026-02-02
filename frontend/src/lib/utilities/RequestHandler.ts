export default class RequestHandler {
	// static development = import.meta.env.VITE_MODE === "development";
	// static baseURL = RequestHandler.development
	// 	? import.meta.env.VITE_DEVELOPMENT_URL
	// 	: import.meta.env.VITE_DEPLOYMENT_URL;
	static baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";
	static apiLink = ".netlify/functions/api";

	static async fetchData(
		method: string,
		link: string,
		requestData: Record<string, any> | FormData = {},
		headers: Record<string, string> = {},
		callback: ((error: string | null, data?: any) => void) | null = null
	) {
		const url = `${RequestHandler.baseURL}/${RequestHandler.apiLink}/${link}`;

		const options: RequestInit = {
			method: method.toUpperCase(),
			headers: {
				...headers,
			} as Record<string, string>,
		};

		const isClient = typeof window !== "undefined";
		const token = isClient ? localStorage.getItem("authToken") : null;

		if (token) {
			(options.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
		}

		const isFormData = requestData instanceof FormData;

		if (isFormData) {
			options.body = requestData;
		} else {
			(options.headers as Record<string, string>)["Content-Type"] = "application/json";
			if (!["get", "head"].includes(method.toLowerCase())) {
				options.body = JSON.stringify(requestData);
			}
		}

		try {
			const response = await fetch(url, options);
			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(responseData.message || `HTTP ${response.status}`);
			}

			if (callback) callback(null, responseData);
			return responseData;
		} catch (error: any) {
			console.error("Fetch error:", error);
			return {
				success: false,
				message: error.message || "An error occurred",
				url,
			};
		}
	}

}
