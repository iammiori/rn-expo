import { ChevronDown, Flag, Menu, MoreHorizontal } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
      title:
        "Figma ipsum component variant main layer. Select inspect object ed...",
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
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const overdueCount = useMemo(
    () => tasks.filter((task) => task.overdue).length,
    [tasks]
  );

  const renderTask = (task: Task) => (
    <TouchableOpacity key={task.id} style={styles.taskItem} activeOpacity={0.7}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            borderColor: task.color,
            backgroundColor: task.completed ? task.color : "transparent",
          },
        ]}
        onPress={() => toggleTask(task.id)}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text
          style={[styles.taskTitle, task.completed && styles.completedTask]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
      </View>

      <View style={styles.taskActions}>
        {task.date && <Text style={styles.taskDate}>{task.date}</Text>}
        {task.hasMenu && (
          <MoreHorizontal size={16} color="#666" style={styles.menuIcon} />
        )}
        {task.hasFlag && (
          <Flag size={14} color="#FF5722" style={styles.flagIcon} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity>
          <Menu size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {overdueCount > 0 && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Overdue</Text>
              <View style={styles.sectionTitleRight}>
                <Text style={styles.overdueCount}>{overdueCount}</Text>
                <ChevronDown size={16} color="#666" />
              </View>
            </TouchableOpacity>

            {tasks.filter((task) => task.overdue).map(renderTask)}
          </View>
        )}

        <View style={styles.section}>
          {tasks.filter((task) => !task.overdue).map(renderTask)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#1a1a1a",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF5722",
  },
  sectionTitleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  overdueCount: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#333",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskDate: {
    fontSize: 14,
    color: "#FF5722",
    fontWeight: "500",
  },
  menuIcon: {
    marginLeft: 4,
  },
  flagIcon: {
    marginLeft: 2,
  },
});
