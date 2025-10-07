import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create(
  (
    set: {
      (partial: unknown, replace?: false | undefined): void;
      (state: unknown, replace: true): void;
    },
    get
  ) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
      try {
        const res = await axiosInstance.get("/auth/check");
        set({ authUser: res.data });
        //@ts-expect-error returning unkown type
        get().connectSocket();
      } catch (e: unknown) {
        console.log("Error in checkAuth: ", e);
        set({ authUser: null });
      } finally {
        set({ isCheckingAuth: false });
      }
    },

    signup: async (data: unknown) => {
      set({ isSigningUp: true });
      try {
        const res = await axiosInstance.post("/auth/signup", data);
        set({ authUser: res.data });
        toast.success("Account created successfully!");
        //@ts-expect-error returning unkown type
        get().connectSocket();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Signup failed");
      } finally {
        set({ isSigningUp: false });
      }
    },

    login: async (data: unknown) => {
      set({ isLoggingIn: true });
      try {
        const res = await axiosInstance.post("/auth/login", data);
        set({ authUser: res.data });
        toast.success("Logged in successfully!");

        //@ts-expect-error returning unkown type
        get().connectSocket();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Login failed");
      } finally {
        set({ isLoggingIn: false });
      }
    },

    logout: async () => {
      try {
        await axiosInstance.post("auth/logout");
        set({ authUser: null });
        toast.success("Logged out successfully");
        //@ts-expect-error returning unkown type
        get().disconnectSocket();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Logging out failed");
      }
    },

    updateProfile: async (data: unknown) => {
      set({ isUpdatingProfile: true });
      try {
        const res = await axiosInstance.put("/auth/update-profile", data);
        set({ authUser: res.data });
        toast.success("Profile updated successfully!");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Updating profile failed");
      } finally {
        set({ isUpdatingProfile: false });
      }
    },

    connectSocket: () => {
      //@ts-expect-error returning unkown type
      const { authUser } = get();
      //@ts-expect-error returning unkown type
      if (!authUser || get().socket?.connected) return;
      const socket = io(BASE_URL, {
        query: { userId: authUser._id },
      });
      socket.connect();
      set({ socket: socket });
      socket.on("getOnlineUsers", (usersIds: []) => {
        set({ onlineUsers: usersIds });
      });
    },
    disconnectSocket: () => {
      //@ts-expect-error returning unkown type
      if (get().socket?.connected) {
        //@ts-expect-error returning unkown type
        get().socket?.disconnect();
        set({ socket: null });
      }
    },
  })
);
