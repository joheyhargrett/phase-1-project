const content = document.getElementById("content");
const artistContainer = document.createElement("div"); // Create a container for the artist info

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
    fetchArtistAlbums("6l3HvQ5sa6mXTsMTB19rO5"); // Fetch artist albums
};

const fetchArtist = async (artistId) => {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { "Authorization": `Bearer ${data.access_token}` }
    });

    const artistInfo = await response.json();
    const artist = { image: artistInfo.images[1].url };
    renderArtist(artist);
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

const renderArtist = (artist) => {
    const artistImage = document.createElement("img");
    artistImage.src = artist.image;
    artistContainer.appendChild(artistImage);

    content.appendChild(artistContainer); // Add the container to the content
};

const renderAlbumDropdown = (albums) => {
    const albumDropdown = document.createElement("select"); // Create a select element for the album dropdown
    albumDropdown.id = "albumDropdown"; // Set an id for the dropdown

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

    artistContainer.appendChild(albumDropdown); // Add the album dropdown to the container
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
