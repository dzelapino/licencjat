import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  GoogleMap,
  StreetViewPanorama,
  Marker,
  Polyline,
  LoadScript,
} from "@react-google-maps/api";
import Link from "next/link";
import styles from "@/styles/games/Geoguessr.module.scss";
import { locations } from "../../../public/locations";
import { useRouter } from "next/router";
import postScore from "./postScore";
import TwoButtonModal from "@/components/modals/twoButtonModal";
import { selectId } from "slices/authSlice";
import { useSelector } from "react-redux";

const GameLogic = ({ indexes, data }) => {
  const [roundScore, setRoundScore] = useState(0);
  const [markers, setMarkers] = useState([]);
  const [summaryMarkers, setSummaryMarkers] = useState([]);
  const [map, setMap] = useState(null);
  const [mapSize, setMapSize] = useState(null);
  const [distance, setDistance] = useState(null);
  const [backToStart, setBackToStart] = useState(null);
  const [prevCenter, setPrevCenter] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const router = useRouter();
  const { id } = router.query;
  const userId = useSelector(selectId);

  useEffect(() => {
  }, [backToStart]);

  const saveScore = (data) => {
    postScore(data);
    setModalOpen(false);
  };

  //ID hasnt load yet
  let game = sessionStorage.getItem(`GG_${id}`)
    ? JSON.parse(sessionStorage.getItem(`GG_${id}`))
    : {
        score: 0,
        currentRound: 1,
        locations: locations.sort(() => 0.5 - Math.random()).slice(0, 5),
        roundsList: [],
      };

  useEffect(() => {
    if (id !== undefined && sessionStorage.getItem(`GG_${id}`)) {
      game = JSON.parse(sessionStorage.getItem(`GG_${id}`));
    }
    if (id !== undefined && !sessionStorage.getItem(`GG_${id}`)) {
      sessionStorage.setItem(`GG_${id}`, JSON.stringify(game));
    }
    setSummaryMarkers(game.roundsList);
  }, [id]);

  const location = game.locations[game.currentRound - 1];
  const center = {
    lat: location?.lat,
    lng: location?.lng,
  };

  //REACT-GOOGLE-MAPS-COMPONENTS-OPTIONS
  const mapOptions = {
    draggableCursor: "crosshair",
    gestureHandling: "greedy",
    streetViewControl: false,
    fullscreenControl: false,
    disableDefaultUI: true,
    clickableIcons: false,
  };
  const panoramaOptions = {
    //COMPASS
    panControl: true,
    //ZOOM BUTTONS
    zoomControl: true,
    //ROAD ARROWS
    linksControl: true,
    //ZOOM
    scrollwheel: true,
    //MOVING
    clickToGo: true,
    //SHOW ADDRESS
    addressControl: false,
    //ROAD NAMES
    showRoadLabels: false,
    //ADDONS
    fullscreenControl: false,
    motionTrackingControl: true,
    enableCloseButton: false,
    visible: true,
    disableDefaultUI: true,
  };
  const polyLineOptions = {
    geodesic: true,
    strokeColor: "#FFFFF",
    strokeOpacity: 0,
    icons: [
      {
        icon: {
          path: "M 0,0 0,0",
          strokeOpacity: 1,
          scale: 3,
        },
        offset: "0",
        repeat: "5px",
      },
    ],
  };

  function loadCenter(map) {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: "Poland" }, function (results, status) {
      map.setCenter(results[0].geometry.location);
      map.setZoom(5);
    });
  }

  const onMapLoad = useCallback((map) => {
    map.setOptions(mapOptions);
    setMap(map);
    loadCenter(map);
    // const streetViewLayer = new window.google.maps.StreetViewCoverageLayer();
    // streetViewLayer.setMap(map);
  }, []);

  const onMapClick = useCallback((e) => {
    setMarkers([
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      },
    ]);
  }, []);

  const addSolutionMarker = () => {
    const solMarker = {
      lat: location.lat,
      lng: location.lng,
      url: `https://www.google.com/maps?q&layer=c&cbll=${location.lat},${location.lng}`,
    };
    markers.push(solMarker);
    summaryMarkers.push(markers);
  };

  const zoomFitBounds = (boundsList) => {
    const bounds = new window.google.maps.LatLngBounds();
    boundsList.forEach((coord) => {
      bounds.extend(coord);
    });
    map.fitBounds(bounds);
  };

  const getDistacneInUnits = () => {
    if (parseFloat(distance).toFixed(1) > 2000) {
      return `${(parseFloat(distance) / 1000).toFixed(1)} KM`;
    }
    if (parseFloat(distance).toFixed(1) > 10000) {
      return `${parseInt(distance / 1000)} KM`;
    }
    if (parseFloat(distance).toFixed(1) <= 2000) {
      return `${parseInt(distance)} M`;
    }
  };

  const getRoundScore = (dist) => {
    //https://www.reddit.com/r/geoguessr/comments/7ekj80/for_all_my_geoguessing_math_nerds/
    const exponent = 0.9893391207 ** parseFloat(dist / 1000);
    setRoundScore(parseInt(5000 * exponent) + 1);
    game.score += parseInt(5000 * exponent) + 1;
  };

  const handleGuess = () => {
    const solutionPosition = new window.google.maps.LatLng(
      location.lat,
      location.lng
    );
    const markerPosition = new window.google.maps.LatLng(
      markers[0].lat,
      markers[0].lng
    );

    const distance =
      window.google.maps.geometry.spherical.computeDistanceBetween(
        solutionPosition,
        markerPosition
      );

    setDistance(distance);
    addSolutionMarker();
    zoomFitBounds([solutionPosition, markerPosition]);
    setMapSize({
      height: "100vh",
      width: "100vw",
    });
    getRoundScore(distance);
    game.roundsList.push(summaryMarkers[game.currentRound - 1]);
    game.currentRound++;
    sessionStorage.setItem(`GG_${id}`, JSON.stringify(game));
  };

  //TODO replace summaryMarkers for game.roundsList, try on round 5
  const nextRound = () => {
    if (game.currentRound - 1 === game.locations.length) {
      const summaryMarkersFlattened = game.roundsList.flat();
      setMarkers(summaryMarkersFlattened);
      zoomFitBounds(summaryMarkersFlattened);
      setGameFinished(true);
      setModalOpen(true);
    } else {
      setMarkers([]);
      // setRound(round + 1);
      setMapSize(null);
      setTimeout(() => {
        loadCenter(map);
      }, 100);
    }
  };

  const panoramaContainerStyle = {
    height: "100vh",
    width: "100vw",
  };

  //PREVENT PANORAMA FROM GOING TO START POINT UNINTENTIONALLY
  const panoMap = useMemo(
    () => (
      <GoogleMap
        center={center}
        zoom={1}
        mapContainerStyle={panoramaContainerStyle}
      >
        <StreetViewPanorama
          id={styles.street_view}
          position={center}
          visible={true}
          // onLoad={onPanoramaLoad}
          options={panoramaOptions}
        />
      </GoogleMap>
    ),
    [game.currentRound, backToStart, game.location]
  );

  return (
    <div>
      {modalOpen ? (
        <TwoButtonModal
          modalText={`Your score is ${game.score}. Do You want to make this score public?`}
          mainButtonLeft={true}
          leftButtonText={"Yes"}
          leftButtonFunction={saveScore}
          leftButtonFunctionParameters={
            {"amount" : game.score.toString(),
            "private" : false,
            "game" : "geozgadywacz",
            "player" : userId}
          }
          rightButtonText={"No"}
          rightButtonFunction={saveScore}
          rightButtonFunctionParameters={
            {"amount" : game.score.toString(),
            "private" : true,
            "game" : "geozgadywacz",
            "player" : userId}
          }
        />
      ) : null}
      <div id={styles.panorama_container}>
        {panoMap}
        <div
          id={styles.startingPoint}
          aria-label="Starting point"
          onClick={() => {
            setPrevCenter({ lat: map.center.lat(), lng: map.center.lng() });
            setBackToStart(backToStart + 1);
          }}
        >
          <img
            src="https://www.geoguessr.com/_next/static/images/icon-return-to-start-3b4eed3225adfd860a4ed3726ad1e05a.svg"
            alt="backToStart"
          />
        </div>
        <div className={styles.score_board}>
          <div>
            <div>Round</div>
            <div>{game.currentRound}</div>
          </div>
          <div>
            <div>Score</div>
            <div>{game.score}</div>
          </div>
        </div>
      </div>
      <div
        id={styles.map_container}
        className={
          markers.length > 1
            ? `${styles.active} ${hidden ? `${styles.hidden}` : ""}`
            : `${hidden ? `${styles.hidden}` : ""}`
        }
      >
        <GoogleMap
          id={styles.map}
          mapContainerStyle={
            mapSize || {
              height: "210px",
              width: "250px",
            }
          }
          zoom={5}
          center={
            markers.length > 0
              ? {
                  lat: map.center.lat() || markers[0].lat,
                  lng: map.center.lng() || markers[0].lng,
                }
              : { lat: prevCenter?.lat || 0, lng: prevCenter?.lng || 0 }
          }
          onClick={
            markers.length !== 2 && markers.length !== 10 ? onMapClick : {}
          }
          onLoad={onMapLoad}
        >
          {markers.length > 0 &&
            markers.map((marker) => (
              <Marker
                key={`${marker.lat}-${marker.lng}`}
                position={{ lat: marker.lat, lng: marker.lng }}
                icon={
                  marker.url
                    ? {
                        url: `https://www.geoguessr.com/_next/static/images/correct-location-4da7df904fc6b08ce841e4ce63cd8bfb.png`,
                        scaledSize: new window.google.maps.Size(25, 25),
                      }
                    : null
                }
                onClick={() =>
                  marker.url ? window.open(marker.url, "_blank") : {}
                }
              />
            ))}
          {markers.length === 2 && (
            <Polyline
              path={[markers[0], markers[1]]}
              options={polyLineOptions}
            />
          )}
          {markers.length === 10 &&
            summaryMarkers.map((markersList) => (
              <Polyline
                key={`${markersList[0].lat}-${markersList[0].lng}`}
                path={[markersList[0], markersList[1]]}
                options={polyLineOptions}
              />
            ))}
        </GoogleMap>
        <div className={styles.cancel} onClick={() => setHidden(!hidden)}>
          X
        </div>
        {(markers.length === 0 || markers.length % 2 !== 0) && (
          <button
            id={styles.confirmButton}
            className={markers.length > 0 ? `${styles.active}` : ""}
            onClick={() => {
              markers.length > 0 ? handleGuess() : console.log("no marker");
            }}
          >
            {markers.length > 0 ? "GUESS" : "PLACE YOUR PIN ON THE MAP"}
          </button>
        )}
        {markers.length > 0 && markers.length % 2 === 0 && (
          <div className={styles.scoreboard}>
            <div className={styles.roundPoints}>
              {markers.length !== 10 ? roundScore : game.score} points
            </div>
            <div id={styles.progressBar} max="100">
              <div
                id={styles.progress}
                style={{
                  width: `${
                    markers.length !== 10
                      ? parseFloat(parseInt(roundScore) / 5000) * 100
                      : parseFloat(parseInt(game.score) / 25000) * 100
                  }%`,
                }}
              ></div>
            </div>
            {markers.length !== 10 ? (
              <div className={styles.score}>
                Your guess was {getDistacneInUnits()} away
              </div>
            ) : (
              <div>Well played!</div>
            )}
            {!gameFinished && (
              <button id={styles.nextRound} onClick={() => nextRound()}>
                {summaryMarkers.length !== 5 ? "NEXT ROUND" : "SUMMARY"}
              </button>
            )}
            {summaryMarkers.length === 5 && (
              <Link href={`../../games/`}>
                <button id={styles.playAgain}>PLAY AGAIN</button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLogic;
