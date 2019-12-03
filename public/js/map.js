var map;
var osm, twilightlayer, lonlatlayer, sunlayer;
function initMap() {
    //style
    var dotlineStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            width: 1.5,
            color: 'rgba(50, 50, 50, 1)',
            lineDash: [.1, 5] //or other combinations
        }),
        zIndex: 2
    })

    var twilightStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(150,0,0,0)',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: "rgba(150, 150, 150, 0.5)",
        })
    });

    var sunStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: '../sun.png',
            scale: 0.3
        })
    });

    osm = new ol.layer.Tile({
        preload: Infinity,
        source: new ol.source.OSM()
    });
    twilightlayer = new ol.layer.Vector({
        source: new ol.source.Vector({}),
        style: twilightStyle
    });
    lonlatlayer = new ol.layer.Vector({
        source: new ol.source.Vector({}),
        style: dotlineStyle
    });
    sunlayer = new ol.layer.Vector({
        source: new ol.source.Vector({}),
        style: sunStyle
    });

    //lonlat
    AddLonLat()

    map = new ol.Map({
        layers: [
            osm,
            lonlatlayer,
            twilightlayer,
            sunlayer,
        ],
        target: 'rcp1_map',
        view: new ol.View({
            center: ol.proj.transform([0, 0],
                'EPSG:4326', 'EPSG:3857'),
            zoom: 2.2
        })
    });

    //update
    updateFeaturesForVectorLayer();
}

function AddLonLat() {
    // Your loctations
    var locations = [];
    locations.push([[-180, 23.4367], [180, 23.4367]])
    locations.push([[-180, -23.4367], [180, -23.4367]])

    var polyline = new ol.geom.MultiLineString(locations);
    // Coordinates need to be in the view's projection, which is
    // 'EPSG:3857' if nothing else is configured for your ol.View instance
    polyline.transform('EPSG:4326', 'EPSG:3857');

    var feature = new ol.Feature({
        geometry: polyline
    })
    var source = lonlatlayer.getSource()
    source.addFeature(feature);
}

function updateFeaturesForVectorLayer() {
    $.ajax({
        type: "GET",
        url: '/api/sunpos',
        dataType: "json",
        success: function (data) {
            var features = (new ol.format.GeoJSON()).readFeatures(data, { featureProjection: "EPSG:3857" });
            sunlayer.getSource().clear();
            sunlayer.getSource().addFeatures(features);
        }
    });

    $.ajax({
        type: "GET",
        url: '/api/twilight',
        dataType: "json",
        success: function (data) {
            var features = (new ol.format.GeoJSON()).readFeatures(data, { featureProjection: "EPSG:3857" });
            twilightlayer.getSource().clear();
            twilightlayer.getSource().addFeatures(features);
        }
    });

    setTimeout(updateFeaturesForVectorLayer, 600000);
}