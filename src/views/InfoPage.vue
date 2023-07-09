<script setup>
    import {
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonProgressBar,
        IonThumbnail,
    } from '@ionic/vue';

    import { ref, onMounted } from 'vue'

    import { Browser } from '@capacitor/browser';

    function openUrl(url) {
        Browser.open({ url: url });
    }

    const news_endpoint = 'https://cors.api.getpapillon.xyz/https://www.vitobus.fr/page-data/linfo-trafic-vitobus/page-data.json';
    const home_endpoint = 'https://cors.api.getpapillon.xyz/https://www.vitobus.fr/page-data/index/page-data.json';

    const news = ref([]);
    const trafic = ref([]);
    const home = ref([]);

    const loading = ref(true);

    const icons = {
        "Ligne A" : "line_a",
        "Ligne B" : "line_b",
        "Ligne C" : "line_c",
        "ETV.COM" : "line_etv",
    }

    fetch(news_endpoint)
        .then(response => response.json())
        .then(data => {
            loading.value = false;

            news.value = data.result.data.allDatoCmsNews.nodes;
            trafic.value = data.result.data.allDatoCmsInfoTraffic.nodes;
        });

    fetch(home_endpoint)
        .then(response => response.json())
        .then(data => {
            home.value = data.result.data.datoCmsHome.informationBanners;
            console.log(home.value);
        });
</script>


<template>
    <ion-page>
        <ion-header mode="md">
            <ion-toolbar color="vitobus-dark">
                <ion-title>Informations</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="loading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content :fullscreen="true">
        
            <div class="ion-list-pre-title" v-if="trafic">
                <p>Info trafic</p>
            </div>

            <ion-list inset v-if="trafic">
                <ion-item mode="md" v-for="item in trafic" :key="item.id">
                    <img slot="start" class="lineIcon" :src="'/assets/lines/'+icons[item.lines[0].name]+'.png'" />
                    <ion-label class="ion-text-wrap">
                        <h2>{{ item.title }}</h2>
                        <div v-html="item.shortDescription"></div>
                    </ion-label>
                </ion-item>
            </ion-list>

            <div class="ion-list-pre-title" v-if="home">
                <p>Actualités Vitobus.fr</p>
            </div>

            <ion-list inset v-if="home">
                <ion-item mode="md" v-for="item in home" :key="item.id" button @click="openUrl(item.link)">
                    <ion-thumbnail slot="start" class="newsThumbnail">
                        <img :src="item.image.url" />
                    </ion-thumbnail>
                    <ion-label class="ion-text-wrap">
                        <h2>{{ item.title }}</h2>
                        <div v-html="item.content"></div>
                    </ion-label>
                </ion-item>
            </ion-list>

            <div class="ion-list-pre-title" v-if="news">
                <p>Évenements Vitobus.fr</p>
            </div>

            <ion-list inset v-if="news">
                <ion-item mode="md" v-for="item in news" :key="item.id" button @click="openUrl('https://www.vitobus.fr/news/'+item.slug)">
                    <ion-thumbnail slot="start" class="newsThumbnail">
                        <img :src="item.image.url" />
                    </ion-thumbnail>
                    <ion-label class="ion-text-wrap">
                        <h2>{{ item.title }}</h2>
                        <div v-html="item.newsIntroduction"></div>
                    </ion-label>
                </ion-item>
            </ion-list>

            <br /><br /><br />

        </ion-content>
    </ion-page>
</template>

<style scoped>
    .lineIcon {
        width: 28px;
        height: 28px;
    }

    .newsThumbnail {
        border-radius: 5px !important;
        overflow: hidden !important;
    }
</style>