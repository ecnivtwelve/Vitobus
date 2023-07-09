<script>
  import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonButton,
    IonIcon
  } from '@ionic/vue';

  import { mapSharp } from 'ionicons/icons';

  import { defineComponent } from 'vue';

  import vitobus_time from '../data/vitobus_time.json';

  import { Browser } from '@capacitor/browser';

  export default defineComponent({
    name: 'LineView',
    components: {
      IonPage,
      IonHeader,
      IonToolbar,
      IonContent,
      IonButtons,
      IonBackButton,
      IonList,
      IonItem,
      IonLabel,
      IonSegment,
      IonSegmentButton,
      IonButton,
      IonIcon
    },
    props: {
      line: {
        type: String,
        required: true,
        default: 'A',
      },
    },
    data() {
      let lineTimes = vitobus_time[this.line.toLowerCase()].scolaire[0];

      // if today is saturday
      if (new Date().getDay() == 6) {
        lineTimes = vitobus_time[this.line.toLowerCase()].samedi[0];
      }

      // Zone B vacations
      const vacations = [
        { name: "Vacances de la Toussaint 2022", startDate: "2022-10-22", endDate: "2022-11-07" },
        { name: "Vacances de Noël 2022", startDate: "2022-12-17", endDate: "2023-01-03" },
        { name: "Vacances d'hiver 2023", startDate: "2023-02-11", endDate: "2023-02-27" },
        { name: "Vacances de printemps 2023", startDate: "2023-04-15", endDate: "2023-05-02" },
        { name: "Pont de l'Ascension 2023", startDate: "2023-05-17", endDate: "2023-05-22" }
      ];

      // if today is a vacation
      for (let i = 0; i < vacations.length; i++) {
        const vacation = vacations[i];
        const today = new Date();

        if (today >= new Date(vacation.startDate) && today <= new Date(vacation.endDate)) {
          lineTimes = vitobus_time[this.line.toLowerCase()].vacances[0];
        }
      }

      // summer (if we're between 2023-07-08 and 2023-09-02)

      if (new Date() >= new Date("2023-07-08") && new Date() <= new Date("2023-09-02")) {
        lineTimes = vitobus_time[this.line.toLowerCase()].ete[0];

        // if today is saturday
        if (new Date().getDay() == 6) {
          lineTimes = vitobus_time[this.line.toLowerCase()].ete_samedi[0];
        }
      }

      // sunday

      if (new Date().getDay() == 0) {
        lineTimes = vitobus_time[this.line.toLowerCase()].dimanche[0];
      }

      const forwards = lineTimes.forwards[0];
      const backwards = lineTimes.backwards[0];

      // get last stop name of each direction
      let forwardsLastStop = Object.keys(forwards)[Object.keys(forwards).length - 1];
      let backwardsLastStop = Object.keys(backwards)[Object.keys(backwards).length - 1];

      const maxChr = 14;

      if (forwardsLastStop.length > maxChr) {
        forwardsLastStop = forwardsLastStop.substring(0, maxChr) + '...';
      }

      if (backwardsLastStop.length > maxChr) {
        backwardsLastStop = backwardsLastStop.substring(0, maxChr) + '...';
      }

      let lineColor = 'vitobus-d';
      const lineLetter = this.line.toLowerCase();
      const knownLetters = ['a', 'b', 'c']

      if (knownLetters.includes(lineLetter)) {
        lineColor = 'vitobus-' + lineLetter;
      }

      return {
        forwards,
        backwards,
        direction: 'forwards',
        stops: {},
        stopsForwards: {},
        stopsBackwards: {},
        directionStrings: {
          forwards: forwardsLastStop,
          backwards: backwardsLastStop,
        },
        closestStops: {
          forwards: {},
          backwards: {},
        },
        lineColor: lineColor,
        lineColorRGB: getComputedStyle(document.body).getPropertyValue('--ion-color-' + lineColor + '-rgb'),
        mapIcon: mapSharp,
      };
    },
    methods: {
      openMap() {
        const maps = {
          'A': 'https://www.datocms-assets.com/50683/1627550022-plan-vit-obus-ligne-a-sept-2021.pdf',
          'B': 'https://www.datocms-assets.com/50683/1627550023-plan-vit-obus-ligne-b-sept-2021.pdf',
          'C': 'https://www.datocms-assets.com/50683/1627550025-plan-vit-obus-ligne-c-sept-2021.pdf',
        }

        const color = '--ion-color-vitobus-' + this.line.toLowerCase() + '-shade';
        // get color
        const style = getComputedStyle(document.body);
        const colorValue = style.getPropertyValue(color);

        Browser.open({
          url: maps[this.line],
          toolbarColor: colorValue,
          presentationStyle: 'popover'
        });
      },
      changeSeg(event) {
        const value = event.detail.value;
        this.direction = value;

        this.stops = this.parseStops(this.direction)
      },
      parseStops(direction) {
        // get direction
        let stops = [];

        if (direction == 'backwards') {
          stops = this.backwards;
        } else {
          stops = this.forwards;
        }

        const allStops = [];
        
        for (let i = 0; i < Object.keys(stops).length; i++) {
          const name = Object.keys(stops)[i];
          const time = this.getStopTime(name, direction);
          const before = this.getTimeBefore(time);

          let closest = false;
          let past = false;

          // get closest stop
          const closestStop = this.getClosestStop(direction);

          if(closestStop.index == i) {
            closest = true;
            past = false;
          }
          else if (closestStop.index > i) {
            closest = false;
            past = true;
          }
          else {
            closest = false;
            past = false;
          }

          allStops.push({
            name,
            time,
            before,
            closest,
            past
          });
        }

        return allStops;
      },
      refreshStops(direction) {
        // for each stop in this.stops
        for (let i = 0; i < this.stops.length; i++) {
          const name = this.stops[i].name;
          const time = this.getStopTime(name, direction);
          const before = this.getTimeBefore(time);

          this.stops[i].time = time;
          this.stops[i].before = before;

          // get closest stop
          const closestStop = this.getClosestStop(direction);

          if(closestStop.index == i) {
            this.stops[i].closest = true;
            this.stops[i].past = false;
          }
          else if (closestStop.index > i) {
            this.stops[i].closest = false;
            this.stops[i].past = true;
          }
          else {
            this.stops[i].closest = false;
            this.stops[i].past = false;
          }
        }
      },
      navigate(url) {
        // convert slashes to double underscores
        url = url.replace(/\//g, '__');

        this.$router.push('/stop/'+this.line+'/'+url);
      },
      getStopTime(stop, direction) {
        // get direction
        let stops = [];

        if (direction == 'backwards') {
          stops = this.backwards;
        } else {
          stops = this.forwards;
        }

        const stopTimes = stops[stop].replace(' - ', ' ').split(' ');

        // get closest time in stopTimes in the future
        const closestTime = new Date();
        closestTime.setHours(23, 59, 59);

        for (let i = 0; i < stopTimes.length; i++) {
          const stopTime = new Date();
          const stopTimeSplit = stopTimes[i].split(':');
          stopTime.setHours(stopTimeSplit[0], stopTimeSplit[1], 0);

          if (stopTime > new Date() && stopTime < closestTime) {
            closestTime.setHours(stopTime.getHours(), stopTime.getMinutes(), 0);
          }
        }

        let hrs = closestTime.getHours();
        let mins = closestTime.getMinutes();

        if (hrs < 10) {
          hrs = '0' + hrs;
        }

        if (mins < 10) {
          mins = '0' + mins;
        }

        let finalTime = hrs + ':' + mins;

        if (finalTime == '23:59') {
          finalTime = '--:--';
        }
        
        return finalTime;
      },
      getTimeBefore(time) {
        // check if time is valid
        if (time == '--:--') {
          return {nextStr: '', time: 0};
        }

        // return time to wait before bus
        const now = new Date();
        const nowTime = now.getHours() + ':' + now.getMinutes();

        const nowTimeSplit = nowTime.split(':');
        const timeSplit = time.split(':');

        const nowTimeMinutes = parseInt(nowTimeSplit[0]) * 60 + parseInt(nowTimeSplit[1]);
        const timeMinutes = parseInt(timeSplit[0]) * 60 + parseInt(timeSplit[1]);

        const timeBefore = timeMinutes - nowTimeMinutes;

        // if less than 1 minute, return 'maintenant'
        if (timeBefore < 1) {
          return {nextStr: 'maintenant', time: timeBefore};
        }
        
        // if longer than 60 minutes, return hours and minutes
        if (timeBefore > 60) {
          const hours = Math.floor(timeBefore / 60);
          let minutes = timeBefore % 60;

          // leading zero
          if (minutes < 10) {
            minutes = '0' + minutes;
          }

          return {nextStr: 'dans ' + hours + 'h' + minutes, time: timeBefore};
        } else {
          return {nextStr: 'dans ' + timeBefore + ' min', time: timeBefore};
        }
      },
      getClosestStop(direction) {
        // get direction
        let stops = [];

        if (direction == 'backwards') {
          stops = this.backwards;
        } else {
          stops = this.forwards;
        }

        // for each stop, check getTimeBefore()
        let closest = {
          index: 0,
          time: 86400
        };

        for (let i = 0; i < Object.keys(stops).length; i++) {
          const stop = Object.keys(stops)[i];
          const time = this.getTimeBefore(this.getStopTime(stop, direction), i).time;

          if (time <= 0) {
            continue;
          }

          if (time < closest.time) {
            closest = {
              index: i,
              time: time
            };
          }
        }

        return closest;
      },
      refreshClosest() {
        this.closestStops = {
          forwards: this.parseStops('forwards')[this.getClosestStop('forwards').index],
          backwards: this.parseStops('backwards')[this.getClosestStop('backwards').index]
        }
      }
    },
    mounted() {
      this.stops = this.parseStops(this.direction);
      this.refreshClosest();

      this.stopsForwards = this.parseStops('forwards');
      this.stopsBackwards = this.parseStops('backwards');

      setInterval(() => {
        this.refreshStops(this.direction);
        this.refreshClosest();
      }, 1000);

      return false;
    }
  });
</script>

<template>
    <ion-page>
      <ion-header mode="md">
        <ion-toolbar :color="lineColor">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/horaires" />
          </ion-buttons>
          
          <div class="line_title">
            <img class="lineLogo" :src="'/assets/lines/line_'+line.toLowerCase()+'.png'"/>
            <div class="line_title_text">
              <h2>Ligne {{ line }}</h2>
              <p>de {{ directionStrings.forwards }} à {{ directionStrings.backwards }}</p>
            </div>
          </div>

          <ion-buttons slot="end">
            <ion-button @click="openMap()">
              <ion-icon slot="icon-only" :icon="mapIcon"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">

        <div class="ion-list-pre-title">
          <p>Prochains passages</p>
        </div>

        <div class="nextPassages inset">
          <div class="nextPassage" v-if="closestStops.forwards">
            <div class="lineName">
              <p>{{ closestStops.forwards.name }}</p>
              <img class="line_icon" :src="'/assets/lines/line_'+line.toLowerCase()+'.png'"/>
            </div>

            <h2 class="time">{{ closestStops.forwards.time }}</h2>

            <p class="direction">vers {{ directionStrings.forwards }}</p>
          </div>
          <div class="nextPassage" v-if="closestStops.backwards">
            <div class="lineName">
              <p>{{ closestStops.backwards.name }}</p>
              <img class="line_icon" :src="'/assets/lines/line_'+line.toLowerCase()+'.png'"/>
            </div>
            <h2 class="time">{{ closestStops.backwards.time }}</h2>

            <p class="direction">vers {{ directionStrings.backwards }}</p>
          </div>
        </div>

        <div class="ion-list-pre-title">
          <p>Arrêts</p>
        </div>
        
        <ion-list inset>
          <ion-segment mode="md" :color="lineColor" class="directionSeg" :value="direction" @ionChange="changeSeg($event)">
              <ion-segment-button value="forwards">
                <ion-label>{{ directionStrings.forwards }}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="backwards">
                <ion-label>{{ directionStrings.backwards }}</ion-label>
              </ion-segment-button>
          </ion-segment>

          <ion-list class="nextTimes" lines="full">
            <ion-item mode="md" button v-for="(stop, i) in stops" v-bind:key="i" :class="{closest: stop.closest, disabled: stop.past || stop.time == '--:--'}" @click="navigate(stop.name)">

              <img slot="start" class="line_list_icon" :src="'/assets/lines/line_'+line.toLowerCase()+'.png'"/>
              
              <ion-label slot="start" class="waitTime">
                <h2 class="stopTime">{{ stop.time }}</h2>
                <p>{{ stop.before.nextStr }}</p>
              </ion-label>

              <ion-label class="stopName ion-text-wrap">
                <h2>{{ stop.name }}</h2>
              </ion-label>
            
            </ion-item>
          </ion-list>
        </ion-list>
        
      </ion-content>
    </ion-page>
</template>

<style scoped>
  .nextTimes * {
    transition: none !important;
  }

  .closest {
    position: sticky !important;
    top: 0px !important;

    z-index: 9999;
  }

  ion-item.closest::part(native) {
    background: rgba(v-bind(lineColorRGB), 5%) !important;
  }

  @media screen and (prefers-color-scheme: dark) {
    ion-item.closest::part(native) {
      background: #ffffff20 !important;
    }
  }

  .past ion-label {
    opacity: 0.35;
  }

  .disabled ion-label {
    opacity: 0.25;
  }

  .stopName {
    padding: 8px 0px;
  }

  .stopTime {
    font-weight: 600;
  }

  .waitTime {
    max-width: 100px;
    margin-right: 5px;
  }

  .waitTime * {
    width: fit-content;
  }

  .nextPassages * {
    margin: 0;
  }

  .nextPassages {
    display: flex;
  }

  .nextPassage {
    flex: 1;
    width: 100% !important;
    padding: 12px 15px;
    overflow: hidden;
  }

  .nextPassage .lineName {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 500;

    width: 100%;
  }

  .nextPassage .lineName p {
    max-width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .nextPassage .lineName img {
    height: 18px;
    margin-top: -2px;
  }

  .nextPassage .time {
    font-size: 28px;
    font-weight: 400;

    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .nextPassage .direction {
    font-size: 16px;
    font-weight: 500;
    opacity: 0.5;
    margin-top: 8px;

    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .nextPassage:nth-child(1) {
    border-right: 1px solid var(--ion-color-step-100);
  }

  .directionSeg ion-segment-button {
    width: 100% !important;
  }

  .line_list_icon {
    height: 24px;
    margin-right: 15px;
  }

  .past .line_list_icon {
    opacity: 0.5;
    filter: grayscale(1);
  }
</style>