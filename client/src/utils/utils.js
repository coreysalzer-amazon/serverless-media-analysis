export function getFileNameFromURL(url) {
	return url.substring(url.lastIndexOf("/") + 1, url.length);
}