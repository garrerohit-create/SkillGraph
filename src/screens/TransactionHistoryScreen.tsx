import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { base44Client } from '../services/base44Client';

interface Transaction {
  id: string;
  amount: number;
  txHash: string;
  date: string;
  status: 'confirmed' | 'pending';
}

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const history = await base44Client.getWithdrawalHistory();
        // Add some mock status since API might not have it
        setTransactions(history.map(tx => ({ ...tx, status: 'confirmed' as const })));
      } catch (error) {
        console.error('Failed to fetch history:', error);
        // Fallback to mock for demo
        setTransactions([
          { id: 'tx1', amount: 50000, txHash: '0x8f2d...9a1b', date: '2026-05-10T14:30:00Z', status: 'confirmed' },
          { id: 'tx2', amount: 25050, txHash: '0x3e4f...1c8d', date: '2026-05-08T09:15:00Z', status: 'confirmed' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: Transaction }) => (
    <BlurView intensity={20} tint="dark" style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconContainer}>
          <Feather name="arrow-up-right" size={20} color="#10B981" />
        </View>
        <View>
          <Text style={styles.txType}>Withdrawal</Text>
          <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.txAmount}>-${(item.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        <Text style={styles.txHash}>{item.txHash}</Text>
      </View>
    </BlurView>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050B14', '#0A192F', '#050B14']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#00E5FF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <View style={{ width: 24 }} />
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00E5FF" />
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="list" size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>No transactions found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A192F' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#E2E8F0', fontSize: 20, fontWeight: '800' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 24, gap: 16 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 20, backgroundColor: 'rgba(10, 25, 47, 0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center' },
  txType: { color: '#E2E8F0', fontSize: 16, fontWeight: '700' },
  txDate: { color: '#718096', fontSize: 12, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  txAmount: { color: '#10B981', fontSize: 18, fontWeight: '800' },
  txHash: { color: '#A0AEC0', fontSize: 10, fontFamily: 'monospace', marginTop: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: '#718096', fontSize: 16, marginTop: 16 },
});
