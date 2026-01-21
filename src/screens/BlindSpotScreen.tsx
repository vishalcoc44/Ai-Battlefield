import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, IconButton, Button, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserBiasStats } from '../services/cognitiveBiasService';

export default function BlindSpotScreen() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { user } = useAuth();
	const [biasStats, setBiasStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (user) {
			fetchBiasStats();
		}
	}, [user]);

	const fetchBiasStats = async () => {
		try {
			setLoading(true);
			const stats = await getUserBiasStats(user!.id);
			setBiasStats(stats);
		} catch (error) {
			console.error('Error fetching bias stats:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#BB86FC" />
				<Text style={styles.loadingText}>Scanning your debate history...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#0f0c29', '#1a1a2e', '#16213e']}
				style={styles.background}
			>
				{/* Header */}
				<View style={[styles.header, { paddingTop: insets.top + 10 }]}>
					<IconButton icon="arrow-left" iconColor="#fff" onPress={() => navigation.goBack()} />
					<Text style={styles.headerTitle}>BLIND SPOT DETECTOR</Text>
					<IconButton icon="radar" iconColor="#fff" onPress={() => { }} />
				</View>

				<ScrollView contentContainerStyle={styles.scrollContent}>

					{/* Radar Chart Placeholder */}
					<Surface style={styles.radarCard} elevation={4}>
						<LinearGradient
							colors={['rgba(33, 150, 243, 0.1)', 'rgba(33, 150, 243, 0.05)']}
							style={styles.radarGradient}
						>
							<View style={styles.radarContainer}>
								{/* Visual representation of a radar/spider chart */}
								<MaterialCommunityIcons name="radar" size={120} color="rgba(33, 150, 243, 0.5)" />
								<Text style={styles.radarLabel}>Scanning Debate History...</Text>
							</View>
							<View style={styles.radarStats}>
								<Text style={styles.radarStatValue}>{biasStats?.activeBiases || 0}</Text>
								<Text style={styles.radarStatLabel}>Active Biases Detected</Text>
							</View>
						</LinearGradient>
					</Surface>

					<Text style={styles.sectionTitle}>Detected Patterns</Text>

					{biasStats?.biasGroups?.length > 0 ? (
						biasStats.biasGroups.map((bias: any) => (
							<Surface key={bias.type} style={styles.biasCard} elevation={2}>
								<View style={styles.biasHeader}>
									<View style={styles.biasTitleRow}>
										<MaterialCommunityIcons
											name={bias.averageScore > 0.5 ? "alert-circle-outline" : "check-circle-outline"}
											size={24}
											color={bias.color}
										/>
										<Text style={styles.biasName}>{bias.name}</Text>
									</View>
									<Text style={[styles.biasScore, { color: bias.color }]}>
										{(bias.averageScore * 100).toFixed(0)}%
									</Text>
								</View>

								<ProgressBar
									progress={bias.averageScore}
									color={bias.color}
									style={styles.progressBar}
								/>

								<Text style={styles.biasDesc}>{bias.description}</Text>

								{bias.recentExample && (
									<View style={styles.exampleBox}>
										<Text style={styles.exampleLabel}>RECENT INSTANCE:</Text>
										<Text style={styles.exampleText}>"{bias.recentExample.text}"</Text>
										<Text style={styles.exampleDate}>
											{new Date(bias.recentExample.date).toLocaleDateString()}
										</Text>
									</View>
								)}

								{bias.averageScore > 0.5 && (
									<Button
										mode="outlined"
										onPress={() => { }}
										style={styles.fixButton}
										textColor={bias.color}
										icon="dumbbell"
									>
										Train to Fix This
									</Button>
								)}
							</Surface>
						))
					) : (
						<Surface style={styles.biasCard} elevation={2}>
							<Text style={styles.noBiasesText}>
								No cognitive biases detected yet. Participate in more debates to see your patterns!
							</Text>
						</Surface>
					)}

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
		paddingBottom: 50,
	},
	radarCard: {
		borderRadius: 20,
		overflow: 'hidden',
		marginBottom: 30,
		backgroundColor: '#1e1e2e',
		borderWidth: 1,
		borderColor: 'rgba(33, 150, 243, 0.3)',
	},
	radarGradient: {
		padding: 30,
		alignItems: 'center',
	},
	radarContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	radarLabel: {
		color: '#2196F3',
		marginTop: 10,
		fontSize: 12,
		letterSpacing: 1,
	},
	radarStats: {
		alignItems: 'center',
	},
	radarStatValue: {
		color: '#fff',
		fontSize: 36,
		fontWeight: 'bold',
	},
	radarStatLabel: {
		color: '#aaa',
		fontSize: 12,
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
		marginLeft: 5,
	},
	biasCard: {
		backgroundColor: '#1e1e2e',
		borderRadius: 16,
		padding: 20,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: '#333',
	},
	biasHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	biasTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	biasName: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		marginLeft: 10,
	},
	biasScore: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	progressBar: {
		height: 6,
		borderRadius: 3,
		backgroundColor: '#333',
		marginBottom: 15,
	},
	biasDesc: {
		color: '#aaa',
		fontSize: 14,
		marginBottom: 15,
		lineHeight: 20,
	},
	exampleBox: {
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		padding: 12,
		borderRadius: 8,
		marginBottom: 15,
	},
	exampleLabel: {
		color: '#666',
		fontSize: 10,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	exampleText: {
		color: '#ddd',
		fontSize: 12,
		fontStyle: 'italic',
	},
	fixButton: {
		borderColor: '#333',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#0f0c29',
	},
	loadingText: {
		color: '#BB86FC',
		marginTop: 10,
		fontSize: 16,
	},
	noBiasesText: {
		color: '#666',
		fontSize: 14,
		textAlign: 'center',
		fontStyle: 'italic',
		padding: 20,
	},
	exampleDate: {
		color: '#888',
		fontSize: 10,
		marginTop: 4,
		fontStyle: 'italic',
	},
});
