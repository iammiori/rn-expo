import { ChevronDown, Flag, Menu, MoreHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  date: string;
  color: string;
  overdue: boolean;
  hasFlag?: boolean;
  hasMenu?: boolean;
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "task title",
      completed: false,
      date: "28 Jul",
      color: "#666",
      overdue: true,
    },
    {
      id: 2,
      title: "task title",
      completed: true,
      date: "1 mar",
      color: "#4CAF50",
      overdue: true,
      hasFlag: true,
    },
    {
      id: 3,
      title: "Figma ipsum component variant main layer. Select inspect object ed...",
      completed: false,
      date: "1 mar",
      color: "#9C27B0",
      overdue: true,
      hasFlag: true,
    },
    {
      id: 4,
      title: "task title",
      completed: false,
      date: "",
      color: "#666",
      overdue: false,
    },
    {
      id: 5,
      title: "텍스트 사이즈 너무 작은지",
      completed: false,
      date: "",
      color: "#2196F3",
      overdue: false,
      hasMenu: true,
      hasFlag: true,
    },
    {
      id: 6,
      title: "텍스트 사이즈 너무 작은지",
      completed: true,
      date: "",
      color: "#4CAF50",
      overdue: false,
      hasFlag: true,
    },
    {
      id: 7,
      title:
        "Figma ipsum component variant main layer. Select inspect object editor resizing thu...",
      completed: false,
      date: "",
      color: "#9C27B0",
      overdue: false,
      hasMenu: true,
    },
    {
      id: 8,
      title:
        "Figma ipsum component variant main layer. Select inspect object editor resizing thumbnb...",
      completed: false,
      date: "",
      color: "#FF9800",
      overdue: false,
    },
    {
      id: 9,
      title: "task sample task sample task sample",
      completed: false,
      date: "",
      color: "#FFC107",
      overdue: false,
    },
    {
      id: 10,
      title: "task sample task sample task sample",
      completed: false,
      date: "",
      color: "#FFC107",
      overdue: false,
    },
  ]);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const overdueCount = useMemo(() => tasks.filter((task) => task.overdue).length, [tasks]);

  const renderTask = (task: Task) => (
    <TouchableOpacity
      key={task.id}
      className="flex-row items-start py-3 px-1 gap-3"
      activeOpacity={0.7}
    >
      <TouchableOpacity
        className="w-5 h-5 rounded border-2 justify-center items-center mt-0.5"
        style={{
          borderColor: task.color,
          backgroundColor: task.completed ? task.color : "transparent",
        }}
        onPress={() => toggleTask(task.id)}
      >
        {task.completed && <Text className="text-white text-xs font-bold">✓</Text>}
      </TouchableOpacity>

      <View className="flex-1">
        <Text
          className={`text-base leading-6 ${
            task.completed ? "line-through text-gray-500" : "text-white"
          }`}
          numberOfLines={2}
        >
          {task.title}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {task.date && <Text className="text-sm text-orange-600 font-medium">{task.date}</Text>}
        {task.hasMenu && (
          <MoreHorizontal
            size={16}
            color="#666"
            className="ml-1"
          />
        )}
        {task.hasFlag && (
          <Flag
            size={14}
            color="#FF5722"
            className="ml-0.5"
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
      />

      <View className="flex-row justify-between items-center px-5 py-4 bg-neutral-900">
        <Text className="text-3xl font-semibold text-white">Inbox</Text>
        <TouchableOpacity>
          <Menu
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
      >
        {overdueCount > 0 && (
          <View className="mb-5">
            <TouchableOpacity className="flex-row justify-between items-center py-3 px-4 bg-neutral-800 rounded-lg mb-2">
              <Text className="text-base font-medium text-orange-600">Overdue</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-gray-500 bg-neutral-700 px-2 py-0.5 rounded-full overflow-hidden">
                  {overdueCount}
                </Text>
                <ChevronDown
                  size={16}
                  color="#666"
                />
              </View>
            </TouchableOpacity>

            {tasks.filter((task) => task.overdue).map(renderTask)}
          </View>
        )}

        <View className="mb-5">{tasks.filter((task) => !task.overdue).map(renderTask)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
