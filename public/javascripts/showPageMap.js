mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'cluster-map',
    style: 'mapbox://styles/mapbox/light-v10', //stylesheet location
    center: campground.geometry.coordinates, //starting position [lng, lat]
    zoom: 4 //starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

var markerHeight = 50, markerRadius = 10, linearOffset = 25;
var popupOffsets = {
    'top': [0, 0],
    'top-left': [0,0],
    'top-right': [0,0],
    'bottom': [0, -markerHeight],
    'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
    'left': [markerRadius, (markerHeight - markerRadius) * -1],
    'right': [-markerRadius, (markerHeight - markerRadius) * -1]
};
// var popup = new mapboxgl.Popup({offset: popupOffsets, className: 'my-class'})
//     .setLngLat(e.lngLat)
//     .setHTML("<h1>Hello World!</h1>")
//     .setMaxWidth("300px")
//     .addTo(map);


// Set options -- for a marker
var marker = new mapboxgl.Marker({
    //color: "#FFFFFF",
    draggable: true
    }).setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: popupOffsets })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map);

