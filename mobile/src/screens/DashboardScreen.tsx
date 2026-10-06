import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const DashboardScreen = ({ navigation }: any) => {
  const { user, logout, networkError, clearNetworkError } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      setStats(res.data.stats);
      setRecentTasks(res.data.recentTasks || []);
      clearNetworkError();
    } catch (err) {
      console.error('Mobile Dashboard fetch error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {networkError && (
        <View style={styles.networkBanner}>
          <Text style={styles.networkBannerText}>⚠️ {networkError}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.fullName || 'User'} 👋</Text>
            <Text style={styles.subtitle}>Overview of your work</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
                <Text style={styles.statValue}>{stats?.totalProjects ?? 0}</Text>
                <Text style={styles.statLabel}>Total Projects</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#e0e7ff' }]}>
                <Text style={styles.statValue}>{stats?.projectsInProgress ?? 0}</Text>
                <Text style={styles.statLabel}>In Progress Projects</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#f3e8ff' }]}>
                <Text style={styles.statValue}>{stats?.totalTasks ?? 0}</Text>
                <Text style={styles.statLabel}>Total Tasks</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
                <Text style={styles.statValue}>{stats?.completedTasks ?? 0}</Text>
                <Text style={styles.statLabel}>Completed Tasks</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => navigation.navigate('Projects')}
              >
                <Text style={styles.actionBtnPrimaryText}>📁 View Projects</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => navigation.navigate('Tasks')}
              >
                <Text style={styles.actionBtnSecondaryText}>✅ View Tasks</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Tasks List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Tasks</Text>
              {recentTasks.length === 0 ? (
                <Text style={styles.emptyText}>No recent tasks available.</Text>
              ) : (
                recentTasks.map((t) => (
                  <View key={t.id} style={styles.taskItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskName, t.status === 'Completed' && styles.completedText]}>
                        {t.name}
                      </Text>
                      {t.project && (
                        <Text style={styles.projectName}>{t.project.name}</Text>
                      )}
                    </View>
                    <View style={styles.badgeGroup}>
                      <Text style={[
                        styles.badge,
                        t.priority === 'High' ? styles.badgeHigh : styles.badgeMedium
                      ]}>
                        {t.priority}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  networkBanner: { backgroundColor: '#fffbebfb', borderColor: '#fde68a', borderWidth: 1, padding: 10, marginHorizontal: 16, marginTop: 10, borderRadius: 8 },
  networkBannerText: { color: '#92400e', fontSize: 13, textAlign: 'center' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  logoutButton: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', padding: 16, borderRadius: 12, marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionBtnPrimary: { flex: 1, backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginRight: 8 },
  actionBtnPrimaryText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  actionBtnSecondary: { flex: 1, backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderWidth: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginLeft: 8 },
  actionBtnSecondaryText: { color: '#334155', fontWeight: '600', fontSize: 14 },
  section: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginVertical: 12 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  taskName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  completedText: { textDecorationLine: 'line-through', color: '#94a3b8' },
  projectName: { fontSize: 12, color: '#2563eb', marginTop: 2 },
  badgeGroup: { flexDirection: 'row' },
  badge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeHigh: { backgroundColor: '#fee2e2', color: '#991b1b' },
  badgeMedium: { backgroundColor: '#fef3c7', color: '#92400e' }
});
