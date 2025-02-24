/* eslint-disable func-names, no-underscore-dangle */
import { hit, noopFunc } from '../helpers/index';

/**
 * @redirect google-ima3
 *
 * @description
 * Mocks the IMA SDK of Google.
 *
 * **Example**
 * ```
 * ||imasdk.googleapis.com/js/sdkloader/ima3.js$script,redirect=google-ima3
 * ```
 */

export function GoogleIma3(source) {
    const VERSION = '3.453.0';

    const ima = {};

    const AdDisplayContainer = function () { };
    AdDisplayContainer.prototype.destroy = noopFunc;
    AdDisplayContainer.prototype.initialize = noopFunc;

    const ImaSdkSettings = function () { };
    ImaSdkSettings.CompanionBackfillMode = {
        ALWAYS: 'always',
        ON_MASTER_AD: 'on_master_ad',
    };
    ImaSdkSettings.VpaidMode = {
        DISABLED: 0,
        ENABLED: 1,
        INSECURE: 2,
    };
    ImaSdkSettings.prototype = {
        c: true,
        f: {},
        i: false,
        l: '',
        p: '',
        r: 0,
        t: '',
        v: '',
        getCompanionBackfill: noopFunc,
        getDisableCustomPlaybackForIOS10Plus() { return this.i; },
        getDisabledFlashAds: () => true,
        getFeatureFlags() { return this.f; },
        getLocale() { return this.l; },
        getNumRedirects() { return this.r; },
        getPlayerType() { return this.t; },
        getPlayerVersion() { return this.v; },
        getPpid() { return this.p; },
        getVpaidMode() { return this.C; },
        isCookiesEnabled() { return this.c; },
        isVpaidAdapter() { return this.M; },
        setCompanionBackfill: noopFunc,
        setAutoPlayAdBreaks(a) {
            this.K = a;
        },
        setCookiesEnabled(c) {
            this.c = !!c;
        },
        setDisableCustomPlaybackForIOS10Plus(i) {
            this.i = !!i;
        },
        setDisableFlashAds: noopFunc,
        setFeatureFlags(f) {
            this.f = !!f;
        },
        setIsVpaidAdapter(a) {
            this.M = a;
        },
        setLocale(l) {
            this.l = !!l;
        },
        setNumRedirects(r) {
            this.r = !!r;
        },
        setPageCorrelator(a) {
            this.R = a;
        },
        setPlayerType(t) {
            this.t = !!t;
        },
        setPlayerVersion(v) {
            this.v = !!v;
        },
        setPpid(p) {
            this.p = !!p;
        },
        setVpaidMode(a) {
            this.C = a;
        },
        setSessionId: noopFunc,
        setStreamCorrelator: noopFunc,
        setVpaidAllowed: noopFunc,
        CompanionBackfillMode: {
            ALWAYS: 'always',
            ON_MASTER_AD: 'on_master_ad',
        },
        VpaidMode: {
            DISABLED: 0,
            ENABLED: 1,
            INSECURE: 2,
        },
    };

    let managerLoaded = false;

    const EventHandler = function () {
        this.listeners = new Map();
        this._dispatch = function (e) {
            const listeners = this.listeners.get(e.type) || [];
            // eslint-disable-next-line no-restricted-syntax
            for (const listener of Array.from(listeners)) {
                try {
                    listener(e);
                } catch (r) {
                    // eslint-disable-next-line no-console
                    console.error(r);
                }
            }
        };
        this.addEventListener = function (t, c) {
            if (!this.listeners.has(t)) {
                this.listeners.set(t, new Set());
            }
            this.listeners.get(t).add(c);
        };
        this.removeEventListener = function (t, c) {
            this.listeners.get(t)?.delete(c);
        };
    };

    const AdsManager = new EventHandler();
    /* eslint-disable no-use-before-define */
    AdsManager.volume = 1;
    AdsManager.collapse = noopFunc;
    AdsManager.configureAdsManager = noopFunc;
    AdsManager.destroy = noopFunc;
    AdsManager.discardAdBreak = noopFunc;
    AdsManager.expand = noopFunc;
    AdsManager.focus = noopFunc;
    AdsManager.getAdSkippableState = () => false;
    AdsManager.getCuePoints = () => [0];
    AdsManager.getCurrentAd = () => currentAd;
    AdsManager.getCurrentAdCuePoints = () => [];
    AdsManager.getRemainingTime = () => 0;
    AdsManager.getVolume = function () { return this.volume; };
    AdsManager.init = noopFunc;
    AdsManager.isCustomClickTrackingUsed = () => false;
    AdsManager.isCustomPlaybackUsed = () => false;
    AdsManager.pause = noopFunc;
    AdsManager.requestNextAdBreak = noopFunc;
    AdsManager.resize = noopFunc;
    AdsManager.resume = noopFunc;
    AdsManager.setVolume = function (v) {
        this.volume = v;
    };
    AdsManager.skip = noopFunc;
    AdsManager.start = function () {
        // eslint-disable-next-line no-restricted-syntax
        for (const type of [
            AdEvent.Type.LOADED,
            AdEvent.Type.STARTED,
            AdEvent.Type.AD_BUFFERING,
            AdEvent.Type.FIRST_QUARTILE,
            AdEvent.Type.MIDPOINT,
            AdEvent.Type.THIRD_QUARTILE,
            AdEvent.Type.COMPLETE,
            AdEvent.Type.ALL_ADS_COMPLETED,
            AdEvent.Type.CONTENT_RESUME_REQUESTED,
        ]) {
            try {
                this._dispatch(new ima.AdEvent(type));
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        }
    };
    AdsManager.stop = noopFunc;
    AdsManager.updateAdsRenderingSettings = noopFunc;
    /* eslint-enable no-use-before-define */

    const manager = Object.create(AdsManager);

    const AdsManagerLoadedEvent = function (type) { this.type = type; };
    AdsManagerLoadedEvent.prototype = {
        getAdsManager: () => manager,
        getUserRequestContext: noopFunc,
    };
    AdsManagerLoadedEvent.Type = {
        ADS_MANAGER_LOADED: 'adsManagerLoaded',
    };

    const AdsLoader = EventHandler;
    AdsLoader.prototype.settings = new ImaSdkSettings();
    AdsLoader.prototype.contentComplete = noopFunc;
    AdsLoader.prototype.destroy = noopFunc;
    AdsLoader.prototype.getSettings = function () {
        return this.settings;
    };
    AdsLoader.prototype.getVersion = () => VERSION;
    AdsLoader.prototype.requestAds = function (adsRequest, userRequestContext) {
        if (!managerLoaded) {
            managerLoaded = true;

            const e = new ima.AdError(
                'adPlayError',
                1205,
                1205,
                'The browser prevented playback initiated without user interaction.',
                adsRequest,
                userRequestContext,
            );
            requestAnimationFrame(() => {
                // using AdErrorEvent is preferred as AdsManagerLoadedEvent causes errors
                // https://github.com/AdguardTeam/Scriptlets/issues/217
                this._dispatch(new ima.AdErrorEvent(e));
            });
        }
    };

    const AdsRenderingSettings = noopFunc;

    const AdsRequest = function () { };
    AdsRequest.prototype = {
        setAdWillAutoPlay: noopFunc,
        setAdWillPlayMuted: noopFunc,
        setContinuousPlayback: noopFunc,
    };

    const AdPodInfo = function () { };
    AdPodInfo.prototype = {
        getAdPosition: () => 1,
        getIsBumper: () => false,
        getMaxDuration: () => -1,
        getPodIndex: () => 1,
        getTimeOffset: () => 0,
        getTotalAds: () => 1,
    };

    const Ad = function () { };
    Ad.prototype = {
        pi: new AdPodInfo(),
        getAdId: () => '',
        getAdPodInfo() { return this.pi; },
        getAdSystem: () => '',
        getAdvertiserName: () => '',
        getApiFramework: () => null,
        getCompanionAds: () => [],
        getContentType: () => '',
        getCreativeAdId: () => '',
        getDealId: () => '',
        getDescription: () => '',
        getDuration: () => 8.5,
        getHeight: () => 0,
        getMediaUrl: () => null,
        getMinSuggestedDuration: () => -2,
        getSkipTimeOffset: () => -1,
        getSurveyUrl: () => null,
        getTitle: () => '',
        getTraffickingParametersString: () => '',
        getUiElements: () => [''],
        getUniversalAdIdRegistry: () => 'unknown',
        getUniversalAdIds: () => [''],
        getUniversalAdIdValue: () => 'unknown',
        getVastMediaBitrate: () => 0,
        getVastMediaHeight: () => 0,
        getVastMediaWidth: () => 0,
        getWidth: () => 0,
        getWrapperAdIds: () => [''],
        getWrapperAdSystems: () => [''],
        getWrapperCreativeIds: () => [''],
        isLinear: () => true,
        isSkippable() { return true; },
    };

    const CompanionAd = function () { };
    CompanionAd.prototype = {
        getAdSlotId: () => '',
        getContent: () => '',
        getContentType: () => '',
        getHeight: () => 1,
        getWidth: () => 1,
    };

    const AdError = function (type, code, vast, message, adsRequest, userRequestContext) {
        this.errorCode = code;
        this.message = message;
        this.type = type;
        this.adsRequest = adsRequest;
        this.userRequestContext = userRequestContext;

        this.getErrorCode = function () {
            return this.errorCode;
        };

        this.getInnerError = function () { };

        this.getMessage = function () {
            return this.message;
        };

        this.getType = function () {
            return this.type;
        };

        this.getVastErrorCode = function () {
            return this.vastErrorCode;
        };

        this.toString = function () {
            return `AdError ${this.errorCode}: ${this.message}`;
        };
    };

    AdError.ErrorCode = {};
    AdError.Type = {};

    const isEngadget = () => {
        try {
            // eslint-disable-next-line no-restricted-syntax
            for (const ctx of Object.values(window.vidible._getContexts())) {
                // eslint-disable-next-line no-restricted-properties
                if (ctx.getPlayer()?.div?.innerHTML.includes('www.engadget.com')) {
                    return true;
                }
            }
        } catch (e) { } // eslint-disable-line no-empty
        return false;
    };

    const currentAd = isEngadget() ? undefined : new Ad();

    const AdEvent = function (type) { this.type = type; };
    AdEvent.prototype = {
        getAd: () => currentAd,
        getAdData: () => { },
    };
    AdEvent.Type = {
        AD_BREAK_READY: 'adBreakReady',
        AD_BUFFERING: 'adBuffering',
        AD_CAN_PLAY: 'adCanPlay',
        AD_METADATA: 'adMetadata',
        AD_PROGRESS: 'adProgress',
        ALL_ADS_COMPLETED: 'allAdsCompleted',
        CLICK: 'click',
        COMPLETE: 'complete',
        CONTENT_PAUSE_REQUESTED: 'contentPauseRequested',
        CONTENT_RESUME_REQUESTED: 'contentResumeRequested',
        DURATION_CHANGE: 'durationChange',
        EXPANDED_CHANGED: 'expandedChanged',
        FIRST_QUARTILE: 'firstQuartile',
        IMPRESSION: 'impression',
        INTERACTION: 'interaction',
        LINEAR_CHANGE: 'linearChange',
        LINEAR_CHANGED: 'linearChanged',
        LOADED: 'loaded',
        LOG: 'log',
        MIDPOINT: 'midpoint',
        PAUSED: 'pause',
        RESUMED: 'resume',
        SKIPPABLE_STATE_CHANGED: 'skippableStateChanged',
        SKIPPED: 'skip',
        STARTED: 'start',
        THIRD_QUARTILE: 'thirdQuartile',
        USER_CLOSE: 'userClose',
        VIDEO_CLICKED: 'videoClicked',
        VIDEO_ICON_CLICKED: 'videoIconClicked',
        VIEWABLE_IMPRESSION: 'viewable_impression',
        VOLUME_CHANGED: 'volumeChange',
        VOLUME_MUTED: 'mute',
    };

    const AdErrorEvent = function (error) {
        this.error = error;
        this.type = 'adError';

        this.getError = function () {
            return this.error;
        };

        this.getUserRequestContext = function () {
            if (this.error?.userRequestContext) {
                return this.error.userRequestContext;
            }
            return {};
        };
    };

    AdErrorEvent.Type = {
        AD_ERROR: 'adError',
    };

    const CustomContentLoadedEvent = function () { };
    CustomContentLoadedEvent.Type = {
        CUSTOM_CONTENT_LOADED: 'deprecated-event',
    };

    const CompanionAdSelectionSettings = function () { };
    CompanionAdSelectionSettings.CreativeType = {
        ALL: 'All',
        FLASH: 'Flash',
        IMAGE: 'Image',
    };
    CompanionAdSelectionSettings.ResourceType = {
        ALL: 'All',
        HTML: 'Html',
        IFRAME: 'IFrame',
        STATIC: 'Static',
    };
    CompanionAdSelectionSettings.SizeCriteria = {
        IGNORE: 'IgnoreSize',
        SELECT_EXACT_MATCH: 'SelectExactMatch',
        SELECT_NEAR_MATCH: 'SelectNearMatch',
    };

    const AdCuePoints = function () { };
    AdCuePoints.prototype = {
        getCuePoints: () => [],
        getAdIdRegistry: () => '',
        getAdIsValue: () => '',
    };
    const AdProgressData = noopFunc;

    const UniversalAdIdInfo = function () { };

    Object.assign(ima, {
        AdCuePoints,
        AdDisplayContainer,
        AdError,
        AdErrorEvent,
        AdEvent,
        AdPodInfo,
        AdProgressData,
        AdsLoader,
        AdsManager: manager,
        AdsManagerLoadedEvent,
        AdsRenderingSettings,
        AdsRequest,
        CompanionAd,
        CompanionAdSelectionSettings,
        CustomContentLoadedEvent,
        gptProxyInstance: {},
        ImaSdkSettings,
        OmidAccessMode: {
            DOMAIN: 'domain',
            FULL: 'full',
            LIMITED: 'limited',
        },
        settings: new ImaSdkSettings(),
        UiElements: {
            AD_ATTRIBUTION: 'adAttribution',
            COUNTDOWN: 'countdown',
        },
        UniversalAdIdInfo,
        VERSION,
        ViewMode: {
            FULLSCREEN: 'fullscreen',
            NORMAL: 'normal',
        },
    });

    if (!window.google) {
        window.google = {};
    }

    window.google.ima = ima;

    hit(source);
}

GoogleIma3.names = ['google-ima3'];

GoogleIma3.injections = [hit, noopFunc];
