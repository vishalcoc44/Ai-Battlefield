import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Text, Surface, IconButton, ProgressBar, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, UserProfile } from '../services/profileService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
	const navigation = useNavigation<any>();
	const insets = useSafeAreaInsets();
	const { session } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadProfile();
	}, [session]);

	const loadProfile = async () => {
		if (!session?.user?.id) return;

		setLoading(true);
		const profileData = await getUserProfile(session.user.id);
		setProfile(profileData);
		setLoading(false);
	};

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#0f0c29', '#1a1a2e', '#16213e']}
				style={styles.background}
			>
				<ScrollView contentContainerStyle={styles.scrollContent}>
					{/* Header Section */}
					<View style={styles.header}>
						<TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('IntellectualResume')}>
							<Avatar.Image size={40} source={{ uri: 'https://i.pravatar.cc/150?img=12' }} />
							<View style={styles.profileInfo}>
								<Text style={styles.profileName}>{profile?.username || 'Loading...'}</Text>
								<Text style={styles.profileTitle}>Level {profile?.level || 1} • {profile?.total_debates || 0} Debates</Text>
							</View>
							<View style={styles.headerActions}>
								<IconButton icon="history" iconColor="#fff" size={24} onPress={() => navigation.navigate('BeliefTracker')} />
								<IconButton icon="incognito" iconColor="#fff" size={24} onPress={() => navigation.navigate('AnonymousLobby')} />
							</View>
						</TouchableOpacity>

						<View style={styles.scoreContainer}>
							<Text style={styles.scoreValue}>{profile?.xp || 0}</Text>
							<Text style={styles.scoreLabel}>XP • {profile?.views_changed || 0} Views Changed</Text>
						</View>
					</View>

					{/* Quick Challenges Section */}
					<Text style={styles.sectionTitle}>Quick Challenges</Text>
					<View style={styles.cardsRow}>
						{/* Card 1 - Green */}
						<TouchableOpacity style={styles.challengeCard} onPress={() => navigation.navigate('Prediction')}>
							<View style={styles.cardHeader}>
								<View style={styles.iconContainerGreen}>
									<MaterialCommunityIcons name="chart-line" size={20} color="#4CAF50" />
								</View>
								<Text style={styles.cardTopic}>Prediction Lab</Text>
							</View>
							<Text style={styles.cardStatement}>Calibrate</Text>
							<Text style={styles.cardPercentageGreen}>Top 5%</Text>
							<Text style={styles.cardSubtext}>New Market →</Text>
							<Text style={styles.cardSubtext}>AGI by 2027?</Text>
							{/* Dummy Graph Line */}
							<View style={styles.graphLineGreen} />
						</TouchableOpacity>

						{/* Card 2 - Red */}
						<TouchableOpacity style={styles.challengeCard} onPress={() => navigation.navigate('DeEscalation')}>
							<View style={styles.cardHeader}>
								<View style={styles.iconContainerRed}>
									<MaterialCommunityIcons name="meditation" size={20} color="#FF5252" />
								</View>
								<Text style={styles.cardTopic}>Zen Dojo</Text>
							</View>
							<Text style={styles.cardStatement}>De-escalate</Text>
							<Text style={styles.cardPercentageRed}>Lvl 3</Text>
							<Text style={styles.cardSubtext}>Troll detected →</Text>
							<Text style={styles.cardSubtext}>High difficulty</Text>
							{/* Dummy Graph Line */}
							<View style={styles.graphLineRed} />
						</TouchableOpacity>
					</View>

					{/* Argument Strength Section */}
					<Surface style={styles.strengthCard} elevation={4}>
						<View style={styles.strengthHeader}>
							<View style={styles.strengthIndicator} />
							<Text style={styles.strengthTitle}>Argument Strength</Text>
							<Text style={styles.strengthValue}>47%</Text>
						</View>

						<ProgressBar progress={0.47} color="#FF5252" style={styles.progressBar} />

						<View style={styles.inputRow}>
							<Avatar.Image size={30} source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={{ marginRight: 10 }} />
							<Text style={styles.inputText}>You: Sun orbits Earth...</Text>
							<IconButton icon="arrow-right" iconColor="#666" size={20} />
						</View>

						<View style={styles.micInputContainer}>
							<Text style={styles.micPlaceholder}>Your argument...</Text>
							<MaterialCommunityIcons name="microphone" size={24} color="#666" />
						</View>
					</Surface>

					{/* Enter Arena Button (Added for functionality) */}
					<TouchableOpacity
						style={styles.arenaButton}
						onPress={() => navigation.navigate('PersonaSelection')}
					>
						<LinearGradient
							colors={['#FF416C', '#FF4B2B']}
							start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
							style={styles.gradientButton}
						>
							<Text style={styles.arenaButtonText}>ENTER THE ARENA</Text>
						</LinearGradient>
					</TouchableOpacity>

				</ScrollView>

				<View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 15) }]}>
					<View style={styles.navItem}>
						<MaterialCommunityIcons name="home" size={28} color="#fff" />
						<Text style={[styles.navText, { color: '#fff' }]}>Home</Text>
					</View>
					<TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Communities')}>
						<MaterialCommunityIcons name="account-group" size={24} color="#666" />
						<Text style={styles.navText}>Communities</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.navItem, styles.centerNavItem]} onPress={() => navigation.navigate('GroupDebateLobby')}>
						<View style={styles.navCircle}>
							<MaterialCommunityIcons name="sword-cross" size={24} color="#fff" />
						</View>
						<Text style={[styles.navText, { color: '#FF5252' }]}>Debate</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('BlindSpot')}>
						<MaterialCommunityIcons name="trophy-outline" size={24} color="#666" />
						<Text style={styles.navText}>Rank</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('IntellectualResume')}>
						<MaterialCommunityIcons name="account-outline" size={24} color="#666" />
						<Text style={styles.navText}>Profile</Text>
					</TouchableOpacity>
				</View>
			</LinearGradient >
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
	scrollContent: {
		padding: 20,
		paddingBottom: 100,
		paddingTop: 50,
	},
	header: {
		marginBottom: 30,
	},
	profileRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	profileInfo: {
		flex: 1,
		marginLeft: 12,
	},
	headerActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	profileName: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	profileTitle: {
		color: '#888',
		fontSize: 12,
	},
	scoreContainer: {
		alignItems: 'center',
	},
	scoreValue: {
		color: '#fff',
		fontSize: 42,
		fontWeight: 'bold',
		letterSpacing: 1,
	},
	scoreLabel: {
		color: '#aaa',
		fontSize: 14,
		letterSpacing: 2,
		textTransform: 'uppercase',
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
	},
	cardsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 25,
	},
	challengeCard: {
		width: '48%',
		backgroundColor: '#1e1e2e',
		borderRadius: 16,
		padding: 15,
		borderWidth: 1,
		borderColor: '#333',
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	iconContainerGreen: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: 'rgba(76, 175, 80, 0.2)',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 8,
	},
	iconContainerRed: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: 'rgba(255, 82, 82, 0.2)',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 8,
	},
	cardTopic: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
	},
	cardStatement: {
		color: '#aaa',
		fontSize: 12,
		marginBottom: 5,
	},
	cardPercentageGreen: {
		color: '#4CAF50',
		fontSize: 32,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	cardPercentageRed: {
		color: '#FF5252',
		fontSize: 32,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	cardSubtext: {
		color: '#666',
		fontSize: 10,
		marginBottom: 2,
	},
	graphLineGreen: {
		height: 20,
		marginTop: 10,
		borderBottomWidth: 2,
		borderBottomColor: '#4CAF50',
		// Mock graph visual
		transform: [{ rotate: '-5deg' }],
	},
	graphLineRed: {
		height: 20,
		marginTop: 10,
		borderBottomWidth: 2,
		borderBottomColor: '#FF5252',
		// Mock graph visual
		transform: [{ rotate: '5deg' }],
	},
	strengthCard: {
		backgroundColor: '#1e1e2e',
		borderRadius: 20,
		padding: 20,
		borderWidth: 1,
		borderColor: '#333',
		marginBottom: 20,
	},
	strengthHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15,
	},
	strengthIndicator: {
		width: 4,
		height: 16,
		backgroundColor: '#FF5252',
		marginRight: 10,
		borderRadius: 2,
	},
	strengthTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		flex: 1,
	},
	strengthValue: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	progressBar: {
		height: 6,
		borderRadius: 3,
		backgroundColor: '#333',
		marginBottom: 20,
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15,
		backgroundColor: '#2a2a3a',
		padding: 10,
		borderRadius: 12,
	},
	inputText: {
		color: '#fff',
		flex: 1,
		fontSize: 14,
	},
	micInputContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderTopWidth: 1,
		borderTopColor: '#333',
		paddingTop: 15,
	},
	micPlaceholder: {
		color: '#666',
	},
	arenaButton: {
		marginTop: 10,
		borderRadius: 25,
		overflow: 'hidden',
	},
	gradientButton: {
		paddingVertical: 15,
		alignItems: 'center',
	},
	arenaButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
		letterSpacing: 1,
	},
	bottomNav: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		alignItems: 'center',
		paddingVertical: 15,
		backgroundColor: '#161625',
		borderTopWidth: 1,
		borderTopColor: '#222',
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
	},
	navItem: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 70,
		flex: 1,
	},
	centerNavItem: {
		flex: 1.5, // Give center item more space to appear more centered
	},
	navText: {
		color: '#666',
		fontSize: 10,
		marginTop: 4,
		textAlign: 'center',
	},
	navCircle: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: '#FF5252',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 5,
		shadowColor: '#FF5252',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
	},
});
