import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserBeliefs, getBeliefStats, Belief } from '../services/beliefService';

const { width } = Dimensions.get('window');

interface BeliefWithMetrics extends Belief {
	change: string;
	color: string;
	lastDebate: string;
}

export default function BeliefTrackerScreen() {
	const navigation = useNavigation();
	const { session } = useAuth();
	const [beliefs, setBeliefs] = useState<BeliefWithMetrics[]>([]);
	const [stats, setStats] = useState({ totalBeliefs: 0, viewsChanged: 0, averageConfidenceChange: 0 });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadBeliefs();
	}, [session]);

	const loadBeliefs = async () => {
		if (!session?.user?.id) return;

		setLoading(true);
		const [beliefsData, statsData] = await Promise.all([
			getUserBeliefs(session.user.id),
			getBeliefStats(session.user.id),
		]);

		// Transform beliefs to include UI metadata
		const transformedBeliefs: BeliefWithMetrics[] = beliefsData.map((belief) => {
			const change = ((belief.current_confidence - belief.initial_confidence) * 100).toFixed(0);
			const changeWithSign = Number(change) >= 0 ? `+${change}%` : `${change}%`;

			let color = '#4CAF50';
			if (belief.status === 'shattered') color = '#FF5252';
			else if (belief.status === 'shifted') color = '#2196F3';
			else if (belief.status === 'reinforced') color = '#4CAF50';
			else color = '#FFC107';

			const lastDebate = belief.last_debate_at
				? getRelativeTime(new Date(belief.last_debate_at))
				: 'Never';

			return {
				...belief,
				change: changeWithSign,
				color,
				lastDebate,
			};
		});

		setBeliefs(transformedBeliefs);
		setStats(statsData);
		setLoading(false);
	};

	const getRelativeTime = (date: Date): string => {
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
		return `${Math.floor(diffInDays / 30)} months ago`;
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.centered]}>
				<LinearGradient colors={['#0f0c29', '#1a1a2e', '#16213e']} style={styles.background}>
					<ActivityIndicator size="large" color="#BB86FC" />
					<Text style={{ color: '#fff', marginTop: 10 }}>Loading beliefs...</Text>
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
				<View style={styles.header}>
					<IconButton icon="arrow-left" iconColor="#fff" onPress={() => navigation.goBack()} />
					<Text style={styles.headerTitle}>MIND MAP</Text>
					<IconButton icon="share-variant" iconColor="#fff" onPress={() => { }} />
				</View>

				<ScrollView contentContainerStyle={styles.scrollContent}>
					{/* Stats Summary */}
					<View style={styles.statsRow}>
						<Surface style={styles.statCard} elevation={2}>
							<Text style={styles.statValue}>{stats.viewsChanged}</Text>
							<Text style={styles.statLabel}>Views Changed</Text>
						</Surface>
						<Surface style={styles.statCard} elevation={2}>
							<Text style={styles.statValue}>+{Math.floor(stats.viewsChanged * 37.5)}</Text>
							<Text style={styles.statLabel}>XP Gained</Text>
						</Surface>
						<Surface style={styles.statCard} elevation={2}>
							<Text style={styles.statValue}>Lvl {Math.min(10, Math.floor(stats.totalBeliefs / 2) + 1)}</Text>
							<Text style={styles.statLabel}>Open Mind</Text>
						</Surface>
					</View>

					<Text style={styles.sectionTitle}>Belief Evolution</Text>

					{beliefs.length === 0 ? (
						<Surface style={styles.beliefCard} elevation={2}>
							<Text style={{ color: '#aaa', textAlign: 'center', padding: 20 }}>
								No beliefs tracked yet. Start a debate to begin tracking your belief changes!
							</Text>
						</Surface>
					) : (
						beliefs.map((belief) => (
							<Surface key={belief.id} style={styles.beliefCard} elevation={2}>
								<View style={styles.cardHeader}>
									<View style={[styles.iconContainer, { backgroundColor: belief.color + '33' }]}>
										<MaterialCommunityIcons name={belief.icon as any} size={24} color={belief.color} />
									</View>
									<View style={styles.headerText}>
										<Text style={styles.topic}>{belief.topic}</Text>
										<Text style={styles.lastDebate}>Last debate: {belief.lastDebate}</Text>
									</View>
									<Text style={{ color: belief.color, fontWeight: 'bold' }}>{belief.change}</Text>
								</View>

								<View style={styles.progressContainer}>
									<View style={styles.progressLabels}>
										<Text style={styles.progressLabel}>Initial: {(belief.initial_confidence * 100).toFixed(0)}%</Text>
										<Text style={styles.progressLabel}>Current: {(belief.current_confidence * 100).toFixed(0)}%</Text>
									</View>
									<View style={styles.progressBarBg}>
										<View style={[styles.connector, {
											left: `${Math.min(belief.initial_confidence, belief.current_confidence) * 100}%`,
											width: `${Math.abs(belief.current_confidence - belief.initial_confidence) * 100}%`,
											backgroundColor: belief.color
										}]} />
										<View style={[styles.marker, { left: `${belief.initial_confidence * 100}%`, backgroundColor: '#666' }]} />
										<View style={[styles.marker, { left: `${belief.current_confidence * 100}%`, backgroundColor: belief.color }]} />
									</View>
								</View>

								<View style={styles.footer}>
									<Text style={styles.statusText}>Status: {belief.status.toUpperCase()}</Text>
									<IconButton icon="chevron-right" size={20} iconColor="#666" />
								</View>
							</Surface>
						))
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
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingTop: 50,
		paddingBottom: 10,
		paddingHorizontal: 10,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: 2,
	},
	scrollContent: {
		padding: 20,
	},
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 30,
	},
	statCard: {
		width: '31%',
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		borderRadius: 12,
		padding: 10,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.1)',
	},
	statValue: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
	},
	statLabel: {
		color: '#aaa',
		fontSize: 10,
		marginTop: 4,
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 15,
		marginLeft: 5,
	},
	beliefCard: {
		backgroundColor: '#1e1e2e',
		borderRadius: 16,
		padding: 15,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: '#333',
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	headerText: {
		flex: 1,
	},
	topic: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	lastDebate: {
		color: '#666',
		fontSize: 12,
	},
	progressContainer: {
		marginBottom: 15,
	},
	progressLabels: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	progressLabel: {
		color: '#888',
		fontSize: 12,
	},
	progressBarBg: {
		height: 4,
		backgroundColor: '#333',
		borderRadius: 2,
		position: 'relative',
		marginTop: 5,
	},
	marker: {
		width: 4,
		height: 8,
		borderRadius: 2,
		position: 'absolute',
		top: -2,
	},
	connector: {
		height: 2,
		position: 'absolute',
		top: 1,
		opacity: 0.5,
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderTopWidth: 1,
		borderTopColor: '#333',
		paddingTop: 10,
	},
	statusText: {
		color: '#aaa',
		fontSize: 12,
	},
});
