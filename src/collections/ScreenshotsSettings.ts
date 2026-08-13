import type { GlobalConfig } from 'payload'

export const ScreenshotSettings: GlobalConfig = {
  slug: 'screenshot-settings',

  fields: [
    {
      name: 'baseCSS',
      label: 'CSS global des captures',
      type: 'code',
      defaultValue: `html, body {
  overflow-x: hidden !important;
  width: 100% !important;
  max-width: 100% !important;
}

#wrappersite {
  overflow: hidden!important;
}

#header,#headerGrid {
  width:100%;
}

.home #content :is(.blocthumb,.specialthumb,.tertiarythumb,.quaternarythumb,.gallery-item,.wp-block-image,.wp-block-image img) {
  transform: initial!important;
  opacity:1!important;
}

#sections :is(.specialthumb,.blocthumb,.specialthumb img,.blocthumb img) {
  background-attachment: inherit!important;
}

.gallery-item img {
  opacity:1!important;
  transform: initial!important;
}

.sectionsbloc img,body .vegas-container,#content img {
  transform: initial!important;
}

#tarteaucitronAlertSmall, #tarteaucitronAlertBig,.fixedParent,.fixed-header,.animationDirection::before,.to-top,#popup,#banner,#ckbp_popup,#ckbp_banner,
#loader-wrapper,.loader,#ckbp_popup,#ckbp_banner,#AVcontentBox,#AVoverlay,#event_animation_container {
  display: none!important;
}

.fixe-bg,.baseBefore::before,#reassurances,#prestations {
  background-attachment: initial!important;
}

.animClass, .animClassChild, .animClassToogle, .animClassChildToogle {
  overflow: inherit!important;
}

.animClass, .animClassChild>*, .animClassToogle, .animClassChildToogle>* {
  transform: translate(0,0)!important;
  opacity: 1!important;
}

#prestations .hiddenChild .prestations-wrapper>*:not(.prestations-title) {
  opacity: 0;
}
`,
      admin: {
        language: 'css',
      },
    },
  ],
}
