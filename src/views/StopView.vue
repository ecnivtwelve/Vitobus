<script>
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
    IonBackButton,
    IonButtons,
    IonSegment,
    IonSegmentButton,
  } from '@ionic/vue';

  import { defineComponent } from 'vue';

  import vitobus_time from '../data/vitobus_time.json';

  export default defineComponent({
    name: 'StopView',
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonBackButton,
        IonButtons,
        IonSegment,
        IonSegmentButton,
    },
    props: {
        line: {
            type: String,
            required: true,
            default: 'A',
        },
        stop: {
            type: String,
            required: true,
            default: 'Gare Saint-Martin',
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

        let forwards = [];
        let backwards = [];

        if(lineTimes.forwards[0][this.stop]) {
            forwards = lineTimes.forwards[0][this.stop].replace('-', '--:--').split(' ');
        }
        if(lineTimes.backwards[0][this.stop]) {
            backwards = lineTimes.backwards[0][this.stop].replace('-', '--:--').split(' ');
        }

        let lineColor = 'vitobus-d';
        const lineLetter = this.line.toLowerCase();
        const knownLetters = ['a', 'b', 'c']

        if (knownLetters.includes(lineLetter)) {
            lineColor = 'vitobus-' + lineLetter;
        }

        return {
            lineColor,
            direction: 'forwards',
            stops: {
                forwards: forwards,
                backwards: backwards,
            },
            wait: {
                forwards: {},
                backwards: {},
            },
            allStops: {
                forwards: Object.keys(lineTimes.forwards[0]),
                backwards: Object.keys(lineTimes.backwards[0]),
            },
            stopName: this.stop.replace('__', '/'),
        };
    },
    methods: {
        calcWait() {
            // for each stop in forwards, calc the wait time
            for (let i = 0; i < this.stops.forwards.length; i++) {
                const stop = this.stops.forwards[i];
                const stopTime = stop.split(':');
                const stopDate = new Date();
                stopDate.setHours(stopTime[0]);
                stopDate.setMinutes(stopTime[1]);
                stopDate.setSeconds(0);

                const now = new Date();

                const diff = stopDate.getTime() - now.getTime();

                const diffMinutes = Math.floor(diff / 1000 / 60);

                // make a string with the wait time
                let string = '';

                let mins = (diffMinutes % 60);

                if (mins < 10) {
                    mins = '0' + mins;
                }

                if (diffMinutes > 60) {
                    string = 'dans ' + Math.floor(diffMinutes / 60) + 'h' + mins;
                }
                else if (diffMinutes > 0) {
                    string = 'dans ' + diffMinutes + ' min';
                }
                else if (diffMinutes == 0) {
                    string = 'maintenant';
                }

                this.wait.forwards[stop] = string;
            }

            // for each stop in backwards, calc the wait time
            for (let i = 0; i < this.stops.backwards.length; i++) {
                const stop = this.stops.backwards[i];
                const stopTime = stop.split(':');
                const stopDate = new Date();
                stopDate.setHours(stopTime[0]);
                stopDate.setMinutes(stopTime[1]);
                stopDate.setSeconds(0);

                const now = new Date();

                const diff = stopDate.getTime() - now.getTime();

                const diffMinutes = Math.floor(diff / 1000 / 60);

                let string = '';

                if (diffMinutes > 60) {
                    string = 'dans ' + Math.floor(diffMinutes / 60) + ' h ' + (diffMinutes % 60);
                }
                else if (diffMinutes > 0) {
                    string = 'dans ' + diffMinutes + ' min';
                }
                else if (diffMinutes == 0) {
                    string = 'maintenant';
                }

                this.wait.backwards[stop] = string;
            }
        },
        changeSeg(event) {
            const value = event.detail.value;
            this.direction = value;
        }
    },
    mounted() {
        this.calcWait();
        setInterval(() => {
            this.calcWait();
        }, 1000);
    },
  })
</script>

<template>
    <ion-page>
      <ion-header mode="md">
        <ion-toolbar color="vitobus-d">
            <ion-buttons slot="start">
                <ion-back-button defaultHref="/horaires" />
            </ion-buttons>

            <div class="line_title">
                <img class="lineLogo" :src="'/assets/lines/line_'+line.toLowerCase()+'.png'"/>
                    <div class="line_title_text">
                    <h2>{{ stopName }}</h2>
                    <p>Arrêt de la ligne {{ line }}</p>
                </div>
            </div>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">

        <div class="ion-list-pre-title">
          <p>Arrêts</p>
        </div>

        <ion-list inset>
            <ion-segment mode="md" :color="lineColor" class="directionSeg" :value="direction" @ionChange="changeSeg($event)">
                <ion-segment-button value="forwards">
                    <ion-label>{{ allStops['forwards'][allStops['forwards'].length - 1] }}</ion-label>
                </ion-segment-button>
                <ion-segment-button value="backwards">
                    <ion-label>{{ allStops['backwards'][allStops['backwards'].length - 1] }}</ion-label>
                </ion-segment-button>
            </ion-segment>
            <IonList>
                <IonItem mode="md" v-for="stop, index in stops[direction]" :key="index">
                    <img slot="start" class="line_list_icon" :src="'/assets/lines/line_'+line.toLowerCase()+'.png'"/>
                
                    <ion-label slot="start" class="waitTime">
                        <h2 class="stopTime">{{ stop }}</h2>
                        <p>{{ wait[direction][stop] }}</p>
                    </ion-label>

                    <ion-label class="stopName ion-text-wrap">
                        <h2>{{ stopName }}</h2>
                        <p>vers {{ allStops[direction][allStops[direction].length - 1] }}</p>
                    </ion-label>
                </IonItem>
            </IonList>
        </ion-list>

      </ion-content>
    </ion-page>
</template>

<style scoped>
    .stopName {
        padding: 2px 0px;
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

    .waitTime h2 {
        font-size: 20px;
        font-weight: 400;
    }

    .line_list_icon {
        height: 24px;
        margin-right: 15px;
    }

    .directionSeg ion-segment-button {
        width: 100% !important;
    }
</style>