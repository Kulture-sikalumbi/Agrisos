import type { UiStrings } from './types';

/**
 * Farmer-facing strings in Bemba (IciBemba).
 * Notes from native review:
 * - cassava → tute
 * - disease → ubulwele
 * - formal “your” → yenu (not yobe)
 * - photo → ichikope (or “photo” where clearer)
 * - “Is your cassava okay?” → Bushe tute yenu ili bwino?
 */
export const bem: UiStrings = {
  appName: 'Agrisos+',
  tagline: 'Ukusanga Ubulwele bwa Tute',
  heroTitle: 'Bushe tute yenu ili bwino?',
  heroSub: 'kopeni ichikope nangu saleni icisabo.\nMwafumya icishiliko mucinshi.',
  legendHealthy: 'Ili bwino',
  legendUnclear: 'Tacishininkishiwe',
  legendDisease: 'Ubulwele',
  scanCamera: 'Sanga na Kamera',
  pickGallery: 'Saleni ichikope',
  askAssistant: 'Ipusheni Ubwafwilisho',
  recentScans: 'Ifyasangwa fyali',
  worksOffline: 'Icitika na pantu tafiledwisha data',
  analyzing: 'Ilemona icisabo...',
  analyzingSub: 'Ilemona ichikope, elyo ilemona ubulwele',
  language: 'Ululimi',

  back: 'Bwelela',
  backHome: 'Bwelela ku ntanshi',
  cameraHint: 'Lolesheni ku cisabo cimo ca tute',
  frameHint: 'Icisabo fishe mu frame',
  gallery: 'Amaphoto',
  cameraNeededTitle: 'asheni Kamera  uluse',
  cameraNeededSub: 'Pembeleleni kamera, nangu saleni ichikope ca cisabo.',
  allowCamera: 'Pembelela Kamera',
  permissionGallery: 'Saleni ichikope',

  confidence: 'Ukusuminisha',
  lowConfidence: 'Tacishininkishiwe sana — pinga ichikope limbi mu lusuba.',
  whatToDoNow: 'Ico mwingachita nomba',
  prevention: 'Ukukana',
  moreTips: 'Ifyo mungacitila',
  hideTips: 'Fisa ifimbi',
  treatmentNote: 'Ifyo mungacitila',
  readResult: 'Umfwa icishiliko',
  stopReading: 'Imya ukubelenga',
  scanAnother: 'Sanga limbi',
  askMoreHelp: 'Ipusheni ubwafwilisho',
  photoNotUsable: 'Ichikope tacinga',
  goodPhotoTitle: 'Efyo mungapanga ichikope cisuma',
  goodPhotoSteps:
    '1. Pangeni mu lusuba (nomba nangu mumshika).\n2. sontekeni camera pe bula ya tute .\n3. sontekeni bwino camera.\n4. Wilasanga ifintu fyakufye, screen, nangu cibumba.',
  retakePhoto: 'Pangeni ichikope limbi',
  rejectTooSmall: 'Ichikope ni inono. Nipepi no kupanga ichikope cisuma ca cisabo.',
  rejectTooDark: 'Ichikope ni ifita. Pangeni limbi mu lusuba.',
  rejectTooBright: 'Ichikope na chibuta sana.',
  rejectTooFlat: 'ichikope icho tachiweme ehseni nakabili',
  // TODO: have a native Bemba speaker review this string (see docs/THREAD_HANDOFF.md).
  rejectNotLeaf: 'Ici ichikope tacilanga tute. Sontekeni camera pe bula lya tute limo ukwisula mwi bala.',
  rejectDecode: 'Nafilwa ukusanga ubulwele',
  // TODO: have a native Bemba speaker review these strings (see docs/THREAD_HANDOFF.md).
  notCassavaTitle: 'Te Chikope ca Tute',
  notCassavaFallbackMessage:
    'Ici ichikope tacilanga bula lya tute, eico tatwingapeela amashiwi ya bulwele pali ici.',
  confirmLeafTitle: 'Bushe ili ni bula lya tute?',
  confirmLeafMessage:
    'Ni fikope fya bula lya tute fye ifingapeela ifisuma. Ifikope fya bantu, ifintu, screen, nangu ifimenwa fimbi fikapeela amasuku yabipa.',
  confirmLeafCancel: 'Cancel, saleni ichikope cimbi',
  confirmLeafContinue: 'Ee, ili ni bula lya tute',

  historyTitle: 'History',
  clear: 'Futa',
  clearConfirmTitle: 'Futeni fyonse?',
  clearConfirmBody: 'bushe chichinka mulefwaya ukufuta fyonse?',
  cancel: 'Awe',
  noScansYet: 'Takuli ifyasangwa',
  noScansSub: 'Nomba mwasinga icisabo, ifyo fyali fileikalapo pa phone.',

  chatTitle: 'Ubwafwilisho bwa Agrisos',
  chatSub: 'Ilingile pa foni, na internet tefyo ifwayika',
  chatWelcome:
    'Mwapoleni! Nine ubwafwilisho bwa Agrisos. kuti mwanjipusha  pali CMD, CBSD, yonse amalwele ya tute',
  chatPlaceholder: 'Lembeni umepusho...',
  chatOffline: 'Mulemona ifyo mungachita pa ciputulwa ca cishiliko.',

  diseases: {
    cmd: {
      label: 'Ubulwele bwa Mosaic bwa Tute (CMD)',
      shortLabel: 'CMD',
      action: 'Nukuleni (fumyeni) icimuti pakuti mwipaye ubulwele',
      advice:
        '1. Fumyeni ici cimuti, mucipose ukutali ne bala.\n2. mwilya tute ,poseni yonse iyonaike.\n3. Moneni ngachakutila fyonse ifimuti ifipalamine nafikwata ubulwele , .',
      prevention:
        '•fwayeni umuti wa prevention \n• nukuleni fyonse ifimuti ifikwete ubulwele',
      treatment:
        'CMD bulwela bwa tute , nukuleni fyonse ifimuti ifikwete ubulwele.fwayeni umuti wa treatment.',
    },
    cbsd: {
      label: 'Ubulwele bwa Brown Streak bwa Tute (CBSD)',
      shortLabel: 'CBSD',
      action: 'Fumyeni ici cimuti — imishila nga nayibola',
      advice:
        '1. Fumyeni  ici cimuti.\n2. mwilya imishila ya tute iyabola; wilasumina amashina yakufuma muli ici.\n3. Landa ku extension officer — CBSD yaleenda lucelo.',
      prevention:
        '• \n• Ipusheni ama local agriculture agents pali CBSD\n• Fumyeni ifimuti fyawile lucelo; wilapeela amashina yawile',
      treatment:
        'CBSD ni virus — takuli umutengo uucusha pa fisabo. Fumyeni icimuti. Moneni ngachakweba atti imishila naibola , mupose yonse . fwayeni umuti wa treatment.',
    },
    healthy: {
      label: 'Tute  ilifye  bwino',
      shortLabel: 'Bwino',
      action: 'tute yenu ilifye bwino , lolesheni yonse amabula ngachakweba atti yalifye bwino',
      advice:
        '1. Moneni ifisabo cila ubushiku pa mosaic, yellow, nangu imishila iyafita.\n2. Shaleni akaceene no kufumya ifyani.\n3. Saleni amashina fye ku fimuti ifili bwino.',
      prevention:
        '• Shimikeni amashina yasuma\n• Moneni whiteflies no fisabo cila ubushiku\n• Wilaleta amashina yakufuma ku mabala yawile',
      treatment:
        'Takufwaya umutengo. Nga whiteflies shingi, ipusheni extension officer ukulutila.',
    },
    uncertain: {
      label: 'Icishiliko tacishininkishiwe',
      shortLabel: 'Tacishininkishiwe',
      action: 'kopeni nakabili , nangu  ',
      advice:
        '1. Pangeni ichikope limbi mu lusuba, cisabo cimo.\n2. Wilasha, wilapanga mumshika.\n3. Nga cimuti cilalolesha ubulwele, ipusheni extension officer.',
      prevention:
        '• Ichikope cisuma: kopeni  ibula yatute, lusuba, mupepi\n• Amashina yasuma yakana ubulwele',
      treatment: 'Takuli amalangililo ya umutengo panono. Pangeni ichikope limbi lyakubalilapo.',
    },
  },
};
