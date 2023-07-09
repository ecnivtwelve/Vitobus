<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
} from '@ionic/vue';

import mapboxgl from 'mapbox-gl';

import LineIcon from '@/components/icons/LineIcon.vue';

import { ref, onMounted } from 'vue'

import vitobus_stops from '../data/vitobus_stops.json';

import { useRouter } from 'vue-router';
import { search } from 'ionicons/icons';
const router = useRouter();

import { Geolocation } from '@capacitor/geolocation';

// ask for geolocation permission
const location_marker = document.createElement('div');
location_marker.style.width = '13px';
location_marker.style.height = '13px';
location_marker.style.borderRadius = '50%';
location_marker.style.backgroundColor = '#0066ff';
location_marker.style.outline = '3px solid #fff';
location_marker.style.boxShadow = '0 1px 5px #000000';

Geolocation.requestPermissions().then(() => {
  Geolocation.getCurrentPosition().then((position) => {
    const marker = new mapboxgl.Marker(location_marker)
      .setLngLat([position.coords.longitude, position.coords.latitude])
      .addTo(map);
  });
});

function navigate(url: string) {
  router.push(url);
}

function navigateLine(url: string, line: string) {
  // convert slashes to double underscores
  url = url.replace(/\//g, '__');
  router.push('/stop/'+line+'/'+url);
}

const allLines = [
  {
    name: 'Ligne A',
    letter: 'A',
    icon: 'line_a',
    comment: 'de Saint-Etienne à Bellevue'
  },
  {
    name: 'Ligne B',
    letter: 'B',
    icon: 'line_b',
    comment: 'de Lycée La Champagne à Lactalis'
  },
  {
    name: 'Ligne C',
    letter: 'C',
    icon: 'line_c',
    comment: 'de Maison Rouge à Z.A.C Roncinière'
  },
]

const secondLines = [
  {
    name: 'Ligne ETV.com',
    letter: 'ETV',
    icon: 'line_etv',
    comment: 'vers la Zone d’activité d’Étrelles'
  },
  {
    name: 'Ligne Vitré - La Guerche',
    letter: 'LG',
    icon: 'line_lg',
    comment: 'vers La Guerche de Bretagne'
  },
]

let lineA = vitobus_stops.line_a;
let lineB = vitobus_stops.line_b;
let lineC = vitobus_stops.line_c;

const isSearching = ref(false);

function searchLine(event: any) {
  const req = event.target.value;

  console.log(req.length);

  if(req.length > 2) {
    isSearching.value = true;

    lineA = vitobus_stops.line_a.filter((stop: any) => {
      return stop.name.toLowerCase().normalize("NFD").includes(req.toLowerCase().normalize("NFD"));
    });

    lineB = vitobus_stops.line_b.filter((stop: any) => {
      return stop.name.toLowerCase().normalize("NFD").includes(req.toLowerCase().normalize("NFD"));
    });

    lineC = vitobus_stops.line_c.filter((stop: any) => {
      return stop.name.toLowerCase().normalize("NFD").includes(req.toLowerCase().normalize("NFD"));
    });
  }
  else {
    isSearching.value = false;
  }
}

let map = null as any;

onMounted(() => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiZWNuaXZ0d2VsdmUiLCJhIjoiY2xqNGNmYXJqMDB5MDNsdGV5bzJzbnloMiJ9.Xl2MghL3NhhaWzSqyshpwg';

  map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v12', // style URL
    center: [-1.21025, 48.11850], // starting position [lng, lat]
    zoom: 12, // starting zoom
  });

  // add current location marker
  

  function markerElem(line: string) {
    const markerElem = document.createElement('img');
    markerElem.setAttribute('src', '/assets/lines/'+line+'.svg');
    markerElem.style.width = '18px';
    markerElem.style.height = '18px';

    return markerElem;
  }

  // for each line in allLines
  allLines.forEach((line: any) => {
    // for each stop, add a marker
    vitobus_stops['line_'+line.letter.toLowerCase()].forEach((stop: any) => {
      const lat = parseFloat(stop.coordinates.split(', ')[0].replace(',', '.'));
      const lng = parseFloat(stop.coordinates.split(', ')[1].replace(',', '.'));

      const marker = new mapboxgl.Marker({
        element: markerElem(line.icon),
        clickTolerance: 30,
        anchor: 'bottom',
      })
        .setLngLat([lng, lat])
        .addTo(map);

        marker.getElement().addEventListener('click', () => {
          navigateLine(stop.name, line.letter);
        });
    });
  });
})
</script>

<template>
  <ion-page>
    <ion-header mode="md">
      <ion-toolbar color="vitobus-dark">
        <ion-title>
          <img class="logo" src="/assets/vitobus_logo.svg"/>
        </ion-title>
      </ion-toolbar>
      <ion-toolbar color="vitobus-dark">
        <ion-searchbar @ionInput="searchLine($event)" animated placeholder="Chercher un arrêt"></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">

      <div id="search" v-if="isSearching">
        <div class="ion-list-pre-title">
          <p>Résultats de recherche</p>
        </div>

        <ion-list inset>
          <ion-item button @click="navigateLine(stop.name, 'A')" v-for="stop, index in lineA" :key="index">
            <img slot="start" class="lineIcon" src="/assets/lines/line_a.png" />
            <ion-label>
              <h2>{{ stop.name }}</h2>
              <p>Arrêt de la ligne A</p>
            </ion-label>
          </ion-item>
          <ion-item button @click="navigateLine(stop.name, 'B')" v-for="stop, index in lineB" :key="index">
            <img slot="start" class="lineIcon" src="/assets/lines/line_b.png" />
            <ion-label>
              <h2>{{ stop.name }}</h2>
              <p>Arrêt de la ligne B</p>
            </ion-label>
          </ion-item>
          <ion-item button @click="navigateLine(stop.name, 'C')" v-for="stop, index in lineC" :key="index">
            <img slot="start" class="lineIcon" src="/assets/lines/line_c.png" />
            <ion-label>
              <h2>{{ stop.name }}</h2>
              <p>Arrêt de la ligne C</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <div class="ion-list-pre-title">
        <p>Carte</p>
      </div>

      <ion-list inset>
        <div id="map"></div>
      </ion-list>

      <div class="ion-list-pre-title" v-if="!isSearching">
        <p>Lignes principales</p>
      </div>

      <ion-list inset v-if="!isSearching">
        <ion-item v-for="(line, i) in allLines" v-bind:key="i" button @click='navigate("/line/"+line.letter)'>
          <img slot="start" class="lineIcon" :src="'/assets/lines/'+line.icon+'.png'" />
          <ion-label>
            <h2>{{ line.name }}</h2>
            <p>{{ line.comment }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div class="ion-list-pre-title" v-if="!isSearching">
        <p>Lignes secondaires</p>
      </div>

      <ion-list inset v-if="!isSearching">
        <ion-item disabled v-for="(line, i) in secondLines" v-bind:key="i" button>
          <img slot="start" class="lineIcon" :src="'/assets/lines/'+line.icon+'.png'" />
          <ion-label>
            <h2>{{ line.name }}</h2>
            <p>{{ line.comment }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <br /><br /><br />

    </ion-content>
  </ion-page>
</template>

<style scoped>
  .logo {
    margin-top: 12px;
    margin-bottom: 6px;
  }

  .lineIcon {
    height: 28px;
    width: 28px;
  }

   #map {
    height: 200px;
    width: 100%;
   }
</style>