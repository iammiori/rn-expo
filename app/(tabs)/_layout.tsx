import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TabLayout() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isModalVisible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isModalVisible]);

  const handleAddPress = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsModalVisible(false);
    });
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#2a2a2a",
            borderTopWidth: 0,
            height: 90,
            paddingBottom: 25,
            paddingTop: 10,
          },
          tabBarActiveTintColor: "#4A9EFF",
          tabBarInactiveTintColor: "#666666",
          tabBarShowLabel: false,
          tabBarIconStyle: {
            marginTop: 5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="folder-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            tabBarButton: () => <View style={{ flex: 1 }} />,
          }}
        />

        <Tabs.Screen
          name="my"
          options={{
            title: "바보임에틀림없어",
            tabBarIcon: ({ color }) => (
              <Ionicons name="ellipsis-horizontal" size={24} color={color} />
            ),
          }}
        />
      </Tabs>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>새로 만들기</Text>

            <TouchableOpacity style={styles.actionItem} onPress={closeModal}>
              <Ionicons name="document-outline" size={24} color="#4A9EFF" />
              <Text style={styles.actionText}>새 작업</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={closeModal}>
              <Ionicons name="folder-outline" size={24} color="#4A9EFF" />
              <Text style={styles.actionText}>새 프로젝트</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={closeModal}>
              <Ionicons name="camera-outline" size={24} color="#4A9EFF" />
              <Text style={styles.actionText}>사진 촬영</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, styles.cancelButton]}
              onPress={closeModal}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 30, // 일단은 휴리스틱, safe area 고려해야할듯
    left: "50%",
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#666666",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#2a2a2a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    minHeight: 300,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#666",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#333",
    borderRadius: 12,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 16,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#444",
    marginTop: 10,
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
});
