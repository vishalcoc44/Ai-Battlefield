import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Surface, IconButton, Avatar, Button, Divider, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getUserProfile, getUserSkills, getUserAchievements, initializeDefaultSkills } from '../services/profileService';
import type { UserProfile, CognitiveSkill, UserAchievement } from '../services/profileService';

export default function IntellectualResumeScreen() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { session } = useAuth();

	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [skills, setSkills] = useState<CognitiveSkill[]>([]);
	const [achievements, setAchievements] = useState<UserAchievement[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingUsername, setEditingUsername] = useState(false);
	const [newUsername, setNewUsername] = useState('');

	useEffect(() => {
		loadData();
	}, [session]);

	const loadData = async () => {
		if (!session?.user?.id) return;

		setLoading(true);
		const profileData = await getUserProfile(session.user.id);
		let skillsData = await getUserSkills(session.user.id);

		// Initialize default skills if none exist
		if (skillsData.length === 0) {
			await initializeDefaultSkills(session.user.id);
			skillsData = await getUserSkills(session.user.id);
		}

		const achievementsData = await getUserAchievements(session.user.id);

		setProfile(profileData);
		setSkills(skillsData);
		setAchievements(achievementsData);
		setLoading(false);
	};

	const handleUpdateUsername = async () => {
		if (!session?.user?.id || !newUsername.trim()) return;

		try {
			const { error } = await supabase
				.from('profiles')
				.update({ username: newUsername.trim() })
				.eq('id', session.user.id);

			if (error) {
				alert('Error updating username: ' + error.message);
			} else {
				// Update local state
				if (profile) {
					setProfile({ ...profile, username: newUsername.trim() });
				}
				setEditingUsername(false);
				alert('Username updated successfully!');
			}
		} catch (error) {
			console.error('Error updating username:', error);
			alert('Failed to update username');
		}
	};

	const handleLogout = async () => {
		try {
			await supabase.auth.signOut();
			(navigation as any).navigate('Auth');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.centered]}>
				<LinearGradient colors={['#0f0c29', '#1a1a2e', '#16213e']} style={styles.background}>
					<ActivityIndicator size="large" color="#BB86FC" />
					<Text style={{ color: '#fff', marginTop: 10 }}>Loading resume...</Text>
				</LinearGradient>
			</View>
		);
	}

	if (!profile) {
		return (
			<View style={[styles.container, styles.centered]}>
				<LinearGradient colors={['#0f0c29', '#1a1a2e', '#16213e']} style={styles.background}>
					<Text style={{ color: '#fff' }}>Profile not found</Text>
				</LinearGradient>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#0f0c29', '#1a1a2e', '#16213e']}
				style={styles.background}
			>
				{/* Header Actions */}
				<View style={[styles.headerActions, { paddingTop: insets.top + 10 }]}>
					<IconButton icon="arrow-left" iconColor="#fff" onPress={() => navigation.goBack()} />
					<IconButton icon="share-variant" iconColor="#fff" onPress={() => { }} />
				</View>

				<ScrollView contentContainerStyle={styles.scrollContent}>

					{/* Resume Paper Effect */}
					<Surface style={styles.resumePaper} elevation={5}>
						<LinearGradient
							colors={['#ffffff', '#f8f9fa']}
							style={styles.paperGradient}
						>
							{/* Header Profile */}
							<View style={styles.resumeHeader}>
								<Avatar.Image size={80} source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
								<View style={styles.headerInfo}>
									{editingUsername ? (
										<View style={styles.usernameEditContainer}>
											<TextInput
												value={newUsername}
												onChangeText={setNewUsername}
												placeholder="Enter display name"
												mode="outlined"
												style={styles.usernameInput}
												theme={{ colors: { primary: '#BB86FC', outline: '#555' } }}
												textColor="#1a1a2e"
												maxLength={30}
											/>
											<View style={styles.usernameEditButtons}>
												<IconButton
													icon="check"
													size={20}
													iconColor="#4CAF50"
													onPress={handleUpdateUsername}
												/>
												<IconButton
													icon="close"
													size={20}
													iconColor="#F44336"
													onPress={() => {
														setEditingUsername(false);
														setNewUsername(profile?.username || '');
													}}
												/>
											</View>
										</View>
									) : (
										<View style={styles.nameContainer}>
											<Text style={styles.name}>{profile.username || session?.user?.email || 'Anonymous'}</Text>
											<IconButton
												icon="pencil"
												size={16}
												iconColor="#BB86FC"
												onPress={() => {
													setEditingUsername(true);
													setNewUsername(profile?.username || '');
												}}
											/>
										</View>
									)}
									<Text style={styles.title}>Cognitive Gladiator • Lvl {profile.level}</Text>
									<View style={styles.badgesRow}>
										<View style={styles.badge}>
											<MaterialCommunityIcons name="trophy" size={14} color="#FFD700" />
											<Text style={styles.badgeText}>Top {profile.rank_percentile || 50}%</Text>
										</View>
										{profile.is_verified && (
											<View style={styles.badge}>
												<MaterialCommunityIcons name="check-decagram" size={14} color="#4CAF50" />
												<Text style={styles.badgeText}>Verified</Text>
											</View>
										)}
									</View>
								</View>
							</View>

							<Divider style={styles.divider} />

							{/* Stats Grid */}
							<View style={styles.statsGrid}>
								<View style={styles.statItem}>
									<Text style={styles.statNumber}>{profile.total_debates}</Text>
									<Text style={styles.statLabel}>Debates</Text>
								</View>
								<View style={styles.statItem}>
									<Text style={styles.statNumber}>{profile.views_changed}</Text>
									<Text style={styles.statLabel}>Views Changed</Text>
								</View>
								<View style={styles.statItem}>
									<Text style={styles.statNumber}>{profile.total_predictions}</Text>
									<Text style={styles.statLabel}>Predictions</Text>
								</View>
								<View style={styles.statItem}>
									<Text style={styles.statNumber}>{(profile.calm_score * 100).toFixed(0)}%</Text>
									<Text style={styles.statLabel}>Calm Score</Text>
								</View>
							</View>

							<Divider style={styles.divider} />

							{/* Cognitive Skills */}
							<Text style={styles.sectionTitle}>Cognitive Skills</Text>
							{skills.map((skill) => (
								<View key={skill.id} style={styles.skillRow}>
									<View style={styles.skillHeader}>
										<Text style={styles.skillName}>{skill.skill_name}</Text>
										<Text style={styles.skillLevel}>{skill.level}/100</Text>
									</View>
									<View style={styles.progressBarBg}>
										<View
											style={[
												styles.progressBarFill,
												{
													width: `${skill.level}%`,
													backgroundColor: skill.color,
												},
											]}
										/>
									</View>
								</View>
							))}

							<Divider style={styles.divider} />

							{/* Achievements */}
							<Text style={styles.sectionTitle}>Achievements</Text>
							{achievements.length === 0 ? (
								<Text style={styles.emptyText}>No achievements unlocked yet</Text>
							) : (
								<View style={styles.achievementsGrid}>
									{achievements.map((userAchievement) => (
										<View key={userAchievement.id} style={styles.achievementCard}>
											<MaterialCommunityIcons
												name={userAchievement.achievement?.icon as any || 'trophy'}
												size={32}
												color="#FFD700"
											/>
											<Text style={styles.achievementTitle}>{userAchievement.achievement?.title}</Text>
											<Text style={styles.achievementDesc}>{userAchievement.achievement?.description}</Text>
										</View>
									))}
								</View>
							)}

							<Divider style={styles.divider} />

							{/* Calibration */}
							<Text style={styles.sectionTitle}>Prediction Calibration</Text>
							<View style={styles.calibrationCard}>
								<View style={styles.calibrationRow}>
									<Text style={styles.calibrationLabel}>Brier Score:</Text>
									<Text style={styles.calibrationValue}>{profile.brier_score.toFixed(3)}</Text>
								</View>
								<View style={styles.calibrationRow}>
									<Text style={styles.calibrationLabel}>Rank:</Text>
									<Text style={styles.calibrationValue}>{profile.calibration_rank}</Text>
								</View>
								<Text style={styles.calibrationNote}>
									Lower Brier scores indicate better calibration (0 = perfect)
								</Text>
							</View>

						</LinearGradient>
					</Surface>

					{/* Export Button */}
					<Button
						mode="contained"
						icon="download"
						style={styles.exportButton}
						buttonColor="#BB86FC"
						onPress={() => { }}
					>
						Export as PDF
					</Button>

					{/* Logout Button */}
					<Button
						mode="outlined"
						icon="logout"
						style={styles.logoutButton}
						textColor="#FF5252"
						onPress={handleLogout}
					>
						Logout
					</Button>

				</ScrollView>
			</LinearGradient>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	background: {
		flex: 1,
	},
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerActions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
	},
	scrollContent: {
		padding: 20,
		paddingBottom: 40,
	},
	resumePaper: {
		borderRadius: 16,
		overflow: 'hidden',
		marginBottom: 20,
	},
	paperGradient: {
		padding: 24,
	},
	resumeHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	avatar: {
		marginRight: 16,
	},
	headerInfo: {
		flex: 1,
	},
	nameContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	usernameEditContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	usernameInput: {
		flex: 1,
		height: 40,
		backgroundColor: '#fff',
		marginRight: 8,
	},
	usernameEditButtons: {
		flexDirection: 'row',
	},
	name: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#1a1a2e',
		marginBottom: 4,
	},
	title: {
		fontSize: 14,
		color: '#666',
		marginBottom: 8,
	},
	badgesRow: {
		flexDirection: 'row',
		gap: 8,
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		gap: 4,
	},
	badgeText: {
		fontSize: 11,
		color: '#333',
		fontWeight: '600',
	},
	divider: {
		marginVertical: 20,
		backgroundColor: '#e0e0e0',
	},
	statsGrid: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	statItem: {
		alignItems: 'center',
	},
	statNumber: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#1a1a2e',
	},
	statLabel: {
		fontSize: 12,
		color: '#666',
		marginTop: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#1a1a2e',
		marginBottom: 16,
	},
	skillRow: {
		marginBottom: 16,
	},
	skillHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	skillName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
	},
	skillLevel: {
		fontSize: 14,
		color: '#666',
	},
	progressBarBg: {
		height: 8,
		backgroundColor: '#e0e0e0',
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressBarFill: {
		height: '100%',
		borderRadius: 4,
	},
	emptyText: {
		color: '#999',
		fontStyle: 'italic',
		textAlign: 'center',
		paddingVertical: 20,
	},
	achievementsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	achievementCard: {
		width: '48%',
		backgroundColor: '#f8f9fa',
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	achievementTitle: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#1a1a2e',
		marginTop: 8,
		textAlign: 'center',
	},
	achievementDesc: {
		fontSize: 11,
		color: '#666',
		marginTop: 4,
		textAlign: 'center',
	},
	calibrationCard: {
		backgroundColor: '#f8f9fa',
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	calibrationRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	calibrationLabel: {
		fontSize: 14,
		color: '#666',
	},
	calibrationValue: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#1a1a2e',
	},
	calibrationNote: {
		fontSize: 11,
		color: '#999',
		fontStyle: 'italic',
		marginTop: 8,
	},
	exportButton: {
		borderRadius: 12,
		paddingVertical: 6,
		marginBottom: 15,
	},
	logoutButton: {
		borderRadius: 12,
		paddingVertical: 6,
		borderColor: '#FF5252',
	},
});
