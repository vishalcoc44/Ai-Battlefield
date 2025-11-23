import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, IconButton, Button, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BIASES = [
	{
		id: '1',
		name: 'Confirmation Bias',
		score: 0.8,
		color: '#FF5252',
		desc: 'Tendency to favor information that confirms your existing beliefs.',
		example: 'In the "Nuclear Energy" debate, you dismissed 3 sources citing safety data.'
	},
	{
		id: '2',
		name: 'Ad Hominem',
		score: 0.3,
		color: '#4CAF50',
		desc: 'Attacking the opponent rather than their argument.',
		example: 'Low frequency. Good job focusing on the topic!'
	},
	{
		id: '3',
		name: 'Sunk Cost Fallacy',
		score: 0.6,
		color: '#FFC107',
		desc: 'Continuing a behavior because of previously invested resources.',
		example: 'You held onto the "Inflation" point despite counter-evidence.'
	},
];

export default function BlindSpotScreen() {
	const navigation = useNavigation();
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
								<Text style={styles.radarStatValue}>3</Text>
								<Text style={styles.radarStatLabel}>Active Biases Detected</Text>
							</View>
						</LinearGradient>
					</Surface>

					<Text style={styles.sectionTitle}>Detected Patterns</Text>

					{BIASES.map((bias) => (
						<Surface key={bias.id} style={styles.biasCard} elevation={2}>
							<View style={styles.biasHeader}>
								<View style={styles.biasTitleRow}>
									<MaterialCommunityIcons
										name={bias.score > 0.5 ? "alert-circle-outline" : "check-circle-outline"}
										size={24}
										color={bias.color}
									/>
									<Text style={styles.biasName}>{bias.name}</Text>
								</View>
								<Text style={[styles.biasScore, { color: bias.color }]}>
									{(bias.score * 100).toFixed(0)}%
								</Text>
							</View>

							<ProgressBar
								progress={bias.score}
								color={bias.color}
								style={styles.progressBar}
							/>

							<Text style={styles.biasDesc}>{bias.desc}</Text>

							<View style={styles.exampleBox}>
								<Text style={styles.exampleLabel}>RECENT INSTANCE:</Text>
								<Text style={styles.exampleText}>"{bias.example}"</Text>
							</View>

							{bias.score > 0.5 && (
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
					))}

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
});
