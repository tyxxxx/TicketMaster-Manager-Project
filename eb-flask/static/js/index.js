
let G_events = [];
let G_sort = { 'name': true, 'genre': true, 'venue': true };

function clearClick() {
  util.q('#keyword').value = '';
  util.q('#distance').value = '';
  util.q('#category').value = 'Default';
  util.q('#detect').checked = false;
  setLocationField(false);
  util.q('#location').value = '';

  util.q('#results').innerHTML = '';
  hideDetail();
}

function scrollToBottom() {
  // const container = util.q('.container');
  const container = util.q('html');
  container.scrollTop = container.scrollHeight;
}

function retriveEventInfo(e) {
  if (e == null) {
    return null;
  }
  let event = {};
  if (e.id != null) {
    event.id = e.id;
  }

  if (e.name != null) {
    event.name = e.name;
  }

  if (e.dates != null && e.dates.start != null && e.dates.start.localDate != null) {
    event.time = e.dates.start.localDate;
    if (e.dates.start.localTime != null) {
      event.time = event.time + ' ' + e.dates.start.localTime;
    }
  }

  if (e.images != null && e.images[0] != null && e.images[0].url != null) {
    event.img = e.images[0].url;
  }

  if (e.classifications != null && e.classifications[0] != null && e.classifications[0].segment != null && e.classifications[0].segment.name != null) {
    event.genre = e.classifications[0].segment.name;
  }

  if (e._embedded != null && e._embedded.venues != null && e._embedded.venues[0] != null && e._embedded.venues[0].name != null) {
    event.venue = e._embedded.venues[0].name;
  }


  return event;
}

