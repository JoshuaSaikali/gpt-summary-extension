// Wait for the DOM content to be loaded
document.addEventListener("DOMContentLoaded", function () {
	// Query the active tab in the current window
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var url = tabs[0].url;
		var summaryElement = document.getElementById("summary");

		// Send a message to the background script to request the page summary
		chrome.runtime.sendMessage(
			{ action: "pageLoaded", content: url },
			function (response) {
				// Update the summary element with the received summary or a default message
				if (response && response.summary) {
					summaryElement.innerHTML = response.summary;
				} else {
					summaryElement.innerHTML = "Summary not available.";
				}
			}
		);
	});
});
