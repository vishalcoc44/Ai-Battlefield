import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, IconButton, Button, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Slider is not in react-native-paper by default, using standard Slider or just a mock for now. 
// Actually, let's use a custom view for the slider to avoid extra dependencies if possible, 
// or just use a simple number input/buttons for MVP. 
// Let's use a simple visual slider simulation with buttons.

const PREDICTIONS = [
	{
		id: '1',
		question: 'Will AGI be achieved by 2027?',
		category: 'Technology',
		deadline: 'Dec 31, 2026',
		myProbability: 0.65,
		communityProbability: 0.42,
	},
	{
		id: '2',
		question: 'Will humans land on Mars before 2030?',
		category: 'Space',
		deadline: 'Dec 31, 2029',
		myProbability: null, // Not predicted yet
		communityProbability: 0.78,
	},
];

export default function PredictionScreen() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const [activePrediction, setActivePrediction] = useState(PREDICTIONS[1]);
	const [sliderValue, setSliderValue] = useState(0.5);

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#0f0c29', '#1a1a2e', '#16213e']}
				style={styles.background}
			>
				{/* Header */}
				<View style={[styles.header, { paddingTop: insets.top + 10 }]}>
					<IconButton icon="arrow-left" iconColor="#fff" onPress={() => navigation.goBack()} />
					<Text style={styles.headerTitle}>PREDICTION LAB</Text>
					<IconButton icon="chart-line" iconColor="#fff" onPress={() => { }} />
				</View>

				<ScrollView contentContainerStyle={styles.scrollContent}>

					{/* Calibration Score Card */}
					<Surface style={styles.scoreCard} elevation={4}>
						<LinearGradient
							colors={['#2a2a3a', '#1e1e2e']}
							style={styles.scoreGradient}
						>
							<View style={styles.scoreRow}>
								<View style={styles.scoreItem}>
									<Text style={styles.scoreLabel}>BRIER SCORE</Text>
									<Text style={styles.scoreValue}>0.14</Text>
									<Text style={styles.scoreSub}>Lower is better</Text>
								</View>
								<View style={styles.scoreDivider} />
								<View style={styles.scoreItem}>
									<Text style={styles.scoreLabel}>CALIBRATION</Text>
									<Text style={styles.scoreValue}>Top 5%</Text>
									<Text style={styles.scoreSub}>Superforecaster</Text>
								</View>
							</View>

							{/* Mock Calibration Graph */}
							<View style={styles.graphContainer}>
								<View style={styles.graphLine} />
								<View style={styles.graphDot} />
								<Text style={styles.graphLabel}>Perfect Calibration Line</Text>
							</View>
						</LinearGradient>
					</Surface>

					<Text style={styles.sectionTitle}>Open Questions</Text>

					{/* Active Prediction Card */}
					<Surface style={styles.predictionCard} elevation={4}>
						<View style={styles.categoryBadge}>
							<Text style={styles.categoryText}>{activePrediction.category.toUpperCase()}</Text>
						</View>

						<Text style={styles.questionText}>{activePrediction.question}</Text>
						<Text style={styles.deadlineText}>Resolves: {activePrediction.deadline}</Text>

						<View style={styles.sliderContainer}>
							<Text style={styles.sliderLabel}>Your Probability: {(sliderValue * 100).toFixed(0)}%</Text>

							{/* Custom Slider Mockup */}
							<View style={styles.sliderTrack}>
								<View style={[styles.sliderFill, { width: `${sliderValue * 100}%` }]} />
								<View style={[styles.sliderThumb, { left: `${sliderValue * 100}%` }]} />
							</View>

							<View style={styles.sliderControls}>
								<Button mode="outlined" onPress={() => setSliderValue(Math.max(0, sliderValue - 0.1))} compact>-10%</Button>
								<Button mode="outlined" onPress={() => setSliderValue(Math.min(1, sliderValue + 0.1))} compact>+10%</Button>
							</View>
						</View>

						<Button
							mode="contained"
							onPress={() => { }}
							style={styles.predictButton}
						>
							LOCK IN PREDICTION
						</Button>

						<Text style={styles.communityText}>
							Community Consensus: {(activePrediction.communityProbability * 100).toFixed(0)}%
						</Text>
					</Surface>

					{/* Past Predictions List */}
					<Text style={styles.sectionTitle}>Your Portfolio</Text>
					{PREDICTIONS.filter(p => p.myProbability !== null).map((p) => (
						<Surface key={p.id} style={styles.portfolioItem} elevation={1}>
							<View>
								<Text style={styles.portfolioQuestion}>{p.question}</Text>
								<Text style={styles.portfolioDate}>Resolves: {p.deadline}</Text>
							</View>
							<View style={styles.portfolioRight}>
								<Text style={styles.portfolioScore}>{(p.myProbability! * 100).toFixed(0)}%</Text>
								<Text style={styles.portfolioLabel}>CONFIDENCE</Text>
							</View>
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
	scoreCard: {
		borderRadius: 16,
		overflow: 'hidden',
		marginBottom: 30,
	},
	scoreGradient: {
		padding: 20,
	},
	scoreRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	scoreItem: {
		flex: 1,
		alignItems: 'center',
	},
	scoreLabel: {
		color: '#aaa',
		fontSize: 10,
		fontWeight: 'bold',
		letterSpacing: 1,
		marginBottom: 4,
	},
	scoreValue: {
		color: '#fff',
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 2,
	},
	scoreSub: {
		color: '#4CAF50',
		fontSize: 10,
	},
	scoreDivider: {
		width: 1,
		backgroundColor: '#444',
		marginHorizontal: 10,
	},
	graphContainer: {
		height: 100,
		backgroundColor: '#161625',
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#333',
	},
	graphLine: {
		width: '80%',
		height: 1,
		backgroundColor: '#666',
		transform: [{ rotate: '-45deg' }],
	},
	graphDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#4CAF50',
		position: 'absolute',
		top: 40,
		left: '60%',
	},
	graphLabel: {
		position: 'absolute',
		bottom: 5,
		color: '#666',
		fontSize: 10,
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
		marginLeft: 5,
	},
	predictionCard: {
		backgroundColor: '#1e1e2e',
		borderRadius: 16,
		padding: 20,
		marginBottom: 30,
		borderWidth: 1,
		borderColor: '#333',
	},
	categoryBadge: {
		alignSelf: 'flex-start',
		backgroundColor: 'rgba(33, 150, 243, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		marginBottom: 10,
	},
	categoryText: {
		color: '#2196F3',
		fontSize: 10,
		fontWeight: 'bold',
	},
	questionText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
		lineHeight: 26,
	},
	deadlineText: {
		color: '#888',
		fontSize: 12,
		marginBottom: 20,
	},
	sliderContainer: {
		marginBottom: 20,
	},
	sliderLabel: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 10,
		textAlign: 'center',
	},
	sliderTrack: {
		height: 10,
		backgroundColor: '#333',
		borderRadius: 5,
		marginBottom: 15,
		position: 'relative',
	},
	sliderFill: {
		height: '100%',
		backgroundColor: '#BB86FC',
		borderRadius: 5,
	},
	sliderThumb: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: '#fff',
		position: 'absolute',
		top: -5,
		marginLeft: -10,
		elevation: 3,
	},
	sliderControls: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	predictButton: {
		backgroundColor: '#BB86FC',
		borderRadius: 8,
		marginBottom: 15,
	},
	communityText: {
		color: '#aaa',
		fontSize: 12,
		textAlign: 'center',
		fontStyle: 'italic',
	},
	portfolioItem: {
		backgroundColor: '#1e1e2e',
		borderRadius: 12,
		padding: 15,
		marginBottom: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	portfolioQuestion: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 4,
		maxWidth: 200,
	},
	portfolioDate: {
		color: '#666',
		fontSize: 10,
	},
	portfolioRight: {
		alignItems: 'flex-end',
	},
	portfolioScore: {
		color: '#BB86FC',
		fontSize: 18,
		fontWeight: 'bold',
	},
	portfolioLabel: {
		color: '#666',
		fontSize: 8,
		fontWeight: 'bold',
	},
});
