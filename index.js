const artistData = [
  { id: "6l3HvQ5sa6mXTsMTB19rO5", name: "J-Cole" },
  { id: "1uNFoZAHBGtllmzznpCI3s", name: "Justin Bieber" },
  { id: "790FomKkXshlbRYZFtlgla", name: "Karol G" },
  { id: "12Chz98pHFMPJEknJQMWvI", name: "Muse" },
  { id: "181bsRPaVXVlUKXrxwZfHK", name: "Megan Thee Stallion" }
  // Add more artists with their IDs and names
];

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

  artistData.forEach((artist) => {
    fetchArtist(artist);
  });

  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", searchArtist);
};

const fetchArtist = async (artist) => {
  const response = await fetch(`https://api.spotify.com/v1/artists/${artist.id}`, {
    headers: { "Authorization": `Bearer ${data.access_token}` }
  });

  const artistInfo = await response.json();
  const artistContainer = document.createElement("div");
  artistContainer.classList.add("artist-container");

  const artistImage = document.createElement("img");
  artistImage.src = artistInfo.images[1].url;

  const artistName = document.createElement("h2");
  artistName.textContent = artist.name;

  // Create a heart icon
  const heartIcon = document.createElement("span");
  heartIcon.className = "heart-icon";
  heartIcon.innerHTML = isArtistHearted(artist.id) ? "&#9829;" : "&#9825;";

  // Add a click event to toggle "hearted" state
  heartIcon.addEventListener("click", () => {
    const hearted = isArtistHearted(artist.id);
    updateHeartedArtists(artist.id, !hearted);
    heartIcon.innerHTML = !hearted ? "&#9829;" : "&#9825;";
  });

  artistContainer.appendChild(artistImage);
  artistContainer.appendChild(artistName);
  artistContainer.appendChild(heartIcon);
  artistContainer.setAttribute("data-artist", artist.id);

  content.appendChild(artistContainer);

  artistImage.addEventListener("click", () => showAlbumDropdown(artist.id));
};

const showAlbumDropdown = async (artistId) => {
  clearAlbumDropdown();

  const albumDropdown = document.createElement("select");
  albumDropdown.id = `albumDropdown-${artistId}`;

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select an Album";
  albumDropdown.appendChild(defaultOption);

  const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?market=US`, {
    headers: { "Authorization": `Bearer ${data.access_token}` }
  });

  const artistAlbums = await response.json();
  renderAlbumDropdown(artistAlbums.items, artistId, albumDropdown);
};

const clearAlbumDropdown = () => {
  const albumDropdowns = content.querySelectorAll("select[id^='albumDropdown-']");
  albumDropdowns.forEach((dropdown) => dropdown.remove());
};

const renderAlbumDropdown = (albums, artistId, albumDropdown) => {
  albums.forEach((album) => {
    const option = document.createElement("option");
    option.value = album.id;
    option.textContent = album.name;
    albumDropdown.appendChild(option);
  });

  albumDropdown.addEventListener("change", async (event) => {
    const selectedAlbumId = event.target.value;
    const artistContainer = content.querySelector(`[data-artist="${artistId}"]`);
    const trackListContainer = artistContainer.querySelector(".track-list-container");
    clearTrackList(trackListContainer);
    await fetchAlbumTracks(selectedAlbumId, trackListContainer);
  });

  const artistContainer = content.querySelector(`[data-artist="${artistId}"]`);
  const trackListContainer = document.createElement("div");
  trackListContainer.classList.add("track-list-container");
  artistContainer.appendChild(trackListContainer);

  artistContainer.appendChild(albumDropdown);
};

const clearTrackList = (trackListContainer) => {
  const existingTrackList = trackListContainer.querySelector("ul");
  if (existingTrackList) {
    existingTrackList.remove();
  }
};

const fetchAlbumTracks = async (albumId, trackListContainer) => {
  const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
    headers: { "Authorization": `Bearer ${data.access_token}` }
  });

  const albumTracks = await response.json();
  renderTrackList(albumTracks.items, trackListContainer);
};

const renderTrackList = (tracks, trackListContainer) => {
  const trackList = document.createElement("ul");
  tracks.forEach((track) => {
    const listItem = document.createElement("li");
    listItem.textContent = track.name;
    trackList.appendChild(listItem);
  });

  trackListContainer.appendChild(trackList);
};

const searchArtist = async () => {
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput.value;

  if (searchTerm) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${searchTerm}&type=artist`, {
      headers: { "Authorization": `Bearer ${data.access_token}` }
    });

    const searchResults = await response.json();
    if (searchResults.artists && searchResults.artists.items.length > 0) {
      const artist = searchResults.artists.items[0];
      fetchArtist({ id: artist.id, name: artist.name });
      searchInput.value = ''; // Clear the search input field
    } else {
      alert("No artists found for the given search term.");
    }
  }
};

const content = document.getElementById("content");
let data = {};

// Function to check if the artist is "hearted" or liked
function isArtistHearted(artistId) {
  const heartedArtists = JSON.parse(localStorage.getItem("heartedArtists")) || [];
  return heartedArtists.includes(artistId);
}

// Function to update the "hearted" state
function updateHeartedArtists(artistId, hearted) {
  const heartedArtists = JSON.parse(localStorage.getItem("heartedArtists")) || [];

  if (hearted) {
    if (!heartedArtists.includes(artistId)) {
      heartedArtists.push(artistId);
    }
  } else {
    const index = heartedArtists.indexOf(artistId);
    if (index !== -1) {
      heartedArtists.splice(index, 1);
    }
  }

  localStorage.setItem("heartedArtists", JSON.stringify(heartedArtists));
}

renderPage();
