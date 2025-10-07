import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create(
  (
    set: {
      (partial: unknown, replace?: false | undefined): void;
      (state: unknown, replace: true): void;
    },
    get
  ) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
      set({ isUsersLoading: true });
      try {
        const res = await axiosInstance.get("/messages/users");
        set({ users: res.data });
      } catch (e: unknown) {
        console.log("Error in getUsers: ", e);
        toast.error("Failed to load users");
      } finally {
        set({ isUsersLoading: false });
      }
    },

    getMessages: async (userId: string) => {
      set({ isMessagesLoading: true });
      try {
        const res = await axiosInstance.get(`/messages/${userId}`);
        set({ messages: res.data });
      } catch (e: unknown) {
        console.log("Error in getMessages: ", e);
        toast.error("Failed to load messages");
      } finally {
        set({ isMessagesLoading: false });
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendMessage: async (messageData: any) => {
      //@ts-expect-error returning unknown type
      const { selectedUser, messages } = get();
      try {
        const res = await axiosInstance.post(
          `/messages/send/${selectedUser._id}`,
          messageData
        );
        set({ messages: [...messages, res.data] });
      } catch (e: unknown) {
        //@ts-expect-error cuz it unkwon
        toast.error(e?.response?.data?.message);
      }
    },

    setSelectedUser: (userId: string) => {
      set({ selectedUser: userId });
    },

    subscribeToMessages: () => {
      //@ts-expect-error returning unkown type
      const { selectedUser } = get();
      if (!selectedUser) return;
      //@ts-expect-error returning unkown type
      const socket = useAuthStore.getState().socket;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.on("newMessage", (newMessage: any) => {
        const isMessageSentFromSelectedUser =
          newMessage.senderId === selectedUser._id;
        if (!isMessageSentFromSelectedUser) return;

        set({
          //@ts-expect-error returning unkown type
          messages: [...get().messages, newMessage],
        });
      });
    },

    unsubscribeFromMessages: () => {
      //@ts-expect-error returning unkown type
      const socket = useAuthStore.getState().socket;
      socket.off("newMessage");
    },
  })
);
