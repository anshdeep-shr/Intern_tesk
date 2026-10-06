import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import api from '../services/api';

export const TasksScreen = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Fetch tasks error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [search, statusFilter, priorityFilter]);

  const toggleTaskStatus = async (task: any) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const deleteTask = async (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/tasks/${id}`);
              fetchTasks();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete task');
            }
          }
        }
      ]
    );
  };

  const renderTaskCard = ({ item }: { item: any }) => {
    const isCompleted = item.status === 'Completed';

    return (
      <View style={[styles.card, isCompleted && styles.cardCompleted]}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
            onPress={() => toggleTaskStatus(item)}
          >
            {isCompleted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.taskTitle, isCompleted && styles.lineThrough]}>
              {item.name}
            </Text>
            {item.project && (
              <Text style={styles.projectName}>📁 {item.project.name}</Text>
            )}
          </View>

          <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {item.description ? (
          <Text style={styles.taskDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={[
            styles.badge,
            item.priority === 'High' ? styles.badgeHigh :
            item.priority === 'Medium' ? styles.badgeMedium : styles.badgeLow
          ]}>
            {item.priority} Priority
          </Text>

          <Text style={[
            styles.statusBadge,
            item.status === 'Completed' ? styles.statusCompleted :
            item.status === 'In Progress' ? styles.statusProgress : styles.statusPending
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search tasks..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.chip, statusFilter === '' && styles.chipActive]}
            onPress={() => setStatusFilter('')}
          >
            <Text style={[styles.chipText, statusFilter === '' && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, statusFilter === 'Pending' && styles.chipActive]}
            onPress={() => setStatusFilter(statusFilter === 'Pending' ? '' : 'Pending')}
          >
            <Text style={[styles.chipText, statusFilter === 'Pending' && styles.chipTextActive]}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, statusFilter === 'In Progress' && styles.chipActive]}
            onPress={() => setStatusFilter(statusFilter === 'In Progress' ? '' : 'In Progress')}
          >
            <Text style={[styles.chipText, statusFilter === 'In Progress' && styles.chipTextActive]}>In Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, statusFilter === 'Completed' && styles.chipActive]}
            onPress={() => setStatusFilter(statusFilter === 'Completed' ? '' : 'Completed')}
          >
            <Text style={[styles.chipText, statusFilter === 'Completed' && styles.chipTextActive]}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tasks found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  searchInput: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a', marginBottom: 10 },
  filterRow: { flexDirection: 'row', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f1f5f9' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#ffffff' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardCompleted: { opacity: 0.8, backgroundColor: '#f8fafc' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#94a3b8', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  checkmark: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  lineThrough: { textDecorationLine: 'line-through', color: '#94a3b8' },
  projectName: { fontSize: 12, color: '#2563eb', marginTop: 2 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 14 },
  taskDesc: { fontSize: 13, color: '#64748b', marginTop: 8, marginLeft: 32 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginLeft: 32 },
  badge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeHigh: { backgroundColor: '#fee2e2', color: '#991b1b' },
  badgeMedium: { backgroundColor: '#fef3c7', color: '#92400e' },
  badgeLow: { backgroundColor: '#dcfce7', color: '#166534' },
  statusBadge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusCompleted: { backgroundColor: '#dcfce7', color: '#15803d' },
  statusProgress: { backgroundColor: '#dbeafe', color: '#1e40af' },
  statusPending: { backgroundColor: '#fef3c7', color: '#92400e' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 }
});
