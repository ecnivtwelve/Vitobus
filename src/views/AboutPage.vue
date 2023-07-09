<template>
  <ion-page>
    <ion-header mode="md">
      <ion-toolbar color="vitobus-dark">
        <ion-title>A propos</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list inset mode="md">
        <ion-item>
          <ion-icon :icon="personCircle" slot="start"></ion-icon>
          <ion-label>
            <p>Développé par</p>
            <h2>Vince Linise</h2>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon :icon="calendar" slot="start"></ion-icon>
          <ion-label>
            <p>Date des données</p>
            <h2>19 juin 2022</h2>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon :icon="speedometer" slot="start"></ion-icon>
          <ion-label>
            <p>Version</p>
            <h2>{{ version }}</h2>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/vue';

import {
  calendar, personCircle, speedometer,
} from 'ionicons/icons';

import { ref } from 'vue';

import package_json from '/package.json'
const version = ref(package_json.version);
</script>
