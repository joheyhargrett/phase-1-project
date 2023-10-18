const content = document.getElementById("content");
const artistContainer = document.createElement("div"); // Create a container for the artist info
const artistImage = document.createElement("img"); // Create an img element for the artist's image
const albumDropdown = document.createElement("select"); // Create a single select element for the album dropdown

let data = {};
let selectedAlbumId = null; // Track the selected album ID

const artistIds = ["6l3HvQ5sa6mXTsMTB19rO5"];
const requestToken = async () => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials&client_id=64ffb24515d44051b073917a2bd60326&client_secret=7ba47ffd43fc4c799c3e9a64b02b2456"
    });
    data = await response.json();
    console.log(data);
};

const renderPage = async () => {
    await requestToken();

    artistIds.forEach((artistId) => fetchArtist(artistId));
};

const fetchArtist = async (artistId) => {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { "Authorization": `Bearer ${data.access_token}` }
    });

    const artistInfo = await response.json();
    const artist = { image: artistInfo.images[1].url };
    artistImage.src = artist.image;
    artistImage.addEventListener("click", () => showAlbumDropdown(artistId)); // Add click event to the artist image
    artistContainer.appendChild(artistImage);

    content.appendChild(artistContainer); // Add the container to the content
};

const showAlbumDropdown = (artistId) => {
    clearAlbumDropdown(); // Clear existing options in the album dropdown
    fetchArtistAlbums(artistId); // Fetch artist albums when the image is clicked
};

const clearAlbumDropdown = () => {
    albumDropdown.innerHTML = ''; // Clear existing options in the album dropdown
};

const fetchArtistAlbums = async (artistId) => {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?market=US`, {
        headers: { "Authorization": `Bearer ${data.access_token}` }
    });

    const artistAlbums = await response.json();
    renderAlbumDropdown(artistAlbums.items); // Populate the album dropdown
};

const fetchAlbumTracks = async (albumId) => {
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
        headers: { "Authorization": `Bearer ${data.access_token}` }
    });

    const albumTracks = await response.json();
    renderTrackList(albumTracks.items); // Display the tracks associated with the album
};

const renderAlbumDropdown = (albums) => {
    const albumOption = document.createElement("option"); // Create an option element for the default message
    albumOption.textContent = "Select an Album";
    albumDropdown.appendChild(albumOption);

    albums.forEach((album) => {
        const option = document.createElement("option");
        option.value = album.id;
        option.textContent = album.name;
        albumDropdown.appendChild(option);
    });

    albumDropdown.addEventListener("change", (event) => {
        selectedAlbumId = event.target.value;
        fetchAlbumTracks(selectedAlbumId); // Fetch and display tracks when an album is selected
    });

    content.appendChild(albumDropdown); // Add the album dropdown to the content
};

const renderTrackList = (tracks) => {
    const trackList = document.createElement("ul");

    tracks.forEach((track) => {
        const listItem = document.createElement("li");
        listItem.textContent = track.name;
        trackList.appendChild(listItem);
    });

    // Clear the previous track list, if any
    const existingTrackList = content.querySelector("#trackList");
    if (existingTrackList) {
        content.removeChild(existingTrackList);
    }

    trackList.id = "trackList";
    content.appendChild(trackList); // Add the new track list to the content
};

renderPage();
