// Send a message to the background script with the loaded content
chrome.runtime.sendMessage(
	{ action: "contentLoaded", content: document.body.innerText },
	function (response) {}
);
