let userLatitude=null,userLongitude=null,lastStops=null;
let stationMap=null,userMapMarker=null;
const stationLocations=[
 {id:'GEU',name:'Graphic Era University',lat:30.268681,lon:77.993404,status:'Approximate reference location'},
 {id:'ISBT',name:'ISBT Dehradun',lat:30.2878207,lon:77.9980253,status:'Approximate reference location'},
 {id:'LALKAMMA',name:'Lal Kamma Chowk',lat:30.273000,lon:77.982000,status:'Demo coordinate — verify exact stop'},
 {id:'CHANDRABANI',name:'Chandrabani',lat:30.286000,lon:77.971000,status:'Demo coordinate — verify exact stop'},
 {id:'PREMNAGAR',name:'Prem Nagar',lat:30.354000,lon:77.963000,status:'Demo coordinate — verify exact stop'},
 {id:'BALLUPUR',name:'Ballupur',lat:30.336000,lon:78.005000,status:'Demo coordinate — verify exact stop'}
];
function initStationMap(){
 const mapElement=document.getElementById('stationMap');
 if(!mapElement||!window.L)return;
 stationMap=L.map(mapElement).setView([30.302,77.988],12);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(stationMap);
 const stationIcon=L.divIcon({className:'',html:'<div style="width:18px;height:18px;border-radius:50%;background:#1f7568;border:3px solid white;box-shadow:0 1px 7px #183c3266"></div>',iconSize:[18,18],iconAnchor:[9,9]});
 stationLocations.forEach(station=>L.marker([station.lat,station.lon],{icon:stationIcon}).addTo(stationMap).bindPopup(`<div class="map-popup-title">${escapeHTML(station.name)}</div><div class="map-popup-meta">${escapeHTML(station.status)}<br>${station.lat.toFixed(5)}, ${station.lon.toFixed(5)}</div>`));
 document.getElementById('mapLocateBtn')?.addEventListener('click',()=>{if(userLatitude===null){getLocation();statusText.textContent='Getting your location for the map...';return;}showUserOnMap();});
 if(userLatitude!==null)showUserOnMap();
 setTimeout(()=>stationMap.invalidateSize(),250);
}
function showUserOnMap(){
 if(!stationMap||userLatitude===null)return;
 if(userMapMarker)stationMap.removeLayer(userMapMarker);
 const userIcon=L.divIcon({className:'',html:'<div style="width:18px;height:18px;border-radius:50%;background:#d99a54;border:3px solid white;box-shadow:0 0 0 5px #d99a5444"></div>',iconSize:[18,18],iconAnchor:[9,9]});
 userMapMarker=L.marker([userLatitude,userLongitude],{icon:userIcon}).addTo(stationMap).bindPopup('<div class="map-popup-title">Your current location</div><div class="map-popup-meta">GPS position from your device</div>');
 stationMap.setView([userLatitude,userLongitude],13);userMapMarker.openPopup();
}
const statusText=document.getElementById('status'),latText=document.getElementById('latitude'),lonText=document.getElementById('longitude'),clock=document.getElementById('clock');
const retryBtn=document.getElementById('retryBtn'),findBtn=document.getElementById('findBtn'),demoBtn=document.getElementById('demoBtn'),results=document.getElementById('results');
function nowMinutes(){const d=new Date();return d.getHours()*60+d.getMinutes();}
function updateClock(){clock.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});if(userLatitude!==null&&lastStops)refreshResults();}
function ready(){retryBtn.disabled=findBtn.disabled=demoBtn.disabled=false;statusText.textContent='C++ calculation module is ready.';}
function getLocation(){if(!navigator.geolocation){statusText.textContent='Geolocation is not supported by this browser.';return;}statusText.textContent='Getting current location...';navigator.geolocation.getCurrentPosition(p=>{userLatitude=p.coords.latitude;userLongitude=p.coords.longitude;latText.textContent=userLatitude.toFixed(6);lonText.textContent=userLongitude.toFixed(6);lastStops=null;statusText.textContent='GPS location retrieved. Click Find Nearest Stops & Buses.';showUserOnMap();},e=>statusText.textContent='Location error: '+e.message+'. Allow permission and retry.',{enableHighAccuracy:true,timeout:15000,maximumAge:0});}
function findStops(){if(userLatitude===null){statusText.textContent='First retrieve your GPS location.';return;}if(!window.cppReady||!Module.findNearestStops){statusText.textContent='C++ module is not ready.';return;}try{lastStops=JSON.parse(Module.findNearestStops(userLatitude,userLongitude,6,nowMinutes()));showResults(lastStops);statusText.textContent='Nearest stations calculated. Bus times are being compared with your live device clock.';}catch(e){statusText.textContent='Calculation error: '+e.message;}}
function refreshResults(){if(!window.cppReady||userLatitude===null)return;try{lastStops=JSON.parse(Module.findNearestStops(userLatitude,userLongitude,6,nowMinutes()));showResults(lastStops);}catch(e){}}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function showResults(stops){const count=document.getElementById('resultCount');if(count)count.textContent=stops.length+' STATION'+(stops.length===1?'':'S');if(!stops.length){results.classList.add('results-empty-art');results.innerHTML='<b>No stations found.</b><p>Try refreshing your location or checking the demo location.</p>';return;}results.classList.remove('results-empty-art');results.innerHTML=stops.map((s,i)=>`<article class="stop-card"><div class="stop-heading"><b>${i+1}. ${escapeHTML(s.name)}</b><span class="distance">${s.distance_km.toFixed(2)} km away</span></div><p class="coords">Station: ${s.latitude.toFixed(6)}, ${s.longitude.toFixed(6)}<br>Your location: ${userLatitude.toFixed(6)}, ${userLongitude.toFixed(6)}</p><small>${escapeHTML(s.data_status)}</small>${s.vehicles.length?s.vehicles.map(v=>`<div class="vehicle"><b>${escapeHTML(v.name)}</b><br>Route: ${escapeHTML(v.route)}<br><small>${escapeHTML(v.data_status)}</small>${v.times.length?v.times.map(t=>`<div class="time-row"><span>${escapeHTML(t.time)}</span><span class="tag ${t.status==='Passed'?'passed':t.status==='Passing now'?'now':'upcoming'}">${escapeHTML(t.status)}</span></div>`).join(''):'<p>No passing times entered.</p>'}</div>`).join(''):'<p>No vehicle records stored for this stop.</p>'}</article>`).join('');}
retryBtn.addEventListener('click',getLocation);findBtn.addEventListener('click',findStops);demoBtn.addEventListener('click',()=>{userLatitude=30.268681;userLongitude=77.993404;latText.textContent=userLatitude.toFixed(6);lonText.textContent=userLongitude.toFixed(6);lastStops=null;statusText.textContent='Graphic Era demo location selected. Click Find Nearest Stops & Buses.';showUserOnMap();});
window.addEventListener('cpp-ready',ready);if(window.cppReady)ready();updateClock();setInterval(updateClock,1000);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initStationMap);else initStationMap();
