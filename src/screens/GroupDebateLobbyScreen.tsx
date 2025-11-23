import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Text, Surface, IconButton, Avatar, Chip, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ACTIVE_DEBATES = [
	{
		id: '1',
		topic: 'UBI is necessary',
		participants: 8,
		timeLeft: '4m',
		status: 'LIVE',
		color: '#FF5252',
	},
	{
		id: '2',
		topic: 'AI Art is Art',
		participants: 12,
		timeLeft: '12m',
		status: 'HEATED',
		color: '#BB86FC',
	},
];

export default function GroupDebateLobbyScreen() {
	const navigation = useNavigation<any>();
	const insets = useSafeAreaInsets();

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#0f0c29', '#1a1a2e', '#16213e']}
				style={styles.background}
			>
				{/* Header */}
				<View style={[styles.header, { paddingTop: insets.top + 10 }]}>
					<IconButton icon="arrow-left" iconColor="#fff" onPress={() => navigation.goBack()} />
					<Text style={styles.headerTitle}>DEBATE GYM</Text>
					<IconButton icon="dumbbell" iconColor="#fff" onPress={() => { }} />
				</View>

				<ScrollView contentContainerStyle={styles.scrollContent}>
					{/* Hero Section - Daily Debate */}
					<Surface style={styles.heroCard} elevation={4}>
						<LinearGradient
							colors={['rgba(255, 82, 82, 0.2)', 'rgba(255, 82, 82, 0.05)']}
							style={styles.heroGradient}
						>
							<View style={styles.heroHeader}>
								<Text style={styles.heroLabel}>DAILY DEBATE</Text>
								<View style={styles.liveBadge}>
									<View style={styles.liveDot} />
									<Text style={styles.liveText}>LIVE</Text>
								</View>
							</View>

							<Text style={styles.heroTopic}>"Social Media bans for under 16s"</Text>

							<View style={styles.heroStats}>
								<View style={styles.statItem}>
									<MaterialCommunityIcons name="fire" size={20} color="#FF5252" />
									<Text style={styles.statText}>High Intensity</Text>
								</View>
								<View style={styles.statItem}>
									<MaterialCommunityIcons name="account-group" size={20} color="#aaa" />
									<Text style={styles.statText}>142 Debating</Text>
								</View>
							</View>

							<Button
								mode="contained"
								onPress={() => { }}
								style={styles.joinButton}
								labelStyle={styles.joinButtonLabel}
							>
								JOIN THE FRAY
							</Button>

						</LinearGradient>
					</Surface>

					<Text style={styles.sectionTitle}>Active Rings</Text>

					{ACTIVE_DEBATES.map((debate) => (
						<TouchableOpacity key={debate.id} onPress={() => navigation.navigate('GroupDebate')}>
							<Surface style={styles.debateCard} elevation={2}>
								<View style={styles.cardLeft}>
									<View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
										<MaterialCommunityIcons name="sword-cross" size={24} color={debate.color} />
									</View>
								</View>
								<View style={styles.cardCenter}>
									<Text style={styles.debateTopic}>{debate.topic}</Text>
									<View style={styles.cardMeta}>
										<Text style={styles.metaText}>{debate.participants} active</Text>
										<Text style={styles.metaDot}>•</Text>
										<Text style={[styles.metaText, { color: debate.color }]}>{debate.status}</Text>
									</View>
								</View>
								<View style={styles.cardRight}>
									<Text style={styles.timeLeft}>{debate.timeLeft}</Text>
									<MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
								</View>
							</Surface>
						</TouchableOpacity>
					))}

					{/* Create New Group */}
					<TouchableOpacity style={styles.createButton}>
						<LinearGradient
							colors={['#2a2a3a', '#1e1e2e']}
							style={styles.createGradient}
						>
							<MaterialCommunityIcons name="plus-circle-outline" size={32} color="#BB86FC" />
							<Text style={styles.createText}>Start New Ring</Text>
						</LinearGradient>
					</TouchableOpacity>

				</ScrollView>
			</LinearGradient>
		</View >
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	background: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
		paddingBottom: 10,
		backgroundColor: 'rgba(22, 33, 62, 0.8)',
	},
	headerTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: 2,
	},
	scrollContent: {
		padding: 20,
		paddingBottom: 100,
	},
	heroCard: {
		borderRadius: 20,
		overflow: 'hidden',
		marginBottom: 30,
		backgroundColor: '#1e1e2e',
		borderWidth: 1,
		borderColor: 'rgba(255, 82, 82, 0.3)',
	},
	heroGradient: {
		padding: 20,
	},
	heroHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	heroLabel: {
		color: '#FF5252',
		fontWeight: 'bold',
		letterSpacing: 1,
		fontSize: 12,
	},
	liveBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 0, 0, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	liveDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#FF0000',
		marginRight: 6,
	},
	liveText: {
		color: '#FF0000',
		fontSize: 10,
		fontWeight: 'bold',
	},
	heroTopic: {
		color: '#fff',
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		lineHeight: 32,
	},
	heroStats: {
		flexDirection: 'row',
		marginBottom: 20,
	},
	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 20,
	},
	statText: {
		color: '#aaa',
		marginLeft: 6,
		fontSize: 12,
	},
	joinButton: {
		backgroundColor: '#FF5252',
		borderRadius: 12,
	},
	joinButtonLabel: {
		color: '#fff',
		fontWeight: 'bold',
		letterSpacing: 1,
		paddingVertical: 4,
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
		marginLeft: 5,
	},
	debateCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#1e1e2e',
		borderRadius: 16,
		padding: 15,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: '#333',
	},
	cardLeft: {
		marginRight: 15,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cardCenter: {
		flex: 1,
	},
	debateTopic: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	cardMeta: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	metaText: {
		color: '#888',
		fontSize: 12,
	},
	metaDot: {
		color: '#666',
		marginHorizontal: 6,
	},
	cardRight: {
		alignItems: 'flex-end',
	},
	timeLeft: {
		color: '#666',
		fontSize: 12,
		marginBottom: 4,
	},
	createButton: {
		marginTop: 10,
		borderRadius: 16,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#333',
		borderStyle: 'dashed',
	},
	createGradient: {
		padding: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	createText: {
		color: '#BB86FC',
		fontSize: 16,
		fontWeight: 'bold',
		marginLeft: 10,
	},
});
