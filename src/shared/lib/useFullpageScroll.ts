import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import { SCREEN_REQUEST } from '@/shared/lib';

import type { Lang } from '@/shared/config';
import type { ScreenRequestDetail } from '@/shared/lib';

gsap.registerPlugin(Observer, ScrollToPlugin);

const SCREEN_IDS = ['hero', 'team', 'benefits', 'join'] as const;

type ScreenId = (typeof SCREEN_IDS)[number];

type Stop = {
  y: number;
  screenId: ScreenId;
};

type ResolveIndex = (stops: Stop[]) => number;

type UseFullpageScrollOptions = {
  isEnabled?: boolean;
};

const TRANSITION_DURATION = 0.8;
const TRANSITION_EASE = 'power2.inOut';
const QUIET_PERIOD = 0.3;
const DESKTOP_MIN_WIDTH = 1025;
const INVERT_WHEEL = -1;
const GESTURE_TOLERANCE = 10;
const ALIGN_TOLERANCE = 1;
const DESKTOP_QUERY = `(min-width: ${DESKTOP_MIN_WIDTH}px)`;
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
const TYPING_TARGETS = 'input, textarea, select, [contenteditable]';
const ACTIVATABLE_TARGETS = 'button, a';

const LINK_SCREENS: Record<string, ScreenId> = {
  '#': 'hero',
  '#hero': 'hero',
  '#team': 'team',
  '#benefits': 'benefits',
  '#join': 'join',
};

const isScreenId = (value: string): value is ScreenId => SCREEN_IDS.includes(value as ScreenId);

const getOpenDialog = () => document.querySelector('dialog[open]');

const getScreenStop = (screenId: ScreenId): Stop | null => {
  const section = document.getElementById(screenId);

  return section ? { y: section.getBoundingClientRect().top + window.scrollY, screenId } : null;
};

const getStops = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  return SCREEN_IDS.map(getScreenStop)
    .filter((stop): stop is Stop => stop !== null)
    .map((stop) => ({ ...stop, y: gsap.utils.clamp(0, maxScroll, stop.y) }));
};

const getNearestIndex: ResolveIndex = (stops) => {
  const distance = (index: number) => Math.abs(stops[index].y - window.scrollY);

  return stops.reduce((nearest, _, index) => (distance(index) < distance(nearest) ? index : nearest), 0);
};

const getScreenIndex = (stops: Stop[], screenId: ScreenId) => stops.findIndex((stop) => stop.screenId === screenId);

const toNext: ResolveIndex = (stops) => getNearestIndex(stops) + 1;
const toPrev: ResolveIndex = (stops) => getNearestIndex(stops) - 1;
const toFirst: ResolveIndex = () => 0;
const toLast: ResolveIndex = (stops) => stops.length - 1;
const toScreen =
  (screenId: ScreenId): ResolveIndex =>
  (stops) =>
    getScreenIndex(stops, screenId);

const KEY_TARGETS: Record<string, ResolveIndex> = {
  ArrowDown: toNext,
  PageDown: toNext,
  ArrowUp: toPrev,
  PageUp: toPrev,
  Home: toFirst,
  End: toLast,
};

const getHashScreen = (): ScreenId | null => {
  const screenId = LINK_SCREENS[window.location.hash] ?? null;

  return screenId === 'hero' ? null : screenId;
};

const syncHash = (screenId: ScreenId) => {
  const hash = screenId === 'hero' ? '' : `#${screenId}`;

  if (hash === window.location.hash) return;

  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search + hash);
};

const isIgnoredInDialog = (event: Event) => {
  const dialog = getOpenDialog();
  const { target } = event;

  return Boolean(dialog && target instanceof Node && target !== dialog && dialog.contains(target));
};

const hasModifier = (event: KeyboardEvent) => event.metaKey || event.ctrlKey || event.altKey;

const isKeyForTarget = (event: KeyboardEvent) => {
  const { target } = event;

  if (!(target instanceof Element)) return false;

  return Boolean(target.closest(TYPING_TARGETS) ?? (event.key === ' ' && target.closest(ACTIVATABLE_TARGETS)));
};

const shouldSkipKey = (event: KeyboardEvent) => hasModifier(event) || Boolean(getOpenDialog()) || isKeyForTarget(event);

const getKeyTarget = (event: KeyboardEvent): ResolveIndex | undefined => {
  if (event.key === ' ') return event.shiftKey ? toPrev : toNext;

  return KEY_TARGETS[event.key];
};

