'use strict';

document.addEventListener('DOMContentLoaded', () => {

   const rangeSlider = document.getElementById('range-slider');

   if (rangeSlider) {
      noUiSlider.create(rangeSlider, {
         start: [50, 1000],
         connect: true,
         step: 1,
         range: {
            'min': [50],
            'max': [1000]
         }
      });

      const input0 = document.getElementById('input-0');
      const input1 = document.getElementById('input-1');
      const inputs = [input0, input1];

      rangeSlider.noUiSlider.on('update', function (values, handle) {
         inputs[handle].value = Math.round(values[handle]);
      });

      const setRangeSlider = (i, value) => {
         let arr = [null, null];
         arr[i] = value;

         console.log(arr);

         rangeSlider.noUiSlider.set(arr);
      };

      inputs.forEach((el, index) => {
         el.addEventListener('change', (e) => {
            console.log(index);
            setRangeSlider(index, e.currentTarget.value);
         });
      });
   }





   //==== Модуь работы со спойлерами  start =======================================================================================================================================================================================================================
   /*
   Для родителя слойлеров пишем атрибут data-spollers
   Для заголовков слойлеров пишем атрибут data-spoller
   Если нужно включать\выключать работу спойлеров на разных размерах экранов
   пишем параметры ширины и типа брейкпоинта.
    
   Например: 
   data-spollers="992,max" - спойлеры будут работать только на экранах меньше или равно 992px
   data-spollers="768,min" - спойлеры будут работать только на экранах больше или равно 768px
    
   Если нужно что бы в блоке открывался болько один слойлер добавляем атрибут data-one-spoller
   */

   const spollersArray = document.querySelectorAll('[data-spollers]');
   if (spollersArray.length > 0) {
      // Получение обычных слойлеров
      const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
         return !item.dataset.spollers.split(",")[0];
      });
      // Инициализация обычных слойлеров
      if (spollersRegular.length > 0) {
         initSpollers(spollersRegular);
      }
      // Получение слойлеров с медиа запросами
      const spollersMedia = Array.from(spollersArray).filter(function (item, index, self) {
         return item.dataset.spollers.split(",")[0];
      });
      // Инициализация слойлеров с медиа запросами
      if (spollersMedia.length > 0) {
         const breakpointsArray = [];
         spollersMedia.forEach(item => {
            const params = item.dataset.spollers;
            const breakpoint = {};
            const paramsArray = params.split(",");
            breakpoint.value = paramsArray[0];
            breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
            breakpoint.item = item;
            breakpointsArray.push(breakpoint);
         });
         // Получаем уникальные брейкпоинты
         let mediaQueries = breakpointsArray.map(function (item) {
            return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
         });
         mediaQueries = mediaQueries.filter(function (item, index, self) {
            return self.indexOf(item) === index;
         });
         // Работаем с каждым брейкпоинтом
         mediaQueries.forEach(breakpoint => {
            const paramsArray = breakpoint.split(",");
            const mediaBreakpoint = paramsArray[1];
            const mediaType = paramsArray[2];
            const matchMedia = window.matchMedia(paramsArray[0]);
            // Объекты с нужными условиями
            const spollersArray = breakpointsArray.filter(function (item) {
               if (item.value === mediaBreakpoint && item.type === mediaType) {
                  return true;
               }
            });
            // Событие
            matchMedia.addEventListener("change", function () {
               initSpollers(spollersArray, matchMedia);
            });
            initSpollers(spollersArray, matchMedia);
         });
      }
      // Инициализация
      function initSpollers(spollersArray, matchMedia = false) {
         spollersArray.forEach(spollersBlock => {
            spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
            if (matchMedia.matches || !matchMedia) {
               spollersBlock.classList.add('_spoller-init');
               initSpollerBody(spollersBlock);
               spollersBlock.addEventListener("click", setSpollerAction);
            } else {
               spollersBlock.classList.remove('_spoller-init');
               initSpollerBody(spollersBlock, false);
               spollersBlock.removeEventListener("click", setSpollerAction);
            }
         });
      }
      // Работа с контентом
      function initSpollerBody(spollersBlock, hideSpollerBody = true) {
         const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
         if (spollerTitles.length > 0) {
            spollerTitles.forEach(spollerTitle => {
               if (hideSpollerBody) {
                  spollerTitle.removeAttribute('tabindex');
                  if (!spollerTitle.classList.contains('_spoller-active')) {
                     spollerTitle.nextElementSibling.hidden = true;
                  }
               } else {
                  spollerTitle.setAttribute('tabindex', '-1');
                  spollerTitle.nextElementSibling.hidden = false;
               }
            });
         }
      }
      function setSpollerAction(e) {
         const el = e.target;
         if (el.hasAttribute('data-spoller') || el.closest('[data-spoller]')) {
            const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]');
            const spollersBlock = spollerTitle.closest('[data-spollers]');
            const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
            if (!spollersBlock.querySelectorAll('._slide').length) {
               if (oneSpoller && !spollerTitle.classList.contains('_spoller-active')) {
                  hideSpollersBody(spollersBlock);
               }
               spollerTitle.classList.toggle('_spoller-active');
               _slideToggle(spollerTitle.nextElementSibling, 500);
            }
            e.preventDefault();
         }
      }
      function hideSpollersBody(spollersBlock) {
         const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._spoller-active');
         if (spollerActiveTitle) {
            spollerActiveTitle.classList.remove('_spoller-active');
            _slideUp(spollerActiveTitle.nextElementSibling, 500);
         }
      }
   }

   //==== 
   //==== Вспомогательные модули плавного расскрытия и закрытия объекта ======================================================================================================================================================================
   let _slideUp = (target, duration = 500, showmore = 0) => {
      if (!target.classList.contains('_slide')) {
         target.classList.add('_slide');
         target.style.transitionProperty = 'height, margin, padding';
         target.style.transitionDuration = duration + 'ms';
         target.style.height = `${target.offsetHeight}px`;
         target.offsetHeight;
         target.style.overflow = 'hidden';
         target.style.height = showmore ? `${showmore}px` : `0px`;
         target.style.paddingTop = 0;
         target.style.paddingBottom = 0;
         target.style.marginTop = 0;
         target.style.marginBottom = 0;
         window.setTimeout(() => {
            target.hidden = !showmore ? true : false;
            !showmore ? target.style.removeProperty('height') : null;
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');
            !showmore ? target.style.removeProperty('overflow') : null;
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
         }, duration);
      }
   }
   let _slideDown = (target, duration = 500, showmore = 0) => {
      if (!target.classList.contains('_slide')) {
         target.classList.add('_slide');
         target.hidden = target.hidden ? false : null;
         showmore ? target.style.removeProperty('height') : null;
         let height = target.offsetHeight;
         target.style.overflow = 'hidden';
         target.style.height = showmore ? `${showmore}px` : `0px`;
         target.style.paddingTop = 0;
         target.style.paddingBottom = 0;
         target.style.marginTop = 0;
         target.style.marginBottom = 0;
         target.offsetHeight;
         target.style.transitionProperty = "height, margin, padding";
         target.style.transitionDuration = duration + 'ms';
         target.style.height = height + 'px';
         target.style.removeProperty('padding-top');
         target.style.removeProperty('padding-bottom');
         target.style.removeProperty('margin-top');
         target.style.removeProperty('margin-bottom');
         window.setTimeout(() => {
            target.style.removeProperty('height');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
         }, duration);
      }
   }
   let _slideToggle = (target, duration = 500) => {
      if (target.hidden) {
         return _slideDown(target, duration);
      } else {
         return _slideUp(target, duration);
      }
   }
   //===
   //==== Модуь работы со спойлерами  end    ===============================================================

   //==== Модуь работы с табами ============================================================================
   /*
   Для родителя табов пишем атрибут data-tabs
   Для родителя заголовков табов пишем атрибут data-tabs-titles
   Для родителя блоков табов пишем атрибут data-tabs-body
   
   Если нужно чтобы табы открывались с анимацией 
   добавляем к data-tabs data-tabs-animate
   По умолчанию, скорость анимации 500ms, 
   указать свою скорость можно так: data-tabs-animate="1000"
   
   Если нужно чтобы табы превращались в "спойлеры" на неком размере экранов пишем параметры ширины.
   Например: data-tabs="992" - табы будут превращаться в спойлеры на экранах меньше или равно 992px
   */

   const tabs = document.querySelectorAll('[data-tabs]');
   let tabsActiveHash = [];

   if (tabs.length > 0) {
      const hash = location.hash.replace('#', '');
      if (hash.startsWith('tab-')) {
         tabsActiveHash = hash.replace('tab-', '').split('-');
      }
      tabs.forEach((tabsBlock, index) => {
         tabsBlock.classList.add('_tab-init');
         tabsBlock.setAttribute('data-tabs-index', index);
         tabsBlock.addEventListener("click", setTabsAction);
         initTabs(tabsBlock);
      });

      // Получение табов с медиа запросами
      const tabsMedia = Array.from(tabs).filter(function (item, index, self) {
         return item.dataset.tabs;
      });
      // Инициализация табов с медиа запросами
      if (tabsMedia.length > 0) {
         initMediaTabs(tabsMedia);
      }
   }
   // Инициализация табов с медиа запросами
   function initMediaTabs(tabsMedia) {
      const breakpointsArray = [];
      tabsMedia.forEach(item => {
         const breakpointValue = item.dataset.tabs;

         const tabsBreakpointsObject = {};
         tabsBreakpointsObject.value = breakpointValue;
         tabsBreakpointsObject.item = item;

         breakpointsArray.push(tabsBreakpointsObject);
      });

      // Получаем уникальные брейкпоинты
      let mediaQueries = breakpointsArray.map(function (item) {
         return `(max-width:${item.value}px),${item.value}`;
      });
      mediaQueries = mediaQueries.filter(function (item, index, self) {
         return self.indexOf(item) === index;
      });

      // Работаем с каждым брейкпоинтом
      mediaQueries.forEach(breakpoint => {
         const paramsArray = breakpoint.split(",");
         const matchMedia = window.matchMedia(paramsArray[0]);
         const mediaBreakpoint = paramsArray[1];

         // Объекты с нужными условиями
         const tabsMediaArray = breakpointsArray.filter(function (item) {
            if (item.value === mediaBreakpoint) {
               return true;
            }
         });

         // Событие
         matchMedia.addEventListener("change", function () {
            setTitlePosition(tabsMediaArray, matchMedia);
         });
         setTitlePosition(tabsMediaArray, matchMedia);
      });
   }
   // Установка позиций заголовков
   function setTitlePosition(tabsMediaArray, matchMedia) {
      tabsMediaArray.forEach(tabsMediaItem => {
         tabsMediaItem = tabsMediaItem.item;
         const tabsTitles = tabsMediaItem.querySelector('[data-tabs-titles]');
         const tabsTitleItems = tabsMediaItem.querySelectorAll('[data-tabs-title]');
         const tabsContent = tabsMediaItem.querySelector('[data-tabs-body]');
         const tabsContentItems = tabsMediaItem.querySelectorAll('[data-tabs-item]');
         tabsContentItems.forEach((tabsContentItem, index) => {
            if (matchMedia.matches) {
               tabsContent.append(tabsTitleItems[index]);
               tabsContent.append(tabsContentItem);
               tabsMediaItem.classList.add('_tab-spoller');
            } else {
               tabsTitles.append(tabsTitleItems[index]);
               tabsMediaItem.classList.remove('_tab-spoller');
            }
         });
      });
   }
   // Работа с контентом
   function initTabs(tabsBlock) {
      const tabsTitles = tabsBlock.querySelectorAll('[data-tabs-titles]>*');
      const tabsContent = tabsBlock.querySelectorAll('[data-tabs-body]>*');
      const tabsBlockIndex = tabsBlock.dataset.tabsIndex;
      const tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;

      if (tabsActiveHashBlock) {
         const tabsActiveTitle = tabsBlock.querySelector('[data-tabs-titles]>._tab-active');
         tabsActiveTitle.classList.remove('_tab-active');
      }
      if (tabsContent.length > 0) {
         tabsContent.forEach((tabsContentItem, index) => {
            tabsTitles[index].setAttribute('data-tabs-title', '');
            tabsContentItem.setAttribute('data-tabs-item', '');

            if (tabsActiveHashBlock && index == tabsActiveHash[1]) {
               tabsTitles[index].classList.add('_tab-active');
            }
            tabsContentItem.hidden = !tabsTitles[index].classList.contains('_tab-active');
         });
      }
   }
   function setTabsStatus(tabsBlock) {
      const tabsTitles = tabsBlock.querySelectorAll('[data-tabs-title]');
      const tabsContent = tabsBlock.querySelectorAll('[data-tabs-item]');
      const tabsBlockIndex = tabsBlock.dataset.tabsIndex;

      function isTabsAnamate(tabsBlock) {
         if (tabsBlock.hasAttribute('data-tabs-animate')) {
            return tabsBlock.dataset.tabsAnimate > 0 ? tabsBlock.dataset.tabsAnimate : 500;
         }
      }
      const tabsBlockAnimate = isTabsAnamate(tabsBlock);

      if (tabsContent.length > 0) {
         tabsContent.forEach((tabsContentItem, index) => {
            if (tabsTitles[index].classList.contains('_tab-active')) {
               if (tabsBlockAnimate) {
                  _slideDown(tabsContentItem, tabsBlockAnimate);
               } else {
                  tabsContentItem.hidden = false;
               }
               location.hash = `tab-${tabsBlockIndex}-${index}`;
            } else {
               if (tabsBlockAnimate) {
                  _slideUp(tabsContentItem, tabsBlockAnimate);
               } else {
                  tabsContentItem.hidden = true;
               }
            }
         });
      }
   }
   function setTabsAction(e) {
      const el = e.target;
      if (el.closest('[data-tabs-title]')) {
         const tabTitle = el.closest('[data-tabs-title]');
         const tabsBlock = tabTitle.closest('[data-tabs]');
         if (!tabTitle.classList.contains('_tab-active') && !tabsBlock.querySelectorAll('._slide').length) {

            const tabActiveTitle = tabsBlock.querySelector('[data-tabs-title]._tab-active');
            if (tabActiveTitle) {
               tabActiveTitle.classList.remove('_tab-active');
            }

            tabTitle.classList.add('_tab-active');
            setTabsStatus(tabsBlock);
         }
         e.preventDefault();
      }
   }

   //==== Модуь работы с табами end   ========================================================================


   // Счетчик ============================================================================================

   function formQuantity() {
      document.addEventListener("click", function (e) {
         let targetElement = e.target;
         if (targetElement.closest('.quantity__button')) {
            let value = parseInt(targetElement.closest('.quantity').querySelector('input').value);
            if (targetElement.classList.contains('quantity__button_plus')) {
               value++;
            } else {
               --value;
               if (value < 1) value = 1;
            }
            targetElement.closest('.quantity').querySelector('input').value = value;
         }


         // Сложение инпутов    -------------------
         // let total = document.querySelector('.cart__total-sum');
         // const idDeepBlue = document.querySelector('#deep-blue');
         // const idDeepGold = document.querySelector('#deep-gold');

         // let idDeepBlueValue = +idDeepBlue.value;
         // let idDeepGoldValue = +idDeepGold.value;


         // total.innerHTML = (idDeepBlueValue + idDeepGoldValue) + '$';
         // -------------------

      });
   }

   formQuantity();

   // Счетчик ==============================================================================================

   //  Карта Yandex start   ================================================================================

   const mapBlock = document.querySelector('.map__block');

   if (mapBlock) {

      let center = [25.196370056959115, 55.27771690078418];

      function init() {
         let map = new ymaps.Map('map-contacts', {
            center: center,
            zoom: 14
         });

         let placemark = new ymaps.Placemark(center, {
            balloonContentHeader: 'Хедер балуна',
            balloonContentBody: 'Боди балуна',
            balloonContentFooter: 'Подвал',
         }, {
            iconLayout: 'default#image',
            iconImageHref: 'images/logo.svg',
            iconImageSize: [138, 55],
            iconImageOffset: [0, 0]
         });

         map.controls.remove('geolocationControl'); // удаляем геолокацию
         map.controls.remove('searchControl'); // удаляем поиск
         map.controls.remove('trafficControl'); // удаляем контроль трафика
         map.controls.remove('typeSelector'); // удаляем тип
         map.controls.remove('fullscreenControl'); // удаляем кнопку перехода в полноэкранный режим
         map.controls.remove('zoomControl'); // удаляем контрол зуммирования
         map.controls.remove('rulerControl'); // удаляем контрол правил
         map.behaviors.disable(['scrollZoom']); // отключаем скролл карты (опционально)

         map.geoObjects.add(placemark);
      }

      ymaps.ready(init);
   }
   // Карта Yandex end   =========================================================================

   // select  choices   Max Graph  =====================================================================
   const multiDefault = () => {
      const elements = document.querySelectorAll('.multi-default');
      elements.forEach(el => {
         const choices = new Choices(el, {
            searchEnabled: false,
            allowHTML: true,
            position: 'bottom',
            noResultsText: 'Ничего не найдено'
         });
      });
   };
   multiDefault();
   // =====================================
   // const pastryiDefault = () => {
   //    const elements = document.querySelectorAll('.pastry-default');
   //    elements.forEach(el => {
   //       const pastry = new Choices(el, {
   //          searchEnabled: false,
   //          allowHTML: true,
   //          position: 'bottom',
   //          noResultsText: 'Ничего не найдено'
   //       });
   //    });
   // };
   // pastryiDefault();
   // =====================================
   // =====================================
   // const priceiDefault = () => {
   //    const elements = document.querySelectorAll('.catalog-price-default');
   //    elements.forEach(el => {
   //       const price = new Choices(el, {
   //          searchEnabled: false,
   //          allowHTML: true,
   //          position: 'bottom',
   //          noResultsText: 'Ничего не найдено'
   //       });
   //    });
   // };
   // priceiDefault();
   // ===================================

   // select  choices  Max Graph  ==================================================================

   // Popup start ====================================================================================

   // Получение хеша в адресе сайта
   function getHash() {
      if (location.hash) { return location.hash.replace('#', ''); }
   }
   // Указание хеша в адресе сайта
   function setHash(hash) {
      history.pushState('', '', hash);
   }

   //==== Вспомогательные модули блокировки прокрутки и скочка =====
   let bodyLockStatus = true;
   let bodyLockToggle = (delay = 500) => {
      if (document.documentElement.classList.contains('lock')) {
         bodyUnlock(delay);
      } else {
         bodyLock(delay);
      }
   }
   let bodyUnlock = (delay = 500) => {
      let body = document.querySelector("body");
      if (bodyLockStatus) {
         let lock_padding = document.querySelectorAll("._lp");
         setTimeout(() => {
            for (let index = 0; index < lock_padding.length; index++) {
               const el = lock_padding[index];
               el.style.paddingRight = '0px';
            }
            body.style.paddingRight = '0px';
            document.documentElement.classList.remove("lock");
         }, delay);
         bodyLockStatus = false;
         setTimeout(function () {
            bodyLockStatus = true;
         }, delay);
      }
   }
   let bodyLock = (delay = 500) => {
      let body = document.querySelector("body");
      if (bodyLockStatus) {
         let lock_padding = document.querySelectorAll("._lp");
         for (let index = 0; index < lock_padding.length; index++) {
            const el = lock_padding[index];
            el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
         }
         body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
         document.documentElement.classList.add("lock");

         bodyLockStatus = false;
         setTimeout(function () {
            bodyLockStatus = true;
         }, delay);
      }
   }

   //==== Вспомогательные модули блокировки прокрутки и скочка   =====

   let popupItem;
   function initPopups() {
      popupItem = new HystModal({
         linkAttributeName: "data-popup",
         beforeOpen: function (popupItem) {
            const hash = popupItem.openedWindow.id;
            setHash(`#${hash}`);
         },
         afterClose: function (popupItem) {
            setHash(window.location.href.split('#')[0]);
         },
         // прочие настройки (не обязательно), см. API
      });
      // Открытие по хешу
      if (getHash() && document.querySelector(`#${getHash()}`)) {
         popupItem.open(`#${getHash()}`);
      }
   }
   initPopups();

   // Popup end =============================================================================================

   //DYNAMIC ADAPT  start ===================================================================================

   function DynamicAdapt(type) {
      this.type = type;
   }

   DynamicAdapt.prototype.init = function () {
      const _this = this;
      // массив объектов
      this.оbjects = [];
      this.daClassname = "_dynamic_adapt_";
      // массив DOM-элементов
      this.nodes = document.querySelectorAll("[data-da]");

      // наполнение оbjects объктами
      for (let i = 0; i < this.nodes.length; i++) {
         const node = this.nodes[i];
         const data = node.dataset.da.trim();
         const dataArray = data.split(",");
         const оbject = {};
         оbject.element = node;
         оbject.parent = node.parentNode;
         оbject.destination = document.querySelector(dataArray[0].trim());
         оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767";
         оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
         оbject.index = this.indexInParent(оbject.parent, оbject.element);
         this.оbjects.push(оbject);
      }

      this.arraySort(this.оbjects);

      // массив уникальных медиа-запросов
      this.mediaQueries = Array.prototype.map.call(this.оbjects, function (item) {
         return '(' + this.type + "-width: " + item.breakpoint + "px)," + item.breakpoint;
      }, this);
      this.mediaQueries = Array.prototype.filter.call(this.mediaQueries, function (item, index, self) {
         return Array.prototype.indexOf.call(self, item) === index;
      });

      // навешивание слушателя на медиа-запрос
      // и вызов обработчика при первом запуске
      for (let i = 0; i < this.mediaQueries.length; i++) {
         const media = this.mediaQueries[i];
         const mediaSplit = String.prototype.split.call(media, ',');
         const matchMedia = window.matchMedia(mediaSplit[0]);
         const mediaBreakpoint = mediaSplit[1];

         // массив объектов с подходящим брейкпоинтом
         const оbjectsFilter = Array.prototype.filter.call(this.оbjects, function (item) {
            return item.breakpoint === mediaBreakpoint;
         });
         matchMedia.addListener(function () {
            _this.mediaHandler(matchMedia, оbjectsFilter);
         });
         this.mediaHandler(matchMedia, оbjectsFilter);
      }
   };

   DynamicAdapt.prototype.mediaHandler = function (matchMedia, оbjects) {
      if (matchMedia.matches) {
         for (let i = 0; i < оbjects.length; i++) {
            const оbject = оbjects[i];
            оbject.index = this.indexInParent(оbject.parent, оbject.element);
            this.moveTo(оbject.place, оbject.element, оbject.destination);
         }
      } else {
         for (let i = 0; i < оbjects.length; i++) {
            const оbject = оbjects[i];
            if (оbject.element.classList.contains(this.daClassname)) {
               this.moveBack(оbject.parent, оbject.element, оbject.index);
            }
         }
      }
   };

   // Функция перемещения
   DynamicAdapt.prototype.moveTo = function (place, element, destination) {
      element.classList.add(this.daClassname);
      if (place === 'last' || place >= destination.children.length) {
         destination.insertAdjacentElement('beforeend', element);
         return;
      }
      if (place === 'first') {
         destination.insertAdjacentElement('afterbegin', element);
         return;
      }
      destination.children[place].insertAdjacentElement('beforebegin', element);
   }

   // Функция возврата
   DynamicAdapt.prototype.moveBack = function (parent, element, index) {
      element.classList.remove(this.daClassname);
      if (parent.children[index] !== undefined) {
         parent.children[index].insertAdjacentElement('beforebegin', element);
      } else {
         parent.insertAdjacentElement('beforeend', element);
      }
   }

   // Функция получения индекса внутри родителя
   DynamicAdapt.prototype.indexInParent = function (parent, element) {
      const array = Array.prototype.slice.call(parent.children);
      return Array.prototype.indexOf.call(array, element);
   };

   // Функция сортировки массива по breakpoint и place 
   // по возрастанию для this.type = min
   // по убыванию для this.type = max
   DynamicAdapt.prototype.arraySort = function (arr) {
      if (this.type === "min") {
         Array.prototype.sort.call(arr, function (a, b) {
            if (a.breakpoint === b.breakpoint) {
               if (a.place === b.place) {
                  return 0;
               }

               if (a.place === "first" || b.place === "last") {
                  return -1;
               }

               if (a.place === "last" || b.place === "first") {
                  return 1;
               }

               return a.place - b.place;
            }

            return a.breakpoint - b.breakpoint;
         });
      } else {
         Array.prototype.sort.call(arr, function (a, b) {
            if (a.breakpoint === b.breakpoint) {
               if (a.place === b.place) {
                  return 0;
               }

               if (a.place === "first" || b.place === "last") {
                  return 1;
               }

               if (a.place === "last" || b.place === "first") {
                  return -1;
               }

               return b.place - a.place;
            }

            return b.breakpoint - a.breakpoint;
         });
         return;
      }
   };

   const da = new DynamicAdapt("max");
   da.init();

   // DYNAMIC ADAPT  end =====================================================================================

   // Slider ===============================================================================================

   const discountSlider = new Swiper('.header__slider', {
      // Optional parameters
      // direction: 'vertical',
      loop: true,
      spaceBetween: 20,
      // grabCursor: true,
      // Автопрокрутка
      // autoplay: {
      // Пауза между прокруткой
      // delay: 3000,
      // Закончить на последнем слайде
      // stopOnLastSlide: true,
      // Отключить после ручного переключения
      // disableOnInteraction: true,
      // },

      // Скорость
      speed: 800,

      // If we need pagination
      pagination: {
         el: '.swiper-pagination.header-swiper-pagination',
         // Буллеты
         type: 'bullets',
         clickable: true,
      },

      // Navigation arrows
      navigation: {
         nextEl: '.swiper-button-next.header-button-next',
         prevEl: '.swiper-button-prev.header-button-prev',
      },

      // And if we need scrollbar
      scrollbar: {
         el: '.swiper-scrollbar',
      },
   });


   const newSlider = new Swiper('.new__slider', {

      loop: true,
      slidesPerView: 4,
      slidesPerGroup: 1,
      spaceBetween: 40,
      grabCursor: true,
      // simulateTouch: false,
      // watchSlidesProgress: true,

      // Скорость
      speed: 1000,

      // If we need pagination
      pagination: {
         el: '.swiper-pagination.new__swiper-pagination',
         // Буллеты
         type: 'bullets',
         clickable: true,
      },

      // Navigation arrows
      navigation: {
         nextEl: '.swiper-button-next.new__swiper-button-next',
         prevEl: '.swiper-button-prev.new__swiper-button-prev',
      },

      breakpoints: {
         320: {
            slidesPerView: 2,
            spaceBetween: 15,
            slidesPerGroup: 2,
         },
         650: {
            slidesPerView: 3,
            spaceBetween: 30,
            slidesPerGroup: 3,
         },
         998: {
            slidesPerView: 4,
            spaceBetween: 30,
            slidesPerGroup: 4,
         },
         1024: {
            slidesPerView: 4,
            spaceBetween: 40,
            slidesPerGroup: 4,
         },
      },
   });



   const blogSlider = new Swiper('.blog__slider', {

      loop: true,
      slidesPerView: 4,
      slidesPerGroup: 1,
      spaceBetween: 40,
      grabCursor: true,
      // simulateTouch: false,
      // watchSlidesProgress: true,

      // Скорость
      speed: 1000,

      // If we need pagination
      pagination: {
         el: '.swiper-pagination.blog__swiper-pagination',
         // Буллеты
         type: 'bullets',
         clickable: true,
      },

      // Navigation arrows
      navigation: {
         nextEl: '.swiper-button-next.blog__swiper-button-next',
         prevEl: '.swiper-button-prev.blog__swiper-button-prev',
      },

      breakpoints: {
         320: {
            slidesPerView: 2,
            spaceBetween: 15,
            slidesPerGroup: 2,
         },
         650: {
            slidesPerView: 3,
            spaceBetween: 30,
            slidesPerGroup: 3,
         },
         998: {
            slidesPerView: 4,
            spaceBetween: 30,
            slidesPerGroup: 4,
         },
         1024: {
            slidesPerView: 4,
            spaceBetween: 40,
            slidesPerGroup: 4,
         },
      },
   });


   const buySlider = new Swiper('.buy__slider', {

      loop: true,
      slidesPerView: 4,
      slidesPerGroup: 1,
      spaceBetween: 40,
      grabCursor: true,
      // simulateTouch: false,
      // watchSlidesProgress: true,

      // Скорость
      speed: 1000,

      // If we need pagination
      pagination: {
         el: '.swiper-pagination.buy__swiper-pagination',
         // Буллеты
         type: 'bullets',
         clickable: true,
      },

      // Navigation arrows
      navigation: {
         nextEl: '.swiper-button-next.buy__swiper-button-next',
         prevEl: '.swiper-button-prev.buy__swiper-button-prev',
      },

      breakpoints: {
         320: {
            slidesPerView: 2,
            spaceBetween: 15,
            slidesPerGroup: 2,
         },
         650: {
            slidesPerView: 3,
            spaceBetween: 30,
            slidesPerGroup: 3,
         },
         998: {
            slidesPerView: 4,
            spaceBetween: 30,
            slidesPerGroup: 4,
         },
         1024: {
            slidesPerView: 4,
            spaceBetween: 40,
            slidesPerGroup: 4,
         },
      },
   });


   const likeSlider = new Swiper('.like__slider', {

      loop: true,
      slidesPerView: 4,
      slidesPerGroup: 1,
      spaceBetween: 40,
      grabCursor: true,
      // simulateTouch: false,
      // watchSlidesProgress: true,

      // Скорость
      speed: 1000,

      // If we need pagination
      pagination: {
         el: '.swiper-pagination.like__swiper-pagination',
         // Буллеты
         type: 'bullets',
         clickable: true,
      },

      // Navigation arrows
      navigation: {
         nextEl: '.swiper-button-next.like__swiper-button-next',
         prevEl: '.swiper-button-prev.like__swiper-button-prev',
      },

      breakpoints: {
         320: {
            slidesPerView: 2,
            spaceBetween: 15,
            slidesPerGroup: 2,
         },
         650: {
            slidesPerView: 3,
            spaceBetween: 30,
            slidesPerGroup: 3,
         },
         998: {
            slidesPerView: 4,
            spaceBetween: 30,
            slidesPerGroup: 4,
         },
         1024: {
            slidesPerView: 4,
            spaceBetween: 40,
            slidesPerGroup: 4,
         },
      },
   });



   // slider  карточки   ===

   var cardSlider = new Swiper(".card__slider", {

      slidesPerView: 3,
      freeMode: true,
      watchSlidesProgress: true,
      // loop: true,

      breakpoints: {
         320: {
            spaceBetween: 10,
            slidesPerView: 3,
         },
         375: {
            spaceBetween: 10,
            slidesPerView: 3,
         },
         425: {
            spaceBetween: 15,
            slidesPerView: 3,
         },
         525: {
            spaceBetween: 15,
            slidesPerView: 4,
         },
         651: {
            spaceBetween: 15,
            slidesPerView: 2,
         },

         767: {
            spaceBetween: 15,
            slidesPerView: 3,
         },
         998: {
            spaceBetween: 20,
            slidesPerView: 3,
         },
      }

   });

   var cardSlider2 = new Swiper(".card__slider-2", {
      spaceBetween: 10,
      navigation: {
         nextEl: ".swiper-button-next.card-button-next",
         prevEl: ".swiper-button-prev.card-button-prev",
      },
      thumbs: {
         swiper: cardSlider,
      },
   });

   // slider =


   const asideSlider = new Swiper('.aside-slider', {

      loop: true,
      // slidesPerView: 4,
      // slidesPerGroup: 1,
      // spaceBetween: 10,
      grabCursor: true,
      // simulateTouch: false,
      // watchSlidesProgress: true,

      // Скорость
      speed: 1000,

      // If we need pagination
      pagination: {
         el: '.swiper-pagination.aside-slider-pagination',
         // Буллеты
         type: 'bullets',
         clickable: true,
      },

      breakpoints: {
         300: {
            slidesPerView: 1,
            spaceBetween: 70,
            slidesPerGroup: 1,
         },

         // 375: {
         //    slidesPerView: 1,
         //    spaceBetween: 70,
         //    slidesPerGroup: 1,
         // },

      },
   });






   // Slider ===============================================================================================

   // Плавный скролл кнопки наверх  ====================================================
   let btnUp = document.querySelector('.btn__up');

   btnUp.addEventListener('click', function (e) {
      scrollToY(0);
   });

   let scrolls = 0;
   window.addEventListener('scroll', function (e) {
      // console.log(++scrolls);
      let pos = window.pageYOffset;

      if (pos > window.innerHeight) {
         btnUp.classList.add('btn__up-open');
      }
      else {
         btnUp.classList.remove('btn__up-open');
      }

   });

   function scrollToY(pos) {
      window.scrollTo({
         top: pos,
         behavior: "smooth"
      });
   }
   // Плавный скролл кнопки наверх  =================================================================

   // Плавный скролл к пунктам =======================================================================
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
         e.preventDefault();
         document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
         });
      });
   });
   // Плавный скролл к пунктам =========================================================================

   // Меню бургер ======================================================================================
   //Burger start   ====================================================================================
   const iconMenu = document.querySelector(".icon-menu");
   const menuBody = document.querySelector(".menu__list");

   if (iconMenu) {
      iconMenu.addEventListener("click", function (e) {
         document.body.classList.toggle("_lock");
         iconMenu.classList.toggle("menu-open");
         menuBody.classList.toggle("menu-open");
         menuBody.classList.toggle('menu__list--active');
      });
   }
   if (menuBody) {
      menuBody.addEventListener('click', function () {
         iconMenu.classList.remove("menu-open");
         menuBody.classList.remove("menu__list--active");
         menuBody.classList.remove("menu-open");
         document.body.classList.remove("_lock");
      });
   }

   //Burger  end  ==========================================================================================

});

//=====  JQuery  start  =============================================================

$(document).ready(function () {
   $("form").submit(function () { // Событие отправки с формы
      var form_data = $(this).serialize(); // Собираем данные из полей
      $.ajax({
         type: "POST", // Метод отправки
         url: "send.php", // Путь к PHP обработчику sendform.php
         data: form_data,
         success: function () {
            $('.overley').addClass('overley-visible');
            $('.modal').addClass('modal__visible');
         }
      }).done(function () {
         $(this).find('input').val('');
         $('form').trigger('reset');
      });
      event.preventDefault();
   });
});


// Slick slider start ====================================================================
$(function () {
   $('.your-class').slick({
      dots: true,
   });

});

// Slick slider finish ====================================================================

//=====  JQuery  finish ===================================================================
