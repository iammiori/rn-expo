import { useModalStore } from "@/stores/modalStore";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import { Pressable, View } from "react-native";

export default function TabLayout() {
  const openActionSheet = useModalStore((state) => state.openActionSheet);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#2a2a2a",
            borderTopWidth: 0,
            height: 90,
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
              <Feather
                name="inbox"
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="(dummy)"
          options={{
            tabBarButton: () => <View style={{ flex: 1 }} />,
          }}
        />

        <Tabs.Screen
          name="my"
          options={{
            title: "바보임에틀림없어",
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>

      <Pressable
        className="absolute bottom-8 left-1/2 -ml-7 w-14 h-14 rounded-full bg-gray-600 justify-center items-center shadow-lg z-[1000]"
        onPress={openActionSheet}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.8 : 1,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          },
        ]}
      >
        <Ionicons
          name="add"
          size={28}
          color="#ffffff"
        />
      </Pressable>
    </>
  );
}
