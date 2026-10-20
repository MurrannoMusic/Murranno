import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { ServiceIllustration } from './ServiceIllustration';

const slides = [
  { id: 'distribution', title: 'MUSIC\nDISTRIBUTION.', label: 'YOUR SOUND. EVERYWHERE.', body: 'Your music on the platforms your listeners love. One upload, a world of possibilities.', accent: '#a834ad' },
  { id: 'promotion', title: 'MUSIC\nPROMOTION.', label: 'MAKE YOUR NEXT MOVE.', body: 'Reach new listeners with promotion built around your music and the story behind it.', accent: '#7040ad' },
  { id: 'creative', title: 'CREATIVE\nSERVICES.', label: 'LOOK AS GOOD AS YOU SOUND.', body: 'Cover artwork and visualizers that turn your sound into a world people can see.', accent: '#ae7fd8' },
];

export default function Onboarding() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const slideHeight = Math.max(420, height - Math.max(insets.top, 16) - Math.max(insets.bottom, 20) - 44 - 18 - 114);
  const list = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const viewability = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => { if (viewableItems[0]?.index != null) setCurrent(viewableItems[0].index); }).current;
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);
  const goTo = (index: number) => { list.current?.scrollToIndex({ index, animated: !reduceMotion }); };
  const complete = () => router.push('/sign-up');
  return <View style={[s.screen, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 20) }]}>
    <StatusBar style="dark" />
    <View style={s.header}><Image source={require('../../assets/images/logo.png')} style={s.logo} resizeMode="contain" /><Pressable onPress={complete} accessibilityRole="button" style={s.skip}><Text style={s.skipText}>Skip intro</Text></Pressable></View>
    <FlatList ref={list} key={width} data={slides} horizontal pagingEnabled initialScrollIndex={current} showsHorizontalScrollIndicator={false}
      getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      onViewableItemsChanged={onViewable} viewabilityConfig={viewability}
      renderItem={({ item, index }) => <ScrollView style={{ width }} contentContainerStyle={[s.slideScroll, { minHeight: slideHeight }]} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <View style={s.cardTop}><Text style={s.counter}>0{index + 1} / 03</Text></View>
          <Text accessibilityRole="header" style={[s.title, { fontSize: width < 350 ? 19 : 22, lineHeight: width < 350 ? 35 : 40 }]}>{item.title}</Text>
          <Text style={s.body}>{item.body}</Text>
          <View style={[s.illustration, { height: Math.max(240, Math.min(height * .48, 460)), width: Math.min(width, 540) }]}><ServiceIllustration kind={index} accent={item.accent} /></View>
        </View>
      </ScrollView>} />
    <View style={s.footer}>
      <View style={s.footerRow}><View style={s.pagination}>{slides.map((slide, index) => <Pressable key={slide.id} onPress={() => goTo(index)} accessibilityRole="button" accessibilityLabel={`Screen ${index + 1}: ${slide.title.replace('\n', ' ')}`} accessibilityState={{ selected: index === current }} style={s.dotButton}><View style={[s.dot, index === current && s.dotActive]} /></Pressable>)}</View>
        <View style={s.actions}>{current > 0 && <Pressable onPress={() => goTo(current - 1)} accessibilityRole="button" accessibilityLabel="Previous screen" style={s.back}><ArrowLeft size={20} color="#7040ad" /></Pressable>}<Pressable onPress={() => current === 2 ? complete() : goTo(current + 1)} accessibilityRole="button" style={s.next}><Text style={s.nextText}>{current === 2 ? 'GET STARTED' : 'NEXT'}</Text><ArrowRight size={20} color="#fff" /></Pressable></View>
      </View>
      <Pressable onPress={() => router.push('/sign-in')} accessibilityRole="link" style={s.login}><Text style={s.loginText}>Already have an account? <Text style={s.loginLink}>Log in</Text></Text></Pressable>
    </View>
  </View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: { width: '100%', maxWidth: 540, alignSelf: 'center', paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  logo: { width: 145, height: 40 }, skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 }, skipText: { fontSize: 12, fontWeight: '500', color: '#735d7e' },
  slideScroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 6 },
  card: { flexGrow: 1, width: '100%', maxWidth: 500, alignSelf: 'center', paddingHorizontal: 8, paddingTop: 12, backgroundColor: '#fff' },
  cardTop: { flexDirection: 'row', justifyContent: 'flex-end' }, counter: { fontSize: 10, lineHeight: 15, letterSpacing: .6, color: '#8b7a94' },
  title: { fontFamily: 'Boldonse', fontWeight: '400', color: '#211527', letterSpacing: -1, marginTop: 20 },
  illustration: { flexGrow: 1, marginLeft: -28, marginTop: 20 }, body: { fontSize: 14, lineHeight: 24, color: '#64516c', marginTop: 16 },
  footer: { width: '100%', maxWidth: 540, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 12 }, footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pagination: { flexDirection: 'row' }, dotButton: { minWidth: 34, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, dot: { width: 7, height: 7, borderRadius: 20, backgroundColor: '#d9cde4' }, dotActive: { width: 24, backgroundColor: '#7040ad' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 }, back: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' }, next: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20, minHeight: 52, borderRadius: 40, paddingHorizontal: 20, backgroundColor: '#7040ad' }, nextText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  login: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 6 }, loginText: { fontSize: 13, color: '#735d7e' }, loginLink: { fontWeight: '600', color: '#7040ad' },
});
