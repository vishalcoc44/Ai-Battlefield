import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, Surface, IconButton, Button, ProgressBar, ActivityIndicator, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import {
	getUserPredictions,
	getOpenPredictions,
	createPrediction,
	getUserBrierScore,
	getPredictionStats,
	Prediction
} from '../services/predictionService';

interface OpenPrediction {
	id: string;
	question: string;
	category: string;
	deadline: string;
	community_probability?: number;
}

export default function PredictionScreen() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { user } = useAuth();
	const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
	const [openPredictions, setOpenPredictions] = useState<OpenPrediction[]>([]);
	const [stats, setStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [activePrediction, setActivePrediction] = useState<OpenPrediction | null>(null);
	const [sliderValue, setSliderValue] = useState(0.5);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newQuestion, setNewQuestion] = useState('');
	const [newCategory, setNewCategory] = useState('Technology');
	const [newDeadline, setNewDeadline] = useState('');
	const [hasPredicted, setHasPredicted] = useState(false);
	const sliderRef = useRef<View>(null);

	useEffect(() => {
		if (user) {
			fetchData();
		}
	}, [user]);

	const handleSliderTouch = (event: any) => {
		if (!sliderRef.current) return;

		sliderRef.current.measure((x, y, width, height, pageX, pageY) => {
			const touchX = event.nativeEvent.pageX;
			const sliderStartX = pageX;
			const sliderWidth = width;
			const relativeX = Math.max(0, Math.min(touchX - sliderStartX, sliderWidth));
			const newValue = relativeX / sliderWidth;
			setSliderValue(newValue);
		});
	};

	const formatDeadline = (deadline: string) => {
		const date = new Date(deadline);
		const now = new Date();
		const diffTime = date.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return 'Resolves: Today';
		} else if (diffDays === 1) {
			return 'Resolves: Tomorrow';
		} else if (diffDays < 7) {
			return `Resolves: In ${diffDays} days`;
		} else {
			const options: Intl.DateTimeFormatOptions = {
				month: 'short',
				day: 'numeric',
				year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
			};
			return `Resolves: ${date.toLocaleDateString('en-US', options)}`;
		}
	};

	const fetchData = async () => {
		try {
			setLoading(true);
			const [predictions, openPreds, userStats] = await Promise.all([
				getUserPredictions(user!.id),
				getOpenPredictions(), // Temporarily disabled community filtering
				getPredictionStats(user!.id)
			]);

			console.log('Predictions loaded:', { predictions, openPreds, userStats });
			setUserPredictions(predictions);
			setOpenPredictions(openPreds);
			setStats(userStats);

			// Set first open prediction as active if available
			if (openPreds.length > 0) {
				console.log('Setting active prediction:', openPreds[0]);
				setActivePrediction(openPreds[0]);
				// Check if user has already predicted on this question
				const hasPredictedOnActive = predictions.some(p => p.question === openPreds[0].question);
				console.log('Has predicted on active:', hasPredictedOnActive);
				setHasPredicted(hasPredictedOnActive);
			} else {
				console.log('No open predictions found');
				setActivePrediction(null);
				setHasPredicted(false);
			}
		} catch (error) {
			console.error('Error fetching prediction data:', error);
			Alert.alert('Error', 'Failed to load prediction data');
		} finally {
			setLoading(false);
		}
	};

	const handleCreatePrediction = async () => {
		if (!user || !activePrediction) return;

		try {
			setCreating(true);
			const success = await createPrediction(
				user.id,
				activePrediction.question,
				activePrediction.category,
				sliderValue,
				activePrediction.deadline
			);

			if (success) {
				Alert.alert('Success', 'Prediction created!');
				fetchData(); // Refresh data
				setHasPredicted(true); // Mark as predicted
			} else {
				Alert.alert('Error', 'Failed to create prediction');
			}
		} catch (error) {
			console.error('Error creating prediction:', error);
			Alert.alert('Error', 'Failed to create prediction');
		} finally {
			setCreating(false);
		}
	};

	const handleCreateNewPrediction = async () => {
		if (!user || !newQuestion.trim() || !newCategory || !newDeadline) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

		try {
			setCreating(true);
			// Create a new prediction question with user's initial probability
			const success = await createPrediction(
				user.id,
				newQuestion.trim(),
				newCategory,
				0.5, // Default 50% probability for new questions
				newDeadline
			);

			if (success) {
				Alert.alert('Success', 'New prediction question created!');
				setShowCreateForm(false);
				setNewQuestion('');
				setNewCategory('Technology');
				setNewDeadline('');
				fetchData(); // Refresh data
			} else {
				Alert.alert('Error', 'Failed to create prediction question');
			}
		} catch (error) {
			console.error('Error creating new prediction:', error);
			Alert.alert('Error', 'Failed to create prediction question');
		} finally {
			setCreating(false);
		}
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#BB86FC" />
				<Text style={styles.loadingText}>Loading predictions...</Text>
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
									<Text style={styles.scoreValue}>{stats?.brierScore?.toFixed(2) || '0.50'}</Text>
									<Text style={styles.scoreSub}>Lower is better</Text>
								</View>
								<View style={styles.scoreDivider} />
								<View style={styles.scoreItem}>
									<Text style={styles.scoreLabel}>CALIBRATION</Text>
									<Text style={styles.scoreValue}>{stats?.calibrationRank || 'Novice'}</Text>
									<Text style={styles.scoreSub}>{stats?.calibrationRank === 'Superforecaster' ? 'Top 5%' : 'Keep practicing'}</Text>
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

					{/* Create New Prediction Section */}
					<View style={styles.createSection}>
						<Button
							mode="outlined"
							onPress={() => setShowCreateForm(!showCreateForm)}
							style={styles.createToggleButton}
							labelStyle={styles.createToggleLabel}
							icon={showCreateForm ? "chevron-up" : "plus"}
						>
							{showCreateForm ? 'HIDE FORM' : 'CREATE NEW PREDICTION'}
						</Button>

						{showCreateForm && (
							<Surface style={styles.createForm} elevation={4}>
								<Text style={styles.formTitle}>Create New Prediction Question</Text>

								<TextInput
									mode="flat"
									label="Question"
									value={newQuestion}
									onChangeText={setNewQuestion}
									placeholder="Will AI surpass human intelligence by 2030?"
									style={styles.questionInput}
									underlineColor="#BB86FC"
									activeUnderlineColor="#BB86FC"
									textColor="#fff"
									placeholderTextColor="#666"
									multiline
									numberOfLines={3}
								/>

								<View style={styles.formRow}>
									<View style={styles.categoryContainer}>
										<Text style={styles.inputLabel}>Category</Text>
										<View style={styles.categoryButtons}>
											{['Technology', 'Politics', 'Science', 'Economy', 'Sports'].map((cat) => (
												<Button
													key={cat}
													mode={newCategory === cat ? "contained" : "outlined"}
													onPress={() => setNewCategory(cat)}
													style={[styles.categoryButton, newCategory === cat && styles.categoryButtonActive]}
													labelStyle={newCategory === cat ? styles.categoryButtonActiveLabel : styles.categoryButtonLabel}
													compact
												>
													{cat}
												</Button>
											))}
										</View>
									</View>
								</View>

								<View style={styles.formRow}>
									<View style={styles.deadlineContainer}>
										<Text style={styles.inputLabel}>Resolution Deadline</Text>
										<View style={styles.deadlineButtons}>
											{[
												{ label: '1 Week', days: 7 },
												{ label: '1 Month', days: 30 },
												{ label: '3 Months', days: 90 },
												{ label: '6 Months', days: 180 }
											].map((option) => {
												const deadline = new Date();
												deadline.setDate(deadline.getDate() + option.days);
												const deadlineStr = deadline.toISOString().split('T')[0];
												return (
													<Button
														key={option.label}
														mode={newDeadline === deadlineStr ? "contained" : "outlined"}
														onPress={() => setNewDeadline(deadlineStr)}
														style={[styles.deadlineButton, newDeadline === deadlineStr && styles.deadlineButtonActive]}
														labelStyle={newDeadline === deadlineStr ? styles.deadlineButtonActiveLabel : styles.deadlineButtonLabel}
														compact
													>
														{option.label}
													</Button>
												);
											})}
										</View>
									</View>
								</View>

								<Button
									mode="contained"
									onPress={handleCreateNewPrediction}
									style={styles.createNewButton}
									disabled={creating || !newQuestion.trim() || !newDeadline}
									loading={creating}
								>
									{creating ? 'CREATING...' : 'CREATE PREDICTION QUESTION'}
								</Button>

								<Text style={styles.createNote}>
									Others will be able to predict on your question and you'll get calibration points when it resolves.
								</Text>
							</Surface>
						)}
					</View>

					<Text style={styles.sectionTitle}>Open Questions</Text>

					{/* Active Prediction Card */}
					{activePrediction ? (
						<Surface style={styles.predictionCard} elevation={4}>
							<View style={styles.categoryBadge}>
								<Text style={styles.categoryText}>{activePrediction.category.toUpperCase()}</Text>
							</View>

							<Text style={styles.questionText}>{activePrediction.question}</Text>
							<Text style={styles.deadlineText}>{formatDeadline(activePrediction.deadline)}</Text>

						<View style={styles.sliderContainer}>
							<Text style={styles.sliderLabel}>Your Probability: {(sliderValue * 100).toFixed(0)}%</Text>

							{/* Custom Slider */}
							<View
								ref={sliderRef}
								style={styles.sliderTrack}
								onTouchStart={handleSliderTouch}
								onTouchMove={handleSliderTouch}
							>
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
								onPress={handleCreatePrediction}
								style={styles.predictButton}
								disabled={creating || hasPredicted}
								loading={creating}
							>
								{hasPredicted ? 'ALREADY PREDICTED' : creating ? 'CREATING...' : 'LOCK IN PREDICTION'}
							</Button>

							<Text style={styles.communityText}>
								Community Consensus: {(activePrediction.community_probability * 100).toFixed(0)}%
							</Text>
						</Surface>
					) : (
						<Surface style={styles.predictionCard} elevation={4}>
							<Text style={styles.noPredictionsText}>No open predictions available</Text>
						</Surface>
					)}

					{/* Past Predictions List */}
					<Text style={styles.sectionTitle}>Your Portfolio ({userPredictions.length})</Text>
					{userPredictions.length > 0 ? (
						userPredictions.map((p) => (
							<Surface key={p.id} style={styles.portfolioItem} elevation={1}>
								<View>
									<Text style={styles.portfolioQuestion}>{p.question}</Text>
									<Text style={styles.portfolioDate}>Resolves: {p.deadline}</Text>
									{p.resolved && (
										<Text style={[styles.portfolioStatus, { color: p.outcome ? '#4CAF50' : '#FF5252' }]}>
											{p.outcome ? '✓ Correct' : '✗ Incorrect'}
										</Text>
									)}
								</View>
								<View style={styles.portfolioRight}>
									<Text style={styles.portfolioScore}>{(p.probability * 100).toFixed(0)}%</Text>
									<Text style={styles.portfolioLabel}>CONFIDENCE</Text>
								</View>
							</Surface>
						))
					) : (
						<Surface style={styles.portfolioItem} elevation={1}>
							<Text style={styles.noPredictionsText}>No predictions yet. Make your first prediction above!</Text>
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
	portfolioStatus: {
		fontSize: 10,
		fontWeight: 'bold',
		marginTop: 2,
	},
	noPredictionsText: {
		color: '#666',
		fontSize: 14,
		textAlign: 'center',
		fontStyle: 'italic',
		padding: 20,
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
	createSection: {
		marginBottom: 30,
	},
	createToggleButton: {
		borderColor: '#BB86FC',
		borderWidth: 2,
		borderRadius: 8,
		marginBottom: 15,
	},
	createToggleLabel: {
		color: '#BB86FC',
		fontWeight: 'bold',
		letterSpacing: 1,
	},
	createForm: {
		backgroundColor: '#1e1e2e',
		borderRadius: 16,
		padding: 20,
		borderWidth: 1,
		borderColor: '#333',
	},
	formTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	questionInput: {
		backgroundColor: 'transparent',
		marginBottom: 20,
	},
	formRow: {
		marginBottom: 20,
	},
	inputLabel: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 10,
	},
	categoryContainer: {
		flex: 1,
	},
	categoryButtons: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	categoryButton: {
		borderColor: '#666',
		minWidth: 80,
		marginBottom: 4,
	},
	categoryButtonActive: {
		backgroundColor: '#BB86FC',
		borderColor: '#BB86FC',
	},
	categoryButtonLabel: {
		fontSize: 11,
		color: '#ccc',
	},
	categoryButtonActiveLabel: {
		color: '#fff',
		fontSize: 11,
	},
	deadlineContainer: {
		flex: 1,
	},
	deadlineButtons: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	deadlineButton: {
		borderColor: '#666',
		minWidth: 70,
		marginBottom: 4,
	},
	deadlineButtonActive: {
		backgroundColor: '#4CAF50',
		borderColor: '#4CAF50',
	},
	deadlineButtonLabel: {
		fontSize: 11,
		color: '#ccc',
	},
	deadlineButtonActiveLabel: {
		color: '#fff',
		fontSize: 11,
	},
	createNewButton: {
		backgroundColor: '#BB86FC',
		borderRadius: 8,
		marginTop: 10,
		marginBottom: 15,
	},
	createNote: {
		color: '#888',
		fontSize: 12,
		textAlign: 'center',
		fontStyle: 'italic',
		lineHeight: 16,
	},
});
