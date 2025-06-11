import { create } from "zustand";

type ModalType = "actionSheet" | "dialog" | null;

interface ModalState {
  modalType: ModalType;
  isVisible: boolean;

  // Actions
  openActionSheet: () => void;
  openDialog: () => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modalType: null,
  isVisible: false,

  openActionSheet: () => set({ modalType: "actionSheet", isVisible: true }),

  openDialog: () => set({ modalType: "dialog", isVisible: true }),

  closeModal: () => {
    set({ isVisible: false });
    // 애니메이션 완료 후 modalType 리셋
    setTimeout(() => set({ modalType: null }), 300);
  },
}));
