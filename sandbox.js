
const artist = async () => {
    const response = await fetch("http://localhost:3000/artist")
    const info = await response.json();
    info.forEach(info => {
        renderInfo(info)
    });
    console.log(artist);
};


const artistIds = ["6l3HvQ5sa6mXTsMTB19rO5"]
const requestToken = async () => {

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials&client_id=64ffb24515d44051b073917a2bd60326&client_secret=7ba47ffd43fc4c799c3e9a64b02b2456"
    });
    const data = await response.json()
    console.log(data)

    const fetchArtist = async (artistId) => {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: { "Authorization": `Bearer ${data.access_token}` }
        })
        const artistInfo = await response.json()
        console.log(artistInfo)
        const artist = {image: artistInfo.images[0].url}
        renderArtist(artist)
    }
    artistIds.forEach((artistId) => fetchArtist(artistId))
}

const content = document.getElementById("content")

const renderArtist = (artist) => {
    const image = document.createElement("img")
    image.src = artist.image
    console.log(image)
    content.append(image)
}

const requestTimer = setTimeout(() => { requestToken(), 3600000 })
// console.log(requestTimer)

//first get all the info of artist
//image, name ,Genre
//add other 4 artist ids to the array
//write the function that will fetch the albums (event listeners)
//click on album and it will fetch the songs on the album