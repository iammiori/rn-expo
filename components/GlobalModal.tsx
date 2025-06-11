import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useModalStore } from "../stores/modalStore";

export function GlobalModals() {
  const { modalType, isVisible, closeModal } = useModalStore();
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 애니메이션 로직을 useCallback으로 메모이제이션
  const startSlideAnimation = useCallback(
    (toValue: number, onComplete?: () => void) => {
      Animated.timing(slideAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }).start(onComplete);
    },
    [slideAnim]
  );

  // ✅ useEffect는 항상 최상위에서 호출 (=convention)
  useEffect(() => {
    if (!isVisible || modalType !== "actionSheet") return;

    startSlideAnimation(1);
  }, [isVisible, modalType, startSlideAnimation]);

  const handleClose = useCallback(() => {
    if (modalType === "actionSheet") {
      startSlideAnimation(0, closeModal);
    } else {
      closeModal();
    }
  }, [modalType, startSlideAnimation, closeModal]);

  if (!modalType) return null;

  return (
    <>
      {/* Action Sheet Modal */}
      {modalType === "actionSheet" && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isVisible}
          onRequestClose={handleClose}
        >
          <Pressable style={styles.modalOverlay} onPress={handleClose}>
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

              <TouchableOpacity style={styles.actionItem} onPress={handleClose}>
                <Ionicons name="document-outline" size={24} color="#4A9EFF" />
                <Text style={styles.actionText}>새 작업</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={handleClose}>
                <Ionicons name="folder-outline" size={24} color="#4A9EFF" />
                <Text style={styles.actionText}>새 프로젝트</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={handleClose}>
                <Ionicons name="camera-outline" size={24} color="#4A9EFF" />
                <Text style={styles.actionText}>사진 촬영</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionItem, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
            </Animated.View>
          </Pressable>
        </Modal>
      )}

      {/* Dialog Modal (예시로 추가) */}
      {modalType === "dialog" && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isVisible}
          onRequestClose={handleClose}
        >
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogContent}>
              <Text style={styles.dialogTitle}>알림</Text>
              <Text style={styles.dialogMessage}>
                이것은 예시 다이얼로그입니다.
              </Text>
              <TouchableOpacity
                style={styles.dialogButton}
                onPress={handleClose}
              >
                <Text style={styles.dialogButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Action Sheet Styles
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

  // Dialog Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContent: {
    backgroundColor: "#2a2a2a",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 280,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  dialogMessage: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 24,
  },
  dialogButton: {
    backgroundColor: "#4A9EFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
});
