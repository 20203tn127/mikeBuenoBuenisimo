importScripts("https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js");
importScripts('/assets/js/utils/db-utils.js');
importScripts('/assets/js/utils/sw-utils.js');


const STATIC_CACHE = 'staticv1';
const INMUTABLE_CACHE = 'inmutablev1';
const DYNAMIC_CACHE = 'dynamicv1';

const APP_SHELL = [
'/index.html',
'/assets/css/style.css',
'/assets/img/img-404.png',
'/assets/img/not-found.svg',
'/assets/img/report.ico',
'/assets/img/reports.png',
'/assets/js/main.js',
'/assets/js/admin/admin.home.controller.js',
'/assets/js/admin/admin.users.controller.js',
'/assets/js/auth/signin.js',
'/assets/js/axios/axios-intance.js',
'/assets/js/toast/toasts.js',
'/pages/auth/register.html',
'/pages/admin/home.html',
'/pages/admin/users.html',
'/pages/attendant/home.html',
'/pages/docent/home.html',
'/pages/docent/incidences.html'

];

const APP_SHELL_INMUTABLE = [
  '/assets/js/jquery-3.7.1.min.js',
  '/assets/vendor/bootstrap/css/bootstrap.min.css',
  '/assets/vendor/bootstrap/js/bootstrap.min.js',
  '/assets/vendor/bootstrap-icons/bootstrap-icons.min.css',
  '/assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff',
  '/assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2',
  '/assets/vendor/boxicons/css/boxicons.min.css',
  '/assets/vendor/boxicons/fonts/boxicon.eot',
  '/assets/vendor/boxicons/fonts/boxicon.svg',
  '/assets/vendor/boxicons/fonts/boxicon.ttf',
  '/assets/vendor/boxicons/fonts/boxicon.woff',
  '/assets/vendor/boxicons/fonts/boxicon.woff2',

];



const clear = (cacheName, items = 50)=>{
  caches.open(cacheName).then(cache=>{
    return caches.keys().then(keys=>{
      if(keys.length > items){
        cache.delete(keys[0]).then((clear(cacheName,items)));
      }
    });
  });
}


self.addEventListener('install', e => {
    const static = caches.open(STATIC_CACHE).then((cache)=>{
      return cache.addAll(APP_SHELL);
    });
    const inmutable = caches.open(INMUTABLE_CACHE).then((cache)=>{
      return cache.addAll(APP_SHELL_INMUTABLE);
    });
    e.waitUntil(Promise.all([static,inmutable]));
});


self.addEventListener('activate', e=>{
  const clearCache = caches.keys().then(keys=>{
    keys.forEach(key=>{
      if(key !== STATIC_CACHE && keys.includes('static')){
        return caches.delete(key);
      }
    });
  });
  e.waitUntil(clearCache);
});


self.addEventListener('fetch', (e) => {
  let source;
  if (e.request.url.includes('/api/')) {
      source = apiSaveIncidence(DYNAMIC_CACHE, e.request);
  } else {
      source.caches.match(e.request).then(cacheRes => {
          if (cacheRes) {
              updateStaticCache(STATIC_CACHE, e.request, APP_SHELL_INMUTABLE);
              return cacheRes;
          } else {
              return updateDynamicCache(DYNAMIC_CACHE, e.request, res);
          }
      });
  }
  e.respondWith(source);
});

self.addEventListener('sync', e=>{
  if (e.tag == 'incidence-status-post') {
    e.waitUntil(saveIncidenceToApi());
  }
})