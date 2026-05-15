import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

export default function DashboardScreen({ onLogout }: { onLogout: () => void }) {
  const stats = [
    { label: 'Active Jobs', value: '4', color: '#3b82f6' },
    { label: 'Completed Today', value: '12', color: '#10b981' },
    { label: 'Alerts', value: '2', color: '#f43f5e' },
  ];

  const recentJobs = [
    { id: 'WO-1001', part: 'Valve Body X1', status: 'IN_PROGRESS' },
    { id: 'WO-1002', part: 'Shaft Assembly', status: 'PAUSED' },
    { id: 'WO-1003', part: 'Bearing Plate', status: 'PENDING' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome, Operator</Text>
          <Text style={styles.date}>Friday, May 15</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Active Production Jobs</Text>
        {recentJobs.map((job, i) => (
          <TouchableOpacity key={i} style={styles.jobCard}>
            <View>
              <Text style={styles.jobId}>{job.id}</Text>
              <Text style={styles.jobPart}>{job.part}</Text>
            </View>
            <View style={[styles.statusBadge, job.status === 'IN_PROGRESS' ? styles.statusActive : styles.statusPaused]}>
              <Text style={styles.statusText}>{job.status}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  welcome: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  date: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    width: '31%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  jobId: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '700',
    marginBottom: 2,
  },
  jobPart: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  statusPaused: {
    backgroundColor: 'rgba(249,115,22,0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
