var map;
var timer;
var refresh_time = 500, refresh_count = -1, max_refresh = 4;
var osm, pathlayer, pointlayer, markerlayer, binglayer;
var selectedFeature;
var markerSource = new ol.source.Vector({});
var pathSource = new ol.source.Vector({});
var pointSource = new ol.source.Vector({});
var pointArray = [];
var oldstyle, hiddenStyle, trackStyle;
function initMap() {
    //style
    trackStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            stroke: new ol.style.Stroke({
                color: '#000'
            }),
            fill: new ol.style.Fill({
                //color: "rgba(0, 230, 0, 0.5)",
                color: "rgba(0, 230, 0, 1)",
            })
        })
    });

    // invisible Style Vector Alpha
    hiddenStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({
                //color: 'rgba(200,200,0,1)'
                color: 'yellow'
            }),
            stroke: new ol.style.Stroke({
                //color: 'rgba(0,0,0,0)',
                color: 'black',
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
    pointlayer = new ol.layer.Vector({
        source: pointSource
    });
    pathlayer = new ol.layer.Vector({
        source: pathSource
    });
    markerlayer = new ol.layer.Vector({
        source: markerSource
    });
    //twilight points
    fetch(
        "/api/points"
        , {
            method: "GET",
            headers: {
                // "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    ).then(
        function (res) {
            console.log(res.status);
            if (res.ok) {
                console.log("Perfect! Your settings are saved.");
            }
            else if (res.status == 401) {
                console.log("Oops! You are not authorized.");
            }
            //console.log(res.json())
            return res.json();
        },
        function (e) {
            console.log("Error submitting form!", e);
        }
    )

    map = new ol.Map({
        controls: ol.control.defaults({
            attributionOptions: ({
                collapsible: false
            })
        }).extend([mousePositionControl]),
        layers: [
            osm,
            gaodelayer,
            binglayer,
            pointlayer,
            pathlayer,
            markerlayer
        ],
        target: 'rcp1_map',
        view: new ol.View({
            center: ol.proj.transform([114.14977978, 30.5020963],
                'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });
}

function CenterAt(lon, lat) {
    var zoom = map.getView().getZoom();
    map.getView().setCenter(ol.proj.transform([lon, lat],
        'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(zoom);
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
    CenterAt(lon, lat);
    AddMarkerPoint(lon, lat);
}

function StartStopTracing() {
    var btn = document.getElementById('btnStartStop');
    if (btn.innerText.indexOf("Start") !== -1) {
        //GetCurPos();
        StartTracing();
        console.log("started");
        btn.innerText = "Stop Tracing";
    }
    else {
        StopTracing();
        btn.innerText = "Start Tracing";
    }
}

function StartTracing() {
    if (refresh_count == -1 || refresh_count > max_refresh) {
        GetCurPos();
        refresh_count = 0;
    }
    refresh_count++;
    //flash
    var features = pointSource.getFeatures();
    if (features.length != 0) {
        var feature = pointSource.getFeatureById(features.length - 1);
        if (refresh_count % 2 == 0) {
            feature.setStyle(hiddenStyle);
        }
        else {
            feature.setStyle(trackStyle);
        }
    }
    timer = setTimeout("StartTracing()", refresh_time);
}

function StopTracing() {
    refresh_count = -1;
    clearTimeout(timer);
    console.log("stopped");
}

function ClearTrackPoints() {
    pathSource.clear();
    pointSource.clear();
    pointArray = [];
}

//var lonArray=[114.14,114.15,114.16,114.17,114.18,114.19];
var lonArray = [114.158625, 114.158565, 114.15808, 114.157775, 114.157601, 114.157405, 114.157485, 114.157527, 114.157459, 114.157439, 114.157395, 114.157197, 114.157032, 114.157177, 114.157287, 114.157694, 114.157898, 114.157914, 114.157865, 114.157833, 114.157769, 114.15826, 114.159029, 114.159915, 114.160732, 114.161187, 114.161439, 114.161849, 114.162678, 114.163326, 114.163326, 114.16382, 114.164109, 114.164316, 114.164396, 114.16448, 114.164651, 114.165154, 114.165633, 114.166273, 114.166826, 114.167264, 114.167684, 114.168094, 114.16841, 114.168724, 114.168998, 114.169216, 114.169627, 114.16993, 114.170228, 114.170292, 114.170364, 114.170439, 114.170499, 114.17058, 114.170637, 114.170715, 114.170759, 114.170861, 114.171015, 114.171167, 114.170924, 114.170395, 114.170059, 114.169614, 114.169069, 114.168573, 114.168135, 114.167682, 114.167516, 114.167194, 114.166756, 114.166023, 114.165327, 114.164869, 114.164507, 114.164111, 114.163809, 114.163367, 114.162962, 114.162413, 114.161922, 114.161263, 114.160962, 114.160948, 114.161132, 114.161563, 114.162137, 114.162465, 114.162847, 114.163469, 114.163766, 114.163748, 114.164018, 114.164125, 114.163827, 114.163827, 114.163571, 114.163297];
var latArray = [30.505114, 30.505137, 30.505113, 30.505202, 30.505193, 30.505335, 30.505938, 30.506488, 30.507022, 30.507237, 30.50747, 30.508182, 30.508814, 30.509023, 30.509012, 30.508993, 30.509172, 30.509866, 30.510417, 30.510634, 30.510789, 30.510755, 30.510646, 30.510446, 30.510074, 30.509842, 30.509699, 30.509386, 30.50887, 30.508476, 30.508476, 30.508126, 30.507943, 30.507806, 30.507776, 30.507754, 30.507923, 30.508586, 30.509101, 30.509825, 30.510442, 30.511064, 30.511035, 30.510781, 30.510671, 30.510995, 30.511348, 30.51164, 30.512141, 30.512521, 30.512527, 30.512159, 30.511775, 30.511348, 30.510967, 30.510563, 30.510152, 30.509789, 30.509625, 30.509191, 30.508569, 30.507976, 30.507921, 30.508037, 30.507981, 30.507905, 30.50778, 30.507561, 30.50727, 30.506804, 30.506578, 30.506502, 30.506673, 30.506977, 30.507287, 30.507334, 30.506905, 30.506495, 30.506131, 30.505592, 30.50505, 30.504418, 30.503795, 30.503123, 30.502758, 30.502427, 30.502258, 30.502, 30.501884, 30.501531, 30.501252, 30.500905, 30.500623, 30.50049, 30.500251, 30.500044, 30.499662, 30.499662, 30.499363, 30.499035];
//var latArray=[30.5,30.5,30.5,30.5,30.5,30.5];
var count = 0;
function GetCurPos2() {
    AddTrackPoint(lonArray[count], latArray[count]);
    if (count == lonArray.length - 1) {
        ClearTrackPoints();
        ClearMarkerPoints();
        count = 0;
    }
    else {
        count++;
    }
}
function GetCurPos() {
    console.log("getting new position of E30");
    var lonlat = [];
    /*
      fetch(
        "http://54.222.247.59/telematics/v1/carpos/geocoding?vin=DFE300000000TEST7"
        , {
          method: "GET",
          headers: {
            "Authorization": "57bd6cb371d732000100000138ed73fe0d15479a5f1e58ab663e01eb"
          }
        }
        */
    fetch(
        "http://gateway.paas.dawnpro.cf/carshare/car/vehiclestatusinfo/getRealTimeDataByVIN?vin=LGJE33E1XGM447712"
        , {
            method: "GET",
        }
    ).then(
        function (res) {
            return res.json();
        }
    ).then(
        function (data) {
            //var location=data.results.location;
            //AddTrackPoint(location.lng,location.lat);
            //CenterAt(location.lng,location.lat);
            var model = data.model;
            AddTrackPoint(model.longitude, model.latitude);
            CenterAt(model.longitude, model.latitude);
        }
    );
}

function ClearPointLayer() {
    pointSource.clear();
}

function AddTrackPoint(lon, lat) {
    pointArray.push([lon, lat]);
    // Create the feature
    var point = new ol.Feature({
        geometry: new ol.geom.Point(
            ol.proj.transform(
                [lon, lat],
                'EPSG:4326', 'EPSG:3857')
        )
    });

    // Set style created earlier
    point.setStyle(trackStyle);
    point.setId(pointArray.length - 1);

    // Assuming your layer / source is already map bound
    pointSource.addFeature(point);

    var cb = document.getElementById('ckbShowTrack');
    if (cb.checked) {
        ShowTrack();
    }
}

function ShowTrack() {
    HideTrack();
    var cb = document.getElementById('ckbShowTrack');
    if (!cb.checked) {
        return;
    }
    //generate a line from pointSource
    var feature = new ol.Feature({
        geometry: new ol.geom.LineString(pointArray)
    });
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    feature.setStyle(
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [0, 0, 200, 0.8],
                width: 10
            })
        })
    );
    pathSource.addFeature(feature);
    //add to pathlayer

}

function HideTrack() {
    //clear features in pathlayer
    pathSource.clear();
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
    ClearTrackPoints();
    GetCurPos();
}

function ClearAll() {
    ClearTrackPoints();
    ClearMarkerPoints();
}
