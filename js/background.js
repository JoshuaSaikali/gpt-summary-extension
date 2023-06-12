// Listen for the extension being installed or updated
chrome.runtime.onInstalled.addListener(function () {
	// Clear the local storage
	chrome.storage.local.clear();
});

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === "pageLoaded") {
		var content = request.content;
		var contentString = JSON.stringify(content); // Convert the content to a string

		// Check if the summary is already stored in local storage
		chrome.storage.local.get([contentString], function (result) {
			if (result[contentString]) {
				// Send the stored summary back to the popup script
				sendResponse({ summary: result[contentString] });
			} else {
				var apiEndpoint = "https://api.openai.com/v1/chat/completions";
				var apiKey = "YOURAPIKEY";

				// Make a POST request to the OpenAI API to generate the summary
				fetch(apiEndpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer " + apiKey,
					},
					body: JSON.stringify({
						model: "gpt-3.5-turbo",
						messages: [
							{
								role: "system",
								content:
									"You: Summarize the following content in 1 paragraph:\n" +
									content,
							},
						],
					}),
				})
					.then(function (response) {
						return response.json();
					})
					.then(function (data) {
						console.log("API response:", data);

						if (
							data &&
							data.choices &&
							data.choices[0] &&
							data.choices[0].message &&
							data.choices[0].message.content
						) {
							var generatedSummary = data.choices[0].message.content;
							var summaryObj = {};
							summaryObj[contentString] = generatedSummary;

							// Store the generated summary in local storage
							chrome.storage.local.set(summaryObj);
							// Send the generated summary back to the popup script
							sendResponse({ summary: generatedSummary });
						} else {
							console.error("Error in API response:", data);
							var errorObj = {};
							errorObj[contentString] = "Error generating summary.";

							// Store the error message in local storage
							chrome.storage.local.set(errorObj);
							// Send a null summary back to the popup script
							sendResponse({ summary: null });
						}
					})
					.catch(function (error) {
						console.error("Error during API call:", error);
						var errorObj = {};
						errorObj[contentString] = "Error generating summary.";

						// Store the error message in local storage
						chrome.storage.local.set(errorObj);
						// Send a null summary back to the popup script
						sendResponse({ summary: null });
					});
			}
		});

		return true; // Indicates that the response will be sent asynchronously
	}
});
