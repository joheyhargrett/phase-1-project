// This code defines an array called artistData containing information about 
// music artists. Each artist is represented as 
// an object with two properties: "id" and "name". 
// The "id" is a unique identifier, and the "name" is the artist's name
const artistData = [
  { id: "6l3HvQ5sa6mXTsMTB19rO5", name: "J-Cole" },
  { id: "1uNFoZAHBGtllmzznpCI3s", name: "Justin Bieber" },
  { id: "790FomKkXshlbRYZFtlgla", name: "Karol G" },
  { id: "12Chz98pHFMPJEknJQMWvI", name: "Muse" },
  { id: "181bsRPaVXVlUKXrxwZfHK", name: "Megan Thee Stallion" }

];
//this is a post requestToken that allows us to access the spotify api 
//to get the artist's top tracks and albums and all the credentials needed to access the api.
const requestToken = async () => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials&client_id=64ffb24515d44051b073917a2bd60326&client_secret=7ba47ffd43fc4c799c3e9a64b02b2456"
  });
  data = await response.json();
  console.log(data);
};
// The renderPage function is responsible for rendering the artist information on a web page. It first calls the requestToken 
// function to get the access token. Then, it iterates over each artist in artistData and calls the fetchArtist 
//function for each artist. Finally,
//  it sets up an event listener for a search button that calls the searchArtist function when clicked.
const renderPage = async () => {
  await requestToken();

  artistData.forEach((artist) => {
    fetchArtist(artist);
  });

  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", searchArtist);
};

const resetArtistContainer = (artistId) => {
  const artistContainer = content.querySelector(`[data-artist="${artistId}"]`);

  const heartIcon = artistContainer.querySelector('.heart-icon');
  heartIcon.innerHTML = isArtistHearted(artistId) ? "❤️" : "🤍";
  clearAlbumDropdown();
  clearTrackList(artistContainer.querySelector(".track-list-container"));
};

const toggleHeart = (artistId) => {
  const artistContainer = content.querySelector(`[data-artist="${artistId}"]`);
  const heartIcon = artistContainer.querySelector('.heart-icon');
  const isLiked = isArtistHearted(artistId);

  if (isLiked) {

    updateHeartedArtists(artistId, false);
    heartIcon.innerHTML = "🤍";
  } else {

    updateHeartedArtists(artistId, true);
    heartIcon.innerHTML = "❤️";
  }
};


const fetchArtistGenre = async (artistId, artistContainer) => {
  const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: { "Authorization": `Bearer ${data.access_token}` }
  });

  const artistInfo = await response.json();
  const genre = artistInfo.genres[0];

  const genresContainer = artistContainer.querySelector(".genres");


  if (genre) {
    const genreElement = document.createElement("span");
    genreElement.textContent = genre;


    genresContainer.appendChild(genreElement);
  } else {

    genresContainer.textContent = "No genre available";
  }
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

  // heartIcon.innerHTML property is set to "❤️," which is a Unicode character representing a red heart. 
  // When you append this heartIcon element to your webpage, it will display the heart icon as text content on the page. This way, 
  // you don't need to use an image for the heart icon, and it will be displayed as a character.

  const heartIcon = document.createElement("span");
  heartIcon.className = "heart-icon";
  heartIcon.innerHTML = isArtistHearted(artist.id) ? "❤️" : "🤍";
  heartIcon.addEventListener("click", () => toggleHeart(artist.id));

// resetArtistContainer is a function that is called when the button is clicked. It is responsible for resetting the information
//  displayed for a specific artist.
// artist.id is used as a parameter for the resetArtistContainer function, which indicates which artist's information needs to be reset.

  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset";
  resetButton.addEventListener("click", () => resetArtistContainer(artist.id));


  const genresContainer = document.createElement("div");
  genresContainer.classList.add("genres");

  artistContainer.appendChild(artistImage);
  artistContainer.appendChild(artistName);
  artistContainer.appendChild(heartIcon);
  artistContainer.appendChild(resetButton);
  artistContainer.appendChild(genresContainer);
  artistContainer.setAttribute("data-artist", artist.id);

  content.appendChild(artistContainer);

  artistImage.addEventListener("click", () => showAlbumDropdown(artist.id));


  await fetchArtistGenre(artist.id, artistContainer);
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
      searchInput.value = '';
    } else {
      alert("No artists found for the given search term.");
    }
  }
};

const content = document.getElementById("content");
let data = {};

function isArtistHearted(artistId) {
  const heartedArtists = JSON.parse(localStorage.getItem("heartedArtists")) || [];
  return heartedArtists.includes(artistId);
}

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
