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
  TextInput
} from 'react-native';
import api from '../services/api';

export const ProjectsScreen = ({ navigation }: any) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get(`/projects?search=${encodeURIComponent(search)}`);
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Fetch projects error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, [search]);

  const renderProjectCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={[
          styles.statusBadge,
          item.status === 'Completed' ? styles.statusCompleted :
          item.status === 'In Progress' ? styles.statusProgress : styles.statusNotStarted
        ]}>
          {item.status}
        </Text>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.description || 'No description available'}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.taskCount}>📋 {item._count?.tasks ?? 0} Tasks</Text>
        <Text style={styles.dateText}>
          {item.startDate ? new Date(item.startDate).toLocaleDateString() : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search projects..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderProjectCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No projects found.</Text>
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
  searchInput: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  statusBadge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusCompleted: { backgroundColor: '#dcfce7', color: '#15803d' },
  statusProgress: { backgroundColor: '#dbeafe', color: '#1e40af' },
  statusNotStarted: { backgroundColor: '#f1f5f9', color: '#475569' },
  cardDesc: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  taskCount: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  dateText: { fontSize: 12, color: '#94a3b8' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 14 }
});
