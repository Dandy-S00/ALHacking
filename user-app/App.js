import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Users, DollarSign, Archive, LogOut, ChevronRight, Play, TrendingUp, Grid, RefreshCw, Settings, Shield } from 'lucide-react-native';

const LONE_STAR_GOLD = '#d4af37';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState({ username: 'LuckyTexan', balance: 100, vault: 50 });
  const [activeTab, setActiveTab] = useState('lobby'); // 'lobby', 'profile', 'game'
  const [activeGame, setActiveGame] = useState(null);
  const [vaultModal, setVaultModal] = useState(false);
  const [vaultAmount, setVaultAmount] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const games = [
    { id: 'slots_neon', name: 'Neon Nights', category: 'Slots', theme: 'Neon', icon: <Grid color={LONE_STAR_GOLD} /> },
    { id: 'slots_oil', name: 'Oil Tycoon', category: 'Slots', theme: 'Texas', icon: <Grid color={LONE_STAR_GOLD} /> },
    { id: 'slots_alamo', name: 'Alamo Riches', category: 'Slots', theme: 'Texas', icon: <Grid color={LONE_STAR_GOLD} /> },
    { id: 'slots_blue', name: 'Bluebonnet Spins', category: 'Slots', theme: 'Texas', icon: <Grid color={LONE_STAR_GOLD} /> },
    { id: 'slots_ranch', name: 'Ranch Hand', category: 'Slots', theme: 'Texas', icon: <Grid color={LONE_STAR_GOLD} /> },
    { id: 'slots_cyber', name: 'Cyber Cash', category: 'Slots', theme: 'Modern', icon: <Grid color={LONE_STAR_GOLD} /> },
    { id: 'fish_deep', name: 'Gulf Coast Gold', category: 'Fish', theme: 'Texas', icon: <Play color={LONE_STAR_GOLD} /> },
    { id: 'fish_tank', name: 'Deep Sea Texan', category: 'Fish', theme: 'Texas', icon: <Play color={LONE_STAR_GOLD} /> },
    { id: 'crash_turbo', name: 'Turbo Crash', category: 'Instant', icon: <TrendingUp color={LONE_STAR_GOLD} /> },
    { id: 'mines_gem', name: 'Gem Mines', category: 'Instant', icon: <RefreshCw color={LONE_STAR_GOLD} /> },
    { id: 'plinko', name: 'LoneStar Plinko', category: 'Instant', icon: <Grid color={LONE_STAR_GOLD} /> },
    { id: 'roulette', name: 'Austin Roulette', category: 'Casino', icon: <RefreshCw color={LONE_STAR_GOLD} /> },
  ];

  const handleVaultAction = (action) => {
    const amt = parseFloat(vaultAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (action === 'deposit') {
      if (user.balance < amt) return;
      setUser({ ...user, balance: user.balance - amt, vault: user.vault + amt });
    } else {
      if (user.vault < amt) return;
      setUser({ ...user, balance: user.balance + amt, vault: user.vault - amt });
    }
    setVaultAmount('');
    setVaultModal(false);
  };

  const handleChangePassword = () => {
    if (newPassword.length < 4) return;
    alert('Password updated! Admin has been notified.');
    setNewPassword('');
    setActiveTab('lobby');
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <View style={styles.loginBox}>
          <Text style={styles.title}>LONE★STAR LUCK</Text>
          <TextInput placeholder="Username" style={styles.input} placeholderTextColor="#666" />
          <TextInput placeholder="Password" style={styles.input} secureTextEntry placeholderTextColor="#666" />
          <TouchableOpacity style={styles.goldButton} onPress={() => setToken('demo')}>
            <Text style={styles.goldButtonText}>ENTER LOBBY</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome, {user.username}</Text>
          <View style={styles.balanceContainer}>
            <DollarSign size={16} color={LONE_STAR_GOLD} />
            <Text style={styles.balanceText}>{user.balance.toFixed(2)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.vaultBtn}
          onPress={() => setVaultModal(true)}
          accessibilityLabel="Open Token Vault"
          accessibilityRole="button"
        >
          <Archive size={20} color="white" />
          <Text style={styles.vaultText}>VAULT: ${user.vault}</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'lobby' && (
        <ScrollView style={styles.lobby}>
          <Text style={styles.sectionTitle}>FEATURED GAMES</Text>
          <View style={styles.gameGrid}>
            {games.map(game => (
              <TouchableOpacity
                key={game.id}
                style={styles.gameCard}
                onPress={() => { setActiveGame(game); setActiveTab('game'); }}
                accessibilityLabel={game.name}
                accessibilityRole="button"
              >
                {game.icon}
                <Text style={styles.gameName}>{game.name}</Text>
                <Text style={styles.gameCategory}>{game.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {activeTab === 'profile' && (
        <View style={styles.lobby}>
          <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
          <View style={styles.profileBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Shield color={LONE_STAR_GOLD} size={24} />
              <Text style={{ color: 'white', marginLeft: 10, fontSize: 18, fontWeight: 'bold' }}>Security</Text>
            </View>
            <Text style={{ color: '#888', marginBottom: 10 }}>Update Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              placeholderTextColor="#666"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity style={styles.goldButton} onPress={handleChangePassword}>
              <Text style={styles.goldButtonText}>UPDATE PASSWORD</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.goldButton, { backgroundColor: '#f44336', marginTop: 20 }]} onPress={() => setToken(null)}>
            <Text style={styles.goldButtonText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'game' && activeGame && (
        <View style={styles.gameRoom}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setActiveTab('lobby')}>
                <Text style={{ color: 'white' }}>← BACK TO LOBBY</Text>
            </TouchableOpacity>
            <View style={styles.gamePlaceholder}>
                <Text style={styles.gameTitle}>{activeGame.name.toUpperCase()}</Text>
                <Text style={{ color: '#888', marginVertical: 20 }}>[ Game Interface Loading... ]</Text>
                <TouchableOpacity style={styles.playBtn} onPress={() => alert('Winnings added to balance!')}>
                    <Text style={{ color: 'black', fontWeight: 'bold' }}>PLACE BET</Text>
                </TouchableOpacity>
            </View>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => setActiveTab('lobby')}
          accessibilityLabel="Lobby"
          accessibilityRole="button"
        >
            <Grid size={24} color={activeTab === 'lobby' ? LONE_STAR_GOLD : '#888'}/>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => setActiveTab('profile')}
          accessibilityLabel="Profile"
          accessibilityRole="button"
        >
            <Settings size={24} color={activeTab === 'profile' ? LONE_STAR_GOLD : '#888'}/>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => setToken(null)}
          accessibilityLabel="Logout"
          accessibilityRole="button"
        >
            <LogOut size={24} color="#888"/>
        </TouchableOpacity>
      </View>

      <Modal visible={vaultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>TOKEN VAULT</Text>
              <Text style={styles.modalSub}>Move tokens between wallet and vault.</Text>
              <View style={{ backgroundColor: '#0a0a0a', padding: 10, borderRadius: 10, marginBottom: 20 }}>
                <Text style={{ color: '#888' }}>Wallet: <Text style={{ color: 'white' }}>${user.balance}</Text></Text>
                <Text style={{ color: '#888' }}>Vault: <Text style={{ color: 'white' }}>${user.vault}</Text></Text>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="Amount"
                keyboardType="numeric"
                value={vaultAmount}
                onChangeText={setVaultAmount}
                placeholderTextColor="#666"
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={[styles.goldButton, { flex: 1 }]} onPress={() => handleVaultAction('deposit')}>
                    <Text style={styles.goldButtonText}>DEPOSIT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.goldButton, { flex: 1, backgroundColor: '#333' }]} onPress={() => handleVaultAction('withdraw')}>
                    <Text style={[styles.goldButtonText, { color: 'white' }]}>WITHDRAW</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setVaultModal(false)} style={{ marginTop: 20 }}><Text style={{ color: '#888', textAlign: 'center' }}>CLOSE</Text></TouchableOpacity>
           </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  loginBox: { width: '85%', padding: 30, backgroundColor: '#161616', borderRadius: 20, borderTopWidth: 3, borderTopColor: LONE_STAR_GOLD, shadowColor: LONE_STAR_GOLD, shadowOpacity: 0.2, shadowRadius: 20 },
  title: { color: LONE_STAR_GOLD, fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 40, letterSpacing: 2 },
  input: { backgroundColor: '#262626', color: 'white', padding: 18, borderRadius: 10, marginBottom: 15 },
  goldButton: { backgroundColor: LONE_STAR_GOLD, padding: 18, borderRadius: 10, alignItems: 'center', shadowColor: LONE_STAR_GOLD, shadowOpacity: 0.3, shadowRadius: 10 },
  goldButtonText: { color: 'black', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  mainContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#222' },
  welcome: { color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  balanceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  balanceText: { color: 'white', fontSize: 24, fontWeight: 'bold', marginLeft: 4 },
  vaultBtn: { backgroundColor: '#1a1a1a', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  vaultText: { color: LONE_STAR_GOLD, fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  lobby: { flex: 1, padding: 20 },
  sectionTitle: { color: '#444', fontSize: 12, fontWeight: 'bold', marginBottom: 20, letterSpacing: 2 },
  gameGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gameCard: { width: '48%', backgroundColor: '#161616', padding: 20, borderRadius: 15, marginBottom: 15, borderBottomWidth: 4, borderBottomColor: '#000', alignItems: 'center' },
  gameName: { color: 'white', marginTop: 12, fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  gameCategory: { color: LONE_STAR_GOLD, fontSize: 9, marginTop: 4, textTransform: 'uppercase', fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#222' },
  footerItem: { padding: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#1a1a1a', padding: 30, borderRadius: 25, borderTopWidth: 5, borderTopColor: LONE_STAR_GOLD },
  modalTitle: { color: LONE_STAR_GOLD, fontSize: 22, fontWeight: '900', marginBottom: 5, letterSpacing: 1 },
  modalSub: { color: '#666', fontSize: 13, marginBottom: 25 },
  modalInput: { backgroundColor: '#262626', color: 'white', padding: 18, borderRadius: 12, marginBottom: 25, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
  profileBox: { backgroundColor: '#161616', padding: 20, borderRadius: 15, marginTop: 10 },
  gameRoom: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
  backBtn: { padding: 20 },
  gamePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gameTitle: { color: LONE_STAR_GOLD, fontSize: 32, fontWeight: '900', textAlign: 'center' },
  playBtn: { backgroundColor: LONE_STAR_GOLD, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 }
});
