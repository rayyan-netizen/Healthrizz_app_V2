import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ImageBackground, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { CANONICAL_SESSIONS } from '@core/map/data/canonicalSessions';
import { SUBMAP_NODE_POSITIONS } from '@core/map/data/submapNodePositions';
import { fetchNodeCompletion } from '@core/map/progress';
import { useChildStore } from '@stores/childStore';
import { submapFor, rizzlerForTopic } from '@lib/assets';
import { TEXT, BG, SPACING, FONT, BORDERS, SHADOW, SECONDARY } from '@lib/theme';
import { hapticLight } from '@lib/haptic';

type NodeState = 'available' | 'locked' | 'completed';

interface NodeMarkerProps {
  icon: string;
  title: string;
  state: NodeState;
  positionPct: { x: number; y: number };
  onPress: () => void;
}

function NodeMarker({ icon, title, state, positionPct, onPress }: NodeMarkerProps) {
  const locked = state === 'locked';
  const completed = state === 'completed';
  return (
    <View style={[styles.markerWrap, { left: `${positionPct.x}%`, top: `${positionPct.y}%` }]}>
      <Pressable
        onPress={() => {
          hapticLight();
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${locked ? 'locked' : completed ? 'completed' : 'available'}`}
        style={({ pressed }) => [styles.markerPressable, { opacity: pressed ? 0.85 : 1 }]}
      >
        <View
          style={[
            styles.marker,
            { backgroundColor: locked ? '#9CA3AF' : completed ? SECONDARY[500] : '#FFFFFF' },
          ]}
        >
          <Text style={styles.markerIcon}>{locked ? '🔒' : completed ? '✓' : icon}</Text>
        </View>
        <View style={styles.label}>
          <Text style={styles.labelText} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export default function SubMap() {
  const { topicKey } = useLocalSearchParams<{ topicKey: string }>();
  const router = useRouter();
  const childId = useChildStore((s) => s.childId);
  const [completedNodeIds, setCompletedNodeIds] = useState<Set<string>>(new Set());

  const session = CANONICAL_SESSIONS.find((s) => s.topicKey === topicKey);
  const lessonNodeId = `${topicKey}-lesson`;
  const quizNodeId = `${topicKey}-quiz`;
  const gameNodeId = `${topicKey}-game`;

  useFocusEffect(
    useCallback(() => {
      if (!childId || topicKey !== 'water') return;
      void fetchNodeCompletion(childId, [lessonNodeId, quizNodeId, gameNodeId]).then(setCompletedNodeIds);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [childId, topicKey])
  );

  if (!session || topicKey !== 'water') {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.notReadyTitle}>Coming soon!</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back to map</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const lessonDone = completedNodeIds.has(lessonNodeId);
  const quizDone = completedNodeIds.has(quizNodeId);
  const positions = SUBMAP_NODE_POSITIONS[session.topicKey] ?? [
    { x: 25, y: 60 },
    { x: 50, y: 30 },
    { x: 75, y: 60 },
  ];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
          <Text style={styles.title}>{session.sessionTitle}</Text>
          <View style={{ width: 50 }} />
        </View>

        <ImageBackground source={submapFor(session.topicKey)} style={styles.bg} resizeMode="cover">
          <Image source={rizzlerForTopic(session.topicKey)} style={styles.rizzler} resizeMode="contain" />

          <NodeMarker
            icon="📖"
            title="Learn"
            state={lessonDone ? 'completed' : 'available'}
            positionPct={positions[0]}
            onPress={() => router.push(`/lesson/${lessonNodeId}`)}
          />
          <NodeMarker
            icon="📝"
            title="Practice"
            state={!lessonDone ? 'locked' : quizDone ? 'completed' : 'available'}
            positionPct={positions[1]}
            onPress={() => {
              if (!lessonDone) {
                Alert.alert('Finish the lesson first!', 'Complete Learn before you try the quiz.');
                return;
              }
              router.push(`/quiz/${lessonNodeId}`);
            }}
          />
          <NodeMarker
            icon="🎮"
            title="Play"
            state={!quizDone ? 'locked' : completedNodeIds.has(gameNodeId) ? 'completed' : 'available'}
            positionPct={positions[2]}
            onPress={() => {
              if (!quizDone) {
                Alert.alert('Finish Practice first!', 'Pass the quiz before you unlock the game.');
                return;
              }
              router.push({ pathname: '/game/[gameType]', params: { gameType: 'quiz-battle', topicKey } });
            }}
          />
        </ImageBackground>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG.warm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.MD },
  notReadyTitle: { fontFamily: FONT.brand, fontSize: 22, color: TEXT.DEFAULT },
  backBtn: { padding: SPACING.MD },
  backBtnText: { fontFamily: FONT.bodyBold, fontSize: 16, color: TEXT.tertiary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
  },
  back: { fontFamily: FONT.bodyBold, color: TEXT.tertiary, fontSize: 16 },
  title: { fontFamily: FONT.brand, fontSize: 18, color: TEXT.DEFAULT },
  bg: { flex: 1 },
  rizzler: {
    position: 'absolute',
    top: SPACING.MD,
    left: SPACING.MD,
    width: 72,
    height: 72,
  },
  markerWrap: {
    position: 'absolute',
    alignItems: 'center',
    width: 100,
    transform: [{ translateX: -50 }, { translateY: -28 }],
  },
  markerPressable: { alignItems: 'center' },
  marker: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.NODE,
  },
  markerIcon: { fontSize: 24 },
  label: {
    backgroundColor: '#FFFFFFEE',
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
    borderRadius: BORDERS.RADIUS.FULL,
    marginTop: 4,
    maxWidth: 100,
  },
  labelText: {
    fontFamily: FONT.bodyBold,
    fontSize: 11,
    color: TEXT.DEFAULT,
    textAlign: 'center',
  },
});
