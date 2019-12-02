var map;
var osm, twilightlayer, customMarkerlayer,markerlayer, gaodelayer, binglayer;
var customMarkerSource = new ol.source.Vector({});
var markerSource = new ol.source.Vector({});
var twilightSource = new ol.source.Vector({});
var twilightPointArray = [];
var sunPosX, sunPosY;
var twilightStyle, customMarkerStyle,markerStyle;
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

    markerStyle = new ol.style.Style({
        /*
        image: new ol.style.Circle({
            radius: 8,
            stroke: new ol.style.Stroke({
                color: '#000'
            }),
            fill: new ol.style.Fill({
                color: "rgba(230, 0, 0, 0.5)",
            })
        })
        */
       image: new ol.style.Icon({
        src: '../sun.png',
        scale: 0.3
      })
    });

    customMarkerStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            stroke: new ol.style.Stroke({
                color: '#000'
            }),
            fill: new ol.style.Fill({
                color: "rgba(0, 230, 0, 0.5)",
            })
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
        style: twilightStyle
    });
    markerlayer = new ol.layer.Vector({
        source: markerSource,
        style: markerStyle
    });
    customMarkerlayer = new ol.layer.Vector({
        source: customMarkerSource,
        style: customMarkerStyle
    });

    //twilight points
    RefreshPos();
    map = new ol.Map({
        controls: ol.control.defaults({
        }).extend([mousePositionControl]),
        layers: [
            osm,
            gaodelayer,
            binglayer,
            twilightlayer,
            markerlayer,
            customMarkerlayer
        ],
        target: 'rcp1_map',
        view: new ol.View({
            center: ol.proj.transform([0, 0],
                'EPSG:4326', 'EPSG:3857'),
            zoom: 2
        })
    });
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function CenterAt(lon,lat)
{
    var zoom=map.getView().getZoom();
    map.getView().setCenter(ol.proj.transform([lon,lat],
        'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(zoom);
}

function UpdateTwilightPoints() {
    fetch("/api/sunpos")
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
            // Create and append the li's to the ul
            sunPosX = data.X
            sunPosY = data.Y
        })

    fetch("/api/points")
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
            // Create and append the li's to the ul
            twilightPointArray = [];
            data.forEach(AddToTwilightPoints)
        })
}

function AddToTwilightPoints(p) {
    twilightPointArray.push([p.X, p.Y])
}

function ClearTwilightPoints() {
    twilightSource.clear();
    markerSource.clear();
}

function ClearMarkerPoints() {
    customMarkerSource.clear()
}

function ShowTwilightLine() {
    //generate a line from pointSource
    var feature = new ol.Feature({
        geometry: new ol.geom.Polygon([twilightPointArray]),
        style: twilightStyle
    });
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    twilightSource.addFeature(feature);
}

function ShowSunPos(){
    var marker = new ol.Feature({
        geometry: new ol.geom.Point(
            ol.proj.transform(
                [sunPosX,sunPosY],
                'EPSG:4326', 'EPSG:3857')
        ),
        style:markerStyle
    });

    markerSource.addFeature(marker);
}

function AddMarkerPoint(lon, lat) {
    //ClearMarkerPoints();
    var marker = new ol.Feature({
        geometry: new ol.geom.Point(
            ol.proj.transform(
                [lon, lat],
                'EPSG:4326', 'EPSG:3857')
        )
    });

    customMarkerSource.addFeature(marker);
}

function RefreshPos() {
    ClearAll()
    UpdateTwilightPoints()
    sleep(300).then(() => {
    ShowTwilightLine()
    ShowSunPos()
    })
}

function ClearAll() {
    ClearTwilightPoints();
    ClearMarkerPoints();
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