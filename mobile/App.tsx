import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { TasksScreen } from './src/screens/TasksScreen';

const MainNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<'Login' | 'Register'>('Login');
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Projects' | 'Tasks'>('Dashboard');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading ProjectHub...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return authScreen === 'Login' ? (
      <LoginScreen navigation={{ navigate: (screen: string) => setAuthScreen(screen as any) }} />
    ) : (
      <RegisterScreen navigation={{ navigate: (screen: string) => setAuthScreen(screen as any) }} />
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.screenContent}>
        {activeTab === 'Dashboard' && (
          <DashboardScreen navigation={{ navigate: (tab: string) => setActiveTab(tab as any) }} />
        )}
        {activeTab === 'Projects' && (
          <ProjectsScreen navigation={{ navigate: (tab: string) => setActiveTab(tab as any) }} />
        )}
        {activeTab === 'Tasks' && <TasksScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('Dashboard')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Dashboard' && styles.activeTabIcon]}>📊</Text>
          <Text style={[styles.tabText, activeTab === 'Dashboard' && styles.activeTabText]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Projects' && styles.activeTab]}
          onPress={() => setActiveTab('Projects')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Projects' && styles.activeTabIcon]}>📁</Text>
          <Text style={[styles.tabText, activeTab === 'Projects' && styles.activeTabText]}>Projects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Tasks' && styles.activeTab]}
          onPress={() => setActiveTab('Tasks')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Tasks' && styles.activeTabIcon]}>✅</Text>
          <Text style={[styles.tabText, activeTab === 'Tasks' && styles.activeTabText]}>Tasks</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { fontSize: 16, fontWeight: '600', color: '#2563eb' },
  mainContainer: { flex: 1, backgroundColor: '#ffffff' },
  screenContent: { flex: 1 },
  bottomBar: { flexDirection: 'row', backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingVertical: 8, paddingHorizontal: 12 },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 8 },
  activeTab: { backgroundColor: '#eff6ff' },
  tabIcon: { fontSize: 18, marginBottom: 2 },
  activeTabIcon: { transform: [{ scale: 1.1 }] },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#2563eb' }
});