function searchEvents() {
  util.q('#results').innerHTML = '';
  hideDetail();
  let url = "/events/?keyword=" + util.q('#keyword').value
    + "&distance=" + util.q('#distance').value
    + "&category=" + util.q('#category').value;
  console.log("detect checked:", util.q('#detect').checked);

  let lat = 40.4241;
  let lng = 74.022;
  if (!util.q('#detect').checked) {
    let location = util.q('#location').value;
    let geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCxMDQd7bL84qZidWOdbTnNoVzlEW1H9oo&address=` + location;
    util.get(geoUrl).then(resp => {
      util.l('google geocode', resp);
      if (resp.results != null && resp.results[0] != null && resp.results[0].geometry != null && resp.results[0].geometry.location != null) {
        let loc = resp.results[0].geometry.location;
        lat = loc.lat;
        lng = loc.lng;
        util.l('google geo code lat', lat, 'lng', lng);
      }
      queryEvents(url, lat, lng);
    });
  } else {
    let ipinfoUrl = 'https://ipinfo.io/?token=b19aa45bb7925f';
    util.get(ipinfoUrl).then(resp => {
      util.l("ip info", resp);
      if (resp.loc != null) {
        let locs = resp.loc.split(',');
        lat = locs[0];
        lng = locs[1];
        util.l("ip info lat", lat, 'lng', lng, 'ip', resp.ip, 'city', resp.city);
      }
      queryEvents(url, lat, lng);
    });
  }
}

function queryEvents(url, lat, lng) {
  url += "&lat=" + lat;
  url += "&lng=" + lng;
  util.get(url).then(resp => {
    util.l('events response', resp)
    if (resp._embedded == null || resp._embedded.events == null) {
      util.q('#results').innerHTML = "<div class='no-result text-center red'>No Records found</div>"
    } else {
      let fullEvents = resp._embedded.events;
      let events = extractEventData(fullEvents);
      G_events = events;
      G_sort = { 'name': true, 'genre': true, 'venue': true };
      showEvents(events);
    }
  });
}

function extractEventData(events) {
  let results = [];
  for (let event of events) {
    results.push(retriveEventInfo(event));
  }
  return results;
}

function showEvents(events) {
  let table = createTable();
  let tbody = util.q('tbody', table);
  for (let event of events) {
    let tr = util.create('tr');

    util.create('td', event.time, tr);
    let iconTd = util.create('td', '', tr);
    let img = util.create('img', '', iconTd);
    img.setAttribute('src', event.img);

    let nameTd = util.create('td', '', tr);
    util.parse(`<a href="javascript:void(0)" onclick="queryDetail('${event.id}')">${event.name}</a>`, nameTd);
    util.create('td', event.genre, tr);
    util.create('td', event.venue, tr);
    tbody.appendChild(tr);
  }
  util.q('#results').innerHTML = ''
  util.q('#results').appendChild(table);
}

function createTable() {
  let html = `
  <table>
    <thead>
    <tr>
    <th>Date</th>
    <th>Icon</th>
    <th onclick="sortEvents('name')">Event</th>
    <th onclick="sortEvents('genre')">Genre</th>
    <th onclick="sortEvents('venue')">Venue</th>
    </tr>
    </thead>
    <tbody>
    </tbody>
  </table>
  `
  return util.parse(html);
}

// query event detail
function queryDetail(id) {
  // let a = detail01;
  // showDetail(a);

  hideDetail();
  util.get('/detail?id=' + id).then(resp => {
    util.l("event detail", resp);
    showDetail(resp);
  });
}

function concat(str, str2) {
  if (str2 == null || str2 == '' || str2 == 'Undefined') {
    return str;
  }

  if (str == null || str == '') {
    return str2;
  } else {
    return str + " | " + str2;
  }

}

function retirveDetailInfo(e) {
  if (e == null) {
    return null;
  }
  let event = {};

  if (e.dates != null && e.dates.start != null && e.dates.start.localDate != null) {
    event.time = e.dates.start.localDate;
    if (e.dates.start.localTime != null) {
      event.time = event.time + ' ' + e.dates.start.localTime;
    }
  }

  if (e._embedded != null && e._embedded.attractions != null && e._embedded.attractions.length > 0) {
    event.artName = [];
    for(let attr of e._embedded.attractions){
      event.artName.push({name:attr.name, url:attr.url});
    }
  }

  if (e._embedded != null && e._embedded.attractions != null && e._embedded.attractions[0] != null && e._embedded.attractions[0].url != null) {
    event.artUrl = e._embedded.attractions[0].url;
  }

  if (e.classifications != null && e.classifications[0] != null) {
    let c = e.classifications[0];
    if (c.genre != null || c.subGenre != null || c.segment != null || c.subType != null) {
      event.genre = '';
      if (c.subGenre != null) {
        event.genre = concat(event.genre, c.subGenre.name);
      }
      if (c.genre != null) {
        event.genre = concat(event.genre, c.genre.name);
      }
      if (c.segment != null) {
        event.genre = concat(event.genre, c.segment.name);
      }
      if (c.subType != null) {
        event.genre = concat(event.genre, c.subType.name);
      }
      if (c.type != null) {
        event.genre = concat(event.genre, c.type.name);
      }
    }
  }

  if (e.priceRanges != null && e.priceRanges[0] != null && e.priceRanges[0].min != null && e.priceRanges[0].max != null) {
    event.priceRange = e.priceRanges[0].min + '-' + e.priceRanges[0].max + 'USD';
  }

  if (e.dates != null && e.dates.status != null && e.dates.status.code != null) {
    event.statusCode = e.dates.status.code;
  }

  if (e.seatmap != null && e.seatmap.staticUrl != null) {
    event.img = e.seatmap.staticUrl;
  }

  if (e._embedded != null && e._embedded.venues != null && e._embedded.venues[0] != null && e._embedded.venues[0].name != null) {
    event.venue = e._embedded.venues[0].name;
  }

  return event;
}

function showDetail(event) {
  if (event == null || event.name == null) {
    alert("Can not show event detail.");
    return;
  }
  let detailBox = util.q('#detailBox');
  detailBox.innerHTML = '';
  let detailDiv = util.parse('<div id="detail"></div>', detailBox);
  util.create('h1', event.name, detailDiv);
  let detailMain = util.parse('<div class="detail-main"></div>', detailDiv);
  let leftDiv = util.parse('<div class="left"></div>', detailMain);
  let rightDiv = util.parse('<div class="right"></div>', detailMain);

  const detail = retirveDetailInfo(event);
  addDetailText(leftDiv, 'Date', detail.time);
  addArts(leftDiv, 'Artist/Team', detail.artName);
  addDetailText(leftDiv, 'Venue', detail.venue);
  addDetailText(leftDiv, 'Genres', detail.genre);
  addDetailText(leftDiv, 'Price Ranges', detail.priceRange);
  addDetailStatus(leftDiv, 'Ticket Status', detail.statusCode);
  addDetailLink(leftDiv, 'Buy Ticket At:', 'Ticketmaster', event.url);

  util.parse(`<img src="${detail.img}" alt="">`, rightDiv);


  util.parse(`
  <div id="showVenue" class="text-center">
    Show Venue Details
    <div>
    <a href="javascript:queryVenueDetail('${detail.venue}')">﹀</a>
    </div>
  </div>`, detailBox);
  // ﹀㇗


  scrollToBottom();
}

function addDetailStatus(parent, title, data) {

  if (data == null || data == '') {
    return;
  }
  let status = "On Sale";
  if (data == 'onsale') {
    status = 'On Sale';
  } else if (data == 'offsale') {
    status = 'Off Sale';
  } else if (data == 'canceled') {
    status = 'Canceled';
  } else if (data == 'postponed') {
    status = 'Postponed';
  } else if (data == 'rescheduled') {
    status = 'Rescheduled';
  }
  let html = `
  <div id="d-date">
    <div class="title">${title}</div>
    <div class="status">
      <span class="data ${data}">${status}</span>
    </div>
  </div>`;
  util.parse(html, parent);
}

function addDetailText(parent, title, data) {
  if (data == null || data == '') {
    return;
  }
  let html = `
  <div id="d-date">
    <div class="title">${title}</div>
    <div class="text data">${data}</div>
  </div>`;
  util.parse(html, parent);
}

function addDetailLink(parent, title, data, url) {
  if (data == null || data == '') {
    return;
  }
  let html = `
  <div id="d-date">
    <div class="title">${title}</div>
    <div class="link data"><a target="_blank" href="${url}">${data}</a></div>
  </div>`;
  util.parse(html, parent);
}

function addArts(parent, title, arts){
  if(arts == null || arts.length == 0){
    return;
  }

  let links = '';
  let i = 0;
  for(let art of arts){
    let link = `<a target="_blank" href="${art.url}">${art.name}</a>`;
    links = links + (i>0?' | ' : '') + link;
    i++;
  }
  
  let html = `
  <div id="d-date">
    <div class="title">${title}</div>
    <div class="link data">${links}</div>
  </div>`;
  util.parse(html, parent);
}

function hideDetail() {
  util.q('#detailBox').innerHTML = '';
  util.q('#venueBox').innerHTML = '';
}

// query and show venue detail
function queryVenueDetail(name) {
  // name = 'Walt Disney Concert Hall';
  util.get('/venue?name=' + name).then(resp => {
    util.l('venue detail', resp);
    showVenueDetail(resp, name);
  });
}
function showVenueDetail(resp, searchName) {
  if (resp._embedded == null || resp._embedded.venues == null) {
    util.l("Can not show venue.", resp._embedded);
    alert("Can not get result by search venue with keyword '" + searchName + "'");
    return;
  }

  util.q('#showVenue').remove();

  venue = resp._embedded.venues[0];
  let venueBox = util.q('#venueBox');
  venueBox.innerHTML = '';
  let name = venue.name;
  let address = 'N/A';
  if (venue.address != null) {
    address = venue.address.line1;
  }
  let city = 'N/A';
  if (venue.city != null) {
    city = venue.city.name;
  }
  if (venue.state != null) {
    city += "," + venue.state.stateCode;
  }
  let postalCode = venue.postalCode || 'N/A';
  let upcomingUrl = venue.url || 'N/A';
  let queryItem = `${name},${address},${city},${postalCode}`;
  let googleSearch = 'https://www.google.com/maps/search/?api=1&query=' + queryItem;
  let html = `
  <div id="venueInfo">
    <div class="venueBorder">
      <div class="text-center">
        <span class="title">${name}</span>
      </div>
      <div class="venue-main">
        <div class="left">
          <div class=" venue-addr">
            <div class="address left1">Address:</div>
            <div class="right1">
              ${address}<br>
              ${city}<br>
              ${postalCode}
            </div>
            <div class="clear"></div>
          </div>
          <div class="open-map text-center">
            <a href="${googleSearch}" target="_blank">Open in Google Maps</a>
          </div>
        </div>
        <div class="right text-center">
          <a href="${upcomingUrl}" target="_blank">More events at this venue</a>
        </div>
      </div>
    </div>
  </div>`;
  util.parse(html, venueBox);
  scrollToBottom();
}

function setLocationField(checked) {
  let input = util.q('#location');

  if (checked) {
    input.classList.add('hide');
    input.setAttribute('required', false);
    input.setAttribute('disabled', true);
  } else {
    input.classList.remove('hide');
    input.setAttribute('required', true);
    input.removeAttribute('disabled');
  }
}

function cmpStr(s1, s2, type) {
  let res = s1.localeCompare(s2);
  res = res * (G_sort[type] ? 1 : -1);
  return res;
}
function cmpName(e1, e2) {
  return cmpStr(e1.name || '', e2.name || '', 'name');
}

function cmpGenre(e1, e2) {
  return cmpStr(e1.genre || '', e2.genre || '', 'genre');
}

function cmpVenue(e1, e2) {
  return cmpStr(e1.venue || '', e2.venue || '', 'venue');
}

function sortEvents(type) {
  if (type == 'name') {
    G_events.sort(cmpName);
  } else if (type == 'genre') {
    G_events.sort(cmpGenre);
  } else if (type == 'venue') {
    G_events.sort(cmpVenue);
  }
  G_sort[type] = !G_sort[type];
  showEvents(G_events);
}

util.q('#detect').onchange = function (ele) {
  setLocationField(ele.target.checked);
};

util.q('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const isValid = e.target.checkValidity();
  if (!isValid) {
    return;
  }

  searchEvents();
});

function sss() {
  if (util.q('#searchForm').reportValidity()) {
    console.log("form validate");
  } else {
    console.log("form not validate");
  }
}

// searchEvents();
// queryDetail(1);