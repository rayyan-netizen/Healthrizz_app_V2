import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { CANONICAL_SESSIONS, DEFAULT_START_SESSION, type TopicKey } from '@core/map/data/canonicalSessions';
import { ASSETS } from '@lib/assets';
import { TEXT, BG, SPACING, FONT, BORDERS, SHADOW } from '@lib/theme';
import { hapticLight } from '@lib/haptic';
import { useReducedMotion } from '@lib/useReducedMotion';

const MAP_ASPECT = 800 / 322;
const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCREEN = Dimensions.get('window');

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

interface IslandMarkerProps {
  icon: string;
  title: string;
  subtext: string;
  color: string;
  positionPct: { x: number; y: number };
  isCurrent: boolean;
  onPress: () => void;
}

function IslandMarker({ icon, title, subtext, color, positionPct, isCurrent, onPress }: IslandMarkerProps) {
  const pulse = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (isCurrent && !reducedMotion) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 750, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 750, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
    } else {
      pulse.value = 1;
    }
  }, [isCurrent, pulse, reducedMotion]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.markerWrap,
        { left: `${positionPct.x}%`, top: `${positionPct.y}%` },
        animStyle,
      ]}
    >
      <Pressable
        onPress={() => {
          hapticLight();
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${subtext}`}
        testID={`island-${title.toLowerCase().replace(/\s+/g, '-')}`}
        style={({ pressed }) => [styles.markerPressable, { opacity: pressed ? 0.85 : 1 }]}
      >
        <View
          style={[
            styles.marker,
            { backgroundColor: color, borderColor: '#FFFFFF' },
            isCurrent && SHADOW.GLOW_PRIMARY,
          ]}
        >
          <Text style={styles.markerIcon}>{icon}</Text>
        </View>
        <View style={styles.label}>
          <Text style={styles.labelText} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function OverworldMap() {
  const router = useRouter();
  const [container, setContainer] = useState({ width: SCREEN.width, height: SCREEN.height });

  // Map fills the container height at min zoom; width follows the image's
  // aspect ratio, which is wider than the container, so horizontal pan is
  // always available even before the user pinches in.
  const mapHeight = container.height;
  const mapWidth = Math.round(mapHeight * MAP_ASPECT);
  const mapLeft = (container.width - mapWidth) / 2;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const composedGesture = useMemo(() => {
    const boundsFor = (currentScale: number) => {
      'worklet';
      return {
        maxX: Math.max(0, (mapWidth * currentScale - container.width) / 2),
        maxY: Math.max(0, (mapHeight * currentScale - container.height) / 2),
      };
    };

    const pinch = Gesture.Pinch()
      .onUpdate((e) => {
        const nextScale = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
        scale.value = nextScale;
        const { maxX, maxY } = boundsFor(nextScale);
        translateX.value = clamp(translateX.value, -maxX, maxX);
        translateY.value = clamp(translateY.value, -maxY, maxY);
      })
      .onEnd(() => {
        savedScale.value = scale.value;
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      });

    const pan = Gesture.Pan()
      .minDistance(10)
      .onUpdate((e) => {
        const { maxX, maxY } = boundsFor(scale.value);
        translateX.value = clamp(savedTranslateX.value + e.translationX, -maxX, maxX);
        translateY.value = clamp(savedTranslateY.value + e.translationY, -maxY, maxY);
      })
      .onEnd(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      });

    return Gesture.Simultaneous(pinch, pan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapWidth, mapHeight, container.width, container.height]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // No backend progress yet — every island is explorable (canonicalSessions'
  // order is a suggestion, not a lock), so just highlight the recommended
  // start session as "current".
  const currentTopicKey: TopicKey | undefined = CANONICAL_SESSIONS.find(
    (s) => s.sessionNumber === DEFAULT_START_SESSION
  )?.topicKey;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View
          style={styles.mapClip}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setContainer({ width, height });
          }}
        >
          <GestureDetector gesture={composedGesture}>
            <Animated.View
              style={[
                styles.mapStage,
                { width: mapWidth, height: mapHeight, left: mapLeft, top: 0 },
                animatedStyle,
              ]}
            >
              <Image
                source={ASSETS.map.overworld}
                style={{ width: mapWidth, height: mapHeight }}
                resizeMode="cover"
              />
              {CANONICAL_SESSIONS.map((s) => (
                <IslandMarker
                  key={s.topicKey}
                  icon={s.icon}
                  title={s.sessionTitle}
                  subtext={s.subtext}
                  color={s.color}
                  positionPct={s.position}
                  isCurrent={currentTopicKey === s.topicKey}
                  onPress={() => {
                    if (s.topicKey === 'water') {
                      router.push(`/map/${s.topicKey}`);
                    } else {
                      Alert.alert(`${s.icon} ${s.sessionTitle}`, `${s.subtext}\n\nLessons coming soon!`);
                    }
                  }}
                />
              ))}
            </Animated.View>
          </GestureDetector>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG.warm },
  mapClip: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#A8DBED',
  },
  mapStage: {
    position: 'absolute',
  },
  markerWrap: {
    position: 'absolute',
    alignItems: 'center',
    width: 110,
    transform: [{ translateX: -55 }, { translateY: -32 }],
  },
  markerPressable: { alignItems: 'center' },
  marker: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.NODE,
  },
  markerIcon: { fontSize: 28 },
  label: {
    backgroundColor: '#FFFFFFEE',
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
    borderRadius: BORDERS.RADIUS.FULL,
    marginTop: 4,
    maxWidth: 110,
  },
  labelText: {
    fontFamily: FONT.bodyBold,
    fontSize: 11,
    color: TEXT.DEFAULT,
    textAlign: 'center',
  },
});
