let currentSong = new Audio();
let songs = [];
let currFolder;

async function getSongs(folder) {
  let a = await fetch(`/${folder}/`).then((response) => response.text());

  let songsDiv = document.createElement("div");
  songsDiv.innerHTML = a;
  let songsA = songsDiv.getElementsByTagName("a");

  songs = [];

  for (let i = 0; i < songsA.length; i++) {
    let element = songsA[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
}

function formatTime(seconds) {
  seconds = Math.round(seconds);
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;

  // Add leading zeros if needed
  let formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  let formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/songs/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = track.replaceAll(
    /%20|\.mp3/gi,
    " "
  );
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};


async function displayAlbums(){
  let a = await fetch(`/songs/`).then((response) => response.text());
  let div = document.createElement("div");
  div.innerHTML = a;
  let anchors = div.getElementsByTagName("a");

  let array = Array.from(anchors);

  for(let index=0;index<array.length;index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let albumfolder = e.href.split("/").slice(-1)[0];

      console.log(albumfolder);
      // get the metadata of the folder
      let response = await fetch(`/songs/${albumfolder}/info.json`).then(
        (response) => response.json()
      );
      console.log(response);

      let cardContainer = document.querySelector(".cardContainer");
      cardContainer.innerHTML += `<div data-folder="${response.data}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                color="#000000" fill="none">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke="currentColor" stroke-width="1.5" fill="#000" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${albumfolder}/\cover.jpg" alt="playlist img">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
    }
  }





  // when someone clicks on cards display the songs inside those cards

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      currFolder = item.currentTarget.dataset.folder;

      await getSongs(`songs/${currFolder}`);

      // play the first song
      console.log(songs[0]);
      playMusic(songs[0], false);

      let songUL = document.querySelector(".songList").querySelector("ul");
      songUL.innerHTML = " ";
      //show all the songs in the playlist
      for (const song of songs) {
        songUL.innerHTML += ` <li> 
                        <img src="img/music.svg"> 

                        <div class="info">
                            <div>${song.replaceAll(/%20/gi, " ")}</div>
                            <div>Ritik</div>
                        </div>

                        <div class="playNow">
                            <span>Play now</span>
                            <img src="img/play.svg" style="filter: invert(1);">
                        </div>
                    
                    </li>`;
      }

      //attach an event listner to each song

      Array.from(
        document.querySelector(".songList").getElementsByTagName("li")
      ).forEach((e) => {
        e.addEventListener("click", () => {
          playMusic(
            e.querySelector(".info").firstElementChild.innerHTML.trim()
          );
        });
      });
    });
  });
}


async function main() {

   //display all the albums on the page 
   displayAlbums();

 

  //attach an event listener to play , pause and next

  //  const play=document.getElementById('play');

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event

  currentSong.addEventListener("timeupdate", () => {
    // console.log((currentSong.currentTime / currentSong.duration) * 100 + "%");

    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )}/${formatTime(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add event listener to seek bar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration / 100) * percent;
  });

  // add event on hamburger

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //close left  when click on close button

  document.querySelector(".left .close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-200%";
  });

  //add event listener on previous and next

  previous.addEventListener("click", () => {
    console.log("previous clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index <= 0) {
      playMusic(songs[songs.length - 1]);
    } else {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    console.log("next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 >= songs.length) {
      playMusic(songs[0]);
    } else {
      playMusic(songs[index + 1]);
    }
  });

  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 >= songs.length) {
      playMusic(songs[0]);
    } else {
      playMusic(songs[index + 1]);
    }
  });

  // add event listener on mute and unmute button

  volumeControl.addEventListener("click", () => {
    if (!currentSong.muted) {
      volumeControl.src = "img/mute.svg";
    } else {
      volumeControl.src = "img/volume.svg";
    }
    currentSong.muted = !currentSong.muted;
  });
}

main();
