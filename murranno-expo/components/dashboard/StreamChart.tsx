import React, { useState } from 'react';
import { ChartSkeleton } from '@/components/states/StateViews';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import type { StreamDataPoint } from '@/hooks/useStreamAnalytics';

/** Uses every reported data point; tapping the plot reveals its value. */
export function StreamChart({ data, loading = false }: { data: StreamDataPoint[]; loading?: boolean }) {
    const { colors } = useTheme();
    const [width, setWidth] = useState(300);
    const [selected, setSelected] = useState<number | null>(null);
    const height = 180, left = 36, right = 12, top = 16, bottom = 28;
    const plotWidth = Math.max(width - left - right, 1), plotHeight = height - top - bottom;
    const max = Math.max(...data.map(d => d.streams), 1);
    const ceiling = Math.max(4, Math.ceil(max / 4) * 4);
    const timestamps = data.map(d => new Date(d.date).getTime());
    const first = timestamps[0] ?? 0;
    const span = (timestamps[timestamps.length - 1] ?? first) - first;
    const x = (i: number) => left + (span > 0 ? (timestamps[i] - first) / span : 0.5) * plotWidth;
    const inspect = (touchX: number) => {
        const target = first + Math.max(0, Math.min(1, (touchX - left) / plotWidth)) * span;
        setSelected(timestamps.reduce((best, timestamp, i) => Math.abs(timestamp - target) < Math.abs(timestamps[best] - target) ? i : best, 0));
    };
    const y = (n: number) => top + plotHeight * (1 - n / ceiling);
    const point = selected !== null ? data[selected] : undefined;
    const compact = (n: number) => n >= 1000000 ? `${+(n / 1000000).toFixed(1)}m` : n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : `${Math.round(n)}`;
    return <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
        {loading ? <ChartSkeleton /> : !data.length ? <View style={s.placeholder}><Text style={{ color: colors.mutedForeground }}>No stream reports for this period yet.</Text></View> : <>
            <View style={s.selection}><Text accessibilityLiveRegion="polite" style={{ color: colors.mutedForeground, fontSize: 12 }}>{point ? `${point.label} · ${point.streams.toLocaleString()} streams` : 'Tap the chart to inspect a day'}</Text></View>
            <Pressable accessibilityRole="adjustable" accessibilityLabel="Daily stream chart" accessibilityValue={{ text: point ? `${point.label}: ${point.streams} streams` : `${data.length} reported days` }} accessibilityActions={[{ name: 'increment', label: 'Next day' }, { name: 'decrement', label: 'Previous day' }]} onAccessibilityAction={e => setSelected(i => Math.max(0, Math.min(data.length - 1, (i ?? 0) + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))} onPress={e => inspect(e.nativeEvent.locationX)}>
                <Svg width={width} height={height}>
                    {[0, 1, 2, 3, 4].map(i => <React.Fragment key={i}>
                        <Line x1={left} y1={y(ceiling * i / 4)} x2={width - right} y2={y(ceiling * i / 4)} stroke={colors.border} strokeDasharray={i ? '3 5' : undefined} />
                        <SvgText x={left - 8} y={y(ceiling * i / 4) + 4} fill={colors.mutedForeground} fontSize={10} textAnchor="end">{compact(ceiling * i / 4)}</SvgText>
                    </React.Fragment>)}
                    {data.length > 1 && <Path d={data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.streams)}`).join(' ')} stroke={colors.primary} strokeWidth={2.5} fill="none" />}
                    {data.length === 1 && <Circle cx={x(0)} cy={y(data[0].streams)} r={4} fill={colors.primary} />}
                    {point && selected !== null && <><Line x1={x(selected)} y1={top} x2={x(selected)} y2={height - bottom} stroke={colors.mutedForeground} strokeDasharray="3 4" /><Circle cx={x(selected)} cy={y(point.streams)} r={5} fill={colors.primary} stroke={colors.background} strokeWidth={2} /></>}
                    {[...new Set([0, Math.floor((data.length - 1) / 2), data.length - 1])].map((i, position, all) => <SvgText key={i} x={x(i)} y={height - 6} fill={colors.mutedForeground} fontSize={10} textAnchor={all.length === 1 ? 'middle' : position === 0 ? 'start' : position === all.length - 1 ? 'end' : 'middle'}>{data[i].label}</SvgText>)}
                </Svg>
            </Pressable>
        </>}
    </View>;
}
const s = StyleSheet.create({ placeholder: { height: 200, alignItems: 'center', justifyContent: 'center' }, selection: { minHeight: 24, alignItems: 'flex-end' } });
