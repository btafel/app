import { Analytics, PageHit } from 'expo-analytics';

const analytics = new Analytics('UA-162053759-1');

export function pageHit(name) {
  analytics
    .hit(new PageHit(name))
    // .then(() => console.log('success'))
    .catch(e => console.log(e.message));
}
