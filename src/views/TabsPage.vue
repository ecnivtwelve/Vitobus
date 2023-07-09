<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="horaires" href="/horaires">
          <ion-icon aria-hidden="true" :ios="time" :md="timeSharp" />
          <ion-label>Horaires</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="map" href="/infos">
          <ion-icon aria-hidden="true" :ios="notifications" :md="notifications" />
          <ion-label>Informations</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="about" href="/about">
          <ion-icon aria-hidden="true" :ios="informationCircle" :md="informationCircleSharp" />
          <ion-label>A propos</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { informationCircle, informationCircleSharp, map, notifications, time, timeSharp } from 'ionicons/icons';
</script>

<style scoped>
  ion-tab-button ion-icon {
    margin-top: 5px;
  }
</style>
