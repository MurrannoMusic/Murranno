import React, { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle2, Inbox, Lock, SearchX, WifiOff, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { getAppStatus } from '@/lib/appStatus';

/** A button inside a state view: navigate (`to`) or run `onPress`. */
export interface StateAction { label: string; to?: string; onPress?: () => void }
type Tone = 'muted' | 'destructive' | 'warning' | 'success';

function ActionButton({ action, primary }: { action: StateAction; primary?: boolean }) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => (action.to ? router.push(action.to as any) : action.onPress?.())}
      style={({ pressed }) => [s.btn, primary ? { backgroundColor: colors.primary } : { borderWidth: 1, borderColor: colors.border }, pressed && { opacity: 0.8 }]}
    >
      <Text style={[s.btnText, { color: primary ? colors.onPrimary : colors.foreground }]}>{action.label}</Text>
    </Pressable>
  );
}

function StateShell({ icon: Icon, tone = 'muted', title, body, action, secondary, style, children }: {
  icon: LucideIcon; tone?: Tone; title: string; body?: ReactNode; action?: StateAction; secondary?: StateAction; style?: ViewStyle; children?: ReactNode;
}) {
  const { colors } = useTheme();
  const color = tone === 'muted' ? colors.mutedForeground : colors[tone];
  return (
    <View accessibilityRole={tone === 'destructive' ? 'alert' : undefined} style={[s.shell, style]}>
      <View style={[s.iconWrap, { backgroundColor: tone === 'muted' ? colors.secondary : `${color}1f` }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={[s.title, { color: colors.foreground }]}>{title}</Text>
      {body ? (typeof body === 'string' ? <Text style={[s.body, { color: colors.mutedForeground }]}>{body}</Text> : body) : null}
      {children}
      {(action || secondary) && (
        <View style={s.actions}>
          {action && <ActionButton action={action} primary />}
          {secondary && <ActionButton action={secondary} />}
        </View>
      )}
    </View>
  );
}

/** Nothing here yet: say why and offer the next step. */
export const EmptyState = ({ icon = Inbox, title, body, action, secondary, style }: { icon?: LucideIcon; title: string; body?: string; action?: StateAction; secondary?: StateAction; style?: ViewStyle }) =>
  <StateShell icon={icon} title={title} body={body} action={action} secondary={secondary} style={style} />;

export const NoResults = ({ query, onClear, what = 'results' }: { query?: string; onClear?: () => void; what?: string }) =>
  <StateShell icon={SearchX} title={query ? `No ${what} for “${query}”` : `No ${what} match these filters`} body="Check the spelling or try a different search." action={onClear ? { label: 'Clear search', onPress: onClear } : undefined} />;

/** Something failed. Always explain it in plain words and offer a way forward. */
export function ErrorState({ error, title, onRetry, style }: { error?: unknown; title?: string; onRetry?: () => void; style?: ViewStyle }) {
  const info = friendlyError(error);
  return <StateShell icon={info.kind === 'offline' ? WifiOff : info.kind === 'forbidden' ? Lock : AlertTriangle} tone={info.kind === 'offline' ? 'warning' : 'destructive'}
    title={title ?? info.title} body={info.message} style={style} action={onRetry ? { label: 'Try again', onPress: onRetry } : undefined} />;
}

/** Signed in but not allowed here; tell them why and what unlocks it. */
export const PermissionDenied = ({ title = 'You don’t have access to this', body, action = { label: 'Go to dashboard', to: '/app' }, secondary }: { title?: string; body?: string; action?: StateAction; secondary?: StateAction }) =>
  <StateShell icon={Lock} tone="warning" title={title} body={body ?? 'Your account doesn’t include this feature yet.'} action={action} secondary={secondary ?? { label: 'Contact support', to: '/app/support' }} />;

/** A finished action: confirm what happened and what comes next. */
export const SuccessState = ({ title, body, action, secondary, style, children }: { title: string; body?: ReactNode; action?: StateAction; secondary?: StateAction; style?: ViewStyle; children?: ReactNode }) =>
  <StateShell icon={CheckCircle2} tone="success" title={title} body={body} action={action} secondary={secondary} style={style}>{children}</StateShell>;

// ── Skeletons ──
export function Skeleton({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={[{ backgroundColor: colors.secondary, borderRadius: 8, opacity: pulse }, style]} />;
}

export const ListSkeleton = ({ rows = 4, media = true }: { rows?: number; media?: boolean }) => (
  <View accessibilityLabel="Loading" accessibilityState={{ busy: true }} style={{ gap: 16, paddingVertical: 8 }}>
    {Array.from({ length: rows }, (_, i) => (
      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {media && <Skeleton style={{ width: 48, height: 48 }} />}
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton style={{ height: 14, width: '60%' }} />
          <Skeleton style={{ height: 11, width: '35%' }} />
        </View>
      </View>
    ))}
  </View>
);

export const StatSkeleton = ({ count = 2 }: { count?: number }) => (
  <View accessibilityLabel="Loading" style={{ flexDirection: 'row', gap: 12 }}>
    {Array.from({ length: count }, (_, i) => <Skeleton key={i} style={{ flex: 1, height: 84, borderRadius: 14 }} />)}
  </View>
);

export const CardSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <View accessibilityLabel="Loading" style={{ gap: 10, paddingVertical: 8 }}>
    <Skeleton style={{ height: 18, width: '50%' }} />
    {Array.from({ length: lines }, (_, i) => <Skeleton key={i} style={{ height: 12, width: i === lines - 1 ? '70%' : '100%' }} />)}
  </View>
);

export const ChartSkeleton = () => <Skeleton style={{ height: 200, borderRadius: 14 }} />;

/** Full-screen spinner for the rare case a skeleton has no shape to mirror. */
export const ScreenLoader = () => {
  const { colors } = useTheme();
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
};

// ── Error wording ──
export interface FriendlyError { kind: 'offline' | 'timeout' | 'auth' | 'forbidden' | 'notfound' | 'server' | 'validation' | 'unknown'; title: string; message: string }

/** Maps fetch / supabase-js / API errors to words a user can act on. */
export function friendlyError(error: unknown): FriendlyError {
  const e = error as { message?: string; status?: number; context?: { status?: number } } | undefined;
  const status = e?.status ?? e?.context?.status;
  const msg = String(e?.message ?? (typeof error === 'string' ? error : ''));
  if (!getAppStatus().online) return { kind: 'offline', title: 'You’re offline', message: 'Check your internet connection. We’ll reload this when you’re back online.' };
  if (/failed to fetch|network request failed|networkerror|load failed/i.test(msg)) return { kind: 'offline', title: 'Can’t reach Murranno', message: 'Your connection dropped or is very slow. Check your internet and try again.' };
  if (/timeout|timed out|aborted/i.test(msg)) return { kind: 'timeout', title: 'This is taking too long', message: 'Your connection seems slow. Try again in a moment.' };
  if (status === 401 || /jwt|not authenticated|sign in again/i.test(msg)) return { kind: 'auth', title: 'Please sign in again', message: 'Your session ended. Sign in to continue where you left off.' };
  if (status === 403 || /permission|not allowed|forbidden|42501/i.test(msg)) return { kind: 'forbidden', title: 'You don’t have permission', message: msg && !/non-2xx/i.test(msg) ? msg : 'Your account isn’t allowed to do this.' };
  if (status === 404) return { kind: 'notfound', title: 'Not found', message: 'This item may have been removed or the link is wrong.' };
  if (status && status >= 500) return { kind: 'server', title: 'Something went wrong on our side', message: 'It’s not something you did. Please try again in a moment.' };
  if (status && status >= 400 && msg && !/non-2xx/i.test(msg)) return { kind: 'validation', title: 'Please check your details', message: msg };
  return { kind: 'unknown', title: 'Couldn’t load this', message: msg && !/non-2xx/i.test(msg) ? msg : 'Something went wrong. Please try again.' };
}

const s = StyleSheet.create({
  shell: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20, gap: 8 },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  title: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 320 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 12 },
  btn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, minHeight: 44, justifyContent: 'center' },
  btnText: { fontSize: 14, fontWeight: '600' },
});
