"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */


async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let finalArr = [];

  let result = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`)
  let resultArr = result.data;

  /** check for no results */
  if (resultArr.length > 0) {
    console.log(resultArr)

    for (let show of resultArr) {
      /** check for empty image */
      let image = "";
      if (!show.show.image) {
        image = "https://tinyurl.com/tv-missing";
      }
      else {
        image = show.show.image.original;
      }

      finalArr.push({
        id: show.show.id,
        name: show.show.name,
        summary: show.show.summary,
        image: image
      })
    }
  }
  else {
    alert(`no results for ${term}`)
  }


  return finalArr;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    let { id, image, name, summary } = show
    const $show = $(
      `<div data-show-id="${id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${image} 
              alt=${name} 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${name}</h5>
             <div><small>${summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);
      
      $showsList.append($show);
    }
    
    $(".Show-getEpisodes").on("click", function (evt) {
      let $show = $(evt.target).parents(".Show").first();
      let showId = $show.data("show-id");
      getEpisodesOfShow(showId);
    })
  }
  

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  let result = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let episodes = result.data;
  populateEpisodes(episodes)
}

function populateEpisodes(episodes) {
  $episodesArea.css("display", "block")
  $episodesArea.empty();
  $showsList.empty();
  const $episodeList = $("<ul></ul").css("list-style-type", "none");
  
  for (let episode of episodes) {
    // console.log(episode);
    let { id, image, name, summary } = episode
    const $episode = $(
      `<li data-show-id="${id}" class="Show col-md-12 col-lg-6 mb-4">
      <div class="media">
        <img 
           src=${image.original} 
           alt=${name} 
           class="w-25 mr-3">
        <div class="media-body">
          <h5 class="text-primary">${name}</h5>
          <div><small>${summary}</small></div>
        </div>
      </div>  
    </li>
    `);
    $episodeList.append($episode)
  }
  $episodesArea.append($episodeList);
}