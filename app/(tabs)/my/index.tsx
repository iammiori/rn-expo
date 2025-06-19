import * as Haptics from "expo-haptics";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// 공통 상수
const ITEM_HEIGHT = 60;

// 🔧 정밀도 문제 해결을 위한 유틸리티 함수들
const safeFloor = (value) => {
  "worklet";
  // 매우 작은 값은 0으로 처리
  if (Math.abs(value) < 0.001) return 0;
  return Math.floor(value + 0.001); // 반올림 오차 보정
};

const safeDivide = (a, b) => {
  "worklet";
  if (b === 0) return 0;
  const result = a / b;
  // NaN이나 Infinity 체크
  if (!isFinite(result)) return 0;
  return result;
};

const clampIndex = (value, min, max) => {
  "worklet";
  if (!isFinite(value) || isNaN(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
};

// 안전한 Haptic 피드백 함수들
let lastHapticTime = 0;
const HAPTIC_THROTTLE = 50; // 50ms 제한

const hapticMedium = () => {
  try {
    const now = Date.now();
    if (now - lastHapticTime > HAPTIC_THROTTLE) {
      lastHapticTime = now;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch((error) => {
        console.warn("Haptic feedback failed:", error);
      });
    }
  } catch (error) {
    console.warn("Haptic medium error:", error);
  }
};

const hapticSelection = () => {
  try {
    const now = Date.now();
    if (now - lastHapticTime > HAPTIC_THROTTLE) {
      lastHapticTime = now;
      Haptics.selectionAsync().catch((error) => {
        console.warn("Haptic selection failed:", error);
      });
    }
  } catch (error) {
    console.warn("Haptic selection error:", error);
  }
};

// 타입 정의
type DraggableItemProps = {
  item: any;
  index: number;
  itemHeight?: number;
  listLength: number;
  reorderData: (fromIndex: number, toIndex: number) => void;
  draggingIndex: SharedValue<number>;
  targetIndex: SharedValue<number>;
};

// 에러 바운더리 제거 - 현재 앱에서는 불필요

// 🔧 개선된 DraggableItem - 정밀도 안전 버전
const DraggableItemBase = memo(
  ({
    item,
    index,
    itemHeight = ITEM_HEIGHT,
    listLength,
    reorderData,
    draggingIndex,
    targetIndex,
  }: DraggableItemProps) => {
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const zIndex = useSharedValue(0);
    const opacity = useSharedValue(1);

    const isDraggingRef = useRef(false);

    // 🚨 정밀도 안전 계산
    const positionOffset = useDerivedValue(() => {
      const currentDragging = draggingIndex.value;
      const currentTarget = targetIndex.value;

      // 정수 체크 추가
      if (
        currentDragging === -1 ||
        currentDragging === index ||
        currentTarget === -1 ||
        !Number.isInteger(currentDragging) ||
        !Number.isInteger(currentTarget)
      ) {
        return 0;
      }

      const minIndex = Math.min(currentDragging, currentTarget);
      const maxIndex = Math.max(currentDragging, currentTarget);

      if (index >= minIndex && index <= maxIndex && index !== currentDragging) {
        // 정확한 정수 값 반환
        return currentDragging < currentTarget ? -itemHeight : itemHeight;
      }

      return 0;
    }, [index, itemHeight]);

    const panGesture = Gesture.Pan()
      .onStart(() => {
        "worklet";
        if (draggingIndex.value !== -1 && draggingIndex.value !== index) {
          return;
        }

        isDraggingRef.current = true;
        scale.value = withSpring(1.08);
        zIndex.value = 1000;
        opacity.value = 1;
        draggingIndex.value = index;
        targetIndex.value = index;
        runOnJS(hapticMedium)();
      })
      .onUpdate((event) => {
        "worklet";
        if (draggingIndex.value !== index) return;

        // 🚨 정밀도 안전 계산
        const translation = Math.round(event.translationY * 100) / 100; // 소수점 2자리로 제한
        translateY.value = translation;

        // 안전한 인덱스 계산
        const currentY = index * itemHeight + translation;
        const centerY = currentY + itemHeight * 0.5;

        // 정밀도 안전 나눗셈 및 인덱스 계산
        const rawIndex = safeDivide(centerY, itemHeight);
        const newTargetIndex = clampIndex(safeFloor(rawIndex), 0, listLength - 1);

        // 정수 값이고 실제로 변경될 때만 업데이트
        if (
          Number.isInteger(newTargetIndex) &&
          newTargetIndex !== targetIndex.value &&
          newTargetIndex >= 0 &&
          newTargetIndex < listLength
        ) {
          targetIndex.value = newTargetIndex;
        }
      })
      .onEnd(() => {
        "worklet";
        if (draggingIndex.value !== index) return;

        const finalIndex = targetIndex.value;
        const initialIndex = index;

        isDraggingRef.current = false;

        // 애니메이션 값 정확히 0으로 리셋
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        scale.value = withSpring(1);

        // 정수 인덱스 검증 후 데이터 업데이트
        if (
          Number.isInteger(finalIndex) &&
          Number.isInteger(initialIndex) &&
          finalIndex !== initialIndex &&
          finalIndex >= 0 &&
          finalIndex < listLength &&
          initialIndex >= 0 &&
          initialIndex < listLength
        ) {
          runOnJS(reorderData)(initialIndex, finalIndex);
          runOnJS(hapticSelection)();
        }

        // 정확한 상태 리셋
        translateY.value = withSpring(0, undefined, (finished) => {
          "worklet";
          if (finished) {
            draggingIndex.value = -1;
            targetIndex.value = -1;
            zIndex.value = 0; // withTiming 제거하고 직접 할당
          }
        });
      })
      .runOnJS(false);

    // 🚨 정밀도 안전 스타일 계산
    const animatedStyle = useAnimatedStyle(() => {
      "worklet";
      const isDragging = draggingIndex.value === index;

      // 정확한 변환 값 계산
      let translateYValue = 0;
      if (isDragging) {
        translateYValue = Math.round(translateY.value * 100) / 100; // 소수점 제한
      } else {
        translateYValue = Math.round(positionOffset.value * 100) / 100;
      }

      // 변환값이 유효한지 검증
      if (!isFinite(translateYValue)) {
        translateYValue = 0;
      }

      return {
        transform: [
          { translateY: translateYValue },
          { scale: Math.max(0.8, Math.min(1.2, scale.value)) }, // scale 범위 제한
        ],
        zIndex: Math.round(zIndex.value), // 정수로 강제 변환
        opacity: Math.max(0, Math.min(1, opacity.value)), // 0-1 범위 강제
        elevation: isDragging ? 12 : 0,
        shadowColor: isDragging ? "#000" : "transparent",
        shadowOpacity: isDragging ? 0.3 : 0,
        shadowRadius: isDragging ? 6 : 0,
      };
    }, [positionOffset]);

    const placeholderStyle = useAnimatedStyle(() => {
      "worklet";
      const showPlaceholder =
        draggingIndex.value >= 0 &&
        targetIndex.value === index &&
        draggingIndex.value !== index &&
        Number.isInteger(targetIndex.value) &&
        targetIndex.value < listLength;

      const height = showPlaceholder ? itemHeight : 0;
      const opacity = showPlaceholder ? 1 : 0;

      return {
        height: withTiming(height, { duration: 200 }),
        opacity: withTiming(opacity, { duration: 200 }),
        backgroundColor: "#2a2a2a",
        borderRadius: 8,
        marginBottom: 0,
      };
    });

    // 컴포넌트 정리
    useEffect(() => {
      return () => {
        if (isDraggingRef.current) {
          runOnJS(() => {
            draggingIndex.value = -1;
            targetIndex.value = -1;
          })();
        }
      };
    }, []);

    return (
      <>
        <Animated.View style={placeholderStyle} />
        <GestureDetector gesture={panGesture}>
          <AnimatedPressable
            style={[styles.draggableItem, animatedStyle]}
            onPress={() => {
              if (!isDraggingRef.current) {
                console.log("Pressed:", item.title);
              }
            }}
          >
            <View style={styles.itemContent}>
              <View style={styles.leftContent}>
                <View style={[styles.checkbox, { borderColor: item.color }]}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
              </View>
              <View style={styles.rightContent}>
                {item.date ? <Text style={styles.dateText}>{item.date}</Text> : null}
                <Text style={styles.menuIcon}>≡</Text>
                {item.hasFlag && <Text style={styles.flagIcon}>🚩</Text>}
              </View>
            </View>
          </AnimatedPressable>
        </GestureDetector>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.index === nextProps.index &&
      prevProps.listLength === nextProps.listLength
    );
  }
);

// DraggableItem - 에러 바운더리 제거
const DraggableItem = DraggableItemBase;

DraggableItem.displayName = "DraggableItem";

const InboxScreen = () => {
  const overdueData = [
    {
      id: "1",
      title: "task title",
      date: "28 Jul",
      color: "#FF6B6B",
      hasFlag: false,
    },
    {
      id: "2",
      title: "task title",
      date: "1 mar",
      color: "#4ECDC4",
      hasFlag: true,
    },
    {
      id: "3",
      title: "Figma ipsum component varian...",
      date: "1 mar",
      color: "#9B59B6",
      hasFlag: true,
    },
  ];

  const [regularData, setRegularData] = useState([
    {
      id: "4",
      title: "task title",
      date: "",
      color: "#666",
      hasFlag: false,
    },
    {
      id: "5",
      title: "텍스트 사이즈 16",
      date: "",
      color: "#3498DB",
      hasFlag: true,
    },
    {
      id: "6",
      title: "텍스트 사이즈 16",
      date: "",
      color: "#4ECDC4",
      hasFlag: true,
    },
    {
      id: "7",
      title: "Figma ipsum component variant main lo...",
      date: "",
      color: "#9B59B6",
      hasFlag: false,
    },
    {
      id: "8",
      title: "Figma ipsum component variant main lay...",
      date: "",
      color: "#E67E22",
      hasFlag: false,
    },
    {
      id: "9",
      title: "task sample task sample task sample",
      date: "",
      color: "#F1C40F",
      hasFlag: false,
    },
    {
      id: "10",
      title: "task sample task sample task sample",
      date: "",
      color: "#F1C40F",
      hasFlag: false,
    },
  ]);

  const renderItem = ({ item }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.item,
          {
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={() => console.log("Pressed:", item.title)}
      >
        <View style={styles.itemContent}>
          <View style={styles.leftContent}>
            <View style={[styles.checkbox, { borderColor: item.color }]}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
          <View style={styles.rightContent}>
            {item.date ? <Text style={styles.dateText}>{item.date}</Text> : null}
            <Text style={styles.menuIcon}>≡</Text>
            {item.hasFlag && <Text style={styles.flagIcon}>🚩</Text>}
          </View>
        </View>
      </Pressable>
    );
  };

  const OverdueSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Overdue 3</Text>
        <Text style={styles.chevron}>⌄</Text>
      </View>
      <FlatList
        data={overdueData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={null}
      />
    </View>
  );

  const RegularSection = () => {
    // SharedValue를 ref로 관리하여 재생성 방지
    const draggingIndexRef = useRef(useSharedValue(-1));
    const targetIndexRef = useRef(useSharedValue(-1));

    const draggingIndex = draggingIndexRef.current;
    const targetIndex = targetIndexRef.current;

    // 드래그 상태 추적
    const isReorderingRef = useRef(false);

    // 🚨 안전한 데이터 재정렬 함수
    const reorderData = useCallback(
      (fromIndex, toIndex) => {
        // 정수 검증 추가
        if (
          !Number.isInteger(fromIndex) ||
          !Number.isInteger(toIndex) ||
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= regularData.length ||
          toIndex >= regularData.length ||
          isReorderingRef.current
        ) {
          console.warn("Invalid reorder indices:", {
            fromIndex,
            toIndex,
            length: regularData.length,
          });
          return;
        }

        isReorderingRef.current = true;

        try {
          setRegularData((prev) => {
            if (fromIndex >= prev.length || toIndex >= prev.length) {
              return prev;
            }

            const arr = [...prev];
            const [item] = arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, item);
            return arr;
          });
        } catch (error) {
          console.error("Reorder data error:", error);
        } finally {
          // 플래그 리셋을 약간 지연시켜 안정성 확보
          setTimeout(() => {
            isReorderingRef.current = false;
          }, 100);
        }
      },
      [regularData.length]
    );

    // 전역 상태 리셋 함수
    const resetDragState = useCallback(() => {
      "worklet";
      draggingIndex.value = -1;
      targetIndex.value = -1;
    }, [draggingIndex, targetIndex]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
      return () => {
        runOnJS(resetDragState)();
        isReorderingRef.current = false;
      };
    }, [resetDragState]);

    const renderDraggableItem = useCallback(
      ({ item, index }) => {
        // 아이템과 인덱스 유효성 검사
        if (!item || index < 0 || index >= regularData.length) {
          return null;
        }

        return (
          <DraggableItem
            key={item.id}
            item={item}
            index={index}
            itemHeight={ITEM_HEIGHT}
            listLength={regularData.length}
            reorderData={reorderData}
            draggingIndex={draggingIndex}
            targetIndex={targetIndex}
          />
        );
      },
      [regularData.length, reorderData, draggingIndex, targetIndex]
    );

    // 키 추출 함수 - 안전성 강화
    const keyExtractor = useCallback((item, index) => {
      return item?.id || `fallback-${index}`;
    }, []);

    return (
      <View style={styles.sectionContainer}>
        <FlatList
          data={regularData}
          renderItem={renderDraggableItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          // 성능 최적화 설정
          getItemLayout={(data, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          removeClippedSubviews={true}
          initialNumToRender={8} // 초기 렌더링 수
          maxToRenderPerBatch={3} // 배치 크기
          windowSize={6} // 윈도우 크기
          // 에러 방지 설정
          ItemSeparatorComponent={null}
          extraData={regularData.length} // 데이터 변경 감지
          // 스크롤 이벤트 최적화
          scrollEventThrottle={16}
          // 메모리 관리
          onEndReachedThreshold={0.1}
        />
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2a2a2a"
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox ⌄</Text>
      </View>

      <FlatList
        data={[{ key: "overdue" }, { key: "regular" }]}
        renderItem={({ item }) => {
          if (item.key === "overdue") {
            return <OverdueSection />;
          }
          return <RegularSection />;
        }}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2a2a2a",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  sectionContainer: {
    backgroundColor: "#3a3a3a",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    overflow: "visible",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#2a2a2a",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: -12,
    marginHorizontal: -8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "500",
  },
  chevron: {
    color: "#888",
    fontSize: 16,
  },
  sectionSeparator: {
    height: 16,
  },
  item: {
    borderRadius: 8,
    marginBottom: 0,
  },
  draggableItem: {
    borderRadius: 8,
    marginBottom: 0,
    backgroundColor: "#3a3a3a",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "#888",
    fontSize: 14,
    marginRight: 8,
  },
  menuIcon: {
    color: "#888",
    fontSize: 16,
    marginRight: 8,
  },
  flagIcon: {
    fontSize: 14,
  },
});

export default InboxScreen;
