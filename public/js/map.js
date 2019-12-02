var map;
var osm, twilightlayer, markerlayer, gaodelayer, binglayer;
var markerSource = new ol.source.Vector({});
var twilightSource = new ol.source.Vector({});
var pointArray = [];
var twilightStyle;
function initMap() {
    //style
    twilightStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(150,0,0,0)',
            width: 1
        }),
            fill: new ol.style.Fill({
                color: "rgba(150, 150, 150, 0.5)",
            })
    });

    var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326',

        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
    });

    gaodelayer = new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            //url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'  
            url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'
        })
    });

    binglayer = new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.BingMaps({
            key: 'ArtOjLzEO20pgshJqvlLmqSfkQfylBUe6mbWgU6_cj2aR9UZUM-A7RHXEkiEATwJ',
            imagerySet: 'AerialWithLabels'
        })
    });

    osm = new ol.layer.Tile({
        preload: Infinity,
        source: new ol.source.OSM()
    });
    twilightlayer = new ol.layer.Vector({
        source: twilightSource,
        style:twilightStyle
    });
    markerlayer = new ol.layer.Vector({
        source: markerSource
    });
    //twilight points
    UpdateTwilightPoints()
   
    map = new ol.Map({
        controls: ol.control.defaults({
            /*
            attributionOptions: ({
                collapsible: false
            })
            */
        }).extend([mousePositionControl]),
        layers: [
            osm,
            gaodelayer,
            binglayer,
            twilightlayer,
            markerlayer
        ],
        target: 'rcp1_map',
        view: new ol.View({
            center: ol.proj.transform([0,0],
                'EPSG:4326', 'EPSG:3857'),
            zoom: 2
        })
    });
}

function UpdateTwilightPoints(){
    fetch("/api/points")
   .then((resp) => resp.json()) // Transform the data into json
   .then(function(data) {
     // Create and append the li's to the ul
     pointArray = [];
     data.forEach(AddToTwilightPoints)
     })
}

function AddToTwilightPoints(p) {
    pointArray.push([p.X,p.Y])
}

function LocatePoint() {
    //split input
    var lonlat = tbLonLat.value.split(",");
    if (lonlat.length != 2) {
        console.log("invaild coordinate!");
        return;
    }

    var cmbformat = document.getElementById('coordformat');

    if (cmbformat.selectedIndex == 1) {
        lonlat = lonlat.reverse();
    }
    //console.log(lonlat);
    //zoom to point
    var lon = parseFloat(lonlat[0]);
    var lat = parseFloat(lonlat[1]);
    //CenterAt(lon, lat);
    AddMarkerPoint(lon, lat);
}

function ClearTrackPoints() {
    twilightSource.clear();
    pointSource.clear();
    pointArray = [];
}

function ClearPointLayer() {
    pointSource.clear();
}

function ShowTrack() {
    //generate a line from pointSource
    var feature = new ol.Feature({
        geometry: new ol.geom.Polygon([pointArray]),
        style:twilightStyle
    });
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    twilightSource.addFeature(feature);
}

function AddMarkerPoint(lon, lat) {
    ClearMarkerPoints();
    //style
    var style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            stroke: new ol.style.Stroke({
                color: '#000'
            }),
            fill: new ol.style.Fill({
                color: "rgba(230, 0, 0, 0.5)",
            })
        }),
        text: new ol.style.Text({
            text: lon + "," + lat, // attribute code
            offsetY: 18,
            fill: new ol.style.Fill({
                color: "#000" // black text // TODO: Unless circle is dark, then white..
            })
        })
    });
    // Create the feature
    var marker = new ol.Feature({
        geometry: new ol.geom.Point(
            ol.proj.transform(
                [lon, lat],
                'EPSG:4326', 'EPSG:3857')
        )
    });

    // Set style created earlier
    marker.setStyle(style);

    // Assuming your layer / source is already map bound
    //var source = markerlayer.getSource();
    //source.addFeatures(marker);
    markerSource.addFeature(marker);
}

function ClearMarkerPoints() {
    markerSource.clear();
}

function backgroundChange(e) {
    switch (e.selectedIndex) {
        case 0:
            //display osm
            binglayer.setVisible(false);
            gaodelayer.setVisible(false);
            osm.setVisible(true);
            document.getElementById("mouse-position").style.color = "black";
            break;
        case 1:
            //display gaode
            binglayer.setVisible(false);
            gaodelayer.setVisible(true);
            osm.setVisible(false);
            document.getElementById("mouse-position").style.color = "black";
            break;
        case 2:
            //display image
            binglayer.setVisible(true);
            gaodelayer.setVisible(false);
            osm.setVisible(false);
            document.getElementById("mouse-position").style.color = "white";
            break;
        default:
            break;
    }
}

function RefreshPos() {
    //ClearTrackPoints();
    //GetCurPos();
    ShowTrack();
}

function ClearAll() {
    ClearTrackPoints();
    ClearMarkerPoints();
}
