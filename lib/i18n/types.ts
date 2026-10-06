import type { NativeLang, LevelId } from '@/lib/store/appStore'

export type AnatomyState =
  | 'long-e'
  | 'short-i'
  | 'flat-a'
  | 'theta'
  | 'eth'
  | 'diphthong-ei'
  | 'sh-sound'

export type PhoneticItem = {
  sound: string
  symbol: string
  targetWord: string
  targetPhonetic: string
  contrastWord: string
  contrastPhonetic: string
  desc: string
  descEn: string
  anatomyState: AnatomyState
  /** lowercased mispronunciation -> feedback in the learner's native language */
  mistakes: Record<string, string>
}

export type PhoneticPack = {
  /** e.g. "Kesalahan khas orang Indonesia" */
  interferenceTitle: string
  /** one-line summary of this L1's interference profile */
  interferenceSummary: string
  items: PhoneticItem[]
}

export type UIStrings = {
  // splash
  splashBadge: string
  splashSubtitle: string
  splashBody: string
  splashCta: string
  splashNote: string
  // onboarding
  obNameTitle: string
  obNameSub: string
  obNamePlaceholder: string
  obLangTitle: string
  obLangSub: string
  obLevelTitle: string
  obLevelSub: string
  obTeacherTitle: string
  obTeacherSub: string
  obNext: string
  obBack: string
  obPickCharacter: string
  obChooseLang: string
  teacherIdLabel: string
  teacherIdDesc: string
  teacherBilingualLabel: string
  teacherBilingualDesc: string
  teacherEnLabel: string
  teacherEnDesc: string
  // placement test
  obTakeTest: string
  // voice narration / how-to
  narrateLabel: string
  narStepLang: string
  narStepName: string
  narStepLevel: string
  narStepTeacher: string
  narRoom: string
  // guided A1 phonics tutorial
  tutWelcome: string
  tutPhonicsTitle: string
  tutPhonicsHint: string
  tutTestTitle: string
  tutTestHint: string
  tutSayWord: string
  tutListening: string
  tutCorrect: string
  tutAlmost: string
  tutEncourage: string
  tutNext: string
  tutRetry: string
  tutEnter: string
  tutSkip: string
  plTitle: string
  plIntro: string
  plMethod: string
  plStart: string
  plQuestion: string
  plOf: string
  plNext: string
  plFinish: string
  plResult: string
  plEstimated: string
  plConfidence: string
  plHigh: string
  plMedium: string
  plLow: string
  plCanDo: string
  plUseThis: string
  plRetake: string
  plCorrect: string
  plWrong: string
  plDisclaimer: string
  // karakter
  karTitle: string
  karSub: string
  karGallery: string
  karRandom: string
  karEnter: string
  // room
  roomExit: string
  roomClass: string
  roomSoundTitle: string
  roomLangTitle: string
  roomTeacherName: string
  roomTeacherRole: string
  roomSpeaking: string
  roomLoading: string
  roomPlaceholder: string
  roomListening: string
  roomRecordingHint: string
  roomMicTitle: string
  roomSend: string
  roomError: string
  // phonetic board
  pbTargetWord: string
  pbCompareWith: string
  pbSoundboard: string
  pbVowels: string
  pbDiphthongs: string
  pbConsonants: string
  pbMouthProfile: string
  pbPreviewLabel: string
  pbStartSpeaking: string
  pbAnalyzing: string
  pbDoneScore: string
  pbDetectedWord: string
  pbScore: string
  pbPhonemeResult: string
  pbRecordingHint: string
  pbSilenceFeedback: string
  pbExcellentFeedback: string
  pbGoodFeedback: string
  pbLowFeedback: string
  pbInterferenceHeading: string
  // dialect lens (Listener/Lens-inspired)
  dlTitle: string
  dlSubtitle: string
  dlTrackA: string
  dlTrackB: string
  dlTrackC: string
  dlPlay: string
  dlAsHeard: string
  dlEvidence: string
  dlNoRules: string
  dlFixHint: string
  dlDisclaimer: string
  dlShow: string
  dlHide: string
  dlTryOther: string
  dlTryPlaceholder: string
  dlSource: string
  // mistake bank
  mbTitle: string
  mbEmpty: string
  mbClear: string
  mbTimes: string
  // shareable CEFR card
  scTitle: string
  scDownload: string
  scShare: string
  scHint: string
  // language names (for the picker)
  langName: string
  langFlag: string
}

export type LocaleBundle = {
  code: NativeLang
  /** BCP-47 tag for native-language speech synthesis */
  speechTag: string
  ui: UIStrings
  phonetics: PhoneticPack
  /** localized CEFR level taglines, keyed by level id */
  levelTaglines: Record<LevelId, string>
  /** hint used by the AI teacher to explain in this language */
  teacherLabel: string
}