const listen = <E extends Event>(target: EventTarget, type: string, handler: (event: E) => void) => {
  const listener = handler as EventListener;

  target.addEventListener(type, listener);

  return () => target.removeEventListener(type, listener);
};

const createFullpage = (duration: number, isEnabled: boolean) => {
  const root = document.documentElement;
  const prevScrollBehavior = root.style.scrollBehavior;
  const prevScrollRestoration = window.history.scrollRestoration;
  let isLocked = false;
  let isMoving = false;
  let tween: gsap.core.Tween | null = null;
  let pendingScreen = getHashScreen();

  const quietTimer = gsap
    .delayedCall(QUIET_PERIOD, () => {
      isLocked = false;
    })
    .pause();

  root.style.scrollBehavior = 'auto';
  window.history.scrollRestoration = 'manual';

  const isBlocked = () => !isEnabled || isLocked || Boolean(getOpenDialog());

  const jumpTo = (stop: Stop) => {
    window.scrollTo(0, stop.y);
    syncHash(stop.screenId);
  };

  const animateTo = (stop: Stop) => {
    isLocked = true;
    isMoving = true;
    tween?.kill();
    tween = gsap.to(window, {
      scrollTo: { y: stop.y, autoKill: false },
      duration,
      ease: TRANSITION_EASE,
      onComplete: () => {
        isMoving = false;
        syncHash(stop.screenId);
        quietTimer.restart(true);
      },
    });
  };

  const goTo = (resolveIndex: ResolveIndex) => {
    if (isBlocked()) return;

    const stops = getStops();
    const index = resolveIndex(stops);
    const stop: Stop | undefined = stops[index];

    if (!stop || index === getNearestIndex(stops)) return;

    animateTo(stop);
  };

  const extendQuiet = () => {
    if (isLocked && !isMoving) quietTimer.restart(true);
  };

  const alignPending = (stops: Stop[]) => {
    const index = pendingScreen ? getScreenIndex(stops, pendingScreen) : -1;

    if (index < 0) return false;

    pendingScreen = null;
    jumpTo(stops[index]);

    return true;
  };

  const align = () => {
    if (isMoving) return;

    const stops = getStops();

    if (!stops.length || alignPending(stops)) return;

    const stop = stops[getNearestIndex(stops)];

    if (Math.abs(stop.y - window.scrollY) > ALIGN_TOLERANCE) jumpTo(stop);
  };

  const onClick = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    const screenId = link ? LINK_SCREENS[link.getAttribute('href') ?? ''] : undefined;

    if (!screenId) return;

    event.preventDefault();
    goTo(toScreen(screenId));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const resolveIndex = shouldSkipKey(event) ? undefined : getKeyTarget(event);

    if (!resolveIndex) return;

    event.preventDefault();
    goTo(resolveIndex);
  };

  const onScreenRequest = (event: CustomEvent<ScreenRequestDetail>) => {
    const { id } = event.detail;

    if (!isScreenId(id)) return;

    event.preventDefault();
    goTo(toScreen(id));
  };

  const observer = Observer.create({
    target: window,
    type: 'wheel,touch',
    wheelSpeed: INVERT_WHEEL,
    tolerance: GESTURE_TOLERANCE,
    preventDefault: true,
    ignoreCheck: isIgnoredInDialog,
    onUp: () => goTo(toNext),
    onDown: () => goTo(toPrev),
    onChange: extendQuiet,
  });

  const resizeObserver = new ResizeObserver(align);

  resizeObserver.observe(document.body);

  const unsubscribers = [
    listen(window, 'resize', align),
    listen(document, 'click', onClick),
    listen(window, 'keydown', onKeyDown),
    listen(window, SCREEN_REQUEST, onScreenRequest),
  ];

  align();

  return () => {
    observer.kill();
    quietTimer.kill();
    tween?.kill();
    resizeObserver.disconnect();
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    root.style.scrollBehavior = prevScrollBehavior;
    window.history.scrollRestoration = prevScrollRestoration;
  };
};

const useFullpageScroll = ({ isEnabled = true }: UseFullpageScrollOptions = {}) => {
  const { lang } = useParams<{ lang: Lang }>();

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add({ desktop: DESKTOP_QUERY, reduce: REDUCE_QUERY }, (ctx) => {
      if (!ctx.conditions?.desktop) return;

      return createFullpage(ctx.conditions.reduce ? 0 : TRANSITION_DURATION, isEnabled);
    });

    return () => mm.revert();
  }, [lang, isEnabled]);
};

export { useFullpageScroll };
